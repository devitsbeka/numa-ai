import type { IngredientCategoryType } from '@/types/cooking-mode';

/**
 * Categorize ingredients based on their type and preparation needs
 */

// Ingredient keyword mappings for smart categorization
const CATEGORY_KEYWORDS = {
  'needs-prep': [
    'onion', 'garlic', 'shallot', 'ginger', 'celery', 'carrot', 'pepper', 'bell pepper',
    'jalapeño', 'chili', 'tomato', 'potato', 'sweet potato', 'zucchini', 'eggplant',
    'cucumber', 'mushroom', 'broccoli', 'cauliflower', 'cabbage', 'herbs', 'parsley',
    'cilantro', 'basil', 'thyme', 'rosemary', 'scallion', 'leek', 'fennel', 'radish',
  ],
  'needs-cooking': [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'meat', 'steak', 'ground',
    'fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'seafood', 'scallop', 'lobster',
    'egg', 'bacon', 'sausage', 'ham', 'pasta', 'noodle', 'rice', 'quinoa', 'lentil',
    'bean', 'chickpea',
  ],
  'needs-thawing': [
    'frozen', 'freeze', 'ice',
  ],
  'needs-washing': [
    'lettuce', 'spinach', 'kale', 'arugula', 'greens', 'salad', 'chard', 'watercress',
    'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'cherry', 'apple', 'pear',
  ],
  'ready-to-use': [
    'oil', 'olive oil', 'butter', 'flour', 'sugar', 'salt', 'pepper', 'spice', 'sauce',
    'vinegar', 'soy sauce', 'stock', 'broth', 'cream', 'milk', 'cheese', 'yogurt',
    'honey', 'syrup', 'extract', 'vanilla', 'baking powder', 'baking soda', 'yeast',
    'canned', 'can', 'jar', 'dried', 'powder', 'paste', 'puree',
  ],
};

const CATEGORY_LABELS = {
  'needs-prep': { name: 'Needs Prep', icon: '🔪' },
  'needs-cooking': { name: 'Needs Cooking', icon: '🔥' },
  'needs-thawing': { name: 'Needs Thawing', icon: '🧊' },
  'ready-to-use': { name: 'Ready to Use', icon: '✓' },
  'needs-washing': { name: 'Needs Washing', icon: '💧' },
};

/**
 * Categorize a single ingredient based on its name
 */
export function categorizeIngredient(ingredientName: string): IngredientCategoryType {
  const lowerName = ingredientName.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as IngredientCategoryType;
      }
    }
  }

  // Default to ready-to-use if no match found
  return 'ready-to-use';
}

/**
 * Get display information for a category
 */
export function getCategoryInfo(category: IngredientCategoryType): { name: string; icon: string } {
  return CATEGORY_LABELS[category];
}

/**
 * Get all category types in preferred display order
 */
export function getCategoryOrder(): IngredientCategoryType[] {
  return ['needs-prep', 'needs-cooking', 'needs-thawing', 'needs-washing', 'ready-to-use'];
}

