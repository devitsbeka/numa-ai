"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { cx } from "@/utils/cx";
import type { MappedRecipe } from "@/types/spoonacular";

interface RecipeSuggestionCarouselProps {
  recipes: MappedRecipe[];
  onDismiss: (recipeId: string) => void;
  onRecipeClick?: (recipeId: string) => void;
}

const DISMISSED_KEY = "dismissedRecipeSuggestions";

export function RecipeSuggestionCarousel({
  recipes,
  onDismiss,
  onRecipeClick,
}: RecipeSuggestionCarouselProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        setDismissedIds(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Error loading dismissed recipes:", error);
    }
  }, []);

  const handleDismiss = (recipeId: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(recipeId);
    setDismissedIds(newDismissed);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...newDismissed]));
    } catch (error) {
      console.error("Error saving dismissed recipes:", error);
    }
    onDismiss(recipeId);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    if (scrollRef.current) {
      handleScroll();
    }
  }, [recipes]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const visibleRecipes = recipes.filter(
    (recipe) => !dismissedIds.has(recipe.id)
  );

  if (visibleRecipes.length === 0) {
    return (
      <div className="text-center py-8 text-primary-foreground/60">
        No recipe suggestions available. Add more ingredients to your kitchen!
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-foreground">
            Recipe Suggestions
          </h3>
          <p className="text-xs text-primary-foreground/60">
            Based on your kitchen ingredients
          </p>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm border border-secondary flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4 text-primary-foreground" />
          </button>
        )}

        {/* Recipes Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {visibleRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="shrink-0 w-64 relative group"
            >
              {/* Dismiss Button */}
              <button
                onClick={() => handleDismiss(recipe.id)}
                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary/90 backdrop-blur-sm border border-secondary flex items-center justify-center hover:bg-primary transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Dismiss suggestion"
              >
                <X className="size-3 text-primary-foreground" />
              </button>

              {/* Recipe Card */}
              <div onClick={() => onRecipeClick?.(recipe.id)} className="cursor-pointer">
                <RecipeCard recipe={recipe} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm border border-secondary flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4 text-primary-foreground" />
          </button>
        )}

        {/* Fade gradients */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-primary to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-primary to-transparent pointer-events-none" />
        )}

        {/* Scrollbar Style */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}

