"use client";

import { Plus } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface AddRecipeCardProps {
  onClick: () => void;
}

export function AddRecipeCard({ onClick }: AddRecipeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group relative flex flex-col aspect-[4/3] w-full rounded-lg",
        "border-2 border-dashed border-utility-gray-300",
        "bg-transparent hover:bg-utility-gray-50/30",
        "transition-all duration-200 cursor-pointer",
        "hover:border-utility-brand-600 hover:border-solid"
      )}
      aria-label="Add new recipe"
    >
      {/* Skeleton Layout - Very Transparent */}
      <div className="absolute inset-0 p-4 flex flex-col gap-2 opacity-10">
        {/* Image skeleton */}
        <div className="h-24 w-full rounded bg-utility-gray-300" />
        {/* Title skeleton */}
        <div className="h-4 w-3/4 rounded bg-utility-gray-300" />
        {/* Subtitle skeleton */}
        <div className="h-3 w-1/2 rounded bg-utility-gray-300" />
        {/* Info row skeleton */}
        <div className="flex gap-2 mt-auto">
          <div className="h-3 w-16 rounded bg-utility-gray-300" />
          <div className="h-3 w-20 rounded bg-utility-gray-300" />
        </div>
      </div>

      {/* Plus Icon - Centered on top */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className={cx(
            "flex items-center justify-center",
            "size-12 rounded-full",
            "bg-utility-brand-600 text-white",
            "transition-transform duration-200",
            "group-hover:scale-110 group-hover:shadow-lg"
          )}
        >
          <Plus className="size-6" />
        </div>
      </div>
    </button>
  );
}

