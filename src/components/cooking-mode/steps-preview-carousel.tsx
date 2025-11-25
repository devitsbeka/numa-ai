"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface StepsPreviewCarouselProps {
  steps: string[];
  onStepClick?: (index: number) => void;
  currentStepIndex?: number;
}

// Format step text for display
const formatStepText = (step: string, maxLength: number = 100): string => {
  let cleaned = step.trim().replace(/\s+/g, ' ');
  if (cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  }
  return cleaned;
};

export function StepsPreviewCarousel({
  steps,
  onStepClick,
  currentStepIndex,
}: StepsPreviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    if (scrollRef.current) {
      handleScroll();
    }
  }, [steps]);

  // Auto-scroll to current step
  useEffect(() => {
    if (currentStepIndex !== undefined && stepRefs.current[currentStepIndex] && scrollRef.current) {
      const stepElement = stepRefs.current[currentStepIndex];
      const container = scrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const stepRect = stepElement.getBoundingClientRect();
      
      const scrollLeft = stepRect.left - containerRect.left + container.scrollLeft - (containerRect.width / 2) + (stepRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (steps.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-primary-foreground/60">No steps available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0 px-2">
        <h2 className="text-xs font-semibold text-primary-foreground">Steps ({steps.length})</h2>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="relative flex-1 min-h-0 overflow-visible">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full flex gap-3 overflow-x-auto overflow-y-visible scrollbar-hide items-start px-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {steps.map((step, index) => {
            const isCurrent = currentStepIndex === index;
            return (
              <div
                key={index}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                onClick={() => onStepClick?.(index)}
                className={cx(
                  "shrink-0 w-64 rounded-lg border-2 transition-all duration-200",
                  "flex flex-col text-left cursor-pointer",
                  "h-[300px]",
                  isCurrent
                    ? "bg-utility-success-500/20 border-utility-success-500 shadow-lg scale-105"
                    : "bg-secondary_alt border-secondary hover:border-primary-foreground/30 hover:shadow-sm"
                )}
              >
                {/* Step Number - Top */}
                <div className="flex items-center gap-2 px-3 pt-3 shrink-0">
                  <div className={cx(
                    "size-6 rounded-full border flex items-center justify-center",
                    isCurrent
                      ? "border-utility-success-500"
                      : "border-primary-foreground/40"
                  )}>
                    <span className={cx(
                      "text-sm font-semibold",
                      isCurrent
                        ? "text-utility-success-500"
                        : "text-primary-foreground"
                    )} style={{ fontWeight: 400 }}>
                      {index + 1}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-utility-success-500 uppercase">
                      Current
                    </span>
                  )}
                </div>

                {/* Step Text - Below with 20px gap */}
                <p className="text-base leading-relaxed line-clamp-5 text-primary-foreground/90 px-3 pb-3" style={{ marginTop: '20px' }}>
                  {formatStepText(step, 120)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Left Arrow - positioned relative to outer container, centered on step cards */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm border border-secondary flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4 text-primary-foreground" />
          </button>
        )}

        {/* Right Arrow - positioned relative to outer container, centered on step cards */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm border border-secondary flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4 text-primary-foreground" />
          </button>
        )}

        {/* Fade gradients */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-primary to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-primary to-transparent pointer-events-none" />
        )}

        {/* Scrollbar Style */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}

