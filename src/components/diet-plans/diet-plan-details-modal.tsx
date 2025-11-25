"use client";

import { useState, useMemo } from "react";
import { X, Calendar as CalendarIcon, ChevronDown, ChevronUp, ShoppingBag02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import type { DietPlan, DailyMealPlan } from "@/types/diet-plan";
import type { MealPlanEntry } from "@/hooks/use-meal-plan";
import Image from "next/image";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { ToastContainer, useToast } from "@/components/base/toast/toast";

interface DietPlanDetailsModalProps {
  dietPlan: DietPlan;
  isOpen: boolean;
  onClose: () => void;
  onAddToMealPlan: (entries: Omit<MealPlanEntry, "addedAt">[], startDate: string) => Promise<void>;
  getMealForDate?: (date: string, mealType: "breakfast" | "lunch" | "dinner") => MealPlanEntry[];
}

export function DietPlanDetailsModal({
  dietPlan,
  isOpen,
  onClose,
  onAddToMealPlan,
  getMealForDate,
}: DietPlanDetailsModalProps) {
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1, 2, 3]));
  const [isAdding, setIsAdding] = useState(false);
  const [addToShoppingList, setAddToShoppingList] = useState(false);
  const { addItem } = useShoppingList();
  const { toasts, showToast, dismissToast } = useToast();

  // Check for conflicts
  const conflicts = useMemo(() => {
    if (!getMealForDate) return [];
    const conflictDates: string[] = [];
    const startDate = new Date(selectedStartDate);
    
    dietPlan.dailyMeals.forEach((dayPlan, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      const dateStr = currentDate.toISOString().split("T")[0];
      
      const hasBreakfast = getMealForDate(dateStr, "breakfast").length > 0;
      const hasLunch = getMealForDate(dateStr, "lunch").length > 0;
      const hasDinner = getMealForDate(dateStr, "dinner").length > 0;
      
      if (hasBreakfast || hasLunch || hasDinner) {
        conflictDates.push(dateStr);
      }
    });
    
    return conflictDates;
  }, [selectedStartDate, dietPlan.dailyMeals, getMealForDate]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const handleAddToMealPlan = async () => {
    if (!selectedStartDate) {
      showToast("Please select a start date", "error");
      return;
    }

    setIsAdding(true);
    try {
      const startDate = new Date(selectedStartDate);
      const entries: Omit<MealPlanEntry, "addedAt">[] = [];

      dietPlan.dailyMeals.forEach((dayPlan) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayPlan.day - 1);
        const dateStr = currentDate.toISOString().split("T")[0];

        entries.push(
          {
            recipeId: dayPlan.breakfast.id,
            recipeName: dayPlan.breakfast.name,
            recipeImage: dayPlan.breakfast.image,
            date: dateStr,
            mealType: "breakfast",
          },
          {
            recipeId: dayPlan.lunch.id,
            recipeName: dayPlan.lunch.name,
            recipeImage: dayPlan.lunch.image,
            date: dateStr,
            mealType: "lunch",
          },
          {
            recipeId: dayPlan.dinner.id,
            recipeName: dayPlan.dinner.name,
            recipeImage: dayPlan.dinner.image,
            date: dateStr,
            mealType: "dinner",
          }
        );
      });

      await onAddToMealPlan(entries, selectedStartDate);

      // Add to shopping list if requested
      if (addToShoppingList) {
        const allIngredients = dietPlan.dailyMeals.flatMap((day) => [
          ...(day.breakfast.ingredients || []),
          ...(day.lunch.ingredients || []),
          ...(day.dinner.ingredients || []),
        ]);
        
        const uniqueIngredients = Array.from(
          new Map(allIngredients.map((ing) => [ing.id || ing.name, ing])).values()
        );

        uniqueIngredients.forEach((ing) => {
          addItem({
            id: `shop-${Date.now()}-${ing.id || ing.name}`,
            name: ing.name,
            image: ing.image,
            quantity: ing.quantity,
          });
        });
        showToast("Added ingredients to shopping list", "success");
      }

      showToast(`Added ${dietPlan.title} to your meal plan!`, "success");
      onClose();
    } catch (error) {
      console.error("Error adding diet plan to meal plan:", error);
      showToast("Failed to add diet plan", "error");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] bg-primary rounded-2xl border-2 border-secondary shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-64 overflow-hidden bg-secondary">
            {dietPlan.coverImage && (
              <Image
                src={dietPlan.coverImage}
                alt={dietPlan.title}
                fill
                className="object-cover"
                sizes="800px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm border border-secondary flex items-center justify-center hover:bg-primary transition-colors z-10"
            >
              <X className="size-5 text-primary-foreground" />
            </button>

            {/* Title Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                    {dietPlan.title}
                  </h1>
                  <p className="text-primary-foreground/80 mb-3">
                    {dietPlan.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dietPlan.tags.map((tag) => (
                      <Badge key={tag} color="gray" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <Badge color="brand" size="lg">
                    {dietPlan.duration} Days
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-4 border-b border-secondary bg-secondary_alt/50">
            <div className="flex items-center gap-6 text-sm">
              {dietPlan.avgCaloriesPerDay && (
                <div>
                  <span className="text-primary-foreground/60">Avg Calories: </span>
                  <span className="font-semibold text-primary-foreground">
                    {dietPlan.avgCaloriesPerDay} cal/day
                  </span>
                </div>
              )}
              {dietPlan.macros && (
                <div>
                  <span className="text-primary-foreground/60">Macros: </span>
                  <span className="font-semibold text-primary-foreground">
                    P: {dietPlan.macros.protein} • C: {dietPlan.macros.carbs} • F: {dietPlan.macros.fats}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            `}</style>
            <div className="p-6">
              {/* Timeline Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-primary-foreground mb-2">
                  Meal Plan Timeline
                </h2>
                <p className="text-sm text-primary-foreground/60">
                  {dietPlan.duration} days of carefully planned meals
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {dietPlan.dailyMeals.map((dayPlan) => {
                  const isExpanded = expandedDays.has(dayPlan.day);
                  return (
                    <div
                      key={dayPlan.day}
                      className="border-2 border-secondary rounded-xl overflow-hidden bg-secondary_alt"
                    >
                      {/* Day Header */}
                      <button
                        onClick={() => toggleDay(dayPlan.day)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-utility-brand-500/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-utility-brand-500">
                              {dayPlan.day}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-primary-foreground group-hover:text-utility-brand-500 transition-colors">
                            Day {dayPlan.day}
                          </h3>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-5 text-primary-foreground/60" />
                        ) : (
                          <ChevronDown className="size-5 text-primary-foreground/60" />
                        )}
                      </button>

                      {/* Day Meals */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* Breakfast */}
                          <MealCard
                            mealType="Breakfast"
                            recipe={dayPlan.breakfast}
                          />
                          {/* Lunch */}
                          <MealCard
                            mealType="Lunch"
                            recipe={dayPlan.lunch}
                          />
                          {/* Dinner */}
                          <MealCard
                            mealType="Dinner"
                            recipe={dayPlan.dinner}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer - Action Bar */}
          <div className="border-t border-secondary bg-secondary_alt p-6">
            <div className="space-y-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-primary-foreground mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={selectedStartDate}
                  onChange={setSelectedStartDate}
                  size="md"
                  className="w-full"
                />
              </div>

              {/* Conflict Warning */}
              {conflicts.length > 0 && (
                <div className="px-4 py-3 rounded-lg bg-utility-warning-500/20 border border-utility-warning-500/50">
                  <p className="text-sm text-utility-warning-400">
                    ⚠️ {conflicts.length} day{conflicts.length > 1 ? "s" : ""} already have meals. They will be replaced.
                  </p>
                </div>
              )}

              {/* Shopping List Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add-to-shopping"
                  checked={addToShoppingList}
                  onChange={(e) => setAddToShoppingList(e.target.checked)}
                  className="w-4 h-4 rounded border-secondary"
                />
                <label
                  htmlFor="add-to-shopping"
                  className="text-sm text-primary-foreground cursor-pointer flex items-center gap-2"
                >
                  <ShoppingBag02 className="size-4" />
                  Add all ingredients to Shopping List
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  color="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  color="primary"
                  onClick={handleAddToMealPlan}
                  isDisabled={isAdding || !selectedStartDate}
                  iconLeading={CalendarIcon}
                  className="flex-1"
                >
                  {isAdding ? "Adding..." : "Start Plan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function MealCard({
  mealType,
  recipe,
}: {
  mealType: string;
  recipe: DailyMealPlan["breakfast"];
}) {
  const mealTypeColors: Record<string, string> = {
    Breakfast: "bg-utility-warning-500/20 border-utility-warning-500/30",
    Lunch: "bg-utility-success-500/20 border-utility-success-500/30",
    Dinner: "bg-utility-brand-500/20 border-utility-brand-500/30",
  };

  return (
    <div className={cx(
      "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
      mealTypeColors[mealType] || "bg-primary border-secondary"
    )}>
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 border border-secondary">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-primary-foreground/60 mb-1 uppercase tracking-wide">
          {mealType}
        </div>
        <h4 className="text-sm font-semibold text-primary-foreground truncate">
          {recipe.name}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          {recipe.calories && (
            <div className="text-xs text-primary-foreground/60">
              {recipe.calories} cal
            </div>
          )}
          {recipe.readyInMinutes && (
            <div className="text-xs text-primary-foreground/60">
              {recipe.readyInMinutes} min
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

