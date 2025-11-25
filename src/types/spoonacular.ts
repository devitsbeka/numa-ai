/**
 * Spoonacular API Type Definitions
 * Based on official Spoonacular API documentation
 */

// Base API Configuration
export interface SpoonacularApiConfig {
  apiKey: string;
  baseUrl?: string;
}

// API Response Headers (for quota tracking)
export interface SpoonacularApiHeaders {
  'X-API-Quota-Request'?: string;
  'X-API-Quota-Used'?: string;
  'X-API-Quota-Left'?: string;
}

// Error Response
export interface SpoonacularError {
  status: 'failure';
  code: number;
  message: string;
}

// Ingredient Types
export interface SpoonacularIngredient {
  id: number;
  name: string;
  nameClean?: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  unitShort?: string;
  unitLong?: string;
  aisle?: string;
  image?: string;
  meta?: string[];
  extendedName?: string;
  consistency?: 'SOLID' | 'LIQUID' | 'GAS';
  measures?: {
    us?: { amount: number; unitShort: string; unitLong: string };
    metric?: { amount: number; unitShort: string; unitLong: string };
  };
}

// Search Recipes by Ingredients Response
export interface RecipeByIngredients {
  id: number;
  title: string;
  image: string;
  imageType: string;
  likes: number;
  missedIngredientCount: number;
  missedIngredients: SpoonacularIngredient[];
  usedIngredients: SpoonacularIngredient[];
  unusedIngredients: SpoonacularIngredient[];
  usedIngredientCount: number;
}

// Search Recipes by Nutrients Response
export interface RecipeByNutrients {
  id: number;
  title: string;
  image: string;
  imageType: string;
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
}

// Complex Recipe Search Response
export interface RecipeSearchResult {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes?: number;
  servings?: number;
}

export interface ComplexSearchResponse {
  results: RecipeSearchResult[];
  offset: number;
  number: number;
  totalResults: number;
}

// Nutrition Data
export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

export interface RecipeNutrition {
  nutrients: Nutrient[];
  properties?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  flavonoids?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  caloricBreakdown?: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
  weightPerServing?: {
    amount: number;
    unit: string;
  };
}

export interface IngredientNutrition {
  id: number;
  name: string;
  amount: number;
  unit: string;
  nutrients: Nutrient[];
}

// Analyzed Instructions
export interface AnalyzedInstruction {
  name: string;
  steps: Array<{
    number: number;
    step: string;
    ingredients?: Array<{
      id: number;
      name: string;
      localizedName: string;
      image: string;
    }>;
    equipment?: Array<{
      id: number;
      name: string;
      localizedName: string;
      image: string;
    }>;
    length?: {
      number: number;
      unit: string;
    };
  }>;
}

// Full Recipe Information
export interface RecipeInformation {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints?: number;
  gaps?: string;
  preparationMinutes?: number;
  cookingMinutes?: number;
  aggregateLikes: number;
  healthScore: number;
  creditsText?: string;
  license?: string;
  sourceName?: string;
  pricePerServing: number;
  extendedIngredients: SpoonacularIngredient[];
  summary?: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  occasions?: string[];
  instructions?: string;
  analyzedInstructions?: AnalyzedInstruction[];
  spoonacularScore?: number;
  spoonacularSourceUrl?: string;
  nutrition?: RecipeNutrition;
  ingredientNutrition?: IngredientNutrition[];
}

// Random Recipes Response
export interface RandomRecipe extends RecipeInformation {
  // Random recipes use the same structure as RecipeInformation
}

// Autocomplete Response
export interface AutocompleteResult {
  id: number;
  title: string;
}

// Search Parameters
export interface SearchByIngredientsParams {
  ingredients: string[];
  number?: number;
  ranking?: 1 | 2; // 1 = maximize used ingredients, 2 = minimize missing ingredients
  ignorePantry?: boolean;
}

export interface SearchByNutrientsParams {
  minCalories?: number;
  maxCalories?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minProtein?: number;
  maxProtein?: number;
  minFat?: number;
  maxFat?: number;
  minCholesterol?: number;
  maxCholesterol?: number;
  minSodium?: number;
  maxSodium?: number;
  minCalcium?: number;
  maxCalcium?: number;
  minMagnesium?: number;
  maxMagnesium?: number;
  minIron?: number;
  maxIron?: number;
  minZinc?: number;
  maxZinc?: number;
  minFiber?: number;
  maxFiber?: number;
  minSugar?: number;
  maxSugar?: number;
  minFolate?: number;
  maxFolate?: number;
  minFolicAcid?: number;
  maxFolicAcid?: number;
  minThiamin?: number;
  maxThiamin?: number;
  minRiboflavin?: number;
  maxRiboflavin?: number;
  minNiacin?: number;
  maxNiacin?: number;
  minVitaminB6?: number;
  maxVitaminB6?: number;
  minVitaminB12?: number;
  maxVitaminB12?: number;
  minVitaminA?: number;
  maxVitaminA?: number;
  minVitaminC?: number;
  maxVitaminC?: number;
  minVitaminD?: number;
  maxVitaminD?: number;
  minVitaminE?: number;
  maxVitaminE?: number;
  minVitaminK?: number;
  maxVitaminK?: number;
  number?: number;
  offset?: number;
  random?: boolean;
  limitLicense?: boolean;
}

export interface ComplexSearchParams {
  query?: string;
  cuisine?: string;
  excludeCuisine?: string;
  diet?: string;
  intolerances?: string;
  equipment?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: string;
  maxReadyTime?: number;
  minServings?: number;
  maxServings?: number;
  minCalories?: number;
  maxCalories?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minProtein?: number;
  maxProtein?: number;
  minFat?: number;
  maxFat?: number;
  addRecipeInformation?: boolean;
  addRecipeNutrition?: boolean;
  fillIngredients?: boolean;
  offset?: number;
  number?: number;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  limitLicense?: boolean;
}

export interface GetRecipeInformationParams {
  includeNutrition?: boolean;
  includeTaste?: boolean;
  addWinePairing?: boolean;
  addRecipeInstructionImages?: boolean;
}

export interface RandomRecipesParams {
  tags?: string;
  number?: number;
  limitLicense?: boolean;
}

// Browse Recipes Parameters (for recipe browsing page)
export interface BrowseRecipesParams {
  type?: string; // meal type: breakfast, main course, side dish, dessert, etc.
  cuisine?: string; // italian, mexican, asian, etc.
  minCalories?: number;
  maxCalories?: number;
  diet?: string; // vegetarian, vegan, etc.
  sort?: string; // popularity, time, healthiness
  number?: number;
  offset?: number;
}

// Mapped Types (converting Spoonacular types to app types)
export interface MappedIngredient {
  id: string;
  name: string;
  icon: string;
  quantity?: string;
  spoonacularId?: number;
  image?: string;
  aisle?: string;
}

export interface MappedRecipe {
  id: string;
  name: string;
  image?: string;
  calories: number;
  carbs?: string;
  fats?: string;
  protein?: string;
  servings?: number;
  time?: string;
  difficulty?: string;
  description?: string;
  badges?: string[];
  ingredients: MappedIngredient[];
  missingIngredients: MappedIngredient[];
  spoonacularId?: number;
  readyInMinutes?: number;
  aggregateLikes?: number;
  healthScore?: number;
  pricePerServing?: number;
  instructions?: string[]; // Array of instruction steps
  analyzedInstructions?: AnalyzedInstruction[]; // Structured instructions with ingredients/equipment
  extendedIngredients?: SpoonacularIngredient[]; // Full ingredient data for detailed views
}

export interface MappedMealSlot {
  time: string;
  label: string;
  meal: {
    name: string;
    image?: string;
    calories?: number;
    carbs?: string;
    fats?: string;
    protein?: string;
  } | null;
}

export interface MealPlanBundle {
  id: string;
  duration: number; // days
  recipes: MappedRecipe[];
  totalCalories: number;
  description: string;
  image?: string;
}

