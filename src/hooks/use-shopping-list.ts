import { useState, useEffect, useCallback } from 'react';

export interface ShoppingListItem {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  quantity?: string;
}

const STORAGE_KEY = 'shoppingItems';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving shopping list:', error);
      }
    }
  }, [items, isMounted]);

  const addItem = useCallback((item: ShoppingListItem) => {
    setItems((prev) => {
      // Check if item already exists (by name)
      const exists = prev.some((i) => i.name.toLowerCase() === item.name.toLowerCase());
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, item];
    });
  }, []);

  const addItems = useCallback((newItems: ShoppingListItem[]) => {
    setItems((prev) => {
      const existingNames = new Set(prev.map((i) => i.name.toLowerCase()));
      const uniqueNewItems = newItems.filter(
        (item) => !existingNames.has(item.name.toLowerCase())
      );
      return [...prev, ...uniqueNewItems];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addItem,
    addItems,
    removeItem,
    clearList,
    isMounted,
  };
}

