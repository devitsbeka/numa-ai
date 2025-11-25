import { useState, useEffect, useCallback } from 'react';
import { getIngredientCategory, getStorageArea } from '@/utils/storage-categorizer';
import type { StorageArea, IngredientCategory } from '@/utils/storage-categorizer';
import { getDefaultQuantity, removeQuantityFromName } from '@/utils/quantity-parser';
import { fetchIngredientImage } from '@/utils/ingredient-image-fetcher';
import { get3DIconForIngredient } from '@/utils/ingredient-icon-map';

export interface KitchenItem {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  quantity?: string;
  isEssential?: boolean;
  addedAt: number; // timestamp
  category?: IngredientCategory;
  storageArea?: StorageArea;
  expiryDate?: string; // ISO date string
}

const STORAGE_KEY = 'kitchenIngredients';

export function useKitchen() {
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle both old format (array of strings) and new format (array of objects)
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            // Migrate old format to new format
            const migrated = parsed.map((name: string) => {
              const cleanName = removeQuantityFromName(name);
              const quantity = getDefaultQuantity(name);
              return {
                id: `kitchen-${Date.now()}-${Math.random()}`,
                name: cleanName,
                quantity,
                image: get3DIconForIngredient(cleanName),
                addedAt: Date.now(),
              };
            });
            setItems(migrated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          } else {
            // Ensure all existing items have quantities and images
            const migrated = parsed.map((item: KitchenItem) => ({
              ...item,
              quantity: getDefaultQuantity(item.name, item.quantity),
              image: get3DIconForIngredient(item.name) ?? item.image,
            }));
            setItems(migrated);
            
            // Fetch images for items that don't have them (async, don't block)
            const itemsWithoutImages = migrated.filter((item: KitchenItem) => !item.image);
            if (itemsWithoutImages.length > 0) {
              // Fetch images in background and update items
              Promise.all(
                itemsWithoutImages.map(async (item: KitchenItem) => {
                  try {
                    const image = await fetchIngredientImage(item.name);
                    if (image) {
                      // Update item in state
                      setItems((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, image } : i))
                      );
                    }
                  } catch (error) {
                    console.error(`Error fetching image for ${item.name}:`, error);
                  }
                })
              ).catch(() => {
                // Ignore errors in background fetch
              });
            }
            
            // Only update localStorage if we made changes
            const hasChanges = migrated.some((item: KitchenItem, index: number) => 
              item.quantity !== (parsed[index] as KitchenItem)?.quantity
            );
            if (hasChanges) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading kitchen items:', error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving kitchen items:', error);
      }
    }
  }, [items, isMounted]);

  const addItem = useCallback(async (item: Omit<KitchenItem, 'id' | 'addedAt'>) => {
    // Check if item already exists
    const exists = items.some((i) => i.name.toLowerCase() === item.name.toLowerCase());
    if (exists) {
      return; // Don't add duplicates
    }

    // Extract quantity from name if present, and clean the name
    const cleanName = removeQuantityFromName(item.name);
    const extractedQuantity = getDefaultQuantity(item.name, item.quantity);

    // Always use LLM to determine category and storage for new items
    // Only use provided values if explicitly set (for manual overrides)
    let category = item.category;
    let storageArea = item.storageArea;
    let image = get3DIconForIngredient(cleanName) ?? item.image; // Prefer 3D icon

    try {
      const { getIngredientCategory, getStorageArea } = await import('@/utils/storage-categorizer');
      // Always call LLM for new items, unless explicitly provided
      // Use clean name (without quantity) for categorization
      if (!category) {
        category = await getIngredientCategory(cleanName);
      }
      if (!storageArea) {
        storageArea = await getStorageArea(cleanName);
      }
    } catch (error) {
      console.error('Error determining category/storage:', error);
      // Fallback to sync versions
      const { getIngredientCategorySync, getStorageAreaSync } = await import('@/utils/storage-categorizer');
      category = category || getIngredientCategorySync(cleanName);
      storageArea = storageArea || getStorageAreaSync(cleanName);
    }

    // Fetch image if not provided
    if (!image) {
      try {
        image = await fetchIngredientImage(cleanName);
      } catch (error) {
        console.error(`Error fetching image for ${cleanName}:`, error);
        // Continue without image
      }
    }

    setItems((prev) => [
      ...prev,
      {
        ...item,
        name: cleanName, // Use cleaned name
        quantity: extractedQuantity, // Always ensure quantity is set
        category,
        storageArea,
        image, // Include fetched or provided image
        id: `kitchen-${Date.now()}-${Math.random()}`,
        addedAt: Date.now(),
      },
    ]);
  }, [items]);

  const addItems = useCallback(async (newItems: Omit<KitchenItem, 'id' | 'addedAt'>[]) => {
    const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
    const uniqueNewItems = newItems.filter((item) => !existingNames.has(item.name.toLowerCase()));

    // Process items with AI categorization
    const processedItems = await Promise.all(
      uniqueNewItems.map(async (item) => {
        // Extract quantity from name if present, and clean the name
        const cleanName = removeQuantityFromName(item.name);
        const extractedQuantity = getDefaultQuantity(item.name, item.quantity);

        let category = item.category;
        let storageArea = item.storageArea;
        let image = get3DIconForIngredient(cleanName) ?? item.image; // Prefer 3D icon

        // Always use LLM to determine category and storage for new items
        // Only use provided values if explicitly set (for manual overrides)
        try {
          const { getIngredientCategory, getStorageArea } = await import('@/utils/storage-categorizer');
          // Always call LLM for new items, unless explicitly provided
          // Use clean name (without quantity) for categorization
          if (!category) {
            category = await getIngredientCategory(cleanName);
          }
          if (!storageArea) {
            storageArea = await getStorageArea(cleanName);
          }
        } catch (error) {
          console.error('Error determining category/storage:', error);
          // Fallback to sync versions
          const { getIngredientCategorySync, getStorageAreaSync } = await import('@/utils/storage-categorizer');
          category = category || getIngredientCategorySync(cleanName);
          storageArea = storageArea || getStorageAreaSync(cleanName);
        }

        // Fetch image if not provided
        if (!image) {
          try {
            image = await fetchIngredientImage(cleanName);
          } catch (error) {
            console.error(`Error fetching image for ${cleanName}:`, error);
            // Continue without image
          }
        }

        return {
          ...item,
          name: cleanName, // Use cleaned name
          quantity: extractedQuantity, // Always ensure quantity is set
          category,
          storageArea,
          image, // Include fetched or provided image
          id: `kitchen-${Date.now()}-${Math.random()}`,
          addedAt: Date.now(),
        };
      })
    );

    setItems((prev) => [...prev, ...processedItems]);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<KitchenItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  const getItemNames = useCallback(() => {
    return items.map((item) => item.name);
  }, [items]);

  const hasItem = useCallback((name: string) => {
    return items.some((item) => item.name.toLowerCase() === name.toLowerCase());
  }, [items]);

  return {
    items,
    addItem,
    addItems,
    removeItem,
    updateItem,
    clearList,
    getItemNames,
    hasItem,
    isMounted,
  };
}

