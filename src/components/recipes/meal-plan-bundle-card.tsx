"use client";

import { Calendar, Clock } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";
import type { MealPlanBundle } from "@/types/spoonacular";
import Link from "next/link";

interface MealPlanBundleCardProps {
  bundle: MealPlanBundle;
  onSelect?: (bundle: MealPlanBundle) => void;
}

export function MealPlanBundleCard({ bundle, onSelect }: MealPlanBundleCardProps) {
  return (
    <div className="group relative flex flex-col cursor-pointer rounded-xl border border-secondary bg-primary shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-quaternary">
        {bundle.image ? (
          <img
            src={bundle.image}
            alt={bundle.description}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="grid grid-cols-3 gap-1 p-4">
              {bundle.recipes.slice(0, 9).map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="aspect-square overflow-hidden rounded bg-primary"
                >
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs">
                      🍽️
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary line-clamp-2 mb-1">
              {bundle.duration} Day Meal Plan
            </h3>
            <p className="text-xs text-tertiary line-clamp-2">
              {bundle.description || `${bundle.recipes.length} carefully curated recipes`}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-tertiary">
          <div className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            <span>{bundle.duration} days</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🍽️</span>
            <span>{bundle.recipes.length} recipes</span>
          </div>
          <div>
            <span>{Math.round(bundle.totalCalories)} kcal/day</span>
          </div>
        </div>

        {/* Action Button */}
        {onSelect ? (
          <Button
            color="primary"
            size="sm"
            onClick={() => onSelect(bundle)}
            className="w-full mt-2"
          >
            Select Plan
          </Button>
        ) : (
          <Link href={`/meal-plans/${bundle.id}`} className="mt-2">
            <Button color="primary" size="sm" className="w-full">
              View Plan
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

