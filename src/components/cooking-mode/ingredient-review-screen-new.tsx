"use client";

import { useState, useMemo } from "react";
import { ShoppingCart01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { DiningTable } from "./dining-table";
import { CompactIngredientCard } from "./compact-ingredient-card";
import { StepsPreviewCarousel } from "./steps-preview-carousel";
import type { CategorizedIngredient, Diner } from "@/types/cooking-mode";

interface IngredientReviewScreenProps {
  ingredients: CategorizedIngredient[];
  recipeName: string;
  servings?: number;
  readyInMinutes?: number;
  difficulty?: string;
  kitchenItems: string[];
  instructions: string[];
  onStartCooking: () => void;
  onIngredientReplace?: (originalId: string, replacementName: string) => void;
  onToggleInKitchen?: (ingredientName: string) => void;
  diners: Diner[];
  onDinersChange: (diners: Diner[]) => void;
  originalServings?: number;
}

export function IngredientReviewScreen({
  ingredients,
  recipeName,
  readyInMinutes,
  difficulty,
  kitchenItems,
  instructions,
  onStartCooking,
  onToggleInKitchen,
  diners,
  onDinersChange,
  originalServings,
}: IngredientReviewScreenProps) {
  const { addItems } = useShoppingList();

  const inKitchenCount = ingredients.filter((ing) => ing.inKitchen).length;
  const totalCount = ingredients.length;
  const missingCount = totalCount - inKitchenCount;

  // Format quantity for display
  const formatQuantity = (ingredient: CategorizedIngredient) => {
    const amount = ingredient.amount;
    if (amount > 0) {
      const rounded = Math.round(amount * 100) / 100;
      const displayAmount = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
      return `${displayAmount} ${ingredient.unit}`;
    }
    return "As needed";
  };

  // Format time
  const formatTime = (minutes?: number) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Handle add all missing to shopping list
  const handleAddAllMissing = () => {
    const missing = ingredients.filter((ing) => !ing.inKitchen);
    addItems(
      missing.map((ing) => ({
        id: `shop-${Date.now()}-${ing.id}`,
        name: ing.name,
        image: ing.image,
        quantity: ing.amount > 0 ? `${ing.amount} ${ing.unit}` : undefined,
      }))
    );
  };

  // Separate primary and secondary ingredients
  const { primary, secondary } = useMemo(() => {
    const primary: CategorizedIngredient[] = [];
    const secondary: CategorizedIngredient[] = [];

    ingredients.forEach((ing) => {
      if (ing.importance === "crucial") {
        primary.push(ing);
      } else {
        secondary.push(ing);
      }
    });

    return { primary, secondary };
  }, [ingredients]);

  return (
    <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-6 overflow-hidden">
      <div className="w-full max-w-7xl h-full flex flex-col gap-4 min-h-0">
        {/* Header */}
        <div className="text-center shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
            Let's prepare {recipeName}
          </h1>
          <p className="text-sm text-primary-foreground/60">
            {formatTime(readyInMinutes)} • {difficulty || "Medium"}
          </p>
        </div>

        {/* Dining Table Section */}
        <div className="shrink-0">
          <DiningTable
            diners={diners}
            onDinersChange={onDinersChange}
            originalServings={originalServings}
          />
        </div>

        {/* Main Content - Steps and Ingredients */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          {/* Left: Steps Preview */}
          <div className="w-96 shrink-0 flex flex-col gap-4 overflow-hidden">
            <StepsPreviewCarousel steps={instructions} />
          </div>

          {/* Right: Ingredients */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Primary Ingredients */}
            {primary.length > 0 && (
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-utility-error-500" />
                  <h2 className="text-lg font-semibold text-primary-foreground">Primary Ingredients</h2>
                  <span className="text-sm text-primary-foreground/60">({primary.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                  {primary.map((ingredient) => (
                    <CompactIngredientCard
                      key={ingredient.id}
                      ingredient={ingredient}
                      formatQuantity={formatQuantity}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Ingredients */}
            {secondary.length > 0 && (
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="size-3 rounded-full bg-utility-success-500" />
                  <h2 className="text-lg font-semibold text-primary-foreground">Secondary Ingredients</h2>
                  <span className="text-sm text-primary-foreground/60">({secondary.length})</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto pr-2">
                  {secondary.map((ingredient) => (
                    <CompactIngredientCard
                      key={ingredient.id}
                      ingredient={ingredient}
                      formatQuantity={formatQuantity}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 flex items-center justify-between gap-4 pt-4 border-t border-secondary">
          <div className="flex items-center gap-4 text-sm">
            <div className="px-3 py-1.5 rounded-lg bg-secondary_alt border border-secondary">
              <span className="text-primary-foreground/60">Total: </span>
              <span className="font-semibold text-primary-foreground">{totalCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-utility-success-500/20 border border-utility-success-500/50">
              <span className="text-utility-success-400">In Kitchen: {inKitchenCount}</span>
            </div>
            {missingCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-utility-warning-500/20 border border-utility-warning-500/50">
                <span className="text-utility-warning-400">Missing: {missingCount}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {missingCount > 0 && (
              <Button
                size="lg"
                iconLeading={ShoppingCart01}
                onClick={handleAddAllMissing}
                className="bg-utility-warning-600 hover:bg-utility-warning-700 text-white"
              >
                Add Missing to List
              </Button>
            )}
            <Button
              size="xl"
              onClick={onStartCooking}
              className="px-8 py-4 bg-utility-success-600 hover:bg-utility-success-700 text-white text-lg font-bold rounded-xl"
            >
              Start Cooking 🔥
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

