"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CookingModeInterface } from "@/components/cooking-mode/cooking-mode-interface";
import { useCustomRecipes } from "@/hooks/use-custom-recipes";
import { normalizeStepInstructions } from "@/utils/step-text-normalizer";
import type { CustomRecipe } from "@/types/custom-recipe";
import type { MappedRecipe } from "@/types/spoonacular";
import type { NutritionFacts } from "@/types/cooking-mode";

export default function CookingModePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;
  const { customRecipes, getCustomRecipe } = useCustomRecipes();

  const [recipe, setRecipe] = useState<CustomRecipe | MappedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kitchenItems, setKitchenItems] = useState<string[]>([]);

  // Load kitchen items from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("kitchenIngredients");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Extract ingredient names from the stored format
          const names = parsed.map((item: any) => item.name || "");
          setKitchenItems(names.filter(Boolean));
        }
      } catch (error) {
        console.error("Error loading kitchen items:", error);
      }
    }
  }, []);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!recipeId) {
          throw new Error("Recipe ID is required");
        }

        console.log("Loading recipe with ID:", recipeId);

        // Strip the 'recipe-' prefix if present (from Spoonacular recipes)
        const cleanRecipeId = recipeId.replace(/^recipe-/, '');
        
        // First, check if it's a custom recipe (try both original and clean IDs)
        const customRecipe = getCustomRecipe(recipeId) || getCustomRecipe(cleanRecipeId);
        if (customRecipe) {
          console.log("Found custom recipe:", customRecipe.name);
          setRecipe(customRecipe);
          setIsLoading(false);
          return;
        }

        console.log("Recipe not found in custom recipes, trying Spoonacular. Clean ID:", cleanRecipeId);

        // Try to fetch from Spoonacular API
        // Check if cleanRecipeId is numeric (Spoonacular ID)
        const spoonacularId = cleanRecipeId.includes("spoonacular-") 
          ? cleanRecipeId.replace("spoonacular-", "")
          : cleanRecipeId;

        // If it's a number, try fetching from Spoonacular
        if (/^\d+$/.test(spoonacularId)) {
          try {
            const response = await fetch(`/api/recipes?action=details&recipeId=${spoonacularId}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch recipe: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data) {
              console.log("Found Spoonacular recipe:", result.data.name || result.data.title);
              setRecipe(result.data);
              setIsLoading(false);
              return;
            } else {
              console.error("Spoonacular API returned unsuccessful response:", result);
            }
          } catch (apiError) {
            console.error("Spoonacular API error:", apiError);
            // Continue to error handling below
          }
        }

        // If we get here, recipe wasn't found
        throw new Error(`Recipe not found. Original ID: ${recipeId}, Clean ID: ${cleanRecipeId}`);
      } catch (err) {
        console.error("Error loading recipe:", err);
        setError(err instanceof Error ? err.message : "Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId, getCustomRecipe]);

  const nutritionFacts = useMemo<NutritionFacts | undefined>(() => {
    if (!recipe) return undefined;

    const formatNumberValue = (value?: number, unit?: string) => {
      if (typeof value !== "number" || Number.isNaN(value)) return undefined;
      const rounded = Math.round(value);
      return unit ? `${rounded} ${unit}` : `${rounded}`;
    };

    const formatMixedValue = (value?: number | string, unit?: string) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        return /[a-zA-Z]/.test(trimmed) ? trimmed : unit ? `${trimmed} ${unit}` : trimmed;
      }
      return formatNumberValue(value, unit);
    };

    if ("nutrition" in recipe && recipe.nutrition) {
      return {
        calories: formatNumberValue(recipe.nutrition.calories, "kcal"),
        protein: formatNumberValue(recipe.nutrition.protein, "g"),
        carbs: formatNumberValue(recipe.nutrition.carbs, "g"),
        fat: formatNumberValue(recipe.nutrition.fat, "g"),
        fiber: formatNumberValue(recipe.nutrition.fiber, "g"),
      };
    }

    const hasMappedNutrition =
      ("calories" in recipe && typeof recipe.calories !== "undefined") ||
      ("protein" in recipe && !!recipe.protein) ||
      ("carbs" in recipe && !!recipe.carbs) ||
      ("fats" in recipe && !!recipe.fats);

    if (!hasMappedNutrition) {
      return undefined;
    }

    return {
      calories: formatMixedValue("calories" in recipe ? recipe.calories : undefined, "kcal"),
      protein: formatMixedValue("protein" in recipe ? recipe.protein : undefined, "g"),
      carbs: formatMixedValue("carbs" in recipe ? recipe.carbs : undefined, "g"),
      fat: formatMixedValue("fats" in recipe ? recipe.fats : undefined, "g"),
    };
  }, [recipe]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl md:text-3xl text-white mb-4">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <p className="text-2xl md:text-3xl text-white mb-4">
            {error || "Recipe not found"}
          </p>
          {recipeId && (
            <p className="text-lg text-white/70 mb-8">
              Recipe ID: {recipeId}
            </p>
          )}
          <div className="flex flex-col gap-4 items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-utility-success-600 hover:bg-utility-success-700 text-white text-lg md:text-xl font-semibold rounded-lg transition-colors"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={() => router.push("/recipes")}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-lg md:text-xl font-semibold rounded-lg transition-colors"
            >
              Browse Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Convert recipe to cooking mode format
  const recipeName: string = "name" in recipe && recipe.name
    ? (recipe.name as string)
    : ("title" in recipe && recipe.title
      ? (recipe.title as string)
      : "Unknown Recipe");

  const formatDisplayQuantity = (amount?: number, unit?: string) => {
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return undefined;
    }

    const rounded = Math.round(amount * 100) / 100;
    const displayAmount = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
    return unit ? `${displayAmount} ${unit}`.trim() : displayAmount;
  };
  
  // Extract ingredients - simplified now that MappedRecipe includes them
  const ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    image?: string;
    displayQuantity?: string;
  }> = [];
  
  if ("ingredients" in recipe && Array.isArray(recipe.ingredients)) {
    // Both MappedRecipe and CustomRecipe have ingredients in mapped format
    recipe.ingredients.forEach((ing, index) => {
      const baseAmount =
        "amount" in ing && typeof ing.amount === "number" && !Number.isNaN(ing.amount)
          ? ing.amount
          : 0;
      const baseUnit = "unit" in ing && typeof ing.unit === "string" ? ing.unit : "";
      const displayQuantity =
        ("quantity" in ing && typeof ing.quantity === "string" && ing.quantity.trim().length > 0)
          ? ing.quantity.trim()
          : undefined;

      ingredients.push({
        id: ("id" in ing && ing.id) ? ing.id : `ing-${index}`,
        name: ing.name,
        amount: baseAmount,
        unit: baseUnit,
        image: ("image" in ing ? ing.image : undefined) as string | undefined,
        displayQuantity,
      });
    });
  }

  // Extract instructions - MappedRecipe now has parsed instructions
  let instructions: string[] = [];
  
  if ("instructions" in recipe && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
    // MappedRecipe or CustomRecipe format - already parsed as array
    instructions = recipe.instructions.filter((inst) => inst.trim().length > 0);
  } else if ("analyzedInstructions" in recipe && Array.isArray(recipe.analyzedInstructions)) {
    // Fallback: extract from analyzed instructions if still needed
    recipe.analyzedInstructions.forEach((section: any) => {
      if (section.steps && Array.isArray(section.steps)) {
        section.steps.forEach((step: any) => {
          if (step.step && step.step.trim().length > 0) {
            instructions.push(step.step.trim());
          }
        });
      }
    });
  } else if ("instructions" in recipe && typeof recipe.instructions === "string") {
    // Plain text instructions - split intelligently
    const text = (recipe.instructions as string).trim();
    const splitByNumbers = text.split(/(?:\r?\n)?\d+\.\s+/).filter((s) => s.trim().length > 0);
    if (splitByNumbers.length > 1) {
      instructions = splitByNumbers.map((s) => s.trim());
    } else {
      const splitByNewlines = text.split(/\n\n+/).filter((s) => s.trim().length > 0);
      instructions = splitByNewlines.length > 1 ? splitByNewlines : [text];
    }
  }

  // If no instructions found, provide a helpful message
  if (instructions.length === 0) {
    instructions = ["No step-by-step instructions available for this recipe."];
  }

  // Normalize step instructions using AI layer
  instructions = normalizeStepInstructions(instructions);

  // Extract recipe metadata
  let recipeServings: number | undefined;
  let readyInMinutes: number | undefined;
  let difficulty: string | undefined;

  if ("servings" in recipe) {
    // CustomRecipe
    recipeServings = recipe.servings;
    const prepTime = ("prepTime" in recipe && recipe.prepTime) ? recipe.prepTime : 0;
    const cookTime = ("cookTime" in recipe && recipe.cookTime) ? recipe.cookTime : 0;
    readyInMinutes = prepTime + cookTime;
    // Calculate difficulty based on total time
    if (readyInMinutes <= 15) {
      difficulty = "Easy";
    } else if (readyInMinutes >= 60) {
      difficulty = "Hard";
    } else {
      difficulty = "Medium";
    }
  } else {
    // MappedRecipe
    recipeServings = recipe.servings;
    readyInMinutes = recipe.readyInMinutes;
    difficulty = recipe.difficulty || "Medium";
  }

  // Extract recipe image - check multiple possible fields
  const recipeImage = 
    ("image" in recipe && recipe.image && typeof recipe.image === "string") 
      ? recipe.image
      : ("imageUrl" in recipe && recipe.imageUrl && typeof recipe.imageUrl === "string")
        ? recipe.imageUrl
        : ("imageURL" in recipe && recipe.imageURL && typeof recipe.imageURL === "string")
          ? recipe.imageURL
          : undefined;

  return (
    <CookingModeInterface
      recipeId={recipeId}
      recipeName={recipeName}
      ingredients={ingredients}
      instructions={instructions}
      kitchenItems={kitchenItems}
      servings={recipeServings}
      readyInMinutes={readyInMinutes}
      difficulty={difficulty}
      nutritionFacts={nutritionFacts}
      recipeImage={recipeImage}
    />
  );
}

