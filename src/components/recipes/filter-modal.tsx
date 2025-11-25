"use client";

import { useState, ReactNode, useEffect } from "react";
import { X } from "@untitledui/icons";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { Toggle } from "@/components/base/toggle/toggle";
import { RadioGroup, RadioButton } from "@/components/base/radio-buttons/radio-buttons";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { cx } from "@/utils/cx";

export interface FilterOptions {
  // Existing
  minCalories?: number;
  maxCalories?: number;
  dietPlan?: boolean;
  sort?: "popularity" | "time" | "healthiness";
  mealTypes?: string[];
  cuisines?: string[];
  calorieRange?: string;
  
  // New
  cookingTime?: string;
  difficulty?: string;
  dietaryRestrictions?: string[];
  servings?: number;
  includeIngredients?: string;
  excludeIngredients?: string;
  quickFilter?: string; // For "For You", "Breakfast", etc.
}

interface FilterModalProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
  trigger?: React.ReactNode;
}

const SORT_OPTIONS = [
  { id: "popularity", label: "Most Popular" },
  { id: "time", label: "Quickest Preparation Time" },
  { id: "healthiness", label: "Healthiest" },
  { id: "likes", label: "Most Likes" },
] as const;

const COOKING_TIME_OPTIONS = [
  { id: "under-15", label: "Under 15 min" },
  { id: "15-30", label: "15-30 min" },
  { id: "30-60", label: "30-60 min" },
  { id: "60-plus", label: "1+ hour" },
];

const DIFFICULTY_OPTIONS = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const CUISINES = [
  { id: "italian", label: "Italian" },
  { id: "mexican", label: "Mexican" },
  { id: "spanish", label: "Spanish" },
  { id: "asian", label: "Asian" },
  { id: "american", label: "American" },
  { id: "french", label: "French" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "indian", label: "Indian" },
];

const DIETARY_RESTRICTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "nut-free", label: "Nut-free" },
];

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
  { id: "dessert", label: "Dessert" },
];

const SERVINGS_OPTIONS = [
  { id: "1-2", label: "1-2 servings" },
  { id: "3-4", label: "3-4 servings" },
  { id: "5-6", label: "5-6 servings" },
  { id: "7-plus", label: "7+ servings" },
];

export function FilterModal({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  filters = {},
  onFiltersChange,
  trigger,
}: FilterModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen;

  // Sync local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange?.(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setLocalFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  const handleCuisineToggle = (cuisineId: string) => {
    const currentCuisines = localFilters.cuisines || [];
    const newCuisines = currentCuisines.includes(cuisineId)
      ? currentCuisines.filter(id => id !== cuisineId)
      : [...currentCuisines, cuisineId];
    setLocalFilters({ ...localFilters, cuisines: newCuisines.length > 0 ? newCuisines : undefined });
  };

  const handleDietaryRestrictionToggle = (restrictionId: string) => {
    const current = localFilters.dietaryRestrictions || [];
    const newRestrictions = current.includes(restrictionId)
      ? current.filter(id => id !== restrictionId)
      : [...current, restrictionId];
    setLocalFilters({ ...localFilters, dietaryRestrictions: newRestrictions.length > 0 ? newRestrictions : undefined });
  };

  const handleMealTypeToggle = (mealTypeId: string) => {
    const current = localFilters.mealTypes || [];
    const newMealTypes = current.includes(mealTypeId)
      ? current.filter(id => id !== mealTypeId)
      : [...current, mealTypeId];
    setLocalFilters({ ...localFilters, mealTypes: newMealTypes.length > 0 ? newMealTypes : undefined });
  };

  const hasActiveFilters =
    localFilters.minCalories ||
    localFilters.maxCalories ||
    localFilters.dietPlan ||
    localFilters.sort ||
    (localFilters.cuisines && localFilters.cuisines.length > 0) ||
    localFilters.cookingTime ||
    localFilters.difficulty ||
    (localFilters.dietaryRestrictions && localFilters.dietaryRestrictions.length > 0) ||
    (localFilters.mealTypes && localFilters.mealTypes.length > 0) ||
    localFilters.servings ||
    localFilters.includeIngredients ||
    localFilters.excludeIngredients;

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <ModalOverlay isDismissable>
        <Modal className="max-w-2xl max-h-[90vh]">
          <Dialog className="flex flex-col rounded-lg border border-secondary bg-primary shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-secondary p-6">
              <h2 className="text-lg font-semibold text-primary">Filters</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary_hover transition-colors"
                aria-label="Close"
              >
                <X className="size-5 text-tertiary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cuisine Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map((cuisine) => {
                    const isSelected = localFilters.cuisines?.includes(cuisine.id) || false;
                    return (
                      <button
                        key={cuisine.id}
                        type="button"
                        onClick={() => handleCuisineToggle(cuisine.id)}
                        className={cx(
                          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                          isSelected
                            ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                            : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                        )}
                      >
                        {cuisine.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meal Type */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Meal Type</h3>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((mealType) => {
                    const isSelected = localFilters.mealTypes?.includes(mealType.id) || false;
                    return (
                      <button
                        key={mealType.id}
                        type="button"
                        onClick={() => handleMealTypeToggle(mealType.id)}
                        className={cx(
                          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                          isSelected
                            ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                            : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                        )}
                      >
                        {mealType.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calories Range */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Calories</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      label="Min Calories"
                      value={localFilters.minCalories?.toString() || ""}
                      onChange={(value) =>
                        setLocalFilters({
                          ...localFilters,
                          minCalories: value ? parseInt(value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="2000"
                      label="Max Calories"
                      value={localFilters.maxCalories?.toString() || ""}
                      onChange={(value) =>
                        setLocalFilters({
                          ...localFilters,
                          maxCalories: value ? parseInt(value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Cooking Time */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Cooking Time</h3>
                <Select
                  placeholder="Select cooking time"
                  size="sm"
                  selectedKey={localFilters.cookingTime}
                  onSelectionChange={(key) =>
                    setLocalFilters({ ...localFilters, cookingTime: key as string })
                  }
                  items={COOKING_TIME_OPTIONS}
                >
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((difficulty) => {
                    const isSelected = localFilters.difficulty === difficulty.id;
                    return (
                      <button
                        key={difficulty.id}
                        type="button"
                        onClick={() =>
                          setLocalFilters({
                            ...localFilters,
                            difficulty: isSelected ? undefined : difficulty.id,
                          })
                        }
                        className={cx(
                          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border leading-none",
                          isSelected
                            ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                            : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
                        )}
                      >
                        {difficulty.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Dietary Restrictions</h3>
                <div className="flex flex-col gap-2">
                  {DIETARY_RESTRICTIONS.map((restriction) => {
                    const isSelected = localFilters.dietaryRestrictions?.includes(restriction.id) || false;
                    return (
                      <label
                        key={restriction.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          isSelected={isSelected}
                          onChange={(selected) => {
                            if (selected) {
                              handleDietaryRestrictionToggle(restriction.id);
                            } else {
                              handleDietaryRestrictionToggle(restriction.id);
                            }
                          }}
                        />
                        <span className="text-sm text-secondary">{restriction.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Servings */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Servings</h3>
                <Select
                  placeholder="Select servings"
                  size="sm"
                  selectedKey={localFilters.servings?.toString()}
                  onSelectionChange={(key) => {
                    const value = key as string;
                    const servingsMap: Record<string, number> = {
                      "1-2": 2,
                      "3-4": 4,
                      "5-6": 6,
                      "7-plus": 8,
                    };
                    setLocalFilters({
                      ...localFilters,
                      servings: value ? servingsMap[value] : undefined,
                    });
                  }}
                  items={SERVINGS_OPTIONS}
                >
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              </div>

              {/* Ingredients */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Ingredients</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Include ingredients (comma separated)"
                    label="Include"
                    value={localFilters.includeIngredients || ""}
                    onChange={(value) =>
                      setLocalFilters({ ...localFilters, includeIngredients: value || undefined })
                    }
                  />
                  <Input
                    placeholder="Exclude ingredients (comma separated)"
                    label="Exclude"
                    value={localFilters.excludeIngredients || ""}
                    onChange={(value) =>
                      setLocalFilters({ ...localFilters, excludeIngredients: value || undefined })
                    }
                  />
                </div>
              </div>

              {/* Diet Plan Toggle */}
              <div className="flex items-center justify-between border-t border-secondary pt-6">
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-primary">My Diet Plan</h3>
                  <p className="text-xs text-tertiary mt-1">
                    Apply balanced nutrition and dietary restrictions
                  </p>
                </div>
                <Toggle
                  size="md"
                  isSelected={localFilters.dietPlan || false}
                  onChange={(isSelected) =>
                    setLocalFilters({ ...localFilters, dietPlan: isSelected })
                  }
                />
              </div>

              {/* Sort Options */}
              <div className="space-y-3 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Sort by</h3>
                <RadioGroup
                  value={localFilters.sort || "popularity"}
                  onChange={(value: string) =>
                    setLocalFilters({ ...localFilters, sort: value as FilterOptions["sort"] })
                  }
                >
                  {SORT_OPTIONS.map((opt) => (
                    <RadioButton key={opt.id} value={opt.id} label={opt.label} />
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-secondary p-6 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className={cx(
                  "text-sm font-medium text-primary hover:underline",
                  !hasActiveFilters && "text-tertiary cursor-not-allowed"
                )}
                disabled={!hasActiveFilters}
              >
                Clear all
              </button>
              <div className="flex gap-2">
                <Button
                  color="secondary"
                  size="md"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button color="primary" size="md" onClick={handleApply}>
                  Show recipes
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
