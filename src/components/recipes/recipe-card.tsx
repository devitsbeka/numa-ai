"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, Calendar as CalendarIcon } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";
import type { MappedRecipe } from "@/types/spoonacular";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MealPlanEntry } from "@/hooks/use-meal-plan";

interface RecipeCardProps {
  recipe: MappedRecipe;
  isFavorite?: boolean;
  onFavoriteToggle?: (recipeId: string, isFavorite: boolean) => void;
  onMealAdded?: (message: string) => void;
  addRecipeToMealPlan?: (entry: Omit<MealPlanEntry, "addedAt">, replace?: boolean) => boolean;
  getMealForDate?: (date: string, mealType: "breakfast" | "lunch" | "dinner") => MealPlanEntry[];
}

export function RecipeCard({ 
  recipe, 
  isFavorite: propIsFavorite, 
  onFavoriteToggle, 
  onMealAdded,
  addRecipeToMealPlan,
  getMealForDate
}: RecipeCardProps) {
  const router = useRouter();
  const [internalIsFavorite, setInternalIsFavorite] = useState(propIsFavorite || false);
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : internalIsFavorite;
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow">("today");
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMealPicker(false);
        setSelectedMealType(null);
      }
    };

    if (showMealPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMealPicker]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    if (propIsFavorite === undefined) {
      setInternalIsFavorite(newFavoriteState);
    }
    onFavoriteToggle?.(recipe.id, newFavoriteState);
  };

  const handleAddToMealClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMealPicker(!showMealPicker);
    if (!showMealPicker) {
      setSelectedMealType(null);
    }
  };

  const getDateString = (dateOption: "today" | "tomorrow"): string => {
    const today = new Date();
    if (dateOption === "tomorrow") {
      today.setDate(today.getDate() + 1);
    }
    return today.toISOString().split("T")[0];
  };

  const getDateLabel = (dateOption: "today" | "tomorrow"): string => {
    return dateOption === "today" ? "Today" : "Tomorrow";
  };

  const handleConfirmAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("handleConfirmAdd called", { selectedMealType, hasAddFunction: !!addRecipeToMealPlan, hasGetFunction: !!getMealForDate });

    if (!selectedMealType || !addRecipeToMealPlan || !getMealForDate) {
      console.error("Missing required functions or meal type", { selectedMealType, addRecipeToMealPlan, getMealForDate });
      return;
    }

    const dateStr = getDateString(selectedDate);
    console.log("Date string:", dateStr);
    const existingMeals = getMealForDate(dateStr, selectedMealType);
    console.log("Existing meals:", existingMeals);

    // Check if meal slot is already occupied
    const hasExistingMeal = existingMeals.length > 0 && existingMeals.some(meal => meal.recipeId !== recipe.id);
    if (hasExistingMeal) {
      const confirmed = window.confirm(
        `Replace existing meal(s) with ${recipe.name}?`
      );
      if (!confirmed) {
        console.log("User cancelled replacement");
        return;
      }
    }

    const entry = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeImage: recipe.image,
      date: dateStr,
      mealType: selectedMealType,
    };
    console.log("Calling addRecipeToMealPlan with:", entry);

    const success = addRecipeToMealPlan(entry);
    console.log("addRecipeToMealPlan returned:", success);

    if (success) {
      const mealTypeLabel =
        selectedMealType === "breakfast"
          ? "Breakfast"
          : selectedMealType === "lunch"
          ? "Lunch"
          : "Dinner";
      const dateLabel = getDateLabel(selectedDate);

      onMealAdded?.(`Added ${recipe.name} to ${mealTypeLabel} for ${dateLabel}`);

      setShowMealPicker(false);
      setSelectedMealType(null);
    } else {
      console.error("addRecipeToMealPlan returned false");
    }
  };

  return (
    <Link
      href={`/recipes/${recipe.spoonacularId || recipe.id}`}
      className="group relative flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-quaternary">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {/* Cooking Mode Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/cooking-mode/${recipe.spoonacularId || recipe.id}`);
            }}
            className={cx(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-utility-success-600/90 backdrop-blur-sm transition-all hover:bg-utility-success-600 hover:scale-110 opacity-0 group-hover:opacity-100"
            )}
            aria-label="Start cooking mode"
          >
            <span className="text-base">👨‍🍳</span>
          </button>

          {/* Add to Meal Button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={handleAddToMealClick}
            className={cx(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100",
              showMealPicker && "opacity-100 bg-white"
            )}
            aria-label="Add to meal plan"
          >
            <CalendarIcon className="size-4 text-primary" />
          </button>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={cx(
              "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110",
              isFavorite 
                ? "bg-red-500 hover:bg-red-600 opacity-100" 
                : "opacity-0 group-hover:opacity-100"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className={cx(
                "size-4 transition-colors",
                isFavorite ? "text-white fill-white" : "text-primary stroke-2"
              )}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Meal Picker Tooltip */}
        {showMealPicker && (
          <div
            ref={pickerRef}
            className="absolute right-3 top-12 z-50 w-64 rounded-lg border border-secondary bg-primary/95 backdrop-blur-md shadow-lg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Date Selection */}
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-primary">Date</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedDate("today");
                  }}
                  className={cx(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                    selectedDate === "today"
                      ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                      : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                  )}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedDate("tomorrow");
                  }}
                  className={cx(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                    selectedDate === "tomorrow"
                      ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                      : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                  )}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            {/* Meal Type Selection */}
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-primary">Meal Type</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedMealType("breakfast");
                  }}
                  className={cx(
                    "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                    selectedMealType === "breakfast"
                      ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                      : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                  )}
                >
                  <span className="text-base leading-none">🥞</span>
                  <span className="leading-none">Breakfast</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedMealType("lunch");
                  }}
                  className={cx(
                    "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                    selectedMealType === "lunch"
                      ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                      : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                  )}
                >
                  <span className="text-base leading-none">🍱</span>
                  <span className="leading-none">Lunch</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedMealType("dinner");
                  }}
                  className={cx(
                    "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                    selectedMealType === "dinner"
                      ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                      : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                  )}
                >
                  <span className="text-base leading-none">🍽️</span>
                  <span className="leading-none">Dinner</span>
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!selectedMealType}
              className={cx(
                "w-full rounded-lg px-3 py-2 text-xs font-medium transition-all border leading-none",
                selectedMealType
                  ? "border-utility-brand-600 bg-utility-brand-600 text-white hover:bg-utility-brand-700"
                  : "border-utility-gray-300 bg-transparent text-fg-tertiary cursor-not-allowed"
              )}
            >
              Add to Meal Plan
            </button>
          </div>
        )}

        {/* Badges Overlay */}
        {recipe.badges && recipe.badges.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {recipe.badges.slice(0, 2).map((badge) => (
              <Badge key={badge} type="pill-color" size="sm" color="gray">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-primary line-clamp-2 group-hover:underline">
          {recipe.name}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-tertiary">
          {recipe.time && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {recipe.time}
            </span>
          )}
          {recipe.calories > 0 && (
            <span>{recipe.calories} kcal</span>
          )}
        </div>
      </div>
    </Link>
  );
}

