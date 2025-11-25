/**
 * Cooking Mode Type Definitions
 */

export type CookingModePhase = 'ingredients' | 'cooking' | 'completed';

export type IngredientCategoryType = 
  | 'needs-prep'
  | 'needs-cooking'
  | 'needs-thawing'
  | 'ready-to-use'
  | 'needs-washing';

export type IngredientImportance = 'crucial' | 'replaceable';

export interface CategorizedIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  image?: string; // URL to ingredient image
  displayQuantity?: string;
  category: IngredientCategoryType;
  inKitchen: boolean;
  checked: boolean;
  importance?: IngredientImportance; // Classification: crucial or replaceable
}

export interface IngredientReplacementDetails {
  name: string;
  displayQuantity?: string;
  image?: string;
  amount?: number;
  unit?: string;
}

export interface IngredientCategory {
  type: IngredientCategoryType;
  name: string;
  icon: string;
  ingredients: CategorizedIngredient[];
}

export interface CookingStep {
  number: number;
  instruction: string;
  estimatedTime?: number; // in seconds
  ingredientsNeeded: string[]; // ingredient names used in this step
  completed: boolean;
  isPrepStep?: boolean; // New flag to distinguish AI-generated prep steps
}

export interface TimerState {
  remainingTime: number; // in seconds
  totalTime: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
}

export interface CookingModeState {
  phase: CookingModePhase;
  currentStep: number;
  steps: CookingStep[];
  categorizedIngredients: IngredientCategory[];
  checkedIngredients: Set<string>;
  timer: TimerState | null;
  isWakeLockActive: boolean;
}

export type DietaryPreference = 'none' | 'vegan' | 'vegetarian' | 'gluten-free' | 'keto' | 'dairy-free';

export interface Diner {
  id: string;
  name: string;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  customSubstitutions: Record<string, string>; // ingredientId -> replacementName
}

export interface DinerIngredientNeed {
  ingredientId: string;
  amount: number;
  unit: string;
  replacementName?: string; // if substituted for this diner
}

export interface NutritionFacts {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
}

