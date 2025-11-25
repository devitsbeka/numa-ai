"use client";

import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { FilterSection } from "@/components/recipes/filter-section";
import { FilterModal, type FilterOptions } from "@/components/recipes/filter-modal";
import { Button } from "@/components/base/buttons/button";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { ToastContainer, useToast } from "@/components/base/toast/toast";
import { useMealPlan } from "@/hooks/use-meal-plan";
import { useCustomRecipes } from "@/hooks/use-custom-recipes";
import { useKitchen } from "@/hooks/use-kitchen";
import { DietPlanCard } from "@/components/diet-plans/diet-plan-card";
import { DietPlanDetailsModal } from "@/components/diet-plans/diet-plan-details-modal";
import { MOCK_DIET_PLANS } from "@/data/mock-diet-plans";
import type { MappedRecipe } from "@/types/spoonacular";
import type { DietPlan } from "@/types/diet-plan";
import type { MealPlanEntry } from "@/hooks/use-meal-plan";
import { RecipeGridSkeleton, DietPlanGridSkeleton } from "@/components/base/skeleton/skeleton";
import { cx } from "@/utils/cx";

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<"recipes" | "diet-plans">("recipes");
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [recipes, setRecipes] = useState<MappedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();
  const { addRecipeToMealPlan, getMealForDate } = useMealPlan();
  const { customRecipes } = useCustomRecipes();
  const { getItemNames } = useKitchen();
  
  // Diet plan state
  const [selectedDietPlanFilter, setSelectedDietPlanFilter] = useState<string | null>(null);
  const [selectedDietPlanDetails, setSelectedDietPlanDetails] = useState<DietPlan | null>(null);
  const [filterByKitchen, setFilterByKitchen] = useState(false);

  // Smooth tab switching
  const handleTabChange = useCallback((key: string) => {
    const newTab = key as "recipes" | "diet-plans";
    if (newTab !== activeTab) {
      startTransition(() => {
        setActiveTab(newTab);
      });
    }
  }, [activeTab]);

  // Filter diet plans
  const filteredDietPlans = useMemo(() => {
    let plans = MOCK_DIET_PLANS;
    
    if (selectedDietPlanFilter) {
      plans = plans.filter((plan) => plan.goal === selectedDietPlanFilter);
    }
    
    return plans;
  }, [selectedDietPlanFilter]);

  // Handle adding diet plan to meal plan
  const handleAddDietPlanToMealPlan = async (
    entries: Omit<MealPlanEntry, "addedAt">[],
    startDate: string
  ) => {
    entries.forEach((entry) => {
      addRecipeToMealPlan(entry, true); // Replace existing meals
    });
  };

  // Load favorites from localStorage - only on client to avoid hydration errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recipeFavorites");
      if (saved) {
        try {
          setFavorites(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error("Error loading favorites:", e);
        }
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && favorites.size > 0) {
      localStorage.setItem("recipeFavorites", JSON.stringify(Array.from(favorites)));
    }
  }, [favorites]);

  // Fetch recipes when filters change
  useEffect(() => {
    if (activeTab !== "recipes") return;

    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          action: "browse",
          number: "24",
        });

        // Quick filter handling
        if (filters.quickFilter) {
          if (filters.quickFilter === "for-you") {
            // For personalized recommendations, use favorites and preferences
            const favoriteIds = Array.from(favorites);
            if (favoriteIds.length > 0) {
              // Could add logic here to fetch based on favorite recipe types/cuisines
            }
          } else if (filters.quickFilter === "breakfast") {
            params.append("type", "breakfast");
          } else if (filters.quickFilter === "lunch") {
            params.append("type", "main course");
          }
        }

        if (filters.mealTypes && filters.mealTypes.length > 0) {
          params.append("type", filters.mealTypes[0]);
        }
        if (filters.cuisines && filters.cuisines.length > 0) {
          params.append("cuisine", filters.cuisines.join(","));
        }
        if (filters.minCalories) {
          params.append("minCalories", filters.minCalories.toString());
        }
        if (filters.maxCalories) {
          params.append("maxCalories", filters.maxCalories.toString());
        }
        if (filters.dietPlan) {
          params.append("diet", "balanced");
        }
        if (filters.sort) {
          params.append("sort", filters.sort);
        }
        if (filters.cookingTime) {
          // Map cooking time to maxReadyTime
          const timeMap: Record<string, number> = {
            "under-15": 15,
            "15-30": 30,
            "30-60": 60,
            "60-plus": 120,
          };
          if (timeMap[filters.cookingTime]) {
            params.append("maxReadyTime", timeMap[filters.cookingTime].toString());
          }
        }
        if (filters.servings) {
          params.append("number", filters.servings.toString());
        }

        // Filter by kitchen ingredients if enabled
        if (filterByKitchen) {
          const kitchenItems = getItemNames();
          if (kitchenItems.length > 0) {
            params.append("includeIngredients", kitchenItems.join(","));
          }
        }

        const response = await fetch(`/api/recipes?${params.toString()}`);
        
        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter, 10) : 60;
          throw new Error(
            `API rate limit exceeded. Please wait ${waitTime} seconds before trying again.`
          );
        }
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
          setRecipes(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch recipes");
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Failed to fetch recipes";
        
        // Provide user-friendly messages for common errors
        if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
          setError(
            "Too many requests. Please wait a moment and try again, or reduce the number of filters."
          );
        } else {
          setError(errorMessage);
        }
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [activeTab, filters, filterByKitchen, getItemNames]);


  const handleFavoriteToggle = (recipeId: string, isFavorite: boolean) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.add(recipeId);
      } else {
        newFavorites.delete(recipeId);
      }
      return newFavorites;
    });
  };


  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <AppHeader
        secondaryNavTabs={{
          selectedKey: activeTab,
          onSelectionChange: handleTabChange,
          items: [
            { id: "recipes", label: "Recipes" },
            { id: "diet-plans", label: "Diet Plans" },
          ],
        }}
        onFiltersClick={() => setIsFiltersModalOpen(true)}
        customRecipesCount={customRecipes.length}
      />
      
      <FilterModal
        isOpen={isFiltersModalOpen}
        onOpenChange={setIsFiltersModalOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Diet Plan Details Modal */}
      {selectedDietPlanDetails && (
        <DietPlanDetailsModal
          dietPlan={selectedDietPlanDetails}
          isOpen={!!selectedDietPlanDetails}
          onClose={() => setSelectedDietPlanDetails(null)}
          onAddToMealPlan={handleAddDietPlanToMealPlan}
          getMealForDate={getMealForDate}
        />
      )}

      <main className="flex-1 pb-12">
        {/* Sticky Header with Filters */}
        {activeTab === "recipes" && (
          <div className="sticky top-0 z-40 border-b border-secondary bg-primary/90 backdrop-blur-md">
            <div className="flex w-full items-center justify-center py-3">
              <div className="flex w-full max-w-container px-4 md:px-8 items-center gap-3">
                <FilterSection
                  filters={filters}
                  onFiltersChange={setFilters}
                />
                <Button
                  size="sm"
                  color={filterByKitchen ? "primary" : "secondary"}
                  onClick={() => setFilterByKitchen(!filterByKitchen)}
                  className="shrink-0 whitespace-nowrap"
                >
                  {filterByKitchen ? "✓ My Kitchen" : "My Kitchen"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Diet Plans Header */}
        {activeTab === "diet-plans" && (
          <div className="sticky top-0 z-40 border-b border-secondary bg-primary/90 backdrop-blur-md">
            <div className="flex w-full items-center justify-center py-4">
              <div className="flex w-full max-w-container items-center gap-2 px-4 md:px-8">
                <div className="flex w-full items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-primary-foreground mb-1">Diet Plans</h1>
                    <p className="text-xs text-primary-foreground/60">
                      Curated meal plans for your goals
                    </p>
                  </div>
                  {/* Diet Plan Navigation Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                      div {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                      }
                    `}</style>
                    <button
                      type="button"
                      onClick={() => setSelectedDietPlanFilter(null)}
                      className={cx(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border",
                        selectedDietPlanFilter === null
                          ? "border-utility-brand-600 bg-utility-brand-600 text-white shadow-sm"
                          : "border-border-secondary bg-bg-primary text-fg-secondary hover:border-border-primary hover:text-fg-primary"
                      )}
                    >
                      All Plans
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDietPlanFilter("detox")}
                      className={cx(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border",
                        selectedDietPlanFilter === "detox"
                          ? "border-utility-brand-600 bg-utility-brand-600 text-white shadow-sm"
                          : "border-border-secondary bg-bg-primary text-fg-secondary hover:border-border-primary hover:text-fg-primary"
                      )}
                    >
                      Detox
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDietPlanFilter("weight-loss")}
                      className={cx(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border",
                        selectedDietPlanFilter === "weight-loss"
                          ? "border-utility-brand-600 bg-utility-brand-600 text-white shadow-sm"
                          : "border-border-secondary bg-bg-primary text-fg-secondary hover:border-border-primary hover:text-fg-primary"
                      )}
                    >
                      Weight Loss
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDietPlanFilter("skin-improvement")}
                      className={cx(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border",
                        selectedDietPlanFilter === "skin-improvement"
                          ? "border-utility-brand-600 bg-utility-brand-600 text-white shadow-sm"
                          : "border-border-secondary bg-bg-primary text-fg-secondary hover:border-border-primary hover:text-fg-primary"
                      )}
                    >
                      Skin Health
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDietPlanFilter("muscle-gain")}
                      className={cx(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border",
                        selectedDietPlanFilter === "muscle-gain"
                          ? "border-utility-brand-600 bg-utility-brand-600 text-white shadow-sm"
                          : "border-border-secondary bg-bg-primary text-fg-secondary hover:border-border-primary hover:text-fg-primary"
                      )}
                    >
                      Muscle Gain
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDietPlanFilter("energy-boost")}
                      className={cx(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap border",
                        selectedDietPlanFilter === "energy-boost"
                          ? "border-utility-brand-600 bg-utility-brand-600 text-white shadow-sm"
                          : "border-border-secondary bg-bg-primary text-fg-secondary hover:border-border-primary hover:text-fg-primary"
                      )}
                    >
                      Energy Boost
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex w-full items-center justify-center">
          <div className="mx-auto max-w-container px-4 md:px-8 w-full">
          {/* Recipes View */}
          {activeTab === "recipes" && (
            <>
              {/* Loading State */}
              {(isLoading || isPending) && <RecipeGridSkeleton count={8} />}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-utility-error-500 mb-4">
                {error}
              </p>
              <Button
                color="primary"
                size="md"
                onClick={() => {
                  setError(null);
                  // Trigger refetch by updating a filter
                  setFilters({ ...filters });
                }}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-primary mb-2">
                No recipes found
              </p>
              <p className="text-sm text-tertiary mb-4">
                Try adjusting your filters or selecting a different category
              </p>
              <Button
                color="secondary"
                size="md"
                onClick={() => {
                  setFilters({});
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Recipes Grid */}
          {!isLoading && !error && recipes.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={favorites.has(recipe.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onMealAdded={(message) => showToast(message, "success")}
                  addRecipeToMealPlan={addRecipeToMealPlan}
                  getMealForDate={getMealForDate}
                />
              ))}
            </div>
          )}
            </>
          )}

          {/* Diet Plans View */}
          {activeTab === "diet-plans" && (
            <>
              {/* Loading State */}
              {isPending && <DietPlanGridSkeleton count={6} />}
              
              {/* Empty State */}
              {!isPending && filteredDietPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 text-6xl">🍽️</div>
                  <p className="text-lg font-semibold text-primary-foreground mb-2">
                    No diet plans found
                  </p>
                  <p className="text-sm text-primary-foreground/60 mb-4">
                    Try selecting a different filter category
                  </p>
                  <Button
                    color="secondary"
                    size="md"
                    onClick={() => setSelectedDietPlanFilter(null)}
                  >
                    Show All Plans
                  </Button>
                </div>
              ) : (
                !isPending && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-6 animate-in fade-in duration-300">
                    {filteredDietPlans.map((plan) => (
                      <DietPlanCard
                        key={plan.id}
                        dietPlan={plan}
                        onClick={setSelectedDietPlanDetails}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
