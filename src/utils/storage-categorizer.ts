/**
 * Categorize ingredients by storage area (Fridge, Freezer, Pantry)
 */

export type StorageArea = 'fridge' | 'freezer' | 'pantry';

export type IngredientCategory = 
  | 'produce' 
  | 'dairy' 
  | 'meat' 
  | 'seafood' 
  | 'frozen' 
  | 'pantry' 
  | 'beverages' 
  | 'condiments' 
  | 'spices' 
  | 'other';

// Storage area mappings based on ingredient keywords
const STORAGE_KEYWORDS: Record<StorageArea, string[]> = {
  fridge: [
    'milk', 'cheese', 'yogurt', 'cream', 'butter', 'eggs', 'egg',
    'lettuce', 'spinach', 'kale', 'arugula', 'greens', 'salad',
    'tomato', 'cucumber', 'bell pepper', 'pepper', 'carrot', 'celery',
    'broccoli', 'cauliflower', 'cabbage', 'mushroom', 'zucchini',
    'onion', 'garlic', 'ginger', 'herbs', 'parsley', 'cilantro', 'basil',
    'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'cherry',
    'apple', 'pear', 'orange', 'lemon', 'lime', 'avocado',
    'chicken', 'beef', 'pork', 'turkey', 'meat', 'fish', 'salmon', 'tuna',
    'shrimp', 'seafood', 'bacon', 'sausage', 'ham',
    'mayonnaise', 'mustard', 'ketchup', 'sauce', 'dressing',
  ],
  freezer: [
    'frozen', 'ice', 'ice cream', 'frozen vegetables', 'frozen fruit',
    'frozen meat', 'frozen fish', 'frozen chicken', 'frozen berries',
  ],
  pantry: [
    'flour', 'sugar', 'salt', 'pepper', 'spice', 'herbs', 'dried',
    'rice', 'pasta', 'noodle', 'quinoa', 'lentil', 'bean', 'chickpea',
    'canned', 'can', 'jar', 'olive oil', 'oil', 'vinegar', 'soy sauce',
    'stock', 'broth', 'honey', 'syrup', 'extract', 'vanilla',
    'baking powder', 'baking soda', 'yeast', 'cocoa', 'chocolate',
    'nuts', 'almond', 'walnut', 'peanut', 'cashew',
    'bread', 'cracker', 'cereal', 'oat', 'granola',
  ],
};

// Category mappings
const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  produce: [
    'lettuce', 'spinach', 'kale', 'arugula', 'greens', 'salad',
    'tomato', 'cucumber', 'bell pepper', 'pepper', 'carrot', 'celery',
    'broccoli', 'cauliflower', 'cabbage', 'mushroom', 'zucchini',
    'onion', 'garlic', 'ginger', 'herbs', 'parsley', 'cilantro', 'basil',
    'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'cherry',
    'apple', 'pear', 'orange', 'lemon', 'lime', 'avocado', 'banana',
  ],
  dairy: [
    'milk', 'cheese', 'yogurt', 'cream', 'butter', 'sour cream',
    'cottage cheese', 'mozzarella', 'cheddar', 'parmesan',
  ],
  meat: [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'duck', 'meat',
    'steak', 'ground', 'bacon', 'sausage', 'ham', 'prosciutto',
  ],
  seafood: [
    'fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'seafood',
    'scallop', 'lobster', 'crab', 'mussel', 'oyster',
  ],
  frozen: [
    'frozen', 'ice', 'ice cream', 'frozen vegetables', 'frozen fruit',
  ],
  pantry: [
    'flour', 'sugar', 'salt', 'rice', 'pasta', 'noodle', 'quinoa',
    'lentil', 'bean', 'chickpea', 'canned', 'can', 'jar',
  ],
  beverages: [
    'juice', 'soda', 'water', 'coffee', 'tea', 'wine', 'beer',
  ],
  condiments: [
    'mayonnaise', 'mustard', 'ketchup', 'sauce', 'dressing',
    'olive oil', 'oil', 'vinegar', 'soy sauce',
  ],
  spices: [
    'pepper', 'spice', 'herbs', 'dried', 'cinnamon', 'paprika',
    'cumin', 'oregano', 'thyme', 'rosemary', 'basil',
  ],
  other: [],
};

/**
 * Determine storage area for an ingredient using AI
 * Falls back to keyword-based categorization if API fails
 */
export async function getStorageArea(ingredientName: string): Promise<StorageArea> {
  try {
    const response = await fetch('/api/ingredients/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredientName }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.storageArea) {
        return data.storageArea;
      }
    }
  } catch (error) {
    console.error('Error fetching storage area from API:', error);
  }

  // Fallback to keyword-based categorization
  return getStorageAreaSync(ingredientName);
}

/**
 * Synchronous version for immediate categorization (fallback)
 */
export function getStorageAreaSync(ingredientName: string): StorageArea {
  const lowerName = ingredientName.toLowerCase();

  // Check freezer first (most specific)
  for (const keyword of STORAGE_KEYWORDS.freezer) {
    if (lowerName.includes(keyword)) {
      return 'freezer';
    }
  }

  // Check fridge
  for (const keyword of STORAGE_KEYWORDS.fridge) {
    if (lowerName.includes(keyword)) {
      return 'fridge';
    }
  }

  // Check pantry
  for (const keyword of STORAGE_KEYWORDS.pantry) {
    if (lowerName.includes(keyword)) {
      return 'pantry';
    }
  }

  // Default to pantry for unknown items
  return 'pantry';
}

/**
 * Determine category for an ingredient using AI
 * Falls back to keyword-based categorization if API fails
 */
export async function getIngredientCategory(ingredientName: string): Promise<IngredientCategory> {
  try {
    const response = await fetch('/api/ingredients/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredientName }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.category) {
        return data.category as IngredientCategory;
      }
    }
  } catch (error) {
    console.error('Error fetching category from API:', error);
  }

  // Fallback to keyword-based categorization
  return getIngredientCategorySync(ingredientName);
}

/**
 * Synchronous version for immediate categorization (fallback)
 */
export function getIngredientCategorySync(ingredientName: string): IngredientCategory {
  const lowerName = ingredientName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return 'other';
}

/**
 * Get display info for storage area
 */
export function getStorageAreaInfo(area: StorageArea): { name: string; icon: string } {
  const info = {
    fridge: { name: 'Refrigerator', icon: '🧊' },
    freezer: { name: 'Freezer', icon: '❄️' },
    pantry: { name: 'Pantry', icon: '🥫' },
  };
  return info[area];
}

/**
 * Get display info for category
 */
export function getCategoryInfo(category: IngredientCategory): { name: string; icon: string } {
  const info: Record<IngredientCategory, { name: string; icon: string }> = {
    produce: { name: 'Produce', icon: '🥬' },
    dairy: { name: 'Dairy', icon: '🥛' },
    meat: { name: 'Meat', icon: '🥩' },
    seafood: { name: 'Seafood', icon: '🐟' },
    frozen: { name: 'Frozen', icon: '🧊' },
    pantry: { name: 'Pantry', icon: '🥫' },
    beverages: { name: 'Beverages', icon: '🥤' },
    condiments: { name: 'Condiments', icon: '🧂' },
    spices: { name: 'Spices', icon: '🌶️' },
    other: { name: 'Other', icon: '📦' },
  };
  return info[category];
}

