"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@/utils/cx";
import type { FilterOptions } from "./filter-modal";

interface FilterSectionProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

// Predefined quick filters
const PREDEFINED_QUICK_FILTERS = [
  { id: "for-you", label: "For You", icon: "✨", isPredefined: true },
  { id: "breakfast", label: "Breakfast", icon: "🥞", isPredefined: true },
  { id: "lunch", label: "Lunch", icon: "🍱", isPredefined: true },
  { id: "game-night", label: "Game Night", icon: "🎮", isPredefined: true },
  { id: "halloween", label: "Halloween", icon: "🎃", isPredefined: true },
  { id: "christmas", label: "Christmas", icon: "🎄", isPredefined: true },
];

// Initial visible count (show first 6, then "Show more" button)
const INITIAL_VISIBLE_COUNT = 6;

export function FilterSection({ filters, onFiltersChange }: FilterSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [dynamicFilters, setDynamicFilters] = useState<Array<{ id: string; label: string; icon?: string; isPredefined: boolean }>>([]);
  const isMyRecipesPage = pathname === "/recipes/my-recipes";

  // Load dynamic filters from localStorage (based on user interactions)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dynamicRecipeFilters");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDynamicFilters(parsed);
        } catch (e) {
          console.error("Error loading dynamic filters:", e);
        }
      }
    }
  }, []);

  // Combine predefined and dynamic filters
  const allQuickFilters = [...PREDEFINED_QUICK_FILTERS, ...dynamicFilters];
  const visibleFilters = showAllFilters 
    ? allQuickFilters 
    : allQuickFilters.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreFilters = allQuickFilters.length > INITIAL_VISIBLE_COUNT;

  const handleQuickFilterSelect = (filterId: string) => {
    // If on My Recipes page, navigate to main recipes page with filter
    if (isMyRecipesPage) {
      router.push(`/recipes?filter=${filterId}`);
      return;
    }

    const newFilters = { ...filters };
    
    // If clicking the same filter, deselect it
    if (filters.quickFilter === filterId) {
      newFilters.quickFilter = undefined;
    } else {
      newFilters.quickFilter = filterId;
    }
    
    onFiltersChange(newFilters);
  };

  // Set "For You" as default on first visit
  useEffect(() => {
    if (!filters.quickFilter && allQuickFilters.length > 0) {
      onFiltersChange({ ...filters, quickFilter: "for-you" });
    }
  }, []);

  return (
    <div className="flex items-center gap-2 w-full overflow-x-auto">
      {visibleFilters.map((filter) => {
        const isSelected = filters.quickFilter === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => handleQuickFilterSelect(filter.id)}
            className={cx(
              "shrink-0 flex items-center gap-1.5 rounded-lg px-4 h-8 text-xs font-medium transition-all whitespace-nowrap border leading-none shadow-[0_0_0_1px_rgba(255,255,255,0.5)]",
              isSelected
                ? "border-utility-brand-600 bg-utility-brand-600 text-white"
                : "border-utility-gray-300 bg-transparent text-fg-secondary hover:border-utility-gray-400 hover:text-fg-primary"
            )}
          >
            {filter.icon && (
              <span className="text-[1.15rem] leading-none">{filter.icon}</span>
            )}
            <span className="leading-none">{filter.label}</span>
          </button>
        );
      })}
      
      {hasMoreFilters && !showAllFilters && (
        <button
          type="button"
          onClick={() => setShowAllFilters(true)}
          className="shrink-0 rounded-lg px-3 h-8 flex items-center text-xs font-medium border border-utility-gray-300 bg-transparent text-fg-primary leading-none shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
        >
          Show more
        </button>
      )}
    </div>
  );
}
