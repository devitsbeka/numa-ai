"use client";

import { ChevronDown, ChevronUp } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { cx } from "@/utils/cx";

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface IngredientsPanelProps {
  ingredients: Ingredient[];
  checkedIngredients: string[];
  onToggleIngredient: (ingredientId: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function IngredientsPanel({
  ingredients,
  checkedIngredients,
  onToggleIngredient,
  isVisible,
  onToggleVisibility,
}: IngredientsPanelProps) {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-secondary pb-6 mb-6">
      {/* Header with Toggle */}
      <button
        type="button"
        onClick={onToggleVisibility}
        className="w-full flex items-center justify-between mb-4"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
          Ingredients ({ingredients.length})
        </h2>
        {isVisible ? (
          <ChevronUp className="size-6 text-primary-foreground" />
        ) : (
          <ChevronDown className="size-6 text-primary-foreground" />
        )}
      </button>

      {/* Ingredients List */}
      {isVisible && (
        <div className="space-y-4">
          {ingredients.map((ingredient) => {
            const isChecked = checkedIngredients.includes(ingredient.id);
            return (
              <div
                key={ingredient.id}
                className={cx(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors",
                  isChecked
                    ? "bg-secondary"
                    : "bg-secondary_alt hover:bg-secondary"
                )}
              >
                <Checkbox
                  isSelected={isChecked}
                  onChange={() => onToggleIngredient(ingredient.id)}
                  aria-label={`${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`}
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <p
                    className={cx(
                      "text-xl md:text-2xl font-semibold transition-all",
                      isChecked
                        ? "text-primary-foreground/60 line-through"
                        : "text-primary-foreground"
                    )}
                  >
                    {ingredient.name}
                  </p>
                  <p className="text-lg md:text-xl text-primary-foreground/70 mt-1">
                    {ingredient.amount} {ingredient.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

