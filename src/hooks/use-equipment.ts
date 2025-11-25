"use client";

import { useState, useEffect, useCallback } from "react";
import type { Equipment } from "@/types/equipment";

const STORAGE_KEY = "kitchenEquipment";

/**
 * Hook to manage user's equipment unlock state
 * Equipment can be unlocked/locked by user clicking on it
 */
export function useEquipment() {
  const [unlockedEquipment, setUnlockedEquipment] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setUnlockedEquipment(new Set(parsed));
      }
    } catch (error) {
      console.error("Error loading equipment state:", error);
    }
  }, []);

  // Save to localStorage whenever unlockedEquipment changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlockedEquipment]));
    } catch (error) {
      console.error("Error saving equipment state:", error);
    }
  }, [unlockedEquipment]);

  const toggleEquipment = useCallback((equipmentId: string) => {
    setUnlockedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(equipmentId)) {
        next.delete(equipmentId);
      } else {
        next.add(equipmentId);
      }
      return next;
    });
  }, []);

  const isUnlocked = useCallback(
    (equipmentId: string) => {
      return unlockedEquipment.has(equipmentId);
    },
    [unlockedEquipment]
  );

  const getEquipmentStatus = useCallback(
    (equipment: Equipment): Equipment["status"] => {
      // If user has manually unlocked it, it's unlocked
      if (unlockedEquipment.has(equipment.id)) {
        return "unlocked";
      }
      // Otherwise use the default status from data
      return equipment.status;
    },
    [unlockedEquipment]
  );

  return {
    toggleEquipment,
    isUnlocked,
    getEquipmentStatus,
    unlockedCount: unlockedEquipment.size,
  };
}


