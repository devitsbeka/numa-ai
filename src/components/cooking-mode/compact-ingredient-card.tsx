"use client";

import { RefreshCw05, ShoppingBag02, Home01, CheckCircle } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { cx } from "@/utils/cx";
import Image from "next/image";
import type { CategorizedIngredient } from "@/types/cooking-mode";
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";

interface CompactIngredientCardProps {
  ingredient: CategorizedIngredient;
  formatQuantity: (ingredient: CategorizedIngredient) => string;
  onReplace?: (ingredientId: string, anchorRect?: DOMRect) => void;
  onAddToBasket?: (ingredient: CategorizedIngredient) => void;
  onAddToKitchen?: (ingredient: CategorizedIngredient) => void;
  isInShoppingList?: boolean;
}

export function CompactIngredientCard({
  ingredient,
  formatQuantity,
  onReplace,
  onAddToBasket,
  onAddToKitchen,
  isInShoppingList = false,
}: CompactIngredientCardProps) {
  const isPrimary = ingredient.importance === "crucial";
  const quantity = formatQuantity(ingredient);
  const imageSrc = getIngredientImageSource(ingredient.name, ingredient.image);
  
  const handleReplace = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onReplace?.(ingredient.id, e.currentTarget.getBoundingClientRect());
  };

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToBasket?.(ingredient);
  };

  const handleAddToKitchen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToKitchen?.(ingredient);
  };

  return (
    <Tooltip 
      title={ingredient.name}
      description={`${quantity} • ${ingredient.inKitchen ? "In Kitchen" : "Missing"} • ${isPrimary ? "Primary" : "Secondary"}`}
    >
      <TooltipTrigger elementType="div">
        <div className={cx(
          "h-full w-full min-w-[140px] max-w-[160px] rounded-lg border-2 transition-all duration-200",
          "flex flex-col overflow-hidden cursor-pointer",
          "bg-secondary_alt border-secondary hover:border-primary-foreground/30 hover:shadow-sm",
          ingredient.inKitchen ? "opacity-100" : "opacity-75"
        )}>
          {/* Image Section */}
          <div className="relative w-full h-20 shrink-0 bg-secondary overflow-hidden">
            {imageSrc ? (
              <div className="absolute inset-3">
                <Image
                  src={imageSrc}
                  alt={ingredient.name}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <span className="text-xs text-primary-foreground/40 font-medium">
                  {ingredient.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {isPrimary && (
              <div className="absolute left-1.5 top-1.5 z-20 group">
                <div className="size-2 rounded-full bg-utility-error-500 transition-all duration-200 group-hover:w-auto group-hover:h-auto group-hover:min-w-[60px] group-hover:px-2 group-hover:py-0.5 group-hover:rounded-full flex items-center justify-center overflow-hidden">
                  <span className="opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto text-[10px] font-semibold text-white whitespace-nowrap transition-all duration-200">
                    Essential
                  </span>
                </div>
              </div>
            )}
            {/* Action Buttons Overlay */}
            <div className="absolute top-1 right-1 flex gap-1 z-20">
              {onReplace && !isPrimary && (
                <ButtonUtility
                  size="sm"
                  color="tertiary"
                  icon={RefreshCw05}
                  onClick={handleReplace}
                  className="bg-primary/90 hover:bg-primary backdrop-blur-sm border border-primary-foreground/20"
                  aria-label="Replace ingredient"
                  tooltip="Find a substitute"
                />
              )}
              {onAddToBasket && (
                <ButtonUtility
                  size="sm"
                  color="tertiary"
                  icon={isInShoppingList ? CheckCircle : ShoppingBag02}
                  onClick={handleAddToBasket}
                  className={cx(
                    "backdrop-blur-sm border border-primary-foreground/20",
                    isInShoppingList
                      ? "bg-utility-success-500/80 hover:bg-utility-success-500 text-white"
                      : "bg-primary/90 hover:bg-primary"
                  )}
                  aria-label={isInShoppingList ? "In shopping list" : "Add to basket"}
                  tooltip={isInShoppingList ? "Already in shopping list" : "Add to shopping list"}
                />
              )}
              {onAddToKitchen && !ingredient.inKitchen && (
                <ButtonUtility
                  size="sm"
                  color="tertiary"
                  icon={Home01}
                  onClick={handleAddToKitchen}
                  className="bg-primary/90 hover:bg-primary backdrop-blur-sm border border-primary-foreground/20"
                  aria-label="Add to kitchen"
                  tooltip="Add to kitchen"
                />
              )}
            </div>
          </div>
          
          {/* Text Section */}
          <div className="flex-1 p-2 flex flex-col gap-0.5 min-h-0">
            <p className="text-xs font-medium text-primary-foreground line-clamp-2 leading-tight">
              {ingredient.name}
            </p>
            <p className="text-[10px] text-primary-foreground/60 leading-tight">
              {quantity}
            </p>
            {!ingredient.inKitchen && (
              <span className="text-[10px] text-utility-warning-400 mt-0.5">
                Missing
              </span>
            )}
          </div>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
}

