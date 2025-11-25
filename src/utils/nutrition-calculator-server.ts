import type { CustomRecipeIngredient, CustomRecipeNutrition } from "@/types/custom-recipe";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

interface SpoonacularIngredientSearchResult {
  id: number;
  name: string;
  image?: string;
}

export interface EnrichedIngredient extends CustomRecipeIngredient {
  image?: string;
  icon?: string;
}

interface SpoonacularIngredientNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber?: number;
}

// Unit conversion to grams (for common units)
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.35,
  lb: 453.6,
  cup: 240, // Approximate for most ingredients
  tbsp: 15,
  tsp: 5,
  ml: 1, // For liquids, 1ml ≈ 1g
  l: 1000,
  floz: 29.57,
};

// Convert amount to grams
function convertToGrams(amount: number, unit: string): number {
  const unitLower = unit.toLowerCase().trim();
  const conversionFactor = UNIT_TO_GRAMS[unitLower] || 1; // Default to 1 if unknown
  return amount * conversionFactor;
}

// Search for ingredient in Spoonacular (server-side)
async function searchIngredient(name: string): Promise<SpoonacularIngredientSearchResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      console.warn("Spoonacular API key not configured");
      return null;
    }

    const url = `${SPOONACULAR_BASE_URL}/food/ingredients/search?query=${encodeURIComponent(name)}&number=5&apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Spoonacular API rate limit exceeded");
        throw new Error("Spoonacular API rate limit exceeded. Please wait a few minutes and try again.");
      }
      return null;
    }
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error("Error searching ingredient:", error);
    return null;
  }
}

// Get nutrition info for ingredient (server-side)
async function getIngredientNutrition(
  ingredientId: number,
  amountInGrams: number
): Promise<SpoonacularIngredientNutrition | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      console.warn("Spoonacular API key not configured");
      return null;
    }

    const url = `${SPOONACULAR_BASE_URL}/food/ingredients/${ingredientId}/information?amount=${amountInGrams}&unit=g&apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Spoonacular API rate limit exceeded");
        throw new Error("Spoonacular API rate limit exceeded. Please wait a few minutes and try again.");
      }
      return null;
    }
    
    const data = await response.json();
    
    // Extract nutrition data
    const nutrition = {
      calories: data.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount || 0,
      protein: data.nutrition?.nutrients?.find((n: any) => n.name === "Protein")?.amount || 0,
      fat: data.nutrition?.nutrients?.find((n: any) => n.name === "Fat")?.amount || 0,
      carbohydrates: data.nutrition?.nutrients?.find((n: any) => n.name === "Carbohydrates")?.amount || 0,
      fiber: data.nutrition?.nutrients?.find((n: any) => n.name === "Fiber")?.amount || 0,
    };

    return nutrition;
  } catch (error) {
    console.error("Error getting ingredient nutrition:", error);
    return null;
  }
}

export async function calculateNutritionServer(
  ingredients: CustomRecipeIngredient[]
): Promise<CustomRecipeNutrition> {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const ingredient of ingredients) {
    // If we already have a Spoonacular ID, use it
    let ingredientId = ingredient.spoonacularId;

    // Otherwise, search for it
    if (!ingredientId) {
      const searchResult = await searchIngredient(ingredient.name);
      if (searchResult) {
        ingredientId = searchResult.id;
      }
    }

    if (!ingredientId) {
      // Skip if we can't find the ingredient
      console.warn(`Could not find nutrition data for: ${ingredient.name}`);
      continue;
    }

    // Convert amount to grams
    const amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);

    // Get nutrition info (per 100g, so we need to scale)
    const nutrition = await getIngredientNutrition(ingredientId, amountInGrams);
    if (nutrition) {
      // Nutrition is already calculated for the amount, so add directly
      totalCalories += nutrition.calories || 0;
      totalProtein += nutrition.protein || 0;
      totalCarbs += nutrition.carbohydrates || 0;
      totalFat += nutrition.fat || 0;
      totalFiber += nutrition.fiber || 0;
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
  };
}

// Emoji mapping for common ingredients
const INGREDIENT_EMOJI_MAP: Record<string, string> = {
  chicken: '🐔',
  beef: '🥩',
  pork: '🐷',
  fish: '🐟',
  salmon: '🐟',
  pasta: '🍝',
  rice: '🍚',
  tomato: '🍅',
  tomatoes: '🍅',
  onion: '🧅',
  onions: '🧅',
  garlic: '🧄',
  carrot: '🥕',
  carrots: '🥕',
  potato: '🥔',
  potatoes: '🥔',
  egg: '🥚',
  eggs: '🥚',
  cheese: '🧀',
  parmesan: '🧀',
  bread: '🍞',
  olive: '🫒',
  'olive oil': '🫒',
  basil: '🌿',
  parsley: '🌿',
  spinach: '🥬',
  lettuce: '🥬',
  mushroom: '🍄',
  mushrooms: '🍄',
  'bell pepper': '🫑',
  avocado: '🥑',
  lemon: '🍋',
  lime: '🟢',
  apple: '🍎',
  banana: '🍌',
  strawberry: '🍓',
  orange: '🍊',
  butter: '🧈',
  milk: '🥛',
  flour: '🌾',
  sugar: '🍬',
  salt: '🧂',
  pepper: '🌶️',
  cinnamon: '🌿',
  oregano: '🌿',
  thyme: '🌿',
  rosemary: '🌿',
  cilantro: '🌿',
  mint: '🌿',
  ginger: '🫚',
  turmeric: '🟡',
  paprika: '🌶️',
  chili: '🌶️',
  bell: '🫑',
  cucumber: '🥒',
  zucchini: '🥒',
  broccoli: '🥦',
  cauliflower: '🥦',
  corn: '🌽',
  peas: '🫛',
  beans: '🫘',
  lentils: '🫘',
  chickpeas: '🫘',
  tofu: '🧈',
  yogurt: '🥛',
  cream: '🥛',
  sour: '🥛',
  honey: '🍯',
  maple: '🍯',
  vinegar: '🍾',
  wine: '🍷',
  beer: '🍺',
  soy: '🫘',
  sesame: '🫘',
  almond: '🥜',
  peanut: '🥜',
  walnut: '🥜',
  cashew: '🥜',
  coconut: '🥥',
  chocolate: '🍫',
  vanilla: '🌿',
  coffee: '☕',
  tea: '🍵',
};

// Get emoji for ingredient name
function getIngredientEmoji(name: string): string {
  const nameLower = name.toLowerCase().trim();
  
  // Direct match
  if (INGREDIENT_EMOJI_MAP[nameLower]) {
    return INGREDIENT_EMOJI_MAP[nameLower];
  }
  
  // Partial match
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJI_MAP)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return emoji;
    }
  }
  
  // Default
  return '🥘';
}

/**
 * Enrich ingredients with images and IDs from Spoonacular
 * This function searches for each ingredient and adds image URLs and standardized IDs
 */
export async function enrichIngredients(
  ingredients: CustomRecipeIngredient[]
): Promise<EnrichedIngredient[]> {
  const enriched: EnrichedIngredient[] = [];
  
  for (const ingredient of ingredients) {
    const enrichedIngredient: EnrichedIngredient = {
      ...ingredient,
      icon: getIngredientEmoji(ingredient.name),
    };
    
    // If we already have a Spoonacular ID, use it to get the image
    if (ingredient.spoonacularId) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
        if (apiKey) {
          const url = `${SPOONACULAR_BASE_URL}/food/ingredients/${ingredient.spoonacularId}/information?amount=100&unit=g&apiKey=${apiKey}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            if (data.image) {
              enrichedIngredient.image = `https://img.spoonacular.com/ingredients_100x100/${data.image}`;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching image for ingredient ${ingredient.name}:`, error);
      }
    } else {
      // Search for the ingredient to get ID and image
      try {
        const searchResult = await searchIngredient(ingredient.name);
        if (searchResult) {
          enrichedIngredient.spoonacularId = searchResult.id;
          if (searchResult.image) {
            enrichedIngredient.image = `https://img.spoonacular.com/ingredients_100x100/${searchResult.image}`;
          }
        }
      } catch (error) {
        console.error(`Error searching for ingredient ${ingredient.name}:`, error);
      }
    }
    
    enriched.push(enrichedIngredient);
  }
  
  return enriched;
}

