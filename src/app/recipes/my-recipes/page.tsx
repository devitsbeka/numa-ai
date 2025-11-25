"use client";

import { useState } from "react";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { FilterSection } from "@/components/recipes/filter-section";
import { FilterModal, type FilterOptions } from "@/components/recipes/filter-modal";
import { Button } from "@/components/base/buttons/button";
import { ToastContainer, useToast } from "@/components/base/toast/toast";
import { useCustomRecipes } from "@/hooks/use-custom-recipes";
import { useMealPlan } from "@/hooks/use-meal-plan";
import { RecipeCreatorModal } from "@/components/recipes/recipe-creator-modal";
import { CustomRecipeCard } from "@/components/recipes/custom-recipe-card";
import { AddRecipeCard } from "@/components/recipes/add-recipe-card";
import { Plus } from "@untitledui/icons";

export default function MyRecipesPage() {
  const { customRecipes } = useCustomRecipes();
  const { addRecipeToMealPlan, getMealForDate } = useMealPlan();
  const { toasts, showToast, dismissToast } = useToast();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <AppHeader
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

      <main className="flex-1 pb-12">
        {/* Sticky Header with Filters */}
        <div className="sticky top-0 z-40 border-b border-secondary bg-primary/90 backdrop-blur-md">
          <div className="flex w-full items-center justify-center py-3">
            <div className="flex w-full max-w-container px-4 md:px-8">
              <FilterSection
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex w-full items-center justify-center">
          <div className="mx-auto max-w-container px-4 md:px-8 w-full py-8">
            {customRecipes.length === 0 ? (
              <EmptyState size="lg">
                <EmptyState.Header>
                  <div className="flex items-center justify-center size-14 rounded-full bg-utility-gray-50 text-utility-gray-700">
                    <span className="text-3xl">📖</span>
                  </div>
                </EmptyState.Header>
                <EmptyState.Content>
                  <EmptyState.Title>No recipes yet</EmptyState.Title>
                  <EmptyState.Description>
                    Create your first custom recipe and add it to your meal plans
                  </EmptyState.Description>
                </EmptyState.Content>
                <EmptyState.Footer>
                  <Button
                    color="primary"
                    size="md"
                    iconLeading={Plus}
                    onClick={() => setIsCreatorOpen(true)}
                  >
                    Add Recipe
                  </Button>
                </EmptyState.Footer>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {customRecipes.map((recipe) => (
                  <CustomRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onMealAdded={(message) => showToast(message, "success")}
                    addRecipeToMealPlan={addRecipeToMealPlan}
                    getMealForDate={getMealForDate}
                  />
                ))}
                <AddRecipeCard onClick={() => setIsCreatorOpen(true)} />
              </div>
            )}
          </div>
        </div>
      </main>

      <RecipeCreatorModal
        isOpen={isCreatorOpen}
        onOpenChange={setIsCreatorOpen}
      />
    </div>
  );
}

