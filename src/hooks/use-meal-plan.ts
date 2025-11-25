"use client";

import { useState, useEffect, useCallback } from "react";

export interface MealPlanEntry {
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mealType: "breakfast" | "lunch" | "dinner";
  addedAt: number; // timestamp
}

export interface MealPlanData {
  [date: string]: {
    breakfast: MealPlanEntry[];
    lunch: MealPlanEntry[];
    dinner: MealPlanEntry[];
  };
}

const STORAGE_KEY = "mealPlan";

// Migration function to convert old format (single meal) to new format (array)
function migrateOldMealPlanFormat(data: any): MealPlanData {
  if (!data || typeof data !== "object") {
    return {};
  }

  const migrated: MealPlanData = {};
  
  Object.keys(data).forEach((date) => {
    const dateData = data[date];
    if (dateData && typeof dateData === "object") {
      // Check if this is old format (single meal per type) or new format (array)
      const isOldFormat = 
        (dateData.breakfast !== null && !Array.isArray(dateData.breakfast)) ||
        (dateData.lunch !== null && !Array.isArray(dateData.lunch)) ||
        (dateData.dinner !== null && !Array.isArray(dateData.dinner));

      if (isOldFormat) {
        // Convert old format to new format
        migrated[date] = {
          breakfast: dateData.breakfast ? [dateData.breakfast] : [],
          lunch: dateData.lunch ? [dateData.lunch] : [],
          dinner: dateData.dinner ? [dateData.dinner] : [],
        };
      } else {
        // Already in new format or already migrated
        migrated[date] = {
          breakfast: Array.isArray(dateData.breakfast) ? dateData.breakfast : [],
          lunch: Array.isArray(dateData.lunch) ? dateData.lunch : [],
          dinner: Array.isArray(dateData.dinner) ? dateData.dinner : [],
        };
      }
    }
  });

  return migrated;
}

export function useMealPlan() {
  const [mealPlan, setMealPlan] = useState<MealPlanData>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount - only once
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log("Loaded meal plan from localStorage:", parsed);
          
          // Migrate old format to new format if needed
          const migrated = migrateOldMealPlanFormat(parsed);
          
          // If migration happened, save the migrated data back
          if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
            console.log("Migrated meal plan from old format to new format");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          }
          
          console.log("Parsed meal plan keys:", Object.keys(migrated));
          setMealPlan(migrated);
        } else {
          console.log("No meal plan found in localStorage, starting fresh");
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading meal plan from localStorage:", error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // Save to localStorage whenever mealPlan changes (but not on initial load)
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      // Skip saving if mealPlan is empty (unless we explicitly want to clear)
      // This prevents overwriting with empty data
      const hasData = Object.keys(mealPlan).length > 0;
      if (!hasData) {
        console.log("Skipping save - mealPlan is empty");
        return;
      }

      try {
        const toSave = JSON.stringify(mealPlan);
        localStorage.setItem(STORAGE_KEY, toSave);
        console.log("✅ Saved meal plan to localStorage:", mealPlan);
        console.log("📊 Total dates in meal plan:", Object.keys(mealPlan).length);
        
        // Verify it was saved correctly
        const verification = localStorage.getItem(STORAGE_KEY);
        if (verification) {
          const parsed = JSON.parse(verification);
          console.log("✅ Verification - read back from localStorage:", parsed);
          console.log("📅 Keys in saved data:", Object.keys(parsed));
          if (Object.keys(parsed).length > 0) {
            Object.keys(parsed).forEach((date) => {
              const dateData = parsed[date];
              const breakfastNames = Array.isArray(dateData.breakfast) 
                ? dateData.breakfast.map((m: MealPlanEntry) => m.recipeName).join(", ") || "none"
                : "none";
              const lunchNames = Array.isArray(dateData.lunch)
                ? dateData.lunch.map((m: MealPlanEntry) => m.recipeName).join(", ") || "none"
                : "none";
              const dinnerNames = Array.isArray(dateData.dinner)
                ? dateData.dinner.map((m: MealPlanEntry) => m.recipeName).join(", ") || "none"
                : "none";
              
              console.log(`📅 Date ${date}:`, {
                breakfast: breakfastNames,
                lunch: lunchNames,
                dinner: dinnerNames,
              });
            });
          }
        } else {
          console.error("❌ Verification failed - nothing in localStorage!");
        }
      } catch (error) {
        console.error("Error saving meal plan to localStorage:", error);
        if (error instanceof Error && error.name === "QuotaExceededError") {
          alert("Storage quota exceeded. Please clear some data.");
        }
      }
    }
  }, [mealPlan, isInitialized]);

  const addRecipeToMealPlan = useCallback(
    (entry: Omit<MealPlanEntry, "addedAt">, replace: boolean = false) => {
      const dateStr = entry.date;
      const newEntry: MealPlanEntry = {
        ...entry,
        addedAt: Date.now(),
      };

      console.log("addRecipeToMealPlan called with:", entry, "replace:", replace);

      setMealPlan((prev) => {
        const updated = { ...prev };
        if (!updated[dateStr]) {
          updated[dateStr] = {
            breakfast: [],
            lunch: [],
            dinner: [],
          };
        }
        
        if (replace) {
          // Replace all meals of this type with the new one
          updated[dateStr] = {
            ...updated[dateStr],
            [entry.mealType]: [newEntry],
          };
        } else {
          // Append to existing meals
          updated[dateStr] = {
            ...updated[dateStr],
            [entry.mealType]: [...(updated[dateStr][entry.mealType] || []), newEntry],
          };
        }
        
        console.log("Adding recipe to meal plan:", { dateStr, mealType: entry.mealType, entry: newEntry, replace });
        console.log("Previous meal plan:", prev);
        console.log("Updated meal plan state:", updated);
        
        return updated;
      });

      return true;
    },
    []
  );

  const removeRecipeFromMealPlan = useCallback(
    (date: string, mealType: "breakfast" | "lunch" | "dinner", index?: number) => {
      setMealPlan((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          if (index !== undefined) {
            // Remove specific meal by index
            const meals = [...(updated[date][mealType] || [])];
            meals.splice(index, 1);
            updated[date] = {
              ...updated[date],
              [mealType]: meals,
            };
          } else {
            // Remove all meals of this type
            updated[date] = {
              ...updated[date],
              [mealType]: [],
            };
          }
          
          // Clean up empty dates
          if (
            updated[date].breakfast.length === 0 &&
            updated[date].lunch.length === 0 &&
            updated[date].dinner.length === 0
          ) {
            delete updated[date];
          }
        }
        return updated;
      });
    },
    []
  );

  const getMealForDate = useCallback(
    (date: string, mealType: "breakfast" | "lunch" | "dinner") => {
      return mealPlan[date]?.[mealType] || [];
    },
    [mealPlan]
  );

  const isRecipeInMealPlan = useCallback(
    (recipeId: string, date: string, mealType: "breakfast" | "lunch" | "dinner") => {
      const meals = mealPlan[date]?.[mealType] || [];
      return meals.some(meal => meal.recipeId === recipeId);
    },
    [mealPlan]
  );

  const getMealsForDate = useCallback(
    (date: string) => {
      return mealPlan[date] || {
        breakfast: [],
        lunch: [],
        dinner: [],
      };
    },
    [mealPlan]
  );

  const replaceMealInMealPlan = useCallback(
    (date: string, mealType: "breakfast" | "lunch" | "dinner", index: number, newEntry: Omit<MealPlanEntry, "addedAt">) => {
      const entry: MealPlanEntry = {
        ...newEntry,
        addedAt: Date.now(),
      };

      setMealPlan((prev) => {
        const updated = { ...prev };
        if (!updated[date]) {
          updated[date] = {
            breakfast: [],
            lunch: [],
            dinner: [],
          };
        }
        
        const meals = [...(updated[date][mealType] || [])];
        if (index >= 0 && index < meals.length) {
          meals[index] = entry;
          updated[date] = {
            ...updated[date],
            [mealType]: meals,
          };
        }
        
        return updated;
      });
    },
    []
  );

  // Helper function to verify localStorage (for debugging)
  const verifyStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("=== MEAL PLAN VERIFICATION ===");
        console.log("Raw localStorage:", stored);
        console.log("Parsed data:", parsed);
        console.log("Date keys:", Object.keys(parsed));
        Object.keys(parsed).forEach((date) => {
          console.log(`Date ${date}:`, parsed[date]);
        });
        console.log("=============================");
        return parsed;
      } else {
        console.log("No meal plan data in localStorage");
        return null;
      }
    }
    return null;
  }, []);

  // Expose verify function on window for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).verifyMealPlan = verifyStorage;
      console.log("Debug helper available: window.verifyMealPlan()");
    }
  }, [verifyStorage]);

  return {
    mealPlan,
    addRecipeToMealPlan,
    removeRecipeFromMealPlan,
    getMealForDate,
    isRecipeInMealPlan,
    getMealsForDate,
    replaceMealInMealPlan,
    verifyStorage,
  };
}

