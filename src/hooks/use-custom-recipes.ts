"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomRecipe } from "@/types/custom-recipe";

const STORAGE_KEY = "customRecipes";

export function useCustomRecipes() {
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setCustomRecipes(parsed);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading custom recipes from localStorage:", error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // Save to localStorage whenever customRecipes changes
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customRecipes));
      } catch (error) {
        console.error("Error saving custom recipes to localStorage:", error);
        if (error instanceof Error && error.name === "QuotaExceededError") {
          alert("Storage quota exceeded. Please clear some data.");
        }
      }
    }
  }, [customRecipes, isInitialized]);

  const addCustomRecipe = useCallback((recipe: Omit<CustomRecipe, "id" | "createdAt">) => {
    const newRecipe: CustomRecipe = {
      ...recipe,
      id: `custom-recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    setCustomRecipes((prev) => [...prev, newRecipe]);
    return newRecipe.id;
  }, []);

  const updateCustomRecipe = useCallback((id: string, recipe: Partial<CustomRecipe>) => {
    setCustomRecipes((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...recipe, updatedAt: Date.now() }
          : r
      )
    );
  }, []);

  const deleteCustomRecipe = useCallback((id: string) => {
    setCustomRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getCustomRecipe = useCallback(
    (id: string) => {
      return customRecipes.find((r) => r.id === id) || null;
    },
    [customRecipes]
  );

  return {
    customRecipes,
    addCustomRecipe,
    updateCustomRecipe,
    deleteCustomRecipe,
    getCustomRecipe,
  };
}


