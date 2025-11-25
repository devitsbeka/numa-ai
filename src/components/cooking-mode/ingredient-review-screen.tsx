"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ShoppingBag02, ChevronLeft, ChevronRight, X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { useKitchen } from "@/hooks/use-kitchen";
import { DiningTable } from "./dining-table";
import { CompactIngredientCard } from "./compact-ingredient-card";
import { StepsPreviewCarousel } from "./steps-preview-carousel";
import { ToastContainer, useToast } from "@/components/base/toast/toast";
import { toTitleCase } from "@/utils/title-case";
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";
import Image from "next/image";
import type {
  CategorizedIngredient,
  Diner,
  NutritionFacts,
  IngredientReplacementDetails,
} from "@/types/cooking-mode";

const SPOONACULAR_INGREDIENT_IMAGE_BASE = "https://img.spoonacular.com/ingredients_250x250/";

const parseReplacementLabel = (input: string, fallbackQuantity?: string) => {
  const raw = input.trim();
  if (!raw) {
    return { name: raw, displayQuantity: fallbackQuantity };
  }

  const delimiterIndex = raw.indexOf("=");
  let working = delimiterIndex >= 0 ? raw.slice(delimiterIndex + 1).trim() : raw;
  working = working.replace(/^\s*(use|try|about|or)\s+/i, "").trim();

  let quantity = fallbackQuantity;
  let name = working;

  const ofIndex = working.toLowerCase().lastIndexOf(" of ");
  if (ofIndex > 0) {
    const possibleQuantity = working.slice(0, ofIndex).trim();
    const possibleName = working.slice(ofIndex + 4).trim();
    if (possibleName) {
      quantity = possibleQuantity || quantity;
      name = possibleName;
    }
  } else {
    const amountMatch = working.match(/^([\d/.,\s]+[a-zA-Z%°]+)\s+(.*)$/);
    if (amountMatch && amountMatch[2]) {
      quantity = amountMatch[1].trim() || quantity;
      name = amountMatch[2].trim();
    }
  }

  const cleanedName = name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const cleanedQuantity = quantity ? quantity.replace(/\s+/g, " ").trim() : undefined;

  return {
    name: cleanedName || raw,
    displayQuantity: cleanedQuantity || fallbackQuantity,
  };
};

interface IngredientReviewScreenProps {
  ingredients: CategorizedIngredient[];
  recipeName: string;
  servings?: number;
  readyInMinutes?: number;
  difficulty?: string;
  kitchenItems: string[];
  instructions: string[];
  onStartCooking: () => void;
  onIngredientReplace?: (originalId: string, replacement: IngredientReplacementDetails) => void;
  onToggleInKitchen?: (ingredientName: string) => void;
  onExit?: () => void;
  diners: Diner[];
  onDinersChange: (diners: Diner[]) => void;
  originalServings?: number;
  nutritionFacts?: NutritionFacts;
  recipeImage?: string;
}

export function IngredientReviewScreen({
  ingredients,
  recipeName,
  servings,
  readyInMinutes,
  difficulty,
  kitchenItems,
  instructions,
  onStartCooking,
  onIngredientReplace,
  onToggleInKitchen,
  onExit,
  diners,
  onDinersChange,
  originalServings,
  nutritionFacts,
  recipeImage,
}: IngredientReviewScreenProps) {
  const { addItems, addItem, items: shoppingListItems } = useShoppingList();
  const { addItems: addToKitchen } = useKitchen();
  const ingredientsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();
  const [replacementPanel, setReplacementPanel] = useState<{
    ingredientId: string;
    ingredientName: string;
    suggestions: string[];
    isLoading: boolean;
    error?: string;
    baseIngredient: CategorizedIngredient;
  } | null>(null);
  const [replacementPanelPosition, setReplacementPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const [customReplacement, setCustomReplacement] = useState("");
  const [isApplyingReplacement, setIsApplyingReplacement] = useState(false);

  useEffect(() => {
    if (!replacementPanel) {
      setCustomReplacement("");
      setReplacementPanelPosition(null);
    }
  }, [replacementPanel]);

  // Combine all ingredients in one array (primary first, then secondary)
  const allIngredients = useMemo(() => {
    const primary: CategorizedIngredient[] = [];
    const secondary: CategorizedIngredient[] = [];

    ingredients.forEach((ing) => {
      if (ing.importance === "crucial") {
        primary.push(ing);
      } else {
        secondary.push(ing);
      }
    });

    return [...primary, ...secondary];
  }, [ingredients]);

  // Check scroll state on mount and when ingredients change
  useEffect(() => {
    const checkScroll = () => {
      if (!ingredientsScrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = ingredientsScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };
    
    // Check after a brief delay to ensure layout is complete
    const timeout = setTimeout(checkScroll, 100);
    return () => clearTimeout(timeout);
  }, [allIngredients]);

  const inKitchenCount = ingredients.filter((ing) => ing.inKitchen).length;
  const totalCount = ingredients.length;
  const missingCount = totalCount - inKitchenCount;

  const nutritionEntries = nutritionFacts
    ? [
        { label: "Calories", value: nutritionFacts.calories },
        { label: "Protein", value: nutritionFacts.protein },
        { label: "Carbs", value: nutritionFacts.carbs },
        { label: "Fat", value: nutritionFacts.fat },
        { label: "Fiber", value: nutritionFacts.fiber },
      ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value))
    : [];

  // Format quantity for display
  const formatQuantity = (ingredient: CategorizedIngredient) => {
    if (ingredient.displayQuantity) {
      return ingredient.displayQuantity;
    }
    const amount = ingredient.amount;
    if (amount > 0) {
      const rounded = Math.round(amount * 100) / 100;
      const displayAmount = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
      return `${displayAmount} ${ingredient.unit}`;
    }
    return "As needed";
  };

  const getReadableQuantity = (ingredient: CategorizedIngredient) => {
    const value = formatQuantity(ingredient);
    return value === "As needed" ? undefined : value;
  };

  // Format time
  const formatTime = (minutes?: number) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Handle add all missing to shopping list and kitchen
  const handleAddAllMissing = async () => {
    const missing = ingredients.filter((ing) => !ing.inKitchen);
    if (missing.length === 0) return;
    
    // Add to shopping list
    addItems(
      missing.map((ing) => ({
        id: `shop-${Date.now()}-${ing.id}`,
        name: ing.name,
        image: getIngredientImageSource(ing.name, ing.image),
        quantity: getReadableQuantity(ing),
      }))
    );
    
    // Add to kitchen
    await addToKitchen(
      missing.map((ing) => ({
        name: ing.name,
        image: getIngredientImageSource(ing.name, ing.image),
        quantity: getReadableQuantity(ing),
      }))
    );
    
    showToast(`${missing.length} ingredient${missing.length > 1 ? "s" : ""} added to kitchen and shopping list`, "success");
  };

  // Handle scroll to update arrow visibility
  const handleScroll = () => {
    if (!ingredientsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ingredientsScrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (ingredientsScrollRef.current) {
      ingredientsScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (ingredientsScrollRef.current) {
      ingredientsScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const triggerReplacementFlow = async (ingredientId: string, anchorRect?: DOMRect) => {
    const ingredient = allIngredients.find((ing) => ing.id === ingredientId);
    if (!ingredient) return;

    if (ingredient.importance === "crucial") {
      showToast(`${ingredient.name} is essential and can't be replaced`, "info");
      return;
    }

    const viewportPadding = 12;
    if (anchorRect) {
      const calculatedLeft = Math.min(
        anchorRect.left + window.scrollX,
        window.innerWidth - 320 - viewportPadding
      );
      const calculatedTop = Math.min(
        anchorRect.bottom + window.scrollY + 8,
        window.innerHeight - 200 - viewportPadding
      );
      setReplacementPanelPosition({ top: calculatedTop, left: Math.max(viewportPadding, calculatedLeft) });
    } else {
      setReplacementPanelPosition(null);
    }

    setReplacementPanel({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      suggestions: [],
      isLoading: true,
      error: undefined,
      baseIngredient: ingredient,
    });
    setCustomReplacement("");

    try {
      const response = await fetch(`/api/ingredients/substitutes?ingredient=${encodeURIComponent(ingredient.name)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch substitutes");
      }
      const result = await response.json();
      const suggestions: string[] =
        result?.data?.substitutes?.map((sub: { name: string } | string) =>
          typeof sub === "string" ? sub : sub.name
        ) || [];

      setReplacementPanel((prev) =>
        prev
          ? {
              ...prev,
              suggestions: suggestions.length > 0 ? suggestions : [`${ingredient.name} alternative`],
              isLoading: false,
            }
          : prev
      );
    } catch (error) {
      console.error("Substitute fetch failed", error);
      setReplacementPanel((prev) =>
        prev
          ? {
              ...prev,
              suggestions: [`${ingredient.name} alternative`],
              isLoading: false,
              error: "Unable to fetch suggestions right now.",
            }
          : prev
      );
    }
  };

  const fetchIngredientMetadata = async (ingredientName: string) => {
    try {
      const response = await fetch(`/api/ingredients/search?query=${encodeURIComponent(ingredientName)}`);
      if (!response.ok) {
        throw new Error("Failed to search ingredients");
      }
      const result = await response.json();
      const first = result?.results?.[0];
      if (first) {
        const fallbackImage = first.image
          ? `${SPOONACULAR_INGREDIENT_IMAGE_BASE}${first.image}`
          : undefined;
        const resolvedName = first.name || ingredientName;
        return {
          name: resolvedName,
          image: getIngredientImageSource(resolvedName, fallbackImage),
        };
      }
    } catch (error) {
      console.error("Ingredient metadata lookup failed:", error);
    }
    return { name: ingredientName, image: getIngredientImageSource(ingredientName) };
  };

  const applyReplacementSelection = async (selection: string) => {
    if (!replacementPanel) return;
    const trimmed = selection.trim();
    if (!trimmed) return;

    setIsApplyingReplacement(true);
    try {
      const fallbackQuantity = getReadableQuantity(replacementPanel.baseIngredient);
      const parsed = parseReplacementLabel(trimmed, fallbackQuantity);
      const metadata = await fetchIngredientMetadata(parsed.name);
      const normalizedName = metadata.name || parsed.name;

      onIngredientReplace?.(replacementPanel.ingredientId, {
        name: normalizedName,
        displayQuantity: parsed.displayQuantity || fallbackQuantity,
        image: getIngredientImageSource(normalizedName, metadata.image),
      });

      showToast(`Swapped for ${normalizedName}`, "success");
      setReplacementPanel(null);
    } catch (error) {
      console.error("Failed to apply replacement:", error);
      showToast("Unable to update ingredient", "error");
    } finally {
      setIsApplyingReplacement(false);
    }
  };

  const handleCustomReplacement = () => {
    if (!replacementPanel || !customReplacement.trim() || isApplyingReplacement) return;
    applyReplacementSelection(customReplacement.trim());
  };

  const handleAddToBasket = (ingredient: CategorizedIngredient) => {
    addItem({
      id: `shop-${Date.now()}-${ingredient.id}`,
      name: ingredient.name,
      image: getIngredientImageSource(ingredient.name, ingredient.image),
      quantity: getReadableQuantity(ingredient),
    });
    showToast(`${ingredient.name} added to shopping list`, "success");
  };

  const handleAddToKitchen = async (ingredient: CategorizedIngredient) => {
    await addToKitchen([
      {
        name: ingredient.name,
        image: getIngredientImageSource(ingredient.name, ingredient.image),
        quantity: getReadableQuantity(ingredient),
      },
    ]);
    onToggleInKitchen?.(ingredient.name);
    showToast(`${ingredient.name} added to kitchen`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full h-full max-w-[1920px] flex flex-col gap-2 min-h-0 relative">
        {/* Header - Compact */}
        <div className="shrink-0 px-2 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              {toTitleCase(recipeName)}
            </h1>
            <p className="text-xs text-primary-foreground/60">
              {formatTime(readyInMinutes)} • {difficulty || "Medium"}
            </p>
          </div>
          {onExit && (
            <Button
              size="sm"
              color="tertiary"
              iconLeading={X}
              onClick={onExit}
              className="text-primary-foreground/80 hover:text-primary-foreground"
            >
              Exit
            </Button>
          )}
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
          {/* Left Sidebar: Recipe Thumbnail & Nutrition */}
          <div className="w-72 shrink-0 flex flex-col gap-3 overflow-hidden">
            {/* Recipe Thumbnail Image - 3:4 aspect ratio with blurred background */}
            <div className="relative w-full rounded-2xl border border-secondary bg-secondary/30 overflow-hidden" style={{ aspectRatio: '3/4' }}>
              {recipeImage ? (
                <>
                  {/* Blurred background */}
                  <div className="absolute inset-0">
                    <Image
                      src={recipeImage}
                      alt={recipeName}
                      fill
                      className="object-cover blur-xl scale-110"
                      sizes="288px"
                      style={{ opacity: 0.6 }}
                    />
                  </div>
                  {/* Centered proportional image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[80%] h-auto" style={{ aspectRatio: 'auto' }}>
                      <Image
                        src={recipeImage}
                        alt={recipeName}
                        width={800}
                        height={600}
                        className="object-contain rounded-lg"
                        sizes="230px"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-primary-foreground/40 text-sm">No Image</span>
                </div>
              )}
            </div>

            {nutritionEntries.length > 0 && (
              <div className="rounded-2xl border border-secondary bg-secondary/30 p-3 text-xs text-primary-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary-foreground">Nutrition Facts</span>
                  {servings && (
                    <span className="text-[10px] uppercase tracking-wide text-primary-foreground/60">
                      Per Serving
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {nutritionEntries.map((entry) => (
                    <div
                      key={entry.label}
                      className="rounded-xl border border-secondary bg-primary/10 px-2 py-1.5"
                    >
                      <p className="text-[10px] text-primary-foreground/60">{entry.label}</p>
                      <p className="text-sm font-semibold text-primary-foreground">{entry.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Cooking Button */}
            <div className="mt-auto pt-2">
              <Button
                size="lg"
                onClick={onStartCooking}
                className="w-full bg-utility-success-600 hover:bg-utility-success-700 text-white font-bold"
              >
                Start Cooking 🔥
              </Button>
            </div>
          </div>

          {/* Center: Steps & Ingredients */}
          <div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
            <div className="rounded-2xl border border-secondary bg-secondary/30 p-3" style={{ height: '360px', overflow: 'visible' }}>
              <StepsPreviewCarousel steps={instructions} />
            </div>

            {allIngredients.length > 0 && (
              <div className="shrink-0 rounded-2xl border border-secondary bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-xs font-semibold text-primary-foreground">
                    Ingredients ({allIngredients.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-primary-foreground/60">
                      {inKitchenCount}/{totalCount} in kitchen
                      {missingCount > 0 && ` • ${missingCount} missing`}
                    </div>
                    {missingCount > 0 && (
                      <Button
                        size="sm"
                        color="secondary"
                        iconLeading={ShoppingBag02}
                        onClick={handleAddAllMissing}
                        className="shrink-0 text-xs px-2 py-1 h-6"
                      >
                        Add Missing
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative h-full">
                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-primary/90 border border-secondary flex items-center justify-center hover:bg-primary transition-colors"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="size-4 text-primary-foreground" />
                    </button>
                  )}

                  {/* Scrollable Container */}
                  <div
                    ref={ingredientsScrollRef}
                    onScroll={handleScroll}
                    className="flex gap-2 overflow-x-auto scrollbar-hide h-full items-stretch px-1"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {allIngredients.map((ingredient, index) => (
                      <div key={`${ingredient.id}-${index}`} className="shrink-0 flex h-full">
                        <CompactIngredientCard
                          ingredient={ingredient}
                          formatQuantity={formatQuantity}
                          onReplace={triggerReplacementFlow}
                          onAddToBasket={handleAddToBasket}
                          onAddToKitchen={handleAddToKitchen}
                          isInShoppingList={shoppingListItems.some(item => 
                            item.name.toLowerCase() === ingredient.name.toLowerCase()
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  {canScrollRight && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-primary/90 border border-secondary flex items-center justify-center hover:bg-primary transition-colors"
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
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Dining Table */}
          <div className="w-72 shrink-0 flex flex-col gap-3 overflow-hidden">
            <div className="rounded-2xl border border-secondary bg-secondary/30 p-4 h-full flex flex-col">
              <DiningTable
                diners={diners}
                onDinersChange={onDinersChange}
                originalServings={originalServings}
              />
            </div>
          </div>
        </div>
        {replacementPanel && (
          <div
            className="absolute w-80 rounded-2xl border border-secondary bg-primary/95 p-4 shadow-2xl"
            style={
              replacementPanelPosition
                ? { top: replacementPanelPosition.top, left: replacementPanelPosition.left }
                : { top: 24, right: 24 }
            }
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60">Swap Ingredient</p>
                <p className="text-base font-semibold text-primary-foreground">{replacementPanel.ingredientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplacementPanel(null)}
                className="text-primary-foreground/60 hover:text-primary-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              {replacementPanel.isLoading && (
                <p className="text-xs text-primary-foreground/60">Finding substitutes...</p>
              )}
              {!replacementPanel.isLoading && (
                <>
                  {replacementPanel.error && (
                    <p className="text-[11px] text-utility-warning-400">{replacementPanel.error}</p>
                  )}
                  {replacementPanel.suggestions.length > 0 ? (
                    replacementPanel.suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        size="sm"
                        color="secondary"
                        className="w-full justify-start text-xs"
                        onClick={() => applyReplacementSelection(suggestion)}
                        isDisabled={isApplyingReplacement}
                      >
                        {suggestion}
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-primary-foreground/60">No suggestions available.</p>
                  )}
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="text-[11px] font-medium text-primary-foreground/70">
                Prefer something else?
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={customReplacement}
                  onChange={(e) => setCustomReplacement(e.target.value)}
                  className="flex-1 rounded-lg border border-secondary bg-primary px-2 py-1 text-xs text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-1 focus:ring-secondary"
                  placeholder="e.g. almond flour"
                />
                <Button
                  size="sm"
                  color="secondary"
                  onClick={handleCustomReplacement}
                  isDisabled={!customReplacement.trim() || isApplyingReplacement}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Scrollbar Hide Styles */}
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
  );
}

