import { useState } from "react";
import { ChevronDown, Check } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import type { IngredientCategory } from "@/types/cooking-mode";
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";

interface IngredientSidebarProps {
  categories: IngredientCategory[];
  currentStepIngredients: string[]; // ingredient names needed for current step
  checkedIngredients: Set<string>;
  onToggleIngredient: (name: string) => void;
}

export function IngredientSidebar({
  categories,
  currentStepIngredients,
  checkedIngredients,
  onToggleIngredient,
}: IngredientSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.type))
  );

  const toggleCategory = (categoryType: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryType)) {
        next.delete(categoryType);
      } else {
        next.add(categoryType);
      }
      return next;
    });
  };

  // Filter out empty categories
  const visibleCategories = categories.filter((cat) => cat.ingredients.length > 0);

  return (
    <div className="h-full bg-secondary backdrop-blur-sm border-r border-secondary flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-secondary shrink-0">
        <h2 className="text-2xl font-bold text-primary-foreground">Ingredients</h2>
        <p className="text-sm text-primary-foreground/60 mt-1">
          {checkedIngredients.size} of {categories.reduce((sum, cat) => sum + cat.ingredients.length, 0)} checked
        </p>
      </div>

      {/* Categories */}
      <div className="flex-1 p-4 space-y-3">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {visibleCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.type);
          const categoryCheckedCount = category.ingredients.filter((ing) =>
            checkedIngredients.has(ing.name)
          ).length;

          return (
            <div
              key={category.type}
              className="bg-secondary_alt rounded-lg border border-secondary overflow-hidden"
            >
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.type)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-primary-foreground">
                      {category.name}
                    </h3>
                    <p className="text-xs text-primary-foreground/60">
                      {categoryCheckedCount}/{category.ingredients.length}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cx(
                    "size-5 text-primary-foreground/60 transition-transform duration-200",
                    isExpanded ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {/* Category Ingredients */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {category.ingredients.map((ingredient) => {
                    const isChecked = checkedIngredients.has(ingredient.name);
                    const isNeededNow = currentStepIngredients.includes(
                      ingredient.name
                    );

                    const imageSrc = getIngredientImageSource(ingredient.name, ingredient.image);

                    return (
                      <label
                        key={ingredient.id}
                        className={cx(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                          "hover:bg-secondary",
                          isNeededNow &&
                            "bg-utility-success-500/10 border border-utility-success-500/30 ring-2 ring-utility-success-500/20",
                          !isNeededNow && "bg-secondary_alt"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleIngredient(ingredient.name)}
                          className="hidden"
                        />
                        <div
                          className={cx(
                            "flex items-center justify-center size-6 rounded-full border-2 shrink-0 transition-all duration-200",
                            isChecked
                              ? "bg-utility-success-500 border-utility-success-500"
                              : "border-secondary"
                          )}
                        >
                          {isChecked && (
                            <Check className="size-4 text-primary-foreground" />
                          )}
                        </div>
                        
                        {/* Ingredient Image */}
                        {imageSrc && (
                          <div className="size-10 rounded-full overflow-hidden bg-secondary shrink-0">
                            <img
                              src={imageSrc}
                              alt={ingredient.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className={cx(
                              "text-sm font-medium text-primary-foreground transition-all duration-200 capitalize",
                              isChecked && "line-through opacity-60"
                            )}
                          >
                            {ingredient.name}
                          </p>
                          <p className="text-xs text-primary-foreground/50">
                            {ingredient.amount > 0 ? `${ingredient.amount} ${ingredient.unit}` : "As needed"}
                          </p>
                        </div>
                        {isNeededNow && (
                          <span className="text-xs font-semibold text-utility-success-400 px-2 py-1 bg-utility-success-500/20 rounded">
                            Now
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

