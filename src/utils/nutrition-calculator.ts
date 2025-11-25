import type { CustomRecipeIngredient, CustomRecipeNutrition } from "@/types/custom-recipe";

interface SpoonacularIngredientSearchResult {
  id: number;
  name: string;
  image?: string;
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

// Search for ingredient in Spoonacular
async function searchIngredient(name: string): Promise<SpoonacularIngredientSearchResult | null> {
  try {
    const response = await fetch(`/api/ingredients/search?query=${encodeURIComponent(name)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success && data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error("Error searching ingredient:", error);
    return null;
  }
}

// Get nutrition info for ingredient
async function getIngredientNutrition(
  ingredientId: number,
  amountInGrams: number
): Promise<SpoonacularIngredientNutrition | null> {
  try {
    const response = await fetch(`/api/ingredients/${ingredientId}/information?amount=${amountInGrams}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success && data.nutrition) {
      return data.nutrition;
    }
    return null;
  } catch (error) {
    console.error("Error getting ingredient nutrition:", error);
    return null;
  }
}

export async function calculateNutrition(
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

// Calculate nutrition for a single ingredient (for preview)
export async function calculateIngredientNutrition(
  ingredient: CustomRecipeIngredient
): Promise<Partial<CustomRecipeNutrition> | null> {
  let ingredientId = ingredient.spoonacularId;

  if (!ingredientId) {
    const searchResult = await searchIngredient(ingredient.name);
    if (searchResult) {
      ingredientId = searchResult.id;
    }
  }

  if (!ingredientId) {
    return null;
  }

  const amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);
  const nutrition = await getIngredientNutrition(ingredientId, amountInGrams);

  if (!nutrition) {
    return null;
  }

  return {
    calories: Math.round(nutrition.calories || 0),
    protein: Math.round((nutrition.protein || 0) * 10) / 10,
    carbs: Math.round((nutrition.carbohydrates || 0) * 10) / 10,
    fat: Math.round((nutrition.fat || 0) * 10) / 10,
    fiber: Math.round((nutrition.fiber || 0) * 10) / 10,
  };
}


