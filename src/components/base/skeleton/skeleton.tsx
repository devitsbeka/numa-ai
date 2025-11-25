"use client";

import { cx } from "@/utils/cx";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({ 
  className, 
  variant = "rectangular", 
  width, 
  height,
  animation = "pulse"
}: SkeletonProps) {
  const baseClasses = cx(
    "bg-quaternary",
    animation === "pulse" && "animate-pulse",
    animation === "wave" && "animate-shimmer",
    variant === "circular" && "rounded-full",
    variant === "rectangular" && "rounded-md",
    variant === "text" && "rounded"
  );

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div 
      className={cx(baseClasses, className)} 
      style={style}
      aria-hidden="true"
    />
  );
}

// Recipe Card Skeleton
export function RecipeCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton variant="rectangular" className="aspect-[4/3] w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" height={20} className="w-3/4" />
        <Skeleton variant="text" height={16} className="w-1/2" />
      </div>
    </div>
  );
}

// Grid of Recipe Card Skeletons
export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Diet Plan Card Skeleton
export function DietPlanCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl overflow-hidden bg-secondary_alt border-2 border-secondary">
      <Skeleton variant="rectangular" className="aspect-[4/3] w-full" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton variant="text" height={24} className="w-3/4" />
        <Skeleton variant="text" height={16} className="w-full" />
        <Skeleton variant="text" height={16} className="w-2/3" />
        <div className="flex gap-2 mt-2">
          <Skeleton variant="rectangular" height={24} width={60} className="rounded-md" />
          <Skeleton variant="rectangular" height={24} width={60} className="rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Diet Plan Grid Skeleton
export function DietPlanGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <DietPlanCardSkeleton key={i} />
      ))}
    </div>
  );
}

