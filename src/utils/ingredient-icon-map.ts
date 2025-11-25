/**
 * Ingredient Icon Map with Tag-Based Intelligent Matching
 * 
 * Fast, robust ingredient-to-icon matching using:
 * 1. Category filtering (Food & Drink only)
 * 2. Tag-based identification (ingredient, food, spice, etc.)
 * 3. Multi-level matching (exact, partial, tag-based)
 * 4. False positive prevention
 * 
 * All matching happens synchronously in milliseconds.
 */

import meta from "../../public/meta.json";
import { removeQuantityFromName } from "@/utils/quantity-parser";

type MetaItem = {
  title: string;
  file_name: string;
  slug: string;
  category?: string;
  tags?: string[];
  volume?: number;
};

const ICON_BASE_PATH = "/3d/";
const FOOD_CATEGORY = "Food & Drink";

// Tags that indicate an item is a food ingredient
const INGREDIENT_TAGS = new Set([
  "ingredient",
  "food",
  "spice",
  "herb",
  "fruit",
  "vegetable",
  "meat",
  "seafood",
  "dairy",
  "grain",
  "nut",
  "seed",
  "legume",
  "beverage",
  "condiment",
  "sauce",
  "oil",
  "flour",
  "sugar",
  "salt",
]);

// Tags that indicate an item is NOT an ingredient (appliances, tools, etc.)
const NON_INGREDIENT_TAGS = new Set([
  "appliance",
  "tool",
  "equipment",
  "utensil",
  "container",
  "furniture",
  "decoration",
  "art",
  "symbol",
]);

// Stop words to filter out from ingredient names
const STOP_WORDS = new Set([
  "fresh",
  "organic",
  "large",
  "small",
  "medium",
  "extra",
  "extra-large",
  "extra-small",
  "chopped",
  "sliced",
  "diced",
  "ground",
  "boneless",
  "skinless",
  "with",
  "and",
  "the",
  "of",
  "a",
  "an",
  "in",
  "pieces",
  "leaves",
  "leaf",
  "whole",
  "shredded",
  "minced",
  "fillet",
  "fillets",
  "breast",
  "breasts",
  "strips",
  "sticks",
  "halves",
  "raw",
  "cooked",
  "frozen",
  "dried",
]);

// False positive patterns - items that contain ingredient names but aren't the ingredient
const FALSE_POSITIVE_PATTERNS = [
  { pattern: /^pine/, exclude: ["pine", "pineapple"] }, // "pineapple" vs "apple"
  { pattern: /bread$/, exclude: ["bread", "gingerbread"] }, // "gingerbread" vs "ginger"
  { pattern: /dance$/, exclude: [] }, // "chicken-dance" vs "chicken"
  { pattern: /coop$/, exclude: [] }, // "chicken-coop" vs "chicken"
  { pattern: /house$/, exclude: ["house"] }, // "gingerbread-house" vs "ginger"
  { pattern: /man$/, exclude: ["man", "gingerbread-man"] }, // "gingerbread-man" vs "ginger"
  { pattern: /cake$/, exclude: ["cake"] }, // "pancake" vs "pan"
  { pattern: /soup$/, exclude: ["soup"] }, // "chicken-soup" vs "chicken"
  { pattern: /mint$/, exclude: ["mint", "peppermint"] }, // "peppermint" vs "pepper"
  { pattern: /roll$/, exclude: ["roll"] }, // "cinnamon-roll" vs "cinnamon"
  { pattern: /pizza$/, exclude: ["pizza"] }, // "pepperoni-pizza" vs "pepperoni"
  { pattern: /donut$/, exclude: ["donut"] }, // "cinnamon-donut" vs "cinnamon"
  { pattern: /skillet$/, exclude: ["skillet"] }, // "cinnamon-roll-skillet" vs "cinnamon"
  { pattern: /oil$/, exclude: ["oil"] }, // "peppermint-oil" vs "pepper" or "peppermint"
  { pattern: /cheese$/, exclude: ["cheese"] }, // "pepper-jack-cheese" vs "pepper"
  { pattern: /spray$/, exclude: ["spray"] }, // "pepper-spray" vs "pepper"
  { pattern: /can$/, exclude: ["can"] }, // "dr-pepper-can" vs "pepper"
];

// Words that indicate a product/recipe containing the ingredient, not the ingredient itself
const PRODUCT_INDICATORS = new Set([
  "roll", "cake", "bread", "pie", "cookie", "muffin", "donut", "pizza", "soup", "stew",
  "skillet", "casserole", "salad", "sauce", "dressing", "marinade", "rub", "spice-blend",
  "oil", "extract", "syrup", "butter", "cheese", "spray", "can", "bottle", "jar",
  "powder", "paste", "puree", "juice", "drink", "beverage", "tea", "coffee"
]);

// Pre-built indexes for fast lookups
const iconMap = new Map<string, MetaItem>(); // slug -> MetaItem
const titleMap = new Map<string, MetaItem>(); // normalized title -> MetaItem
const tagIndex = new Map<string, MetaItem[]>(); // tag -> MetaItem[]
const foodItems: MetaItem[] = []; // All food items

// Initialize indexes
function initializeIndexes() {
  const items = meta.items as MetaItem[];
  
  for (const item of items) {
    // Only process Food & Drink category items
    if (item.category !== FOOD_CATEGORY) continue;
    
    // Check if item has ingredient-related tags
    const hasIngredientTag = item.tags?.some(tag => INGREDIENT_TAGS.has(tag.toLowerCase()));
    const hasNonIngredientTag = item.tags?.some(tag => NON_INGREDIENT_TAGS.has(tag.toLowerCase()));
    
    // Skip if it's clearly not an ingredient (has non-ingredient tags and no ingredient tags)
    if (hasNonIngredientTag && !hasIngredientTag) continue;
    
    // Add to food items
    foodItems.push(item);
    
    // Index by slug
    const normalizedSlug = normalizeForLookup(item.slug);
    if (normalizedSlug) {
      iconMap.set(normalizedSlug, item);
    }
    
    // Index by title
    const normalizedTitle = normalizeForLookup(item.title);
    if (normalizedTitle) {
      titleMap.set(normalizedTitle, item);
    }
    
    // Index by tags
    if (item.tags) {
      for (const tag of item.tags) {
        const normalizedTag = tag.toLowerCase();
        if (!tagIndex.has(normalizedTag)) {
          tagIndex.set(normalizedTag, []);
        }
        tagIndex.get(normalizedTag)!.push(item);
      }
    }
  }
}

// Initialize on module load
initializeIndexes();

function normalizeForLookup(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part && !STOP_WORDS.has(part))
    .join(" ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateLookupKeys(name: string): string[] {
  const cleaned = removeQuantityFromName(name);
  const base = normalizeForLookup(cleaned);
  const keys = new Set<string>();

  if (base) {
    keys.add(base);
    // Remove trailing descriptors
    keys.add(base.replace(/-(leaves|leaf|pieces|strips|sticks|halves|whole|root|seeds|seed|powder|fresh|dried)$/, ""));
    // Singular form
    if (base.endsWith("es")) {
      keys.add(base.slice(0, -2));
    } else if (base.endsWith("s")) {
      keys.add(base.slice(0, -1));
    }
    // Remove hyphens for broader match
    keys.add(base.replace(/-/g, ""));
  }

  return Array.from(keys).filter(Boolean);
}

/**
 * Check if a word appears as a complete word (not substring) in text
 * Uses word boundaries to prevent "pepper" matching "peppermint"
 * 
 * Examples:
 * - "pepper" in "black-pepper" → true (complete word)
 * - "pepper" in "peppermint" → false (substring, not complete word)
 * - "cinnamon" in "cinnamon-roll" → true (complete word before hyphen)
 */
function isCompleteWord(word: string, text: string): boolean {
  // Escape special regex characters
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Check for word boundaries: start of string, hyphen, space, or end of string
  // This prevents "pepper" from matching "peppermint"
  const wordBoundaryRegex = new RegExp(`(^|[-\\s])${escapedWord}([-\\s]|$)`, 'i');
  
  // Also check if the word is at the start and followed by another word
  // e.g., "cinnamon" at start of "cinnamon-roll"
  const startWordRegex = new RegExp(`^${escapedWord}([-\\s]|$)`, 'i');
  
  // Or at the end preceded by a boundary
  // e.g., "pepper" at end of "black-pepper"
  const endWordRegex = new RegExp(`([-\\s]|^)${escapedWord}$`, 'i');
  
  return wordBoundaryRegex.test(text) || startWordRegex.test(text) || endWordRegex.test(text);
}

/**
 * Check if an item is a product containing the ingredient vs the ingredient itself
 */
function isProductContainingIngredient(ingredientName: string, item: MetaItem): boolean {
  const normalizedIngredient = normalizeForLookup(ingredientName);
  const normalizedTitle = normalizeForLookup(item.title);
  const normalizedSlug = normalizeForLookup(item.slug);
  const fullText = `${normalizedTitle} ${normalizedSlug}`;
  
  const ingredientWords = normalizedIngredient.split(/[-\\s]+/).filter(Boolean);
  const itemWords = fullText.split(/[-\\s]+/).filter(Boolean);
  
  // For simple ingredient names (1-2 words), be very strict
  if (ingredientWords.length <= 2) {
    // Check if the item has product indicators
    const hasProductIndicator = itemWords.some(word => PRODUCT_INDICATORS.has(word));
    
    if (hasProductIndicator) {
      // It's definitely a product, not the ingredient itself
      return true;
    }
    
    // If item has significantly more words than ingredient, it's likely a compound product
    // e.g., "cinnamon" (1 word) vs "cinnamon-roll" (2 words) - reject if it's a product
    if (itemWords.length > ingredientWords.length + 1) {
      // Check if extra words are product-related
      const extraWords = itemWords.slice(ingredientWords.length);
      const hasProductWords = extraWords.some(word => PRODUCT_INDICATORS.has(word));
      if (hasProductWords) {
        return true;
      }
    }
    
    // Special case: if ingredient is a single word and item has that word + another word
    // and the other word is not a valid descriptor (like "black", "green", "root"), reject
    if (ingredientWords.length === 1 && itemWords.length === 2) {
      const otherWord = itemWords.find(w => w !== ingredientWords[0]);
      if (otherWord && PRODUCT_INDICATORS.has(otherWord)) {
        return true; // e.g., "cinnamon" + "roll" = product
      }
    }
  }
  
  return false;
}

/**
 * Check if an icon item is a valid match for an ingredient
 */
function isValidIngredientMatch(ingredientName: string, item: MetaItem): boolean {
  const normalizedIngredient = normalizeForLookup(ingredientName);
  const normalizedTitle = normalizeForLookup(item.title);
  const normalizedSlug = normalizeForLookup(item.slug);
  
  // Extract base ingredient name (remove descriptors)
  const baseIngredient = normalizedIngredient
    .split("-")
    .filter(word => !STOP_WORDS.has(word))
    .join("-");
  
  const baseWords = baseIngredient.split(/[-\\s]+/).filter(Boolean);
  
  // Reject if it's a product containing the ingredient (e.g., "cinnamon-roll" for "cinnamon")
  if (isProductContainingIngredient(ingredientName, item)) {
    return false;
  }
  
  // For simple ingredient names (1 word), be extra strict
  const ingredientWords = baseWords;
  if (ingredientWords.length === 1) {
    const itemWords = [...normalizedTitle.split(/[-\\s]+/), ...normalizedSlug.split(/[-\\s]+/)].filter(Boolean);
    
    // If item has more than 2 words total, it's likely a compound product - reject
    if (itemWords.length > 2) {
      // Unless it's a valid descriptor like "black-pepper" or "ginger-root"
      const validDescriptors = new Set(["black", "white", "green", "red", "yellow", "root", "leaves", "seed", "powder", "fresh", "dried"]);
      const extraWords = itemWords.slice(1);
      const hasOnlyValidDescriptors = extraWords.every(word => validDescriptors.has(word));
      
      if (!hasOnlyValidDescriptors) {
        return false; // Has non-descriptor words, likely a product
      }
    }
    
    // If item has exactly 2 words and the second is a product indicator, reject
    if (itemWords.length === 2) {
      const secondWord = itemWords[1];
      if (PRODUCT_INDICATORS.has(secondWord)) {
        return false; // e.g., "cinnamon-roll"
      }
    }
  }
  
  // Check false positive patterns
  const fullText = [normalizedTitle, normalizedSlug].join(" ");
  for (const { pattern, exclude } of FALSE_POSITIVE_PATTERNS) {
    if (pattern.test(fullText)) {
      // If the ingredient name itself matches the exclude list, it's OK
      if (exclude.some(ex => normalizedIngredient.includes(ex) || fullText.includes(ex))) {
        continue;
      }
      // Otherwise, it's a false positive
      if (!baseWords.some(word => fullText.includes(word))) {
        return false;
      }
    }
  }
  
  // For simple ingredient names (1-2 words), require complete word matches
  // This prevents "pepper" from matching "peppermint"
  if (baseWords.length <= 2) {
    // All base words must appear as complete words (not substrings)
    const allWordsAreComplete = baseWords.every(word => 
      isCompleteWord(word, normalizedTitle) || isCompleteWord(word, normalizedSlug)
    );
    
    if (!allWordsAreComplete) {
      return false;
    }
  } else {
    // For longer names, check if all words appear
    const allWordsMatch = baseWords.every(word => 
      normalizedTitle.includes(word) || normalizedSlug.includes(word)
    );
    
    if (!allWordsMatch) {
      return false;
    }
  }
  
  // Check tags - prefer items with ingredient-related tags
  const hasIngredientTag = item.tags?.some(tag => INGREDIENT_TAGS.has(tag.toLowerCase()));
  const hasNonIngredientTag = item.tags?.some(tag => NON_INGREDIENT_TAGS.has(tag.toLowerCase()));
  
  // If it has non-ingredient tags and no ingredient tags, reject
  if (hasNonIngredientTag && !hasIngredientTag) {
    return false;
  }
  
  return true;
}

/**
 * Score a match based on how well it matches
 * Higher scores = better matches
 */
function scoreMatch(ingredientName: string, item: MetaItem): number {
  let score = 0;
  const normalizedIngredient = normalizeForLookup(ingredientName);
  const normalizedTitle = normalizeForLookup(item.title);
  const normalizedSlug = normalizeForLookup(item.slug);
  
  const ingredientWords = normalizedIngredient.split(/[-\\s]+/).filter(Boolean);
  const itemWords = [...normalizedTitle.split(/[-\\s]+/), ...normalizedSlug.split(/[-\\s]+/)].filter(Boolean);
  
  // Exact match gets highest score
  if (normalizedSlug === normalizedIngredient || normalizedTitle === normalizedIngredient) {
    score += 1000;
  }
  
  // Title or slug starts with ingredient name (e.g., "black-pepper" for "pepper")
  else if (normalizedTitle.startsWith(normalizedIngredient + "-") || normalizedSlug.startsWith(normalizedIngredient + "-")) {
    score += 800;
  }
  
  // Ingredient name starts with title/slug (e.g., "ginger root" matches "ginger")
  else if (normalizedIngredient.startsWith(normalizedTitle) || normalizedIngredient.startsWith(normalizedSlug)) {
    score += 700;
  }
  
  // Prefer simple matches over compound words
  // Penalize if item has more words than ingredient (indicates it's a compound product)
  const itemWordCount = itemWords.length;
  const ingredientWordCount = ingredientWords.length;
  
  if (itemWordCount === ingredientWordCount) {
    // Same number of words - good match
    score += 500;
  } else if (itemWordCount === ingredientWordCount + 1) {
    // One extra word (like "black-pepper" for "pepper") - acceptable
    score += 300;
  } else if (itemWordCount > ingredientWordCount + 1) {
    // Multiple extra words - likely a product, heavily penalize
    score -= 200;
  }
  
  // Check for complete word matches (not substring matches)
  const allWordsComplete = ingredientWords.every(word => 
    isCompleteWord(word, normalizedTitle) || isCompleteWord(word, normalizedSlug)
  );
  
  if (allWordsComplete) {
    score += 400;
  } else {
    // Substring match - penalize
    score -= 100;
  }
  
  // Tag-based scoring
  const hasIngredientTag = item.tags?.some(tag => INGREDIENT_TAGS.has(tag.toLowerCase()));
  if (hasIngredientTag) {
    score += 50;
  }
  
  // Prefer items with "ingredient" tag specifically
  if (item.tags?.includes("ingredient")) {
    score += 30;
  }
  
  // Prefer items with "spice" tag for spices
  if (item.tags?.includes("spice") && (normalizedIngredient.includes("pepper") || normalizedIngredient.includes("cinnamon"))) {
    score += 20;
  }
  
  // Heavy penalty for product indicators
  const hasProductIndicator = itemWords.some(word => PRODUCT_INDICATORS.has(word));
  if (hasProductIndicator && ingredientWordCount <= 2) {
    score -= 500; // Strong penalty for products when looking for simple ingredients
  }
  
  return score;
}

/**
 * Get the best matching icon for an ingredient using tag-based intelligent matching
 */
export function get3DIconForIngredient(name?: string): string | undefined {
  if (!name) return undefined;
  
  const lookupKeys = generateLookupKeys(name);
  const normalizedName = normalizeForLookup(name);
  
  // 1. Try exact matches first (fastest)
  for (const key of lookupKeys) {
    const match = iconMap.get(key);
    if (match && isValidIngredientMatch(name, match)) {
      return `${ICON_BASE_PATH}${match.file_name}`;
    }
  }
  
  // 2. Try title matches
  for (const key of lookupKeys) {
    const match = titleMap.get(key);
    if (match && isValidIngredientMatch(name, match)) {
      return `${ICON_BASE_PATH}${match.file_name}`;
    }
  }
  
  // 3. Try partial matches with suffix variations
  if (normalizedName) {
    const commonSuffixes = ["-root", "-leaves", "-leaf", "-seeds", "-seed", "-powder", "-fresh", "-dried", "-whole", "-sliced", "-chopped"];
    for (const suffix of commonSuffixes) {
      const withSuffix = normalizedName + suffix;
      const match = iconMap.get(withSuffix) || titleMap.get(withSuffix);
      if (match && isValidIngredientMatch(name, match)) {
        return `${ICON_BASE_PATH}${match.file_name}`;
      }
    }
  }
  
  // 4. Search through all food items for partial matches
  const candidates: Array<{ item: MetaItem; score: number }> = [];
  
  for (const item of foodItems) {
    if (isValidIngredientMatch(name, item)) {
      const score = scoreMatch(name, item);
      // Only accept matches with positive scores (reject heavily penalized ones)
      if (score > 0) {
        candidates.push({ item, score });
      }
    }
  }
  
  // Sort by score and return best match
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    const bestMatch = candidates[0];
    
    // For simple ingredient names (1-2 words), require a minimum score threshold
    // This prevents matching "cinnamon" to "cinnamon-roll" when score is too low
    const ingredientWords = normalizedName.split(/[-\\s]+/).filter(Boolean);
    if (ingredientWords.length <= 2 && bestMatch.score < 200) {
      // Score too low - likely a poor match, reject it
      return undefined;
    }
    
    return `${ICON_BASE_PATH}${bestMatch.item.file_name}`;
  }
  
  return undefined;
}

/**
 * Synchronous version (alias for backwards compatibility)
 */
export function get3DIconForIngredientSync(name?: string): string | undefined {
  return get3DIconForIngredient(name);
}

/**
 * Get ingredient image source
 */
export function getIngredientImageSource(name: string, fallback?: string): string | undefined {
  return get3DIconForIngredient(name) ?? fallback;
}

/**
 * Async version (for backwards compatibility with hook)
 */
export async function getIngredientImageSourceAsync(name: string, fallback?: string): Promise<string | undefined> {
  return getIngredientImageSource(name, fallback);
}
