"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { KitchenItemCard } from "./kitchen-item-card";
import { cx } from "@/utils/cx";
import type { KitchenItem } from "@/hooks/use-kitchen";
import type { StorageArea } from "@/utils/storage-categorizer";
import { getStorageAreaInfo } from "@/utils/storage-categorizer";

interface StorageSectionProps {
  storageArea: StorageArea;
  items: KitchenItem[];
  onUpdateItem: (id: string, updates: Partial<KitchenItem>) => void;
  onRemoveItem: (id: string) => void;
  searchQuery?: string;
}

export function StorageSection({
  storageArea,
  items,
  onUpdateItem,
  onRemoveItem,
  searchQuery = "",
}: StorageSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const areaInfo = getStorageAreaInfo(storageArea);

  // Filter items by search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredItems.length === 0 && !searchQuery) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-secondary_alt border border-secondary hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{areaInfo.icon}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-primary-foreground">
              {areaInfo.name}
            </h3>
            <p className="text-xs text-primary-foreground/60">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-5 text-primary-foreground/60" />
        ) : (
          <ChevronDown className="size-5 text-primary-foreground/60" />
        )}
      </button>

      {/* Items Grid */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-primary-foreground/60">
              No items found in {areaInfo.name.toLowerCase()}
            </div>
          ) : (
            filteredItems.map((item) => (
              <KitchenItemCard
                key={item.id}
                item={item}
                onUpdate={onUpdateItem}
                onRemove={onRemoveItem}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

