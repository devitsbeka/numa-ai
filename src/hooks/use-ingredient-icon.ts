"use client";

import { useState, useEffect } from "react";
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";

/**
 * Hook to get ingredient icon with tag-based intelligent matching
 * Returns the icon immediately (synchronous, fast)
 */
export function useIngredientIcon(ingredientName: string, fallback?: string) {
  const [iconSrc, setIconSrc] = useState<string | undefined>(() => 
    getIngredientImageSource(ingredientName, fallback)
  );

  useEffect(() => {
    if (!ingredientName) {
      setIconSrc(fallback);
      return;
    }

    // Get icon synchronously (fast, tag-based matching)
    const icon = getIngredientImageSource(ingredientName, fallback);
    setIconSrc(icon);
  }, [ingredientName, fallback]);

  return { iconSrc, isValidating: false };
}

