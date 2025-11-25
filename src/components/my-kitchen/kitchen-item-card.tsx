"use client";

import { useState, useMemo } from "react";
import { Trash01, Edit03, X, Check } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { cx } from "@/utils/cx";
import Image from "next/image";
import type { KitchenItem } from "@/hooks/use-kitchen";
import type { StorageArea } from "@/utils/storage-categorizer";
import { getStorageAreaInfo, getCategoryInfo } from "@/utils/storage-categorizer";
import type { SelectItemType } from "@/components/base/select/select";
import { getDefaultQuantity } from "@/utils/quantity-parser";
import { getIngredientImageSource } from "@/utils/ingredient-icon-map";

interface KitchenItemCardProps {
  item: KitchenItem;
  onUpdate: (id: string, updates: Partial<KitchenItem>) => void;
  onRemove: (id: string) => void;
}

const STORAGE_AREAS: StorageArea[] = ['fridge', 'freezer', 'pantry'];

export function KitchenItemCard({
  item,
  onUpdate,
  onRemove,
}: KitchenItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity || "");
  const [editStorageArea, setEditStorageArea] = useState<StorageArea>(
    item.storageArea || "pantry"
  );
  const [editExpiryDate, setEditExpiryDate] = useState(
    item.expiryDate || ""
  );

  const categoryInfo = item.category ? getCategoryInfo(item.category) : null;
  const storageInfo = item.storageArea
    ? getStorageAreaInfo(item.storageArea)
    : null;
  
  // Ensure item.image is a valid string if provided
  const fallbackImage = item.image && typeof item.image === 'string' ? item.image : undefined;
  const imageSrc = getIngredientImageSource(item.name, fallbackImage);
  
  // Ensure imageSrc is a valid string (not an object or empty)
  const validImageSrc = imageSrc && typeof imageSrc === 'string' && imageSrc.trim() !== '' && imageSrc !== 'undefined' ? imageSrc : null;

  // Prepare storage area options for Select
  const storageOptions: SelectItemType[] = useMemo(() => {
    return STORAGE_AREAS.map((area) => {
      const info = getStorageAreaInfo(area);
      return {
        id: area,
        label: `${info.icon} ${info.name}`,
      };
    });
  }, []);

  const handleSave = () => {
    // Ensure quantity is always set - use default if empty
    const finalQuantity = editQuantity.trim() || getDefaultQuantity(item.name);
    
    onUpdate(item.id, {
      quantity: finalQuantity,
      storageArea: editStorageArea,
      expiryDate: editExpiryDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditQuantity(item.quantity || "");
    setEditStorageArea(item.storageArea || "pantry");
    setEditExpiryDate(item.expiryDate || "");
    setIsEditing(false);
  };

  const isExpiringSoon = item.expiryDate
    ? new Date(item.expiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    : false;

  // Capitalize first letter of ingredient name
  const capitalizedName = item.name.charAt(0).toUpperCase() + item.name.slice(1);

  // Get category tags
  const categoryTags = [];
  if (categoryInfo) {
    categoryTags.push(categoryInfo.name);
  }
  if (storageInfo && storageInfo.name !== "Pantry") {
    categoryTags.push(storageInfo.name);
  }

  return (
    <div
      className={cx(
        "rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset",
        isEditing && "min-h-24"
      )}
    >
      {/* Edit Mode */}
      {isEditing ? (
        <div className="p-3 flex gap-3">
          <div className="w-16 h-16 flex-shrink-0 bg-secondary rounded overflow-hidden">
            {validImageSrc ? (
              <Image
                src={validImageSrc}
                alt={item.name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl text-primary-foreground/40 font-medium">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <Input
              type="text"
              placeholder="Quantity (e.g., 2 cups)"
              value={editQuantity}
              onChange={(value) => setEditQuantity(value)}
              size="sm"
            />
            <div className="flex gap-3">
              <Select
                selectedKey={editStorageArea}
                onSelectionChange={(key) => setEditStorageArea(key as StorageArea)}
                items={storageOptions}
                size="sm"
                placeholder="Storage"
                className="flex-1"
              >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
              <Input
                type="date"
                placeholder="Expiry"
                value={editExpiryDate}
                onChange={(value) => setEditExpiryDate(value)}
                size="sm"
                className="flex-1"
              />
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                iconLeading={Check}
                onClick={handleSave}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                size="sm"
                color="secondary"
                iconLeading={X}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col gap-2 px-4 py-5 md:px-5">
          {/* Image and Name Row */}
          <div className="flex items-center gap-3">
            {/* Image - 64x64px */}
            <div className="relative w-16 h-16 flex-shrink-0 bg-secondary rounded overflow-hidden">
              {validImageSrc ? (
                <Image
                  src={validImageSrc}
                  alt={item.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl text-primary-foreground/40 font-medium">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {item.isEssential && (
                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-utility-warning-500 rounded-bl rounded-tr">
                  <span className="sr-only">Essential</span>
                </div>
              )}
              {isExpiringSoon && item.expiryDate && (
                <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-utility-error-500 rounded-br rounded-tl">
                  <span className="sr-only">Expiring Soon</span>
                </div>
              )}
            </div>

            {/* Ingredient Name - Subtitle typography (text-sm font-medium text-tertiary) */}
            <h3 className="text-sm font-medium text-tertiary">
              {capitalizedName}
            </h3>
          </div>

          {/* Quantity and Category Tags Row - matches MetricsSimple structure */}
          <div className="flex items-end gap-4">
            {/* Quantity - Slightly smaller font */}
            <p className="flex-1 text-xs text-primary-foreground/60">
              {item.quantity || "As needed"}
            </p>

            {/* Category Tags - Instead of change indicator (where 100% was) */}
            {categoryTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {categoryTags.map((tag, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary border border-secondary whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions Dropdown - Top right (same position as MetricsSimple) */}
          <div className="absolute top-4 right-4 md:top-5 md:right-5">
            <Dropdown.Root>
              <Dropdown.DotsButton />
              <Dropdown.Popover className="w-min">
                <Dropdown.Menu onAction={(key) => {
                  if (key === "edit") {
                    setIsEditing(true);
                  } else if (key === "delete") {
                    onRemove(item.id);
                  }
                }}>
                  <Dropdown.Item id="edit" icon={Edit03} label="Edit" />
                  <Dropdown.Item id="delete" icon={Trash01} label="Delete" />
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
        </div>
      )}
    </div>
  );
}

