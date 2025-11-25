export interface CustomRecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  spoonacularId?: number; // Optional ID from Spoonacular API
  image?: string; // Optional image URL from Spoonacular
  icon?: string; // Optional emoji icon
}

export interface CustomRecipeNutrition {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
}

export interface CustomRecipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  image?: string;
  ingredients: CustomRecipeIngredient[];
  instructions: string[];
  nutrition: CustomRecipeNutrition;
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

