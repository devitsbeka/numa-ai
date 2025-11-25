/**
 * Equipment types for the My Equipment tab
 * Represents kitchen equipment that can be unlocked and used in recipes
 */

export type EquipmentCategory = 
  | "Knives & Cutting"
  | "Cooking Appliances"
  | "Preparation Tools"
  | "Baking Equipment"
  | "Specialty Tools"
  | "Storage & Organization";

export type EquipmentStatus = "locked" | "unlocked";

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  icon?: string; // Optional icon identifier or emoji
  status: EquipmentStatus;
  unlockRequirement?: string; // Description of how to unlock (e.g., "Complete 10 recipes")
  capabilities?: string[]; // What recipes/techniques this enables
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary"; // Gamification element
}


