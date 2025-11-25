"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, ShoppingCart01, Box, Calendar as CalendarIcon, Trash01, X, Clock, ThumbsUp, ThumbsDown, ChevronDown, RefreshCw05, CheckCircle, ArrowRight } from "@untitledui/icons";
import { useMealPlan, type MealPlanEntry } from "@/hooks/use-meal-plan";
import { Button as AriaButton } from "react-aria-components";
import Link from "next/link";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { Tooltip as AriaTooltip, TooltipTrigger as AriaTooltipTrigger } from "react-aria-components";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { ComboBox } from "@/components/base/select/combobox";
import { ListBoxItem } from "react-aria-components";
import { Toggle } from "@/components/base/toggle/toggle";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { TagGroup, TagList, Tag } from "@/components/base/tags/tags";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { cx } from "@/utils/cx";
import type { MappedRecipe } from "@/types/spoonacular";
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";
import { useIngredientIcon } from "@/hooks/use-ingredient-icon";

// Ingredient type definition
type Ingredient = {
    id: string;
    name: string;
    icon: string;
    image?: string; // Spoonacular ingredient image URL
    quantity?: string;
};

// Meal planning types
type MealState = "empty" | "planned" | "adding";

type MealSlot = {
    time: string;
    label: string;
    meals: Array<{
        name: string;
        image?: string;
        calories?: number;
        carbs?: string;
        fats?: string;
        recipeId?: string;
    }>;
};

type MealPlanData = {
    state: MealState;
    meals?: MealSlot[];
    suggestedMeals?: Array<{
        id: string;
        name: string;
        image?: string;
        calories: number;
        servings: number;
    }>;
    addingMeal?: {
        name: string;
        image?: string;
        cookingTime: string;
        description: string;
        calories: number;
        carbs: string;
        fats: string;
        servings: number;
        ingredients: Ingredient[];
        missingIngredients: Ingredient[];
    };
};

const DEFAULT_MEAL_SLOTS: Array<{ time: string; label: string }> = [
    { time: "10:00", label: "Breakfast" },
    { time: "13:00", label: "Lunch" },
    { time: "19:00", label: "Dinner" },
];

const normalizeMealEntry = (meal: any): MealSlot["meals"][number] => {
    if (!meal) {
        return {
            name: "Meal",
        };
    }

    return {
        name: typeof meal.name === "string" && meal.name.trim().length > 0 ? meal.name : "Meal",
        image: typeof meal.image === "string" ? meal.image : undefined,
        calories:
            typeof meal.calories === "number"
                ? meal.calories
                : typeof meal.calories === "string"
                ? Number.parseFloat(meal.calories) || undefined
                : undefined,
        carbs:
            typeof meal.carbs === "string"
                ? meal.carbs
                : typeof meal.carbs === "number"
                ? `${meal.carbs}g`
                : undefined,
        fats:
            typeof meal.fats === "string"
                ? meal.fats
                : typeof meal.fats === "number"
                ? `${meal.fats}g`
                : undefined,
        recipeId: typeof meal.recipeId === "string" ? meal.recipeId : meal.id,
    };
};

const normalizeMealSlots = (slots: any): MealSlot[] => {
    if (!Array.isArray(slots)) return [];

    return slots.map((slot: any, index: number) => {
        const fallback = DEFAULT_MEAL_SLOTS[index] ?? DEFAULT_MEAL_SLOTS[DEFAULT_MEAL_SLOTS.length - 1];
        const mealsArray = Array.isArray(slot?.meals)
            ? slot.meals
            : slot?.meal
            ? [slot.meal]
            : [];

        return {
            time: typeof slot?.time === "string" ? slot.time : fallback.time,
            label: typeof slot?.label === "string" ? slot.label : fallback.label,
            meals: mealsArray.filter(Boolean).map(normalizeMealEntry),
        };
    });
};

const normalizeStoredMealsRecord = (record: Record<string, any>): Map<string, MealSlot[]> => {
    const entries = Object.entries(record || {}).map(([key, value]) => {
        const rawSlots = Array.isArray(value) ? value : Array.isArray(value?.meals) ? value.meals : [];
        return [key, normalizeMealSlots(rawSlots)] as [string, MealSlot[]];
    });
    return new Map(entries);
};

// Initial data with Spoonacular images
const initialKitchenItems: Ingredient[] = [
    { id: "item-1", name: "Tomato", icon: "🍅", image: "https://img.spoonacular.com/ingredients_100x100/tomato.png" },
    { id: "item-2", name: "Onion", icon: "🧅", image: "https://img.spoonacular.com/ingredients_100x100/brown-onion.png" },
    { id: "item-3", name: "Carrot", icon: "🥕", image: "https://img.spoonacular.com/ingredients_100x100/carrots.jpg" },
];

const initialShoppingItems: Ingredient[] = [
    { id: "shop-1", name: "Parsley", icon: "🌿", image: "https://img.spoonacular.com/ingredients_100x100/parsley.jpg" },
    { id: "shop-2", name: "Spinach", icon: "🥬", image: "https://img.spoonacular.com/ingredients_100x100/spinach.jpg" },
    { id: "shop-3", name: "Pasta", icon: "🍝", image: "https://img.spoonacular.com/ingredients_100x100/pasta-penne.jpg" },
    // Demo overlap so indicator is visible by default
    { id: "shop-4", name: "Basil", icon: "🌿", image: "https://img.spoonacular.com/ingredients_100x100/basil.jpg" },
];

const INACTIVE_TILE_DOT_CLASS = "bg-utility-gray-300"; // lighter inactive grey dot for calendar strip tiles

const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDateIdFromDate = (date: Date) => {
    return `date-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// Convert date string (YYYY-MM-DD) to dateId (date-YYYY-M-D)
const dateStringToDateId = (dateStr: string): string => {
    const date = new Date(dateStr);
    return getDateIdFromDate(date);
};

// Convert dateId (date-YYYY-M-D) to date string (YYYY-MM-DD)
const dateIdToDateString = (dateId: string): string => {
    const match = dateId.match(/date-(\d+)-(\d+)-(\d+)/);
    if (!match) return "";
    const [, year, month, day] = match;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Convert meal plan entries to MealSlot format
const convertMealPlanEntriesToMealSlot = (entries: MealPlanEntry[], time: string, label: string): MealSlot => {
    return {
        time,
        label,
        meals: entries.map(entry => ({
            name: entry.recipeName,
            image: entry.recipeImage,
            calories: undefined, // We don't store this in meal plan entry
            carbs: undefined,
            fats: undefined,
            recipeId: entry.recipeId,
        })),
    };
};

const CALORIE_FILTER_LABELS: Record<string, string> = {
    "500": "≤ 500 kcal",
    "750": "≤ 750 kcal",
    "1000": "≤ 1000 kcal",
    "1500": "≤ 1500 kcal",
};

const DIET_FILTER_LABELS: Record<string, string> = {
    keto: "Keto",
    vegan: "Vegan",
    vegetarian: "Vegetarian",
    paleo: "Paleo",
};

const formatFilterBadgeLabel = (fallback: string, value: string | null, labels: Record<string, string>) => {
    if (!value) {
        return fallback;
    }

    return `${fallback}: ${labels[value] ?? value}`;
};

// Helper function to generate date cards for days
const generateDayCards = (centerDate: Date, beforeCount: number = 15, afterCount: number = 15) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCount = beforeCount + 1 + afterCount; // +1 for the center date
    const cards = [];

    // Generate dates before center date
    for (let i = beforeCount; i > 0; i--) {
        const date = new Date(centerDate);
        date.setDate(centerDate.getDate() - i);
        const isToday = date.getTime() === today.getTime();
        const month = months[date.getMonth()];
        const dayNumber = date.getDate();
        const dayName = days[date.getDay()];
        const id = `date-${date.getFullYear()}-${date.getMonth() + 1}-${dayNumber}`;

        cards.push({
            id,
            date: isToday ? `TODAY ${month} ${dayNumber}` : `${month} ${dayNumber}`,
            dayName,
            dayNumber,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            isToday,
            dateObj: date,
        });
    }

    // Add center date
    const centerDateCopy = new Date(centerDate);
    centerDateCopy.setHours(0, 0, 0, 0);
    const isToday = centerDateCopy.getTime() === today.getTime();
    const month = months[centerDateCopy.getMonth()];
    const dayNumber = centerDateCopy.getDate();
    const dayName = days[centerDateCopy.getDay()];
    const id = `date-${centerDateCopy.getFullYear()}-${centerDateCopy.getMonth() + 1}-${dayNumber}`;

    cards.push({
        id,
        date: isToday ? `TODAY ${month} ${dayNumber}` : `${month} ${dayNumber}`,
        dayName,
        dayNumber,
        month: centerDateCopy.getMonth() + 1,
        year: centerDateCopy.getFullYear(),
        isToday,
        dateObj: centerDateCopy,
    });

    // Generate dates after center date
    for (let i = 1; i <= afterCount; i++) {
        const date = new Date(centerDate);
        date.setDate(centerDate.getDate() + i);
        const isToday = date.getTime() === today.getTime();
        const month = months[date.getMonth()];
        const dayNumber = date.getDate();
        const dayName = days[date.getDay()];
        const id = `date-${date.getFullYear()}-${date.getMonth() + 1}-${dayNumber}`;

        cards.push({
            id,
            date: isToday ? `TODAY ${month} ${dayNumber}` : `${month} ${dayNumber}`,
            dayName,
            dayNumber,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            isToday,
            dateObj: date,
        });
    }

    return cards;
};

// Helper function to generate week cards
const generateWeekCards = (centerDate: Date, beforeCount: number = 6, afterCount: number = 6) => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cards = [];

    // Get Monday of the center week
    const centerDayOfWeek = centerDate.getDay();
    const centerMonday = new Date(centerDate);
    centerMonday.setDate(centerDate.getDate() - centerDayOfWeek + (centerDayOfWeek === 0 ? -6 : 1));
    centerMonday.setHours(0, 0, 0, 0);

    // Generate weeks before center week
    for (let i = beforeCount; i > 0; i--) {
        const monday = new Date(centerMonday);
        monday.setDate(centerMonday.getDate() - i * 7);
        
        const weekEnd = new Date(monday);
        weekEnd.setDate(monday.getDate() + 6);
        
        const isCurrentWeek = today >= monday && today <= weekEnd;
        const month = months[monday.getMonth()];
        const id = `week-${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;

        cards.push({
            id,
            date: isCurrentWeek ? `THIS WEEK` : `WEEK ${month} ${monday.getDate()}`,
            dayName: `${monday.getDate()}-${weekEnd.getDate()}`,
            dayNumber: monday.getDate(),
            month: monday.getMonth() + 1,
            year: monday.getFullYear(),
            isToday: isCurrentWeek,
            dateObj: monday,
        });
    }

    // Add center week
    const weekEnd = new Date(centerMonday);
    weekEnd.setDate(centerMonday.getDate() + 6);
    const isCurrentWeek = today >= centerMonday && today <= weekEnd;
    const month = months[centerMonday.getMonth()];
    const id = `week-${centerMonday.getFullYear()}-${centerMonday.getMonth() + 1}-${centerMonday.getDate()}`;

    cards.push({
        id,
        date: isCurrentWeek ? `THIS WEEK` : `WEEK ${month} ${centerMonday.getDate()}`,
        dayName: `${centerMonday.getDate()}-${weekEnd.getDate()}`,
        dayNumber: centerMonday.getDate(),
        month: centerMonday.getMonth() + 1,
        year: centerMonday.getFullYear(),
        isToday: isCurrentWeek,
        dateObj: centerMonday,
    });

    // Generate weeks after center week
    for (let i = 1; i <= afterCount; i++) {
        const monday = new Date(centerMonday);
        monday.setDate(centerMonday.getDate() + i * 7);
        
        const weekEnd = new Date(monday);
        weekEnd.setDate(monday.getDate() + 6);
        
        const isCurrentWeek = today >= monday && today <= weekEnd;
        const month = months[monday.getMonth()];
        const id = `week-${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;

        cards.push({
            id,
            date: isCurrentWeek ? `THIS WEEK` : `WEEK ${month} ${monday.getDate()}`,
            dayName: `${monday.getDate()}-${weekEnd.getDate()}`,
            dayNumber: monday.getDate(),
            month: monday.getMonth() + 1,
            year: monday.getFullYear(),
            isToday: isCurrentWeek,
            dateObj: monday,
        });
    }

    return cards;
};

// Helper function to generate month cards
const generateMonthCards = (centerDate: Date, beforeCount: number = 6, afterCount: number = 6) => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cards = [];

    // Generate months before center month
    for (let i = beforeCount; i > 0; i--) {
        const date = new Date(centerDate.getFullYear(), centerDate.getMonth() - i, 1);
        const isCurrentMonth = date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        const month = months[date.getMonth()];
        const id = `month-${date.getFullYear()}-${date.getMonth() + 1}`;

        cards.push({
            id,
            date: isCurrentMonth ? `THIS MONTH` : month,
            dayName: month,
            dayNumber: 1,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            isToday: isCurrentMonth,
            dateObj: date,
        });
    }

    // Add center month
    const centerMonth = new Date(centerDate.getFullYear(), centerDate.getMonth(), 1);
    const isCurrentMonth = centerMonth.getMonth() === today.getMonth() && centerMonth.getFullYear() === today.getFullYear();
    const month = months[centerMonth.getMonth()];
    const id = `month-${centerMonth.getFullYear()}-${centerMonth.getMonth() + 1}`;

    cards.push({
        id,
        date: isCurrentMonth ? `THIS MONTH` : month,
        dayName: month,
        dayNumber: 1,
        month: centerMonth.getMonth() + 1,
        year: centerMonth.getFullYear(),
        isToday: isCurrentMonth,
        dateObj: centerMonth,
    });

    // Generate months after center month
    for (let i = 1; i <= afterCount; i++) {
        const date = new Date(centerDate.getFullYear(), centerDate.getMonth() + i, 1);
        const isCurrentMonth = date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        const month = months[date.getMonth()];
        const id = `month-${date.getFullYear()}-${date.getMonth() + 1}`;

        cards.push({
            id,
            date: isCurrentMonth ? `THIS MONTH` : month,
            dayName: month,
            dayNumber: 1,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            isToday: isCurrentMonth,
            dateObj: date,
        });
    }

    return cards;
};

// Suggested recipes data
type SuggestedRecipe = {
    id: string;
    name: string;
    calories: number;
    carbs: string;
    sodium: string;
};

// Old suggestedRecipes constant removed - now using state from API

// IngredientChip component for reusable ingredient display
interface IngredientChipProps {
    ingredient: Ingredient;
    sourceList: "kitchen" | "shopping" | "missing";
    onMoveToKitchen?: () => void;
    onMoveToShopping?: () => void;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    draggedIngredient?: { id: string; sourceList: string } | null;
    hasShoppingIndicator?: boolean;
    showCheckbox?: boolean;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

const IngredientChip = ({
    ingredient,
    sourceList,
    onMoveToKitchen,
    onMoveToShopping,
    onDragStart,
    onDragEnd,
    draggedIngredient,
    hasShoppingIndicator,
    showCheckbox,
    isChecked,
    onCheckChange,
}: IngredientChipProps) => {
    // Use AI-validated icon lookup
    const { iconSrc: imageSrc } = useIngredientIcon(ingredient.name, ingredient.image);
    const chipElement = (
        <div className={cx("relative inline-flex items-center gap-2")}>
            {showCheckbox && (
                <Checkbox
                    size="sm"
                    isSelected={isChecked}
                    onChange={(checked) => onCheckChange?.(checked)}
                    className="shrink-0"
                />
            )}
            <div
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                className="flex h-10 w-10 cursor-grab active:cursor-grabbing items-center justify-center rounded-full bg-quaternary hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand overflow-hidden"
                data-ingredient-id={ingredient.id}
                data-source-list={sourceList}
                role="button"
                tabIndex={0}
                aria-label={`${ingredient.name} ingredient`}
                aria-grabbed={draggedIngredient?.id === ingredient.id}
            >
                {imageSrc ? (
                    <img 
                        src={imageSrc} 
                        alt={ingredient.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.ingredient-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <span 
                    className={cx(
                        "ingredient-fallback",
                        imageSrc ? "hidden" : "block",
                        "text-[26.19px]"
                    )}
                    style={{ fontSize: "26.19px" }}
            >
                {ingredient.icon}
                </span>
            </div>
            {hasShoppingIndicator && (
                <div className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-utility-success-500 text-white shadow-sm ring-2 ring-primary">
                    <ShoppingCart01 className="h-2.5 w-2.5" />
                </div>
            )}
        </div>
    );

    // For missing ingredients, use custom tooltip with action buttons
    if (sourceList === "missing") {
        return (
            <AriaTooltipTrigger delay={300} trigger="hover">
                <div>{chipElement}</div>
                <AriaTooltip
                    placement="top"
                    offset={6}
                    className={({ isEntering, isExiting }) => cx(isEntering && "ease-out animate-in", isExiting && "ease-in animate-out")}
                >
                    {({ isEntering, isExiting }) => (
                        <div
                            className={cx(
                                "z-50 flex max-w-xs origin-(--trigger-anchor-point) flex-col items-start gap-1 rounded-lg bg-primary-solid px-3 py-3 shadow-lg will-change-transform",
                                isEntering &&
                                    "ease-out animate-in fade-in zoom-in-95 in-placement-left:slide-in-from-right-0.5 in-placement-right:slide-in-from-left-0.5 in-placement-top:slide-in-from-bottom-0.5 in-placement-bottom:slide-in-from-top-0.5",
                                isExiting &&
                                    "ease-in animate-out fade-out zoom-out-95 in-placement-left:slide-out-to-right-0.5 in-placement-right:slide-out-to-left-0.5 in-placement-top:slide-out-to-bottom-0.5 in-placement-bottom:slide-out-to-top-0.5",
                            )}
                        >
                            <div>
                                <span className="text-xs font-semibold text-white">{ingredient.name}</span>
                                {ingredient.quantity && (
                                    <span className="text-xs font-medium text-tooltip-supporting-text ml-1">• {ingredient.quantity}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                                {onMoveToShopping && (
                                    <AriaButton
                                        className="flex h-6 w-6 items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors outline-hidden"
                                        onPress={onMoveToShopping}
                                        aria-label="Add to Shopping List"
                                    >
                                        <ShoppingCart01 className="size-3 text-white" />
                                    </AriaButton>
                                )}
                                {onMoveToKitchen && (
                                    <AriaButton
                                        className="flex h-6 w-6 items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors outline-hidden"
                                        onPress={onMoveToKitchen}
                                        aria-label="Add to My Kitchen"
                                    >
                                        <Box className="size-3 text-white" />
                                    </AriaButton>
                                )}
                            </div>
                        </div>
                    )}
                </AriaTooltip>
            </AriaTooltipTrigger>
        );
    }

    // For kitchen and shopping items, use custom tooltip with action button
    return (
        <AriaTooltipTrigger delay={300} trigger="hover">
            <div>{chipElement}</div>
            <AriaTooltip
                placement="top"
                offset={6}
                className={({ isEntering, isExiting }) => cx(isEntering && "ease-out animate-in", isExiting && "ease-in animate-out")}
            >
                {({ isEntering, isExiting }) => (
                    <div
                        className={cx(
                            "z-50 flex max-w-xs origin-(--trigger-anchor-point) flex-col items-start gap-1 rounded-lg bg-primary-solid px-3 py-3 shadow-lg will-change-transform",
                            isEntering &&
                                "ease-out animate-in fade-in zoom-in-95 in-placement-left:slide-in-from-right-0.5 in-placement-right:slide-in-from-left-0.5 in-placement-top:slide-in-from-bottom-0.5 in-placement-bottom:slide-out-to-top-0.5",
                            isExiting &&
                                "ease-in animate-out fade-out zoom-out-95 in-placement-left:slide-out-to-right-0.5 in-placement-right:slide-out-to-left-0.5 in-placement-top:slide-out-to-bottom-0.5 in-placement-bottom:slide-out-to-top-0.5",
                        )}
                    >
                        <span className="text-xs font-semibold text-white">{ingredient.name}</span>
                        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                            {sourceList === "kitchen" && onMoveToShopping && (
                                <AriaButton
                                    className="flex h-6 w-6 items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors outline-hidden"
                                    onPress={onMoveToShopping}
                                    aria-label="Add to Shopping List"
                                >
                                    <ShoppingCart01 className="size-3 text-white" />
                                </AriaButton>
                            )}
                            {sourceList === "shopping" && onMoveToKitchen && (
                                <AriaButton
                                    className="flex h-6 w-6 items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors outline-hidden"
                                    onPress={onMoveToKitchen}
                                    aria-label="Add to My Kitchen"
                                >
                                    <Box className="size-3 text-white" />
                                </AriaButton>
                            )}
                        </div>
                    </div>
                )}
            </AriaTooltip>
        </AriaTooltipTrigger>
    );
};

// Get meal count for a calendar card based on view mode and meal data
// Returns count in the specified ranges, or null if empty state
const getMealCountForCard = (cardId: string, viewMode: "days" | "weeks" | "months", mealData: MealPlanData): number | null => {
    if (mealData.state === "empty") {
        return null; // No badge for empty state
    }
    
    // Generate a hash from the card ID for consistent pseudo-random values
    const hash = cardId.split("-").reduce((acc, val) => acc + parseInt(val) || 0, 0);
    
    if (viewMode === "days") {
        // Days: 1-3 range
        return (hash % 3) + 1;
    } else if (viewMode === "weeks") {
        // Weeks: 1-21 range
        return (hash % 21) + 1;
    } else {
        // Months: 80-100 range
        return (hash % 21) + 80;
    }
};

// Meal planning data generator - returns empty by default, uses stored meals if available
const generateMealData = (dateId: string, storedMeals?: MealSlot[] | any[]): MealPlanData => {
    // If we have stored meals for this date, use them
    if (storedMeals && storedMeals.length > 0) {
        const normalizedSlots = normalizeMealSlots(storedMeals);
        const hasMeals = normalizedSlots.some(slot => slot.meals.length > 0);
        return {
            state: hasMeals ? "planned" : "empty",
            meals: normalizedSlots,
        };
    }
    
    // Default: empty state with meal slots structure
    return {
        state: "empty",
        meals: DEFAULT_MEAL_SLOTS.map(({ time, label }) => ({
            time,
            label,
            meals: [],
        })),
    };
};

export const Dashboard15 = () => {
    const [viewMode, setViewMode] = useState<"days" | "weeks" | "months">("days");
    // Set center date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [centerDate, setCenterDate] = useState(today);
    const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const ingredientsScrollRef = useRef<HTMLDivElement>(null);
    const periodTabsScrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Ingredient state management with localStorage persistence
    // Always use initial values to prevent hydration mismatch
    const [kitchenItems, setKitchenItems] = useState<Ingredient[]>(initialKitchenItems);
    const [shoppingItems, setShoppingItems] = useState<Ingredient[]>(initialShoppingItems);
    const [isMounted, setIsMounted] = useState(false);

    // Load from localStorage after hydration (client-side only)
    useEffect(() => {
        setIsMounted(true);
        try {
            const savedKitchen = localStorage.getItem('kitchenItems');
            if (savedKitchen) {
                const parsed = JSON.parse(savedKitchen);
                setKitchenItems(parsed);
            }
        } catch (error) {
            console.error('Error loading kitchen items:', error);
        }

        try {
            const savedShopping = localStorage.getItem('shoppingItems');
            if (savedShopping) {
                const parsed = JSON.parse(savedShopping);
                setShoppingItems(parsed);
            }
        } catch (error) {
            console.error('Error loading shopping items:', error);
        }
    }, []);

    // Save kitchen items to localStorage (only after mount to prevent hydration issues)
    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;
        try {
            localStorage.setItem('kitchenItems', JSON.stringify(kitchenItems));
        } catch (error) {
            console.error('Error saving kitchen items:', error);
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please clear some data.');
            }
        }
    }, [kitchenItems, isMounted]);

    // Save shopping items to localStorage (only after mount to prevent hydration issues)
    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;
        try {
            localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
        } catch (error) {
            console.error('Error saving shopping items:', error);
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please clear some data.');
            }
        }
    }, [shoppingItems, isMounted]);
    const [draggedIngredient, setDraggedIngredient] = useState<{ id: string; sourceList: string } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<{ message: string; visible: boolean } | null>(null);
    const [isDraggingForDelete, setIsDraggingForDelete] = useState(false);
    
    // Visible items logic:
    // - If total <= 5 show all
    // - If total > 5 show 4 + overflow badge
    const MAX_VISIBLE_ITEMS = 5;
    const OVERFLOW_VISIBLE_ITEMS = 4;
    const getVisibleItemCount = (total: number) => (total <= MAX_VISIBLE_ITEMS ? total : OVERFLOW_VISIBLE_ITEMS);

    // Generate cards based on view mode with symmetric ranges around center date
    const dateCards =
        viewMode === "days"
            ? generateDayCards(centerDate, 15, 15) // Generate 15 days before and after center
            : viewMode === "weeks"
              ? generateWeekCards(centerDate, 6, 6) // Generate 6 weeks before and after center
              : generateMonthCards(centerDate, 6, 6); // Generate 6 months before and after center

    const todayCard = dateCards.find((card) => card.isToday);
    const defaultSelectedId = selectedDateId || todayCard?.id || dateCards[Math.floor(dateCards.length / 2)]?.id || "";
    const selectedDateCard = dateCards.find((card) => card.id === defaultSelectedId) || dateCards[Math.floor(dateCards.length / 2)];
    const todayDateId = getDateIdFromDate(today);

    const periodDayTabs = useMemo(() => {
        if (!selectedDateCard) return [];

        if (viewMode === "weeks") {
            const startOfWeek = new Date(selectedDateCard.dateObj);
            startOfWeek.setHours(0, 0, 0, 0);
            return Array.from({ length: 7 }).map((_, index) => {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + index);
                return {
                    id: getDateIdFromDate(day),
                    label: `${weekdayShort[day.getDay()]} ${day.getDate()}`,
                    fullLabel: day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
                };
            });
        }

        if (viewMode === "months") {
            const monthDate = new Date(selectedDateCard.dateObj);
            monthDate.setHours(0, 0, 0, 0);
            monthDate.setDate(1);
            const month = monthDate.getMonth();
            const year = monthDate.getFullYear();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            return Array.from({ length: daysInMonth }).map((_, index) => {
                const day = new Date(year, month, index + 1);
                return {
                    id: getDateIdFromDate(day),
                    label: `${index + 1}`,
                    fullLabel: day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
                };
            });
        }

        return [];
    }, [selectedDateCard, viewMode]);

    const defaultPeriodMealDateId = useMemo(() => {
        if (!periodDayTabs.length) return null;
        const todayMatch = periodDayTabs.find((day) => day.id === todayDateId);
        return todayMatch?.id ?? periodDayTabs[0].id;
    }, [periodDayTabs, todayDateId]);

    const [selectedMealDateId, setSelectedMealDateId] = useState<string | null>(null);
    const activeMealDateId =
        viewMode === "days"
            ? defaultSelectedId
            : selectedMealDateId ?? defaultPeriodMealDateId ?? defaultSelectedId;

    // Use meal plan hook to sync with RecipeCard additions
    const { mealPlan, getMealsForDate, getMealForDate, addRecipeToMealPlan, removeRecipeFromMealPlan } = useMealPlan();

    // Meal planning state - store meals per date with localStorage persistence
    // Initialize empty on server to avoid hydration mismatch
    const [storedMeals, setStoredMeals] = useState<Map<string, MealSlot[]>>(new Map());
    const [isHydrated, setIsHydrated] = useState(false);

    // Load storedMeals from localStorage only after hydration
    useEffect(() => {
        setIsHydrated(true);
        if (typeof window === 'undefined') return;
        try {
            const saved = localStorage.getItem('storedMeals');
            if (saved) {
                const parsed = JSON.parse(saved);
                setStoredMeals(normalizeStoredMealsRecord(parsed));
            }
        } catch (error) {
            console.error('Error loading stored meals:', error);
        }
    }, []);

    // Sync mealPlan data to storedMeals format
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;
        
        setStoredMeals((prev) => {
            const updated = new Map(prev);
            let hasChanges = false;

            // Convert mealPlan entries to storedMeals format
            Object.keys(mealPlan).forEach((dateStr) => {
                const dateId = dateStringToDateId(dateStr);
                const meals = mealPlan[dateStr];
                
                const mealSlots: MealSlot[] = [
                    convertMealPlanEntriesToMealSlot(meals.breakfast || [], "10:00", "Breakfast"),
                    convertMealPlanEntriesToMealSlot(meals.lunch || [], "13:00", "Lunch"),
                    convertMealPlanEntriesToMealSlot(meals.dinner || [], "19:00", "Dinner"),
                ];

                // Only update if there's actual meal data
                const hasMeals = mealSlots.some(slot => slot.meals.length > 0);
                if (hasMeals) {
                    updated.set(dateId, mealSlots);
                    hasChanges = true;
                }
            });

            return hasChanges ? updated : prev;
        });
    }, [mealPlan, isHydrated]);

    // Save storedMeals to localStorage whenever it changes (only after hydration)
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;
        try {
            const obj = Object.fromEntries(storedMeals);
            localStorage.setItem('storedMeals', JSON.stringify(obj));
        } catch (error) {
            console.error('Error saving stored meals:', error);
        }
    }, [storedMeals, isHydrated]);

    // Meal planning state - initialize with empty state to avoid hydration mismatch
    const [mealPlanData, setMealPlanData] = useState<MealPlanData>(() => {
        return generateMealData(activeMealDateId, undefined);
    });
    
    // Update meal plan data when active date changes or after hydration
    useEffect(() => {
        const stored = storedMeals.get(activeMealDateId);
        setMealPlanData(generateMealData(activeMealDateId, stored));
    }, [activeMealDateId, storedMeals, isHydrated]);
    
    // Track completed meals (by date ID + meal slot key)
    const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
    
    // Track if we're in "adding" mode (overrides the base state)
    const [isAddingMeal, setIsAddingMeal] = useState(false);
    const [mealActionType, setMealActionType] = useState<"add" | "replace">("add");
    const [mealActionMealType, setMealActionMealType] = useState<"breakfast" | "lunch" | "dinner" | null>(null);
    const [mealActionIndex, setMealActionIndex] = useState<number | undefined>(undefined);
    
    // Meal search and filter state
    const [mealSearchText, setMealSearchText] = useState("");
    const [selectedSuggestion, setSelectedSuggestion] = useState<MappedRecipe | null>(null);
    const [useMyPreferences, setUseMyPreferences] = useState(false);
    const [calorieThreshold, setCalorieThreshold] = useState<string | null>(null);
    const [dietFilter, setDietFilter] = useState<string | null>(null);
    const [servings, setServings] = useState(1);
    const [periodTabsScrollState, setPeriodTabsScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

    const calorieBadgeLabel = formatFilterBadgeLabel("Calories", calorieThreshold, CALORIE_FILTER_LABELS);
    const dietBadgeLabel = formatFilterBadgeLabel("Diet", dietFilter, DIET_FILTER_LABELS);
    
    // Ingredient selection state for add meal flow
    const [selectAllIngredients, setSelectAllIngredients] = useState(true);
    const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set());
    
    // Recipe search and loading states
    const [mealSuggestions, setMealSuggestions] = useState<MappedRecipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [recipeError, setRecipeError] = useState<string | null>(null);
    // Suggested recipes queue - stores multiple recipes for Yummy/Nah interaction
    const [suggestedRecipesQueue, setSuggestedRecipesQueue] = useState<MappedRecipe[]>([]);
    const [dislikedRecipeIds, setDislikedRecipeIds] = useState<Set<number>>(new Set());
    const [likedRecipeIds, setLikedRecipeIds] = useState<Set<number>>(new Set());
    const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

    // Debounced search text for API calls
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

    // Debounce search text
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(mealSearchText);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [mealSearchText]);

    // Auto-scroll selected date to be the first fully visible card (accounting for left fade)
    useEffect(() => {
        if (!scrollContainerRef.current || !defaultSelectedId) return;

        const container = scrollContainerRef.current;
        const selectedButton = container.querySelector(`[data-card-id="${defaultSelectedId}"]`) as HTMLElement;
        
        if (selectedButton) {
            const containerRect = container.getBoundingClientRect();
            const buttonRect = selectedButton.getBoundingClientRect();
            
            // Get the first card to calculate its width + gap
            const firstCard = container.querySelector('[data-card-id]') as HTMLElement;
            const cardWidth = firstCard ? firstCard.offsetWidth : 100;
            const gap = 8; // gap-2 = 8px
            
            // Position selected card as second item (first is partially hidden under fade)
            // This means scrolling by: (cardWidth + gap) less than putting it at position 0
            const targetScroll = buttonRect.left - containerRect.left + container.scrollLeft - (cardWidth + gap);
            const startScroll = container.scrollLeft;
            const distance = targetScroll - startScroll;
            const duration = 2000; // 2 seconds
            let startTime: number | null = null;

            const animateScroll = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation (ease-in-out)
                const easeInOutCubic = (t: number) => 
                    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                
                const easedProgress = easeInOutCubic(progress);
                container.scrollLeft = startScroll + distance * easedProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };

            requestAnimationFrame(animateScroll);
        }
    }, [defaultSelectedId]);

    // Fetch meal suggestions based on kitchen ingredients and filters
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const fetchMealSuggestions = async () => {
            // Only fetch if we have ingredients or are searching
            if (kitchenItems.length === 0 && !debouncedSearchText && !calorieThreshold && !dietFilter) {
                setMealSuggestions([]);
                return;
            }

            setIsLoadingRecipes(true);
            setRecipeError(null);

            try {
                const ingredients = kitchenItems.map(item => item.name);
                
                // Use API route instead of direct API call
                const params = new URLSearchParams({
                    action: 'search',
                    ingredients: ingredients.join(','),
                    number: '10',
                });
                
                if (debouncedSearchText) params.append('query', debouncedSearchText);
                if (calorieThreshold) params.append('calorieThreshold', calorieThreshold);
                if (dietFilter) params.append('diet', dietFilter);
                
                const response = await fetch(`/api/recipes?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    setMealSuggestions(result.data);
                } else {
                    throw new Error(result.error || 'Failed to fetch recipes');
                }
            } catch (error) {
                console.error('Error fetching meal suggestions:', error);
                setRecipeError(error instanceof Error ? error.message : 'Failed to fetch recipes');
                setMealSuggestions([]);
            } finally {
                setIsLoadingRecipes(false);
            }
        };

        fetchMealSuggestions();
    }, [kitchenItems, debouncedSearchText, calorieThreshold, dietFilter]);

    // Fetch suggested recipes based on kitchen ingredients
    const fetchSuggestedRecipes = useCallback(async () => {
        setIsLoadingSuggested(true);
        try {
            const ingredients = kitchenItems.map(item => item.name);
            const excludeIds = Array.from(dislikedRecipeIds);
            
            // Use suggestions endpoint with kitchen ingredients
            const params = new URLSearchParams({
                action: 'suggestions',
                ingredients: ingredients.join(','),
                number: '5',
            });
            
            if (excludeIds.length > 0) {
                params.append('excludeIds', excludeIds.join(','));
            }
            
            const response = await fetch(`/api/recipes?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                // Add to queue
                setSuggestedRecipesQueue(prev => [...prev, ...result.data]);
            }
        } catch (error) {
            console.error('Error fetching suggested recipes:', error);
        } finally {
            setIsLoadingSuggested(false);
        }
    }, [kitchenItems, dislikedRecipeIds]);

    // Initial fetch and refetch when queue is low
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        // Fetch initial suggestions
        fetchSuggestedRecipes();
    }, []);

    // Refetch when queue drops below 2
    useEffect(() => {
        if (suggestedRecipesQueue.length < 2 && !isLoadingSuggested) {
            fetchSuggestedRecipes();
        }
    }, [suggestedRecipesQueue.length, isLoadingSuggested, fetchSuggestedRecipes]);

    // Note: Recipe details are now fetched when user clicks on a suggestion
    
    // Helper function to calculate quantity based on servings
    const calculateQuantity = useCallback((quantity: string, servings: number): string => {
        if (!quantity || servings === 1) return quantity;
        
        // Try to extract numeric value and unit
        const match = quantity.match(/^([\d.]+)\s*(.*)$/);
        if (match) {
            const [, numStr, unit] = match;
            const num = parseFloat(numStr);
            if (!isNaN(num)) {
                const calculatedNum = Math.round(num * servings * 10) / 10; // Round to 1 decimal place
                // Handle whole numbers without decimals
                const formattedNum = calculatedNum % 1 === 0 ? calculatedNum.toString() : calculatedNum.toString();
                return unit ? `${formattedNum} ${unit}` : formattedNum;
            }
        }
        return quantity;
    }, []);

    // Filter suggestions based on calorie filter (search is handled by API)
    const filteredSuggestions = mealSuggestions.filter((meal) => {
        const matchesCalories = !calorieThreshold || (meal.calories && meal.calories <= parseInt(calorieThreshold));
        return matchesCalories;
    });
    
    // Suggested recipe dismissal state
    const [isDismissing, setIsDismissing] = useState(false);
    
    // Generate missing ingredients for selected meal (for backward compatibility)
    const [missingIngredients, setMissingIngredients] = useState<Ingredient[]>(() => {
        const mealData = generateMealData(activeMealDateId);
        return mealData.addingMeal?.missingIngredients || [];
    });

    // Handler for marking meal as done
    const handleMarkDone = useCallback((mealKey: string) => {
        setCompletedMeals((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(mealKey)) {
                newSet.delete(mealKey);
            } else {
                newSet.add(mealKey);
            }
            return newSet;
        });
    }, []);

    // Update selected ingredient IDs when suggestion changes or select-all is toggled
    useEffect(() => {
        if (selectedSuggestion && selectedSuggestion.missingIngredients) {
            if (selectAllIngredients) {
                // Select all missing ingredients
                const missingIds = new Set(selectedSuggestion.missingIngredients.map(ing => ing.id));
                setSelectedIngredientIds(missingIds);
            }
        } else {
            setSelectedIngredientIds(new Set());
        }
    }, [selectedSuggestion?.id, selectAllIngredients, selectedSuggestion]);

    // Ensure a valid meal date is selected for weeks/months tabs
    useEffect(() => {
        if (viewMode === "days") {
            if (selectedMealDateId !== null) {
                setSelectedMealDateId(null);
            }
            return;
        }

        if (!periodDayTabs.length) {
            if (selectedMealDateId !== null) {
                setSelectedMealDateId(null);
            }
            return;
        }

        if (!selectedMealDateId || !periodDayTabs.some((day) => day.id === selectedMealDateId)) {
            setSelectedMealDateId(defaultPeriodMealDateId ?? periodDayTabs[0].id ?? null);
        }
    }, [viewMode, periodDayTabs, selectedMealDateId, defaultPeriodMealDateId]);

    // Update meal plan data when selected meal date changes
    useEffect(() => {
        const stored = storedMeals.get(activeMealDateId);
        const newMealData = generateMealData(activeMealDateId, stored);
        setMealPlanData(newMealData);
        setIsAddingMeal(false); // Reset adding state when date changes
        setMissingIngredients(newMealData.addingMeal?.missingIngredients || []);
    }, [activeMealDateId, storedMeals]);
    
    // Current meal data (respects adding state)
    const currentMealData: MealPlanData = isAddingMeal
        ? {
            ...mealPlanData,
            state: "adding",
            meals: mealPlanData.meals || [
                { time: "10:00", label: "Breakfast", meals: [] },
                { time: "13:00", label: "Lunch", meals: [] },
                { time: "19:00", label: "Dinner", meals: [] },
            ],
        }
        : mealPlanData;

    // Helper function to show toast message
    const showToast = useCallback((message: string) => {
        setToastMessage({ message, visible: true });
        setTimeout(() => {
            setToastMessage((prev) => prev ? { ...prev, visible: false } : null);
            setTimeout(() => setToastMessage(null), 300); // Wait for fade out
        }, 2000);
    }, []);

    // Helper function to delete ingredient from any list
    const deleteIngredient = useCallback((ingredientId: string, sourceList: "kitchen" | "shopping" | "missing") => {
        let ingredient: Ingredient | undefined;
        
        if (sourceList === "kitchen") {
            ingredient = kitchenItems.find((item) => item.id === ingredientId);
            if (ingredient) {
                setKitchenItems((prev) => prev.filter((item) => item.id !== ingredientId));
                showToast(`${ingredient.name} deleted`);
            }
        } else if (sourceList === "shopping") {
            ingredient = shoppingItems.find((item) => item.id === ingredientId);
            if (ingredient) {
                setShoppingItems((prev) => prev.filter((item) => item.id !== ingredientId));
                showToast(`${ingredient.name} deleted`);
            }
        } else {
            ingredient = missingIngredients.find((item) => item.id === ingredientId);
            if (ingredient) {
                setMissingIngredients((prev) => prev.filter((item) => item.id !== ingredientId));
                showToast(`${ingredient.name} deleted`);
            }
        }
    }, [kitchenItems, shoppingItems, missingIngredients, showToast]);

    // Helper function to move ingredient between lists
    const moveIngredient = useCallback((ingredientId: string, sourceList: "kitchen" | "shopping" | "missing", targetList: "kitchen" | "shopping" | "missing") => {
        if (sourceList === targetList) return;

        // Find the ingredient
        let ingredient: Ingredient | undefined;
        let wasLastMissing = false;
        
        if (sourceList === "kitchen") {
            ingredient = kitchenItems.find((item) => item.id === ingredientId);
            if (ingredient) {
                setKitchenItems((prev) => prev.filter((item) => item.id !== ingredientId));
            }
        } else if (sourceList === "shopping") {
            ingredient = shoppingItems.find((item) => item.id === ingredientId);
            if (ingredient) {
                setShoppingItems((prev) => prev.filter((item) => item.id !== ingredientId));
            }
        } else {
            ingredient = missingIngredients.find((item) => item.id === ingredientId);
            if (ingredient) {
                wasLastMissing = missingIngredients.length === 1;
                setMissingIngredients((prev) => prev.filter((item) => item.id !== ingredientId));
            }
        }

        if (!ingredient) return;

        // Add to target list at the beginning (prepend) and ensure no duplicates
        if (targetList === "kitchen") {
            setKitchenItems((prev) => {
                if (prev.some((item) => item.id === ingredientId)) return prev;
                return [ingredient!, ...prev];
            });
            showToast(`${ingredient.name} moved to My Kitchen`);
        } else if (targetList === "shopping") {
            setShoppingItems((prev) => {
                if (prev.some((item) => item.id === ingredientId)) return prev;
                return [ingredient!, ...prev];
            });
            showToast(`${ingredient.name} moved to Shopping List`);
        }

        // Show success message when all missing ingredients are moved
        if (wasLastMissing && sourceList === "missing") {
            setTimeout(() => {
                showToast("All ingredients secured!");
            }, 500);
        }
        // Note: missing ingredients are generated per meal, so we don't add to that list
    }, [kitchenItems, shoppingItems, missingIngredients, showToast]);

    // Drag and drop handlers
    const handleDragStart = useCallback((e: React.DragEvent, ingredientId: string, sourceList: "kitchen" | "shopping" | "missing") => {
        setDraggedIngredient({ id: ingredientId, sourceList });
        setIsDraggingForDelete(true);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({ id: ingredientId, sourceList }));
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedIngredient(null);
        setDragOverTarget(null);
        setIsDraggingForDelete(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, targetList: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Don't set dragOverTarget if we're over trash
        if (dragOverTarget !== "trash") {
            e.dataTransfer.dropEffect = "move";
            setDragOverTarget(targetList);
        }
    }, [dragOverTarget]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only clear if we're leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverTarget(null);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetList: "kitchen" | "shopping" | "missing") => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverTarget(null);
        setIsDraggingForDelete(false);

        if (!draggedIngredient) {
            // Try to parse from dataTransfer as fallback
            try {
                const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                if (data.id && data.sourceList) {
                    moveIngredient(data.id, data.sourceList, targetList);
                }
            } catch {
                // Ignore parse errors
            }
            return;
        }

        moveIngredient(draggedIngredient.id, draggedIngredient.sourceList as "kitchen" | "shopping" | "missing", targetList);
        setDraggedIngredient(null);
    }, [draggedIngredient, moveIngredient]);

    const handleTrashDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverTarget(null);
        setIsDraggingForDelete(false);

        if (!draggedIngredient) {
            try {
                const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                if (data.id && data.sourceList) {
                    deleteIngredient(data.id, data.sourceList);
                }
            } catch {
                // Ignore parse errors
            }
            return;
        }

        deleteIngredient(draggedIngredient.id, draggedIngredient.sourceList as "kitchen" | "shopping" | "missing");
        setDraggedIngredient(null);
    }, [draggedIngredient, deleteIngredient]);

    // Helper function to center a card in the scroll container
    const centerCardInView = (cardId: string) => {
        if (!scrollContainerRef.current) return;
        
        const cardIndex = dateCards.findIndex((card) => card.id === cardId);
        if (cardIndex === -1) return;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
                const cardElement = scrollContainerRef.current.children[cardIndex] as HTMLElement;
                if (cardElement) {
                    const cardWidth = cardElement.offsetWidth;
                    const cardLeft = cardElement.offsetLeft;
                    const containerWidth = scrollContainerRef.current.clientWidth;
                    const scrollPosition = cardLeft - containerWidth / 2 + cardWidth / 2;
                    scrollContainerRef.current.scrollLeft = Math.max(0, scrollPosition);
                }
            }
        });
    };

    // Initialize selected date to today and reset when view mode changes
    useEffect(() => {
        const todayCard = dateCards.find((card) => card.isToday);
        if (todayCard) {
            setSelectedDateId(todayCard.id);
        } else if (dateCards.length > 0) {
            // If no today card, select the middle card (center date)
            const centerIndex = Math.floor(dateCards.length / 2);
            setSelectedDateId(dateCards[centerIndex].id);
        }
        
        // Center the center date card (middle card) in the slider when view mode changes
        if (dateCards.length > 0) {
            const centerIndex = Math.floor(dateCards.length / 2);
            const centerCard = dateCards[centerIndex];
            if (centerCard) {
                centerCardInView(centerCard.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    // Set today as default on initial load and center it in the slider
    useEffect(() => {
        const todayCard = dateCards.find((card) => card.isToday);
        if (todayCard && !selectedDateId) {
            setSelectedDateId(todayCard.id);
        }
        
        // Center the center date card (middle card) in the slider on initial load
        if (dateCards.length > 0) {
            const centerIndex = Math.floor(dateCards.length / 2);
            const centerCard = dateCards[centerIndex];
            if (centerCard) {
                centerCardInView(centerCard.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Center selected date when it changes
    useEffect(() => {
        if (selectedDateId) {
            centerCardInView(selectedDateId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDateId]);

    // Scroll handlers
    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const handleIngredientsScroll = (direction: "left" | "right") => {
        if (ingredientsScrollRef.current) {
            const scrollAmount = 200;
            ingredientsScrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const handlePeriodTabsArrowScroll = useCallback((direction: "left" | "right") => {
        if (!periodTabsScrollRef.current) return;
        const baseAmount = periodTabsScrollRef.current.clientWidth || 240;
        const scrollAmount = Math.max(baseAmount * 0.8, 240);
        periodTabsScrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    }, []);

    // Drag scroll handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const updatePeriodTabsScrollState = useCallback(() => {
        const el = periodTabsScrollRef.current;
        if (!el) {
            setPeriodTabsScrollState({ canScrollLeft: false, canScrollRight: false });
            return;
        }

        const { scrollLeft, scrollWidth, clientWidth } = el;
        setPeriodTabsScrollState({
            canScrollLeft: scrollLeft > 4,
            canScrollRight: scrollLeft + clientWidth < scrollWidth - 4,
        });
    }, []);

    const showPeriodTabs = viewMode !== "days" && periodDayTabs.length > 0;

    useEffect(() => {
        if (!showPeriodTabs) {
            setPeriodTabsScrollState({ canScrollLeft: false, canScrollRight: false });
            return;
        }

        const node = periodTabsScrollRef.current;
        if (!node) {
            setPeriodTabsScrollState({ canScrollLeft: false, canScrollRight: false });
            return;
        }

        const handleScroll = () => updatePeriodTabsScrollState();
        const handleResize = () => updatePeriodTabsScrollState();
        
        // Check scroll state after layout
        const timeoutId = setTimeout(() => {
            updatePeriodTabsScrollState();
        }, 0);
        
        updatePeriodTabsScrollState();
        node.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(timeoutId);
            node.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, [showPeriodTabs, periodDayTabs.length, updatePeriodTabsScrollState]);

    const handlePeriodTabSelect = useCallback((dayId: string) => {
        setSelectedMealDateId(dayId);
    }, []);

    const renderPeriodTab = (day: { id: string; label: string; fullLabel: string }) => {
        const isSelected = activeMealDateId === day.id;

        return (
            <button
                key={day.id}
                type="button"
                onClick={() => handlePeriodTabSelect(day.id)}
                className={cx(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-colors outline-hidden",
                    isSelected
                        ? "border-brand bg-brand-secondary/70 text-brand shadow-xs"
                        : "border-secondary/70 bg-primary text-tertiary hover:bg-primary_hover"
                )}
                aria-pressed={isSelected}
                title={day.fullLabel}
            >
                {day.label}
            </button>
        );
    };

    return (
        <div className="bg-primary">
            <AppHeader
                secondaryNavTabs={{
                    selectedKey: viewMode,
                    onSelectionChange: (key) => setViewMode(String(key) as "days" | "weeks" | "months"),
                    items: [
                        { id: "days", label: "Days" },
                        { id: "weeks", label: "Weeks" },
                        { id: "months", label: "Months" },
                    ],
                }}
                secondaryNavRight={
                    <Link href="/calendar">
                        <AriaButton className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors outline-hidden">
                            <CalendarIcon className="size-4" />
                        </AriaButton>
                    </Link>
                }
            />

            {/* Calendar strip - full width below header */}
                <section className="flex w-full items-center justify-center border-b border-secondary bg-primary py-4">
                    <div className="flex w-full max-w-container items-center gap-2 px-4 md:px-8">
                        {/* Left Arrow */}
                        <button
                            onClick={() => handleScroll("left")}
                            className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="size-5" />
                        </button>

                        {/* Scrollable container with fade effects */}
                        <div className="relative flex-1 overflow-hidden">
                            {/* Left fade */}
                            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-primary to-transparent" />
                            {/* Right fade */}
                            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-primary to-transparent" />

                            {/* Scrollable tiles */}
                            <div
                                ref={scrollContainerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                                className={cx(
                                    "flex gap-2 overflow-x-auto pb-2 scrollbar-hide",
                                    isDragging && "cursor-grabbing select-none",
                                    !isDragging && "cursor-grab",
                                )}
                                style={{ WebkitOverflowScrolling: "touch" }}
                            >
                                {dateCards.map((card) => {
                                    // Format content based on view mode
                                    const monthsShort = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                                    const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                    let topText = "";
                                    let bottomText = "";
                                    
                                    // Check if this card is today (not just selected)
                                    const isToday = card.isToday;
                                    
                                    if (viewMode === "days") {
                                        topText = isToday ? "TODAY" : monthsShort[card.dateObj.getMonth()];
                                        bottomText = card.dayNumber.toString();
                                    } else if (viewMode === "weeks") {
                                        topText = isToday ? "THIS WEEK" : monthsShort[card.dateObj.getMonth()];
                                        const weekEnd = new Date(card.dateObj);
                                        weekEnd.setDate(card.dateObj.getDate() + 6);
                                        bottomText = `${card.dayNumber}-${weekEnd.getDate()}`;
                                    } else if (viewMode === "months") {
                                        topText = isToday ? "THIS MONTH" : card.year.toString();
                                        bottomText = monthsFull[card.dateObj.getMonth()];
                                    }

                                    // Check if this date has any meals in storedMeals
                                    const cardMeals = storedMeals.get(card.id);
                                    const hasMeals = cardMeals ? cardMeals.some(slot => slot.meals.length > 0) : false;
                                    const mealCount = cardMeals ? cardMeals.reduce((sum, slot) => sum + slot.meals.length, 0) : 0;
                                    const tooltipText = hasMeals 
                                        ? `${mealCount} meal${mealCount > 1 ? 's' : ''} planned`
                                        : "No meals planned";

                                    return (
                                        <Tooltip
                                            key={card.id}
                                            title={tooltipText}
                                            placement="top"
                                            offset={6}
                                            delay={300}
                                            trigger="hover"
                                        >
                                            <button
                                            onClick={() => setSelectedDateId(card.id)}
                                            data-card-id={card.id}
                                            className={cx(
                                                "flex min-w-[100px] shrink-0 rounded-lg border p-3 transition-colors",
                                                card.id === defaultSelectedId
                                                    ? "border-utility-success-300 bg-utility-success-50"
                                                    : "border-secondary bg-primary hover:bg-primary_hover",
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full gap-2">
                                                <div className="flex flex-col items-start">
                                                    <p
                                                        className={cx(
                                                            "text-xs font-semibold",
                                                            card.id === defaultSelectedId ? "text-utility-success-700" : "text-tertiary",
                                                        )}
                                                    >
                                                        {topText}
                                                    </p>
                                                    <p
                                                        className={cx(
                                                            "text-sm font-semibold",
                                                            card.id === defaultSelectedId ? "text-utility-success-700" : "text-primary",
                                                        )}
                                                    >
                                                        {bottomText}
                                                    </p>
                                                </div>
                                                    <div className="flex items-center shrink-0">
                                                        <div
                                                            className={cx(
                                                                "h-2 w-2 rounded-full",
                                                                hasMeals 
                                                                    ? "bg-utility-success-500" 
                                                                    : INACTIVE_TILE_DOT_CLASS
                                                            )}
                                                        />
                                                    </div>
                                            </div>
                                        </button>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => handleScroll("right")}
                            className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                </section>

            <main className="pt-8 pb-12 lg:pt-12 lg:pb-24">
                <div className="flex flex-col gap-8">
                    {/* Three column layout */}
                    <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-8 px-4 lg:grid-cols-[2fr_6fr_2fr] lg:px-8">
                        {/* Left Column - Kitchen Inventory & Shopping List */}
                        <div className="flex w-full flex-col gap-6">
                            {/* Inventory - My Kitchen Card */}
                            <div
                                className={cx(
                                    "rounded-lg border border-secondary bg-primary p-5 transition-colors w-full",
                                    dragOverTarget === "kitchen" && "ring-2 ring-brand"
                                )}
                                onDragOver={(e) => handleDragOver(e, "kitchen")}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, "kitchen")}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">INVENTORY</p>
                                        <p className="text-sm font-semibold text-primary">My Kitchen</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ButtonUtility size="xs" color="tertiary" icon={Plus} />
                                        <Link href="/my-kitchen">
                                            <ButtonUtility 
                                                size="xs" 
                                                color="tertiary" 
                                                icon={ArrowRight}
                                                aria-label="Open My Kitchen"
                                            />
                                        </Link>
                                    </div>
                                </div>
                                {kitchenItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 mb-3">
                                        <p className="text-sm text-tertiary text-center">Your kitchen is empty.</p>
                                        <p className="text-xs text-tertiary text-center mt-1">Add some ingredients there.</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-3 overflow-hidden">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {kitchenItems.slice(0, getVisibleItemCount(kitchenItems.length)).map((item) => (
                                                <IngredientChip
                                                    key={item.id}
                                                    ingredient={item}
                                                    sourceList="kitchen"
                                                    onMoveToShopping={() => moveIngredient(item.id, "kitchen", "shopping")}
                                                    onDragStart={(e) => handleDragStart(e, item.id, "kitchen")}
                                                    onDragEnd={handleDragEnd}
                                                    draggedIngredient={draggedIngredient}
                                                />
                                            ))}
                                        </div>
                                        {kitchenItems.length > MAX_VISIBLE_ITEMS && (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-quaternary text-xs font-semibold text-tertiary">
                                                +{kitchenItems.length - OVERFLOW_VISIBLE_ITEMS}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-sm text-tertiary">{kitchenItems.length} items</p>
                            </div>

                            {/* Last 5 Days - Shopping List Card */}
                            <div
                                className={cx(
                                    "rounded-lg border border-secondary bg-primary p-5 transition-colors w-full",
                                    dragOverTarget === "shopping" && "ring-2 ring-brand"
                                )}
                                onDragOver={(e) => handleDragOver(e, "shopping")}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, "shopping")}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">LAST 5 DAYS</p>
                                        <p className="text-sm font-semibold text-primary">Shopping List</p>
                                    </div>
                                    <ButtonUtility size="xs" color="tertiary" icon={Plus} />
                                </div>
                                {shoppingItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 mb-3">
                                        <p className="text-sm text-tertiary text-center">Your shopping list is empty.</p>
                                        <p className="text-xs text-tertiary text-center mt-1">Add some ingredients there.</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-3 overflow-hidden">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {shoppingItems.slice(0, getVisibleItemCount(shoppingItems.length)).map((item) => (
                                                <IngredientChip
                                                    key={item.id}
                                                    ingredient={item}
                                                    sourceList="shopping"
                                                    onMoveToKitchen={() => moveIngredient(item.id, "shopping", "kitchen")}
                                                    onDragStart={(e) => handleDragStart(e, item.id, "shopping")}
                                                    onDragEnd={handleDragEnd}
                                                    draggedIngredient={draggedIngredient}
                                                />
                                            ))}
                                        </div>
                                        {shoppingItems.length > MAX_VISIBLE_ITEMS && (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-quaternary text-xs font-semibold text-tertiary">
                                                +{shoppingItems.length - OVERFLOW_VISIBLE_ITEMS}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-sm text-tertiary">{shoppingItems.length} items</p>
                            </div>
                        </div>

                        {/* Middle Column - Meal Planning */}
                        <div className="flex w-full flex-col gap-6">
                            {/* Meal Planning Card */}
                            <div className="rounded-lg border border-secondary bg-primary p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">PLANNING</p>
                                        <p className="text-sm font-semibold text-primary">{currentMealData.state === "adding" ? "Add Meal" : "Meal Plans"}</p>
                                    </div>
                                    {currentMealData.state === "adding" ? (
                                        <AriaButton 
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary hover:bg-primary_hover transition-colors outline-hidden"
                                            onPress={() => {
                                                setIsAddingMeal(false);
                                                setMealSearchText("");
                                                setSelectedSuggestion(null);
                                                setServings(1);
                                                setUseMyPreferences(false);
                                                setCalorieThreshold(null);
                                                setSelectAllIngredients(true);
                                                setSelectedIngredientIds(new Set());
                                            }}
                                        >
                                            <X className="size-4 text-tertiary" />
                                        </AriaButton>
                                    ) : (
                                        <Button color="secondary" size="sm" onClick={() => setIsAddingMeal(true)}>
                                            + Add Meals
                                        </Button>
                                    )}
                                </div>

                                {showPeriodTabs && (
                                    <div className="mb-6 w-full max-w-full overflow-hidden">
                                        <div className="flex items-center gap-2 w-full max-w-full">
                                            {periodTabsScrollState.canScrollLeft && (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePeriodTabsArrowScroll("left")}
                                                    aria-label="Scroll days left"
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover transition-colors"
                                                >
                                                    <ChevronLeft className="size-4" />
                                                </button>
                                            )}
                                            <div className="relative flex-1 overflow-hidden min-w-0 max-w-full" style={{ width: 0 }}>
                                                {periodTabsScrollState.canScrollLeft && (
                                                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-primary to-transparent" />
                                                )}
                                                {periodTabsScrollState.canScrollRight && (
                                                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-primary to-transparent" />
                                                )}
                                                <div
                                                    ref={periodTabsScrollRef}
                                                    className="flex flex-nowrap gap-2 overflow-x-auto py-1 scrollbar-hide"
                                                    style={{ WebkitOverflowScrolling: "touch" }}
                                                >
                                                    {periodDayTabs.map(renderPeriodTab)}
                                                </div>
                                            </div>
                                            {periodTabsScrollState.canScrollRight && (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePeriodTabsArrowScroll("right")}
                                                    aria-label="Scroll days right"
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover transition-colors"
                                                >
                                                    <ChevronRight className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {currentMealData.state === "empty" && (
                                    <div className="flex items-center gap-6 py-8">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-quaternary">
                                                <div className="text-6xl">👨‍🍳</div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-primary mb-1">Uh oh...</p>
                                            <p className="text-sm text-tertiary mb-4">You have no meals planned yet..</p>
                                            <Button color="primary" size="sm" onClick={() => setIsAddingMeal(true)} className="bg-utility-success-500 hover:bg-utility-success-600 text-white">
                                                Plan your first meal
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Planned State - Timeline */}
                                {currentMealData.state === "planned" && currentMealData.meals && (
                                    <div className="relative">
                                        {/* Vertical line - goes through center of time badges */}
                                        <div className="absolute left-[26px] top-0 w-0.5 bg-secondary z-0" style={{ height: 'calc(100% - 120px)' }}></div>
                                        
                                        {/* Meal slots */}
                                        <div className="space-y-6">
                                                {currentMealData.meals.map((slot, slotIndex) => {
                                                    const mealTypeMap: Record<string, "breakfast" | "lunch" | "dinner"> = {
                                                        "Breakfast": "breakfast",
                                                        "Lunch": "lunch",
                                                        "Dinner": "dinner",
                                                    };
                                                    const mealType = mealTypeMap[slot.label];
                                                    const isoDate = dateIdToDateString(activeMealDateId);
                                                    const mealEntries = getMealForDate(isoDate, mealType);
                                                
                                                return (
                                                        <div key={slotIndex} className="group relative flex items-start gap-4">
                                                        {/* Time badge chip */}
                                                            <div className="shrink-0 z-10 pt-1">
                                                                <Badge type="pill-color" size="sm" color="gray">
                                                                {slot.time}
                                                            </Badge>
                                                        </div>
                                                        
                                                            {/* Meals container - horizontal scrollable */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="text-sm font-semibold text-primary">{slot.label}</p>
                                                                    
                                                                    {/* Add/Replace dropdown button */}
                                                                    <Dropdown.Root>
                                                                        <AriaButton
                                                                            className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-2 py-1 text-xs font-medium text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors outline-hidden"
                                                                            aria-label="Add or replace meal"
                                                                        >
                                                                            <Plus className="size-3" />
                                                                            <span>Add meal</span>
                                                                            <ChevronDown className="size-3" />
                                                                        </AriaButton>
                                                                        <Dropdown.Popover placement="bottom right">
                                                                            <Dropdown.Menu
                                                                                onAction={(key) => {
                                                                                    const action = key as string;
                                                                                    if (action === "add") {
                                                                                        // Set context for adding (not replacing)
                                                                                        setMealActionType("add");
                                                                                        setMealActionMealType(mealType);
                                                                                        setIsAddingMeal(true);
                                                                                    } else if (action === "replace") {
                                                                                        // Set context for replacing
                                                                                        setMealActionType("replace");
                                                                                        setMealActionMealType(mealType);
                                                                setIsAddingMeal(true);
                                                            }
                                                        }}
                                                    >
                                                                                <Dropdown.Item id="add">Add meal</Dropdown.Item>
                                                                                <Dropdown.Item id="replace">Replace all meals</Dropdown.Item>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown.Popover>
                                                                    </Dropdown.Root>
                                                                </div>
                                                                
                                                                {/* Horizontal scrollable meals container */}
                                                                {slot.meals.length > 0 ? (
                                                                    <div className="relative">
                                                                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                                                            {slot.meals.map((meal, mealIndex) => {
                                                                                const mealKey = `${activeMealDateId}-${slot.time}-${slot.label}-${mealIndex}`;
                                                                                const isCompleted = completedMeals.has(mealKey);
                                                                                const mealEntry = mealEntries[mealIndex];
                                                                                const recipeId = mealEntry?.recipeId || meal.recipeId;
                                                                                
                                                                                return (
                                                                                    <div
                                                                                        key={mealIndex}
                                                                                        className={cx(
                                                                                            "relative shrink-0 flex flex-col gap-2 w-[200px] rounded-lg border border-secondary bg-primary p-3 transition-all duration-300",
                                                                                            isCompleted && "opacity-75 ring-2 ring-utility-success-500"
                                                                                        )}
                                                                                    >
                                                                                        {/* Meal image */}
                                                                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-quaternary">
                                                                                            {meal.image ? (
                                                                                                <>
                                                                                                    {meal.image.startsWith('http') ? (
                                                                                                        <img
                                                                                                            src={meal.image}
                                                                                                            alt={meal.name}
                                                                            className={cx(
                                                                                                                "w-full h-full object-cover transition-all duration-300",
                                                                                                                isCompleted && "opacity-50"
                                                                            )}
                                                                        />
                                                                    ) : (
                                                                                                        <div className="flex items-center justify-center h-full text-4xl">
                                                                                                            {meal.image}
                                                                                                        </div>
                                                                                                    )}
                                                                    {isCompleted && (
                                                                                                        <div className="absolute inset-0 flex items-center justify-center bg-primary/50">
                                                                                                            <CheckCircle className="size-8 text-utility-success-500" />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                                                <div className="flex items-center justify-center h-full text-4xl">🍽️</div>
                                                        )}
                                                    </div>
                                                    
                                                                                        {/* Meal name */}
                                                                <p className={cx(
                                                                                            "text-sm font-medium text-primary truncate",
                                                                    isCompleted && "line-through decoration-2 decoration-utility-success-500"
                                                                )}>
                                                                                            {meal.name}
                                                                                        </p>
                                                                                        
                                                                                        {/* Action buttons */}
                                                                                        <div className="flex items-center gap-1.5">
                                                                    {recipeId && (
                                                                        <Link
                                                                            href={`/cooking-mode/${recipeId}`}
                                                                                                    className="flex items-center justify-center rounded-lg border border-utility-success-600 bg-utility-success-50 px-2 py-1 text-xs font-medium text-utility-success-600 hover:bg-utility-success-100 transition-colors"
                                                                        >
                                                                                                    <span className="text-xs">👨‍🍳</span>
                                                                        </Link>
                                                                    )}
                                                                                            <Dropdown.Root>
                                                                                                <AriaButton
                                                                                                    className="flex items-center justify-center rounded-lg border border-secondary bg-primary px-2 py-1 text-xs font-medium text-tertiary hover:bg-primary_hover transition-colors outline-hidden"
                                                                                                    aria-label="Meal options"
                                                                                                >
                                                                                                    <RefreshCw05 className="size-3" />
                                                                                                </AriaButton>
                                                                                                <Dropdown.Popover placement="bottom right">
                                                                                                    <Dropdown.Menu
                                                                                                        onAction={(key) => {
                                                                                                            const action = key as string;
                                                                                                            if (action === "replace-this") {
                                                                                                                // Replace this specific meal
                                                                                                                setMealActionType("replace");
                                                                                                                setMealActionMealType(mealType);
                                                                                                                setMealActionIndex(mealIndex);
                                                                                                                setIsAddingMeal(true);
                                                                                                            } else if (action === "remove") {
                                                                                                                // Remove this meal
                                                                                                                removeRecipeFromMealPlan(isoDate, mealType, mealIndex);
                                                                                                                showToast(`${meal.name} removed from ${slot.label}`);
                                                                                                            }
                                                                                                        }}
                                                                                                    >
                                                                                                        <Dropdown.Item id="replace-this">Replace</Dropdown.Item>
                                                                                                        <Dropdown.Item id="remove">Remove</Dropdown.Item>
                                                                                                    </Dropdown.Menu>
                                                                                                </Dropdown.Popover>
                                                                                            </Dropdown.Root>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleMarkDone(mealKey)}
                                                                        className={cx(
                                                                                                    "flex items-center justify-center rounded-lg border px-2 py-1 transition-colors",
                                                                                                    isCompleted ? "border-utility-success-500 bg-utility-success-50 text-utility-success-600" : "border-secondary bg-primary text-tertiary hover:bg-primary_hover"
                                                                                                )}
                                                                                            >
                                                                                                <CheckCircle className={cx("size-3", isCompleted && "text-utility-success-600")} />
                                                                    </button>
                                                                                        </div>
                                                                </div>
                                                            );
                                                                            })}
                                                                        </div>
                                                                        {/* Fade gradient on right if scrollable */}
                                                                        {slot.meals.length > 2 && (
                                                                            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-primary to-transparent pointer-events-none" />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-secondary bg-primary/50">
                                                                        <p className="text-sm text-tertiary">No meals planned</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Nutrition Summary Footer */}
                                        {(() => {
                                            const totals = currentMealData.meals?.reduce((acc, slot) => {
                                                // Sum across all meals in this slot
                                                slot.meals.forEach(meal => {
                                                    if (meal.calories && meal.carbs && meal.fats) {
                                                        acc.calories += meal.calories;
                                                        const carbsValue = parseFloat(meal.carbs.replace('g', '').trim());
                                                        const fatsValue = parseFloat(meal.fats.replace('g', '').trim());
                                                    if (!isNaN(carbsValue)) acc.carbs += carbsValue;
                                                    if (!isNaN(fatsValue)) acc.fats += fatsValue;
                                                }
                                                });
                                                return acc;
                                            }, { calories: 0, carbs: 0, fats: 0 }) || { calories: 0, carbs: 0, fats: 0 };
                                            
                                            return (
                                                <div className="mt-6 pt-6 border-t border-secondary">
                                                    {/* Totals Row */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">TOTALS</p>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-primary">{totals.calories.toLocaleString()}</p>
                                                                <p className="text-xs text-tertiary">Calories</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-primary">{Math.round(totals.carbs)}g</p>
                                                                <p className="text-xs text-tertiary">Carbs</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-primary">{Math.round(totals.fats)}g</p>
                                                                <p className="text-xs text-tertiary">Fats</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Adding Meal State */}
                                {currentMealData.state === "adding" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-[45%_1fr] gap-12">
                                            {/* Left Column - Search & Filters */}
                                            <div className="space-y-4">
                                                {/* Large Search Input */}
                                                <div className="relative">
                                                    <Input
                                                        size="md"
                                                        placeholder="Search for a meal... (e.g., pasta, chicken, salad)"
                                                        value={mealSearchText}
                                                        onChange={setMealSearchText}
                                                    autoFocus
                                                        className="text-base"
                                                        wrapperClassName="[&>div]:pr-10"
                                                    />
                                                    {mealSearchText && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setMealSearchText("");
                                                                setSelectedSuggestion(null);
                                                                setServings(1);
                                                            }}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-lg hover:bg-primary_hover transition-colors outline-hidden pointer-events-auto"
                                                            aria-label="Clear search"
                                            >
                                                <X className="size-4 text-tertiary" />
                                                        </button>
                                                    )}
                                        </div>

                                                {/* Loading state - only show when not viewing a selected recipe */}
                                                {isLoadingRecipes && !selectedSuggestion && (
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-tertiary">Searching recipes...</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {[1, 2, 3, 4, 5].map((idx) => (
                                                                <div key={idx} className="h-8 w-24 rounded-full bg-quaternary animate-pulse" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Error state */}
                                                {recipeError && !isLoadingRecipes && (
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-utility-error-500">Error: {recipeError}</p>
                                                        <Button 
                                                            size="sm" 
                                                            color="secondary"
                                                            onClick={() => {
                                                                setRecipeError(null);
                                                                // Retry by triggering refetch
                                                                setDebouncedSearchText(debouncedSearchText);
                                                            }}
                                                        >
                                                            Retry
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Suggestions Chips - only show when no selection */}
                                                {!isLoadingRecipes && mealSearchText && filteredSuggestions.length > 0 && !selectedSuggestion && (
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {filteredSuggestions.slice(0, 5).map((meal) => (
                                                                <button
                                                                    key={meal.id}
                                                                    type="button"
                                                                    className="cursor-pointer transition-all duration-200 outline-hidden"
                                                                    onClick={async () => {
                                                                        // Map MappedRecipe to the expected format
                                                                        const mapped = {
                                                                            ...meal,
                                                                            image: meal.image || meal.ingredients[0]?.icon || '🍽️',
                                                                        };
                                                                        setSelectedSuggestion(mapped);
                                                                        setMealSearchText(meal.name);
                                                                        
                                                                        // Fetch full details if we have a spoonacular ID
                                                                        if (meal.spoonacularId) {
                                                                            try {
                                                                                const response = await fetch(`/api/recipes?action=details&recipeId=${meal.spoonacularId}`);
                                                                                const result = await response.json();
                                                                                
                                                                                if (result.success) {
                                                                                    setSelectedSuggestion(result.data);
                                                                                }
                                                                            } catch (error) {
                                                                                console.error('Error fetching recipe details:', error);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Badge
                                                                        type="pill-color"
                                                                        size="md"
                                                                        color="gray"
                                                                    >
                                                                        {meal.image ? (
                                                                            <img src={meal.image} alt={meal.name} className="w-4 h-4 rounded object-cover inline-block mr-1" />
                                                                        ) : (
                                                                            meal.ingredients[0]?.icon || '🍽️'
                                                                        )} {meal.name}
                                                                    </Badge>
                                                                </button>
                                                            ))}
                                                            {/* Explore chip */}
                                                            <Link href="/recipes">
                                                                <BadgeWithIcon
                                                                    type="pill-color"
                                                                    size="md"
                                                                    color="blue"
                                                                    iconLeading={ArrowRight}
                                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                                >
                                                                    Explore
                                                                </BadgeWithIcon>
                                                            </Link>
                                                </div>
                                                        </div>
                                                )}

                                                {/* Filters Row - show only when no selection */}
                                                {!selectedSuggestion && (
                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary">
                                                        {/* Calories Filter Badge */}
                                                        <Dropdown.Root>
                                                            <AriaButton className="outline-hidden">
                                                                <Badge
                                                                    type="pill-color"
                                                                    size="sm"
                                                                    color="gray"
                                                                    className="cursor-pointer gap-1.5 px-3 py-1.5"
                                                                >
                                                                    <span>{calorieBadgeLabel}</span>
                                                                    <ChevronDown className="size-3" />
                                                                </Badge>
                                                            </AriaButton>
                                                            <Dropdown.Popover placement="bottom left">
                                                                <Dropdown.Menu
                                                                    selectedKeys={calorieThreshold ? [calorieThreshold] : []}
                                                                    onSelectionChange={(keys) => {
                                                                        const selected = Array.from(keys)[0] as string;
                                                                        setCalorieThreshold(selected === "none" ? null : selected);
                                                                    }}
                                                                >
                                                                    <Dropdown.Item id="500">≤ 500 kcal</Dropdown.Item>
                                                                    <Dropdown.Item id="750">≤ 750 kcal</Dropdown.Item>
                                                                    <Dropdown.Item id="1000">≤ 1000 kcal</Dropdown.Item>
                                                                    <Dropdown.Item id="1500">≤ 1500 kcal</Dropdown.Item>
                                                                    <Dropdown.Item id="none">No limit</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown.Popover>
                                                        </Dropdown.Root>

                                                        {/* Diet Filter Badge */}
                                                        <Dropdown.Root>
                                                            <AriaButton className="outline-hidden">
                                                                <Badge
                                                                    type="pill-color"
                                                                    size="sm"
                                                                    color="gray"
                                                                    className="cursor-pointer gap-1.5 px-3 py-1.5"
                                                                >
                                                                    <span>{dietBadgeLabel}</span>
                                                                    <ChevronDown className="size-3" />
                                                                </Badge>
                                                            </AriaButton>
                                                            <Dropdown.Popover placement="bottom left">
                                                                <Dropdown.Menu
                                                                    selectedKeys={dietFilter ? [dietFilter] : []}
                                                                    onSelectionChange={(keys) => {
                                                                        const selected = Array.from(keys)[0] as string;
                                                                        setDietFilter(selected === "none" ? null : selected);
                                                                    }}
                                                                >
                                                                    <Dropdown.Item id="keto">Keto</Dropdown.Item>
                                                                    <Dropdown.Item id="vegan">Vegan</Dropdown.Item>
                                                                    <Dropdown.Item id="vegetarian">Vegetarian</Dropdown.Item>
                                                                    <Dropdown.Item id="paleo">Paleo</Dropdown.Item>
                                                                    <Dropdown.Item id="none">Any</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown.Popover>
                                                        </Dropdown.Root>

                                                    </div>
                                                )}

                                                {/* Recipe Summary - show when selected */}
                                                {selectedSuggestion && (
                                                    <div className="space-y-4 pt-2">
                                                        {/* Thumbnail - full width, 16:9 aspect ratio */}
                                                        <div className="relative w-full aspect-video flex items-center justify-center rounded-lg bg-quaternary overflow-hidden">
                                                            {selectedSuggestion.image ? (
                                                                <img 
                                                                    src={selectedSuggestion.image} 
                                                                    alt={selectedSuggestion.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-6xl">{selectedSuggestion.ingredients[0]?.icon || '🍽️'}</span>
                                                            )}
                                                            {/* Badges overlay */}
                                                            {selectedSuggestion.badges && selectedSuggestion.badges.length > 0 && (
                                                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                                                                    {selectedSuggestion.badges.slice(0, 3).map((badge, index) => (
                                                                        <Badge
                                                                            key={index}
                                                                            type="pill-color"
                                                                            size="sm"
                                                                            color="gray"
                                                                            className="bg-primary-solid/90 text-white backdrop-blur-sm"
                                                                        >
                                                                            {badge}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                </div>
                                                
                                                {/* Description */}
                                                        <p className="text-xs text-tertiary">{selectedSuggestion.description}</p>
                                                        
                                                        {/* Separator */}
                                                        <div className="h-px bg-border-secondary" />
                                                        
                                                        {/* Time and Difficulty Stats */}
                                                        <div className="flex items-start gap-6">
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-xs font-normal text-tertiary">Time</p>
                                                                <p className="text-sm font-medium text-primary">{selectedSuggestion.time}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-xs font-normal text-tertiary">Difficulty</p>
                                                                <p className="text-sm font-medium text-primary">{selectedSuggestion.difficulty}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column - Ingredients & Servings */}
                                            <div className="space-y-6 min-w-0 overflow-hidden">

                                                {/* Ingredients */}
                                                {!selectedSuggestion ? (
                                                    <div className="relative space-y-3 opacity-40 pointer-events-none overflow-hidden">
                                                        {/* Right fade effect */}
                                                        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-primary to-transparent" />
                                                        
                                                        {/* Servings Selector Skeleton */}
                                                <div>
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary mb-2">SERVINGS</p>
                                                            <div className="flex gap-2">
                                                                {[1, 2, 3, 4].map((num) => (
                                                                    <div
                                                                        key={num}
                                                                        className="flex h-8 flex-1 items-center justify-center rounded-lg border border-secondary bg-primary"
                                                                    >
                                                                        <span className="text-sm font-semibold text-tertiary">{num === 4 ? "4+" : num}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Ingredients Header Skeleton */}
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">INGREDIENTS</p>
                                                            <Badge type="pill-color" size="sm" color="gray">
                                                                0
                                                            </Badge>
                                                        </div>

                                                        {/* Ingredients Skeleton */}
                                                        <div className="flex items-center gap-3">
                                                            {[1, 2, 3, 4].map((idx) => (
                                                                <div key={idx} className="shrink-0 flex items-center gap-2">
                                                                    <div className="h-10 w-10 rounded-full bg-quaternary" />
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="h-3 w-16 bg-quaternary rounded" />
                                                                        <div className="h-2 w-12 bg-quaternary rounded" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                (
                                                    <div className="space-y-6">
                                                        {/* Servings Selector - moved to top */}
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-tertiary mb-2">SERVINGS</p>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4].map((num) => (
                                                            <AriaButton
                                                                key={num}
                                                                className={cx(
                                                                    "flex h-8 flex-1 items-center justify-center rounded-lg border transition-colors outline-hidden",
                                                                            num === servings
                                                                        ? "border-brand bg-brand-secondary text-brand"
                                                                        : "border-secondary bg-primary hover:bg-primary_hover text-primary"
                                                                )}
                                                                        onPress={() => setServings(num)}
                                                            >
                                                                <span className="text-sm font-semibold">{num === 4 ? "4+" : num}</span>
                                                            </AriaButton>
                                                        ))}
                                                    </div>
                                                </div>

                                                        {/* Ingredients Header */}
                                                        <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">INGREDIENTS</p>
                                                            <Badge type="pill-color" size="sm" color="gray">
                                                                {selectedSuggestion.ingredients.length}
                                                            </Badge>
                                                            </div>
                                                            <button
                                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-utility-success-50 hover:bg-utility-success-100 transition-colors group"
                                                                onClick={() => {
                                                                    // Add all ingredients to shopping list with images from recipe
                                                                    selectedSuggestion.ingredients.forEach((ing, index) => {
                                                                        const newItem: Ingredient = {
                                                                            id: `shop-${Date.now()}-${index}-${ing.spoonacularId || ing.id}`,
                                                                            name: ing.name,
                                                                            icon: ing.icon,
                                                                            image: getIngredientImageSource(ing.name, ing.image),
                                                                            quantity: ing.quantity
                                                                        };
                                                                        setShoppingItems(prev => [...prev, newItem]);
                                                                    });
                                                                    showToast(`${selectedSuggestion.ingredients.length} ingredients added to shopping list`);
                                                                }}
                                                            >
                                                                <ShoppingCart01 className="size-3.5 text-utility-success-600 group-hover:text-utility-success-700" />
                                                                <span className="text-xs font-semibold text-utility-success-600 group-hover:text-utility-success-700">Add</span>
                                                            </button>
                                                        </div>

                                                        {/* Ingredients Scrollable Row with fade effects and arrows */}
                                                        <div className="flex items-center gap-2">
                                                            {/* Left Arrow */}
                                                            <button
                                                                onClick={() => handleIngredientsScroll("left")}
                                                                className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors"
                                                                aria-label="Scroll ingredients left"
                                                            >
                                                                <ChevronLeft className="size-5" />
                                                            </button>

                                                            {/* Scrollable container with fade effects */}
                                                            <div className="relative flex-1 overflow-hidden min-w-0">
                                                                {/* Right fade */}
                                                                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-primary to-transparent" />
                                                                
                                                                {/* Scrollable ingredients */}
                                                                <div
                                                                    ref={ingredientsScrollRef}
                                                                    className="flex items-center gap-3 py-3 overflow-x-auto overflow-y-hidden scrollbar-hide -mx-1 px-1"
                                                                    style={{ WebkitOverflowScrolling: "touch" }}
                                                                >
                                                                    {selectedSuggestion.ingredients.map((ingredient, index) => {
                                                                        const isMissing = selectedSuggestion.missingIngredients.some((miss) => miss.id === ingredient.id || miss.name === ingredient.name);
                                                                        const isInShopping = shoppingItems.some((item) => item.name === ingredient.name);
                                                                        const adjustedQuantity = calculateQuantity(ingredient.quantity || "", servings);
                                                            return (
                                                                            <div key={`${ingredient.id}-${index}-${ingredient.name}`} className="shrink-0 flex items-center gap-2">
                                                                                <IngredientChip
                                                                                    ingredient={ingredient}
                                                                                    sourceList={isMissing ? "missing" : isInShopping ? "shopping" : "kitchen"}
                                                                                    onMoveToShopping={() => moveIngredient(ingredient.id, isMissing ? "missing" : "kitchen", "shopping")}
                                                                                    onMoveToKitchen={() => {
                                                                                        if (isMissing) {
                                                                                            moveIngredient(ingredient.id, "missing", "kitchen");
                                                                                        } else {
                                                                                            moveIngredient(ingredient.id, "shopping", "kitchen");
                                                                                        }
                                                                                    }}
                                                                                    onDragStart={(e) => handleDragStart(e, ingredient.id, isMissing ? "missing" : isInShopping ? "shopping" : "kitchen")}
                                                                                    onDragEnd={handleDragEnd}
                                                                                    draggedIngredient={draggedIngredient}
                                                                                    hasShoppingIndicator={isInShopping}
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-xs font-medium text-primary whitespace-nowrap">{ingredient.name}</span>
                                                                                    <span className="text-xs text-tertiary whitespace-nowrap">{adjustedQuantity}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                                    {/* Cart button at the end of the scrollable row */}
                                                                    {selectedSuggestion.missingIngredients.length > 0 && (
                                                                        <div className="shrink-0 ml-2">
                                                                            <AriaButton
                                                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-quaternary hover:bg-primary_hover transition-colors outline-hidden"
                                                                                onPress={() => {
                                                                                    selectedSuggestion.missingIngredients.forEach(ing => {
                                                                                        moveIngredient(ing.id, "missing", "shopping");
                                                                                    });
                                                                                    setSelectedIngredientIds(new Set());
                                                                                    setSelectAllIngredients(true);
                                                                                }}
                                                                                aria-label="Add all missing ingredients to shopping list"
                                                                            >
                                                                                <ShoppingCart01 className="size-5 text-tertiary" />
                                                                            </AriaButton>
                                                        </div>
                                                    )}
                                                                </div>
                                                </div>

                                                            {/* Right Arrow */}
                                                            <button
                                                                onClick={() => handleIngredientsScroll("right")}
                                                                className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors"
                                                                aria-label="Scroll ingredients right"
                                                            >
                                                                <ChevronRight className="size-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                                )}

                                                {/* Nutrient Facts - moved to right column, after ingredients */}
                                                {!selectedSuggestion ? (
                                                    <div className="relative pt-2 border-t border-secondary opacity-40 pointer-events-none overflow-hidden">
                                                        {/* Right fade effect */}
                                                        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-primary to-transparent" />
                                                        
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-tertiary mb-3">NUTRIENT FACTS</p>
                                                    <div className="grid grid-cols-3 gap-4">
                                                            {[1, 2, 3].map((idx) => (
                                                                <div key={idx} className="text-center">
                                                                    <div className="relative mb-2 h-16 flex items-center justify-center">
                                                                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                                                            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-utility-gray-200" />
                                                                        </svg>
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <div className="h-3 w-8 bg-quaternary rounded" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-3 w-16 bg-quaternary rounded mx-auto" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                (
                                                    <div className="pt-2 border-t border-secondary">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-tertiary mb-3">NUTRIENT FACTS</p>
                                                        <div className={cx("grid grid-cols-3 gap-4 transition-all duration-300 ease-out opacity-100")}>
                                                        <div className="text-center">
                                                                <div className="relative mb-2 h-16 flex items-center justify-center">
                                                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                                                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-utility-gray-200" />
                                                                    <circle 
                                                                        cx="32" cy="32" r="28" 
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        strokeWidth="4" 
                                                                        strokeDasharray={`${2 * Math.PI * 28 * 0.7} ${2 * Math.PI * 28}`}
                                                                        className="text-utility-success-500"
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-xs font-normal text-primary">{(selectedSuggestion.calories * servings).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-semibold text-tertiary mb-1">CALORIES</p>
                                                        </div>
                                                        <div className="text-center">
                                                                <div className="relative mb-2 h-16 flex items-center justify-center">
                                                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                                                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-utility-gray-200" />
                                                                    <circle 
                                                                        cx="32" cy="32" r="28" 
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        strokeWidth="4" 
                                                                        strokeDasharray={`${2 * Math.PI * 28 * 0.8} ${2 * Math.PI * 28}`}
                                                                        className="text-utility-warning-500"
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-xs font-normal text-primary">
                                                                            {(() => {
                                                                                if (!selectedSuggestion.carbs) return '0g';
                                                                                const carbsValue = parseFloat(selectedSuggestion.carbs.replace('g', ''));
                                                                                return isNaN(carbsValue) ? '0g' : `${Math.round(carbsValue * servings)}g`;
                                                                            })()}
                                                                        </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-semibold text-tertiary mb-1">CARBS</p>
                                                        </div>
                                                        <div className="text-center">
                                                                <div className="relative mb-2 h-16 flex items-center justify-center">
                                                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                                                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-utility-gray-200" />
                                                                    <circle 
                                                                        cx="32" cy="32" r="28" 
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        strokeWidth="4" 
                                                                        strokeDasharray={`${2 * Math.PI * 28 * 0.6} ${2 * Math.PI * 28}`}
                                                                        className="text-utility-blue-500"
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-xs font-normal text-primary">
                                                                            {(() => {
                                                                                if (!selectedSuggestion.fats) return '0g';
                                                                                const fatsValue = parseFloat(selectedSuggestion.fats.replace('g', ''));
                                                                                return isNaN(fatsValue) ? '0g' : `${Math.round(fatsValue * servings)}g`;
                                                                            })()}
                                                                        </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-semibold text-tertiary mb-1">FATS</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                )
                                                )}

                                                {/* Add to Meal Plan Dropdown */}
                                                {selectedSuggestion && (
                                                    <div className="pt-2">
                                                        <Dropdown.Root>
                                                            <AriaButton
                                                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-transparent bg-utility-success-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-utility-success-600 focus:outline-hidden"
                                                                aria-label="Add to meal plan"
                                                            >
                                                                <CalendarIcon className="size-4" />
                                                                <span>Add to Meal Plan</span>
                                                                <ChevronDown className="size-4" />
                                                            </AriaButton>
                                                            <Dropdown.Popover placement="bottom left">
                                                                <Dropdown.Menu
                                                                    onAction={(key) => {
                                                                        const mealSlot = key as string;
                                                                        const mealTypeMap: Record<string, "breakfast" | "lunch" | "dinner"> = {
                                                                            "Breakfast": "breakfast",
                                                                            "Lunch": "lunch",
                                                                            "Dinner": "dinner",
                                                                        };
                                                                        const mealType = mealTypeMap[mealSlot];
                                                                        const isoDate = dateIdToDateString(activeMealDateId);
                                                                        
                                                                        // Determine if we should replace or add
                                                                        const shouldReplace = mealActionType === "replace" && mealActionMealType === mealType;
                                                                        
                                                                        // Add to meal plan using hook
                                                                        const recipeId = selectedSuggestion.spoonacularId?.toString() || selectedSuggestion.id;
                                                                        addRecipeToMealPlan({
                                                                            recipeId: recipeId,
                                                                            recipeName: selectedSuggestion.name,
                                                                            recipeImage: selectedSuggestion.image,
                                                                            date: isoDate,
                                                                            mealType: mealType,
                                                                        }, shouldReplace);
                                                                        
                                                                        showToast(`${selectedSuggestion.name} ${shouldReplace ? "replaced in" : "added to"} ${mealSlot}`);
                                                                        
                                                                        // Reset the form
                                                        setIsAddingMeal(false);
                                                                setMealSearchText("");
                                                                setSelectedSuggestion(null);
                                                                setServings(1);
                                                                setUseMyPreferences(false);
                                                                setCalorieThreshold(null);
                                                                        setSelectAllIngredients(true);
                                                                        setSelectedIngredientIds(new Set());
                                                                        setMealActionType("add");
                                                                        setMealActionMealType(null);
                                                                        setMealActionIndex(undefined);
                                                                    }}
                                                                >
                                                                    <Dropdown.Item id="Breakfast">Breakfast</Dropdown.Item>
                                                                    <Dropdown.Item id="Lunch">Lunch</Dropdown.Item>
                                                                    <Dropdown.Item id="Dinner">Dinner</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown.Popover>
                                                        </Dropdown.Root>
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Continue Learning & Suggested Recipes */}
                        <div className="flex w-full flex-col gap-6">
                            {/* Continue Card */}
                            <div className="rounded-lg border border-secondary bg-primary p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">CONTINUE</p>
                                </div>
                                <p className="text-sm font-semibold text-primary mb-2">Cutting Skills - Lesson 3</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-quaternary">
                                        ▶
                                    </div>
                                    <p className="text-sm text-tertiary">Hand Movements (3:29)</p>
                                </div>
                            </div>

                            {/* Suggested for you Card */}
                            <div className="rounded-lg border border-secondary bg-primary p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">SUGGESTED FOR YOU</p>
                                    <ButtonUtility size="xs" color="tertiary" />
                                </div>
                                <div className="mb-3">
                                    {(() => {
                                        const currentRecipe = suggestedRecipesQueue[currentSuggestionIndex] || null;
                                        if (!currentRecipe) {
                                            return (
                                                <div className="h-32 w-full rounded-lg bg-quaternary flex items-center justify-center">
                                                    <p className="text-sm text-tertiary">
                                                        {isLoadingSuggested ? 'Loading suggestions...' : 'No suggestions available'}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        
                                        const handleYummy = () => {
                                            // Track liked recipe
                                            if (currentRecipe.spoonacularId) {
                                                setLikedRecipeIds(prev => new Set(prev).add(currentRecipe.spoonacularId!));
                                            }
                                            // Move to next recipe
                                            nextSuggestion();
                                        };
                                        
                                        const handleNah = () => {
                                            // Track disliked recipe
                                            if (currentRecipe.spoonacularId) {
                                                setDislikedRecipeIds(prev => new Set(prev).add(currentRecipe.spoonacularId!));
                                            }
                                            // Move to next recipe
                                            nextSuggestion();
                                        };
                                        
                                        const nextSuggestion = () => {
                                            setIsDismissing(true);
                                            setTimeout(() => {
                                                setCurrentSuggestionIndex((prev) => {
                                                    if (suggestedRecipesQueue.length === 0) return 0;
                                                    const nextIndex = prev + 1;
                                                    // If we've reached the end, stay at last item (will trigger refetch)
                                                    return nextIndex >= suggestedRecipesQueue.length ? prev : nextIndex;
                                                });
                                                setIsDismissing(false);
                                            }, 300);
                                        };
                                        
                                        return (
                                            <>
                                                {/* Thumbnail layer - no delay */}
                                                <div
                                                    className={cx(
                                                        "group relative h-32 w-full rounded-lg bg-quaternary mb-3 overflow-hidden transition-all duration-200 ease-out",
                                                        isDismissing ? "scale-95 opacity-0 delay-0" : "scale-100 opacity-100 delay-0"
                                                    )}
                                                >
                                                    {currentRecipe.image ? (
                                                        <img 
                                                            src={currentRecipe.image} 
                                                            alt={currentRecipe.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <span className="text-4xl">{currentRecipe.ingredients[0]?.icon || '🍽️'}</span>
                                                        </div>
                                                    )}
                                                    {/* Hover overlay with icon buttons */}
                                                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={handleNah}
                                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-utility-gray-200 hover:bg-utility-gray-300 transition-colors"
                                                        >
                                                            <ThumbsDown className="size-5 text-utility-gray-700" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleYummy}
                                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-utility-success-500 hover:bg-utility-success-600 transition-colors"
                                                        >
                                                            <ThumbsUp className="size-5 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Title layer - 100ms delay */}
                                                <p
                                                    className={cx(
                                                        "text-sm font-semibold text-primary mb-2 transition-all duration-200 ease-out",
                                                        isDismissing ? "scale-95 opacity-0 delay-[100ms]" : "scale-100 opacity-100 delay-[100ms]"
                                                    )}
                                                >
                                                    {currentRecipe.name}
                                                </p>
                                                
                                                {/* Nutrition layer - 200ms delay */}
                                                <div
                                                    className={cx(
                                                        "flex items-center gap-4 text-xs text-tertiary transition-all duration-200 ease-out",
                                                        isDismissing ? "scale-95 opacity-0 delay-[200ms]" : "scale-100 opacity-100 delay-[200ms]"
                                                    )}
                                                >
                                                    {currentRecipe.calories && <span>kcal {currentRecipe.calories}</span>}
                                                    {currentRecipe.carbs && <span>{currentRecipe.carbs}</span>}
                                                    {currentRecipe.protein && <span>{currentRecipe.protein}</span>}
                                                </div>
                                                
                                                {/* Thumbs up/down icon buttons - always visible */}
                                                <div className="flex gap-2 mt-3 justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={handleNah}
                                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-utility-gray-200 hover:bg-utility-gray-300 transition-colors"
                                                    >
                                                        <ThumbsDown className="size-5 text-utility-gray-700" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleYummy}
                                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-utility-success-500 hover:bg-utility-success-600 transition-colors"
                                                    >
                                                        <ThumbsUp className="size-5 text-white" />
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={cx(
                        "fixed bottom-8 right-8 z-50 rounded-lg bg-primary-solid px-4 py-3 shadow-lg transition-all duration-300",
                        toastMessage.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}
                >
                    <p className="text-sm font-medium text-white">{toastMessage.message}</p>
                </div>
            )}

            {/* Trash Drop Target - shown when dragging */}
            {isDraggingForDelete && draggedIngredient && (
                <div
                    className={cx(
                        "fixed bottom-24 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer",
                        dragOverTarget === "trash"
                            ? "border-utility-error-400 bg-utility-error-50 scale-110"
                            : "border-utility-error-300/50 bg-primary/80 backdrop-blur-sm scale-100"
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                        setDragOverTarget("trash");
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setDragOverTarget(null);
                        }
                    }}
                    onDrop={handleTrashDrop}
                    aria-label="Delete ingredient"
                >
                    <Trash01 className={cx("size-6 transition-colors", dragOverTarget === "trash" ? "text-utility-error-600" : "text-utility-error-400")} />
                </div>
            )}
        </div>
    );
};
