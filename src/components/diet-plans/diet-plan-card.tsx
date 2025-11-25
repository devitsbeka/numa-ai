"use client";

import { useState, useMemo } from "react";
import { Star01, Clock, ArrowLeft, ArrowRight } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";
import type { DietPlan } from "@/types/diet-plan";
import Image from "next/image";

interface DietPlanCardProps {
  dietPlan: DietPlan;
  onClick?: (dietPlan: DietPlan) => void;
}

export function DietPlanCard({ dietPlan, onClick }: DietPlanCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Organize meals into slides (weeks or day groups)
  const mealSlides = useMemo(() => {
    const slides: Array<{ label: string; days: typeof dietPlan.dailyMeals }> = [];
    
    if (dietPlan.duration <= 7) {
      // For 7 days or less, show all days in one slide
      slides.push({
        label: "All Days",
        days: dietPlan.dailyMeals,
      });
    } else if (dietPlan.duration <= 14) {
      // For 14 days, split into Week 1 and Week 2
      slides.push({
        label: "Week 1",
        days: dietPlan.dailyMeals.slice(0, 7),
      });
      slides.push({
        label: "Week 2",
        days: dietPlan.dailyMeals.slice(7, 14),
      });
    } else {
      // For 21+ days, split into weeks of 7 days each
      const weeks = Math.ceil(dietPlan.duration / 7);
      for (let week = 0; week < weeks; week++) {
        const startDay = week * 7;
        const endDay = Math.min(startDay + 7, dietPlan.duration);
        slides.push({
          label: `Week ${week + 1}`,
          days: dietPlan.dailyMeals.slice(startDay, endDay),
        });
      }
    }
    
    return slides;
  }, [dietPlan.dailyMeals, dietPlan.duration]);

  const currentSlideData = mealSlides[currentSlide];
  const hasMultipleSlides = mealSlides.length > 1;

  return (
    <div
      onClick={() => onClick?.(dietPlan)}
      className={cx(
        "group cursor-pointer rounded-xl overflow-hidden",
        "bg-secondary_alt border-2 border-secondary",
        "transition-all duration-200",
        "hover:border-primary-foreground/30 hover:shadow-lg hover:-translate-y-1"
      )}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-secondary">
        {!imageError && dietPlan.coverImage ? (
          <Image
            src={dietPlan.coverImage}
            alt={dietPlan.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-utility-brand-500/20 to-utility-success-500/20">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Meal Preview Grid on Hover */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/90 backdrop-blur-md z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Week/Day Label */}
          <div className="text-sm font-semibold text-primary-foreground mb-4">
            {currentSlideData?.label}
          </div>

          {/* Meal Grid */}
          <div className="flex-1 flex items-center justify-center w-full px-4">
            <div className="grid grid-cols-7 gap-3 max-w-full">
              {currentSlideData?.days.map((day, dayIndex) => (
                <div key={dayIndex} className="flex flex-col gap-2 items-center">
                  {/* Day Label */}
                  <div className="text-[10px] font-medium text-primary-foreground/90">
                    Day {day.day}
                  </div>
                  {/* Breakfast */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary bg-secondary shadow-md">
                    {day.breakfast.image ? (
                      <Image
                        src={day.breakfast.image}
                        alt={day.breakfast.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm bg-utility-brand-500/20">🍳</div>
                    )}
                  </div>
                  {/* Lunch */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary bg-secondary shadow-md">
                    {day.lunch.image ? (
                      <Image
                        src={day.lunch.image}
                        alt={day.lunch.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm bg-utility-success-500/20">🍽️</div>
                    )}
                  </div>
                  {/* Dinner */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary bg-secondary shadow-md">
                    {day.dinner.image ? (
                      <Image
                        src={day.dinner.image}
                        alt={day.dinner.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm bg-utility-indigo-500/20">🌙</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {hasMultipleSlides && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide((prev) => (prev > 0 ? prev - 1 : mealSlides.length - 1));
                }}
                className="p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                aria-label="Previous week"
              >
                <ArrowLeft className="size-4 text-primary-foreground" />
              </button>
              
              {/* Slide Indicators */}
              <div className="flex gap-1.5">
                {mealSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(index);
                    }}
                    className={cx(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentSlide
                        ? "bg-primary-foreground w-6"
                        : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
                    )}
                    aria-label={`Go to ${mealSlides[index].label}`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide((prev) => (prev < mealSlides.length - 1 ? prev + 1 : 0));
                }}
                className="p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                aria-label="Next week"
              >
                <ArrowRight className="size-4 text-primary-foreground" />
              </button>
            </div>
          )}
        </div>
        
        {/* Duration Badge */}
        <div className="absolute top-3 right-3 z-20">
          <Badge color="brand" size="sm" className="backdrop-blur-sm bg-primary/90">
            {dietPlan.duration} Days
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-primary-foreground mb-2 line-clamp-2 group-hover:text-utility-brand-500 transition-colors">
          {dietPlan.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-primary-foreground/70 mb-3 line-clamp-2">
          {dietPlan.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dietPlan.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} color="gray" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary">
          {/* Rating */}
          {dietPlan.rating && (
            <div className="flex items-center gap-1">
              <Star01 className="size-4 text-utility-warning-500 fill-utility-warning-500" />
              <span className="text-sm font-medium text-primary-foreground">
                {dietPlan.rating}
              </span>
              {dietPlan.reviewCount && (
                <span className="text-xs text-primary-foreground/60">
                  ({dietPlan.reviewCount})
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Weight Loss Estimate */}
            {dietPlan.estimatedWeightLoss !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {dietPlan.estimatedWeightLoss > 0 ? (
                  <>
                    <span className="text-utility-success-500 font-semibold">
                      -{dietPlan.estimatedWeightLoss} kg
                    </span>
                    <span className="text-primary-foreground/60 text-xs">avg</span>
                  </>
                ) : dietPlan.estimatedWeightLoss < 0 ? (
                  <>
                    <span className="text-utility-brand-500 font-semibold">
                      +{Math.abs(dietPlan.estimatedWeightLoss)} kg
                    </span>
                    <span className="text-primary-foreground/60 text-xs">muscle</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Calories */}
            {dietPlan.avgCaloriesPerDay && (
              <div className="flex items-center gap-1 text-sm text-primary-foreground/60">
                <Clock className="size-4" />
                <span>{dietPlan.avgCaloriesPerDay} cal/day</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

