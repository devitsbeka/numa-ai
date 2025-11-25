import type { MappedRecipe } from "./spoonacular";

export interface DietPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // days
  tags: string[]; // e.g., ["Detox", "Vegan", "Weight Loss"]
  coverImage: string;
  dailyMeals: DailyMealPlan[];
  avgCaloriesPerDay?: number;
  macros?: {
    protein?: string;
    carbs?: string;
    fats?: string;
  };
  rating?: number;
  reviewCount?: number;
  goal?: "detox" | "weight-loss" | "muscle-gain" | "skin-improvement" | "energy-boost" | "general";
  estimatedWeightLoss?: number; // kg lost on average if completed
}

export interface DailyMealPlan {
  day: number;
  breakfast: MappedRecipe;
  lunch: MappedRecipe;
  dinner: MappedRecipe;
  snacks?: MappedRecipe[];
}

