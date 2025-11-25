/**
 * Spoonacular API Service
 * Handles all API interactions with Spoonacular Food API
 */

import type {
  SpoonacularApiConfig,
  SpoonacularError,
  RecipeByIngredients,
  RecipeByNutrients,
  ComplexSearchResponse,
  RecipeInformation,
  RandomRecipe,
  AutocompleteResult,
  SearchByIngredientsParams,
  SearchByNutrientsParams,
  ComplexSearchParams,
  GetRecipeInformationParams,
  RandomRecipesParams,
  BrowseRecipesParams,
  MappedIngredient,
  MappedRecipe,
  RecipeSearchResult,
  AnalyzedInstruction,
} from '@/types/spoonacular';
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

// Get API key from environment
const getApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new Error('Spoonacular API key is not configured. Please set NEXT_PUBLIC_SPOONACULAR_API_KEY in your environment variables.');
  }
  return apiKey;
};

// Helper to build query string
const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        queryParams.append(key, value.join(','));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  return queryParams.toString();
};

// Base fetch function with error handling
async function apiRequest<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> {
  const apiKey = getApiKey();
  const queryString = buildQueryString({ ...params, apiKey });
  const url = `${SPOONACULAR_BASE_URL}${endpoint}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle rate limiting (429) specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) : 60;
        throw new Error(
          `API rate limit exceeded (429). Please wait ${waitTime} seconds before trying again.`
        );
      }

      const errorData: SpoonacularError = await response.json().catch(() => ({
        status: 'failure',
        code: response.status,
        message: `API request failed with status ${response.status}`,
      }));

      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching data from Spoonacular API');
  }
}

/**
 * Search recipes by ingredients
 * Finds recipes that use as many of the given ingredients as possible
 */
export async function searchRecipesByIngredients(
  params: SearchByIngredientsParams
): Promise<RecipeByIngredients[]> {
  const { ingredients, number = 10, ranking = 1, ignorePantry = true } = params;
  
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  return apiRequest<RecipeByIngredients[]>('/recipes/findByIngredients', {
    ingredients: ingredients.join(','),
    number: Math.min(number, 100), // API limit is 100
    ranking,
    ignorePantry,
  });
}

/**
 * Search recipes by nutrients
 * Finds recipes within specific nutritional ranges
 */
export async function searchRecipesByNutrients(
  params: SearchByNutrientsParams
): Promise<RecipeByNutrients[]> {
  const { number = 10, ...filters } = params;

  return apiRequest<RecipeByNutrients[]>('/recipes/findByNutrients', {
    ...filters,
    number: Math.min(number, 100), // API limit is 100
  });
}

/**
 * Complex recipe search with advanced filters
 */
export async function complexRecipeSearch(
  params: ComplexSearchParams
): Promise<ComplexSearchResponse> {
  const { number = 10, offset = 0, ...filters } = params;

  return apiRequest<ComplexSearchResponse>('/recipes/complexSearch', {
    ...filters,
    number: Math.min(number, 100), // API limit is 100
    offset,
  });
}

/**
 * Get detailed recipe information
 */
export async function getRecipeInformation(
  id: number,
  params: GetRecipeInformationParams = {}
): Promise<RecipeInformation> {
  const { includeNutrition = true, ...otherParams } = params;

  return apiRequest<RecipeInformation>(`/recipes/${id}/information`, {
    includeNutrition,
    ...otherParams,
  });
}

/**
 * Get random recipes
 */
export async function getRandomRecipes(
  params: RandomRecipesParams = {}
): Promise<RandomRecipe[]> {
  const { number = 10, tags, limitLicense = false } = params;

  // Random recipes endpoint returns a different structure
  const response = await apiRequest<{ recipes: RandomRecipe[] }>('/recipes/random', {
    number: Math.min(number, 100), // API limit is 100
    tags,
    limitLicense,
  });

  return response.recipes || [];
}

/**
 * Autocomplete recipe search
 */
export async function autocompleteRecipeSearch(
  query: string,
  number: number = 10
): Promise<AutocompleteResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  return apiRequest<AutocompleteResult[]>('/recipes/autocomplete', {
    query: query.trim(),
    number: Math.min(number, 25), // API limit is 25
  });
}

// Mapping utilities to convert Spoonacular API responses to app format

/**
 * Map Spoonacular ingredient to app ingredient format
 */
export function mapIngredient(
  ingredient: any,
  icon?: string
): MappedIngredient {
  // Try to map common ingredient names to emojis
  const ingredientEmojiMap: Record<string, string> = {
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
    pepper: '🫑',
    avocado: '🥑',
    lemon: '🍋',
    lime: '🟢',
    apple: '🍎',
    banana: '🍌',
    strawberry: '🍓',
    orange: '🍊',
  };

  const name = (ingredient.name || ingredient.nameClean || '').toLowerCase();
  const mappedIcon =
    icon ||
    ingredientEmojiMap[name] ||
    Object.keys(ingredientEmojiMap).find((key) => name.includes(key)) &&
      ingredientEmojiMap[Object.keys(ingredientEmojiMap).find((key) => name.includes(key))!] ||
    '🥘'; // Default ingredient emoji

  // Format quantity nicely
  let quantity = '';
  if (ingredient.amount && ingredient.unit) {
    // Format the amount (remove unnecessary decimals)
    const amount = ingredient.amount % 1 === 0 
      ? ingredient.amount.toString() 
      : ingredient.amount.toFixed(1).replace(/\.0$/, '');
    
    // Clean up unit names
    const unit = ingredient.unit
      .replace('tablespoons', 'tbsp')
      .replace('tablespoon', 'tbsp')
      .replace('teaspoons', 'tsp')
      .replace('teaspoon', 'tsp')
      .replace('ounces', 'oz')
      .replace('ounce', 'oz')
      .replace('pounds', 'lb')
      .replace('pound', 'lb')
      .replace('cups', 'cup')
      .replace('servings', '')
      .replace('serving', '')
      .trim();
    
    quantity = unit ? `${amount} ${unit}` : amount;
  } else if (ingredient.original) {
    // Fallback to original, but clean it up
    quantity = ingredient.original
      .replace(/^to\s+/i, '')  // Remove "to" at the start
      .replace(/,.*$/, '')      // Remove everything after comma
      .replace(/\(.*?\)/g, '')  // Remove parentheses content
      .trim();
  }

  const displayName = ingredient.name || ingredient.nameClean || 'Unknown Ingredient';
  const fallbackImage = ingredient.image
    ? `https://img.spoonacular.com/ingredients_100x100/${ingredient.image}`
    : undefined;

  return {
    id: `ing-${ingredient.id || Math.random().toString(36).substr(2, 9)}`,
    name: displayName,
    icon: mappedIcon,
    quantity: quantity || undefined,
    spoonacularId: ingredient.id,
    image: getIngredientImageSource(displayName, fallbackImage),
    aisle: ingredient.aisle,
  };
}

/**
 * Map Spoonacular recipe to app recipe format
 */
export function mapRecipe(
  recipe: RecipeByIngredients | RecipeByNutrients | RecipeInformation | RecipeSearchResult,
  detailedInfo?: RecipeInformation
): MappedRecipe {
  const isDetailed = 'extendedIngredients' in recipe;
  const recipeInfo = detailedInfo || (isDetailed ? (recipe as RecipeInformation) : null);

  // Extract nutritional info
  let calories = 0;
  let carbs: string | undefined;
  let fats: string | undefined;
  let protein: string | undefined;

  if ('calories' in recipe && typeof recipe.calories === 'number') {
    calories = recipe.calories;
    carbs = recipe.carbs;
    fats = recipe.fat;
    protein = recipe.protein;
  } else if (recipeInfo?.nutrition) {
    calories = Math.round(
      recipeInfo.nutrition.nutrients.find((n) => n.name === 'Calories')?.amount || 0
    );
    const carbsNutrient = recipeInfo.nutrition.nutrients.find((n) => n.name === 'Carbohydrates');
    const fatNutrient = recipeInfo.nutrition.nutrients.find((n) => n.name === 'Fat');
    const proteinNutrient = recipeInfo.nutrition.nutrients.find((n) => n.name === 'Protein');

    carbs = carbsNutrient ? `${Math.round(carbsNutrient.amount)}g` : undefined;
    fats = fatNutrient ? `${Math.round(fatNutrient.amount)}g` : undefined;
    protein = proteinNutrient ? `${Math.round(proteinNutrient.amount)}g` : undefined;
  }

  // Map ingredients
  let ingredients: MappedIngredient[] = [];
  let missingIngredients: MappedIngredient[] = [];

  if (recipeInfo && 'extendedIngredients' in recipeInfo) {
    // Detailed recipe with full ingredient list (from detailedInfo parameter or detailed recipe)
    ingredients = recipeInfo.extendedIngredients.map((ing) => mapIngredient(ing));
  } else if (isDetailed && 'extendedIngredients' in recipe) {
    // Recipe itself is detailed
    ingredients = (recipe as RecipeInformation).extendedIngredients.map((ing) => mapIngredient(ing));
  } else if ('usedIngredients' in recipe) {
    // Recipe by ingredients response
    const byIngredients = recipe as RecipeByIngredients;
    ingredients = byIngredients.usedIngredients.map((ing) => mapIngredient(ing));
    missingIngredients = byIngredients.missedIngredients.map((ing) => mapIngredient(ing));
  }

  // Extract badges/dietary info
  const badges: string[] = [];
  if (recipeInfo) {
    if (recipeInfo.vegetarian) badges.push('Vegetarian');
    if (recipeInfo.vegan) badges.push('Vegan');
    if (recipeInfo.glutenFree) badges.push('Gluten Free');
    if (recipeInfo.dairyFree) badges.push('Dairy Free');
    if (recipeInfo.veryHealthy) badges.push('Very Healthy');
    if (recipeInfo.cheap) badges.push('Budget Friendly');
    if (recipeInfo.veryPopular) badges.push('Popular');
    if (recipeInfo.lowFodmap) badges.push('Low FODMAP');
    recipeInfo.diets?.forEach((diet) => {
      const dietLabels: Record<string, string> = {
        keto: 'Keto',
        paleo: 'Paleo',
        pescetarian: 'Pescetarian',
        primal: 'Primal',
        whole30: 'Whole30',
      };
      if (dietLabels[diet.toLowerCase()]) {
        badges.push(dietLabels[diet.toLowerCase()]);
      }
    });
  }

  // Determine difficulty based on preparation/cooking time
  const readyInMinutes = recipeInfo?.readyInMinutes || ('readyInMinutes' in recipe ? recipe.readyInMinutes : undefined);
  let difficulty = 'Medium';
  if (readyInMinutes) {
    if (readyInMinutes <= 15) difficulty = 'Easy';
    else if (readyInMinutes >= 60) difficulty = 'Hard';
  }

  // Extract instructions (prefer analyzedInstructions, fallback to plain text)
  let instructions: string[] = [];
  let analyzedInstructions: AnalyzedInstruction[] | undefined;

  if (recipeInfo?.analyzedInstructions && recipeInfo.analyzedInstructions.length > 0) {
    // Prefer structured instructions
    analyzedInstructions = recipeInfo.analyzedInstructions;
    // Extract steps as flat array
    recipeInfo.analyzedInstructions.forEach((section) => {
      if (section.steps && Array.isArray(section.steps)) {
        section.steps.forEach((step) => {
          if (step.step && step.step.trim()) {
            instructions.push(step.step.trim());
          }
        });
      }
    });
  } else if (recipeInfo?.instructions && typeof recipeInfo.instructions === 'string') {
    // Fallback to plain text instructions
    const text = recipeInfo.instructions.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
    
    // Try to split by numbered steps (1., 2., etc.)
    const splitByNumbers = text.split(/(?:\r?\n)?\d+\.\s+/).filter((s) => s.trim().length > 0);
    if (splitByNumbers.length > 1) {
      instructions = splitByNumbers.map((s) => s.trim());
    } else {
      // Split by double newlines or periods followed by capital letters
      const splitByNewlines = text.split(/\n\n+/).filter((s) => s.trim().length > 0);
      if (splitByNewlines.length > 1) {
        instructions = splitByNewlines.map((s) => s.trim());
      } else {
        const splitBySentences = text.split(/\.\s+(?=[A-Z])/).filter((s) => s.trim().length > 0);
        if (splitBySentences.length > 1) {
          instructions = splitBySentences.map((s) => s.trim() + (s.endsWith('.') ? '' : '.'));
        } else {
          // Single instruction block
          instructions = [text];
        }
      }
    }
  }

  return {
    id: `recipe-${recipe.id}`,
    name: recipe.title || (recipeInfo?.title || 'Unknown Recipe'),
    image:
      recipe.image || recipeInfo?.image
        ? `https://img.spoonacular.com/recipes/${(recipe.id || recipeInfo?.id || '').toString()}-556x370.jpg`
        : undefined,
    calories,
    carbs,
    fats,
    protein,
    servings: recipeInfo?.servings || ('servings' in recipe ? recipe.servings : undefined),
    time: readyInMinutes ? `${readyInMinutes} minutes` : undefined,
    difficulty,
    description: recipeInfo?.summary
      ? recipeInfo.summary.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
      : undefined,
    badges: badges.length > 0 ? badges : undefined,
    ingredients,
    missingIngredients,
    spoonacularId: recipe.id,
    readyInMinutes,
    aggregateLikes: recipeInfo?.aggregateLikes,
    healthScore: recipeInfo?.healthScore,
    pricePerServing: recipeInfo?.pricePerServing,
    instructions: instructions.length > 0 ? instructions : undefined,
    analyzedInstructions,
    extendedIngredients: recipeInfo?.extendedIngredients,
  };
}

/**
 * Search recipes with kitchen ingredients and apply filters
 */
export async function searchRecipesWithFilters(
  kitchenIngredients: string[],
  filters: {
    query?: string;
    calorieThreshold?: string;
    diet?: string;
    number?: number;
  } = {}
): Promise<MappedRecipe[]> {
  const { query, calorieThreshold, diet, number = 10 } = filters;

  try {
    // If we have query, calorie, diet filters, or ingredients, use complex search
    if (query || calorieThreshold || diet || kitchenIngredients.length > 0) {
      const complexParams: ComplexSearchParams = {
        query,
        includeIngredients: kitchenIngredients.length > 0 ? kitchenIngredients.join(',') : undefined,
        number,
        addRecipeInformation: true,
        addRecipeNutrition: true,
      };

      if (calorieThreshold) {
        const maxCalories = parseInt(calorieThreshold);
        if (!isNaN(maxCalories)) {
          complexParams.maxCalories = maxCalories;
        }
      }

      if (diet) {
        complexParams.diet = diet.toLowerCase();
      }

      const response = await complexRecipeSearch(complexParams);
      
      // Fetch detailed info for each recipe
      const recipes = await Promise.all(
        response.results.slice(0, number).map(async (result) => {
          try {
            const details = await getRecipeInformation(result.id, { includeNutrition: true });
            return mapRecipe(result, details);
          } catch (error) {
            console.error(`Failed to fetch details for recipe ${result.id}:`, error);
            return mapRecipe(result);
          }
        })
      );

      return recipes;
    }

    // If no ingredients, return empty array
    if (kitchenIngredients.length === 0) {
      return [];
    }

    // Otherwise, use ingredient-based search
    const results = await searchRecipesByIngredients({
      ingredients: kitchenIngredients,
      number,
      ranking: 1, // Maximize used ingredients
      ignorePantry: true,
    });

    // Fetch detailed info for each recipe to get ingredients
    const recipes = await Promise.all(
      results.map(async (result) => {
        try {
          const details = await getRecipeInformation(result.id, { includeNutrition: true });
          return mapRecipe(result, details);
        } catch (error) {
          console.error(`Failed to fetch details for recipe ${result.id}:`, error);
          return mapRecipe(result);
        }
      })
    );

    return recipes;
  } catch (error) {
    console.error('Error in searchRecipesWithFilters:', error);
    throw error;
  }
}

/**
 * Browse recipes with category, cuisine, and filter options
 * Used for the recipes browsing page
 */
export async function browseRecipes(
  params: BrowseRecipesParams
): Promise<MappedRecipe[]> {
  const {
    type,
    cuisine,
    minCalories,
    maxCalories,
    diet,
    sort = 'popularity',
    number = 20,
    offset = 0,
  } = params;

  try {
    const complexParams: ComplexSearchParams = {
      type,
      cuisine,
      minCalories,
      maxCalories,
      diet,
      sort,
      number: Math.min(number, 100), // API limit is 100
      offset,
      addRecipeInformation: true,
      addRecipeNutrition: true,
    };

    const response = await complexRecipeSearch(complexParams);

    // Fetch detailed info for each recipe
    const recipes = await Promise.all(
      response.results.map(async (result) => {
        try {
          const details = await getRecipeInformation(result.id, { includeNutrition: true });
          return mapRecipe(result, details);
        } catch (error) {
          console.error(`Failed to fetch details for recipe ${result.id}:`, error);
          return mapRecipe(result);
        }
      })
    );

    return recipes;
  } catch (error) {
    console.error('Error in browseRecipes:', error);
    throw error;
  }
}

