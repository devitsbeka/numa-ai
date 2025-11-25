"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export interface Category {
  id: string;
  label: string;
  type?: string; // Spoonacular type: breakfast, main course, dessert, etc.
  cuisine?: string; // Spoonacular cuisine: italian, mexican, asian, etc.
  icon?: string; // Emoji icon
}

const CATEGORIES: Category[] = [
  { id: "all", label: "All", icon: "🍽️" },
  { id: "breakfast", label: "Breakfast", type: "breakfast", icon: "🥞" },
  { id: "lunch", label: "Lunch", type: "main course", icon: "🍱" },
  { id: "dinner", label: "Dinner", type: "main course", icon: "🍽️" },
  { id: "dessert", label: "Dessert", type: "dessert", icon: "🍰" },
  { id: "italian", label: "Italian", cuisine: "italian", icon: "🍝" },
  { id: "mexican", label: "Mexican", cuisine: "mexican", icon: "🌮" },
  { id: "asian", label: "Asian", cuisine: "asian", icon: "🍜" },
  { id: "healthy", label: "Healthy", icon: "🥗" },
  { id: "quick", label: "Quick", icon: "⚡" },
];

interface CategoryBarProps {
  selectedCategoryId?: string;
  onCategorySelect?: (category: Category) => void;
}

export function CategoryBar({ selectedCategoryId = "all", onCategorySelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    const targetScroll =
      scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative flex w-full items-center gap-2">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-secondary bg-primary shadow-sm hover:bg-primary_hover transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-4 text-primary" />
        </button>
      )}

      {/* Scrollable Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Left Fade */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-primary to-transparent" />
        )}
        {/* Right Fade */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-primary to-transparent" />
        )}

        {/* Categories */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = category.id === selectedCategoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect?.(category)}
                className={cx(
                  "shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                  isSelected
                    ? "border-primary bg-primary text-primary font-semibold shadow-sm"
                    : "border-secondary bg-primary text-tertiary hover:border-primary hover:text-primary"
                )}
              >
                {category.icon && <span className="text-base">{category.icon}</span>}
                <span className="text-sm">{category.label}</span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-secondary bg-primary shadow-sm hover:bg-primary_hover transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="size-4 text-primary" />
        </button>
      )}
    </div>
  );
}

