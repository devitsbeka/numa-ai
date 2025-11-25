/**
 * Utility functions for parsing and normalizing ingredient quantities
 */

/**
 * Extracts quantity from ingredient name if present
 * Examples:
 * - "2 cups flour" -> "2 cups"
 * - "500g sugar" -> "500g"
 * - "1/2 tsp salt" -> "1/2 tsp"
 * - "flour" -> null (no quantity found)
 */
export function extractQuantityFromName(name: string): string | null {
  // Common quantity patterns
  const quantityPatterns = [
    // Fractions with units: "1/2 cup", "3/4 tsp"
    /^(\d+\/\d+|\d+\.\d+|\d+)\s*(cup|cups|tbsp|tsp|tablespoon|teaspoon|tablespoons|teaspoons|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|piece|pieces|pkg|package|packages|can|cans|bottle|bottles|jar|jars|box|boxes|bag|bags|container|containers)\b/i,
    // Numbers with units: "2 cups", "500g"
    /^(\d+)\s*(cup|cups|tbsp|tsp|tablespoon|teaspoon|tablespoons|teaspoons|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|piece|pieces|pkg|package|packages|can|cans|bottle|bottles|jar|jars|box|boxes|bag|bags|container|containers)\b/i,
    // Just numbers at start: "2 flour" -> "2"
    /^(\d+\/\d+|\d+\.\d+|\d+)\s+/,
  ];

  for (const pattern of quantityPatterns) {
    const match = name.match(pattern);
    if (match) {
      // Extract the full quantity string
      const fullMatch = match[0].trim();
      // Remove trailing spaces and get the rest of the name
      const remainingName = name.substring(match[0].length).trim();
      
      // Only return quantity if there's actual content after it (indicating it's a quantity, not just a number in the name)
      if (remainingName.length > 0) {
        return fullMatch;
      }
    }
  }

  return null;
}

/**
 * Normalizes quantity string to a standard format
 */
export function normalizeQuantity(quantity: string): string {
  return quantity.trim();
}

/**
 * Gets a default quantity for an ingredient if none is provided
 * Returns "As needed" for most items, or tries to extract from name
 */
export function getDefaultQuantity(name: string, existingQuantity?: string): string {
  // If quantity already exists, use it
  if (existingQuantity && existingQuantity.trim()) {
    return normalizeQuantity(existingQuantity);
  }

  // Try to extract quantity from name
  const extracted = extractQuantityFromName(name);
  if (extracted) {
    return extracted;
  }

  // Default fallback
  return "As needed";
}

/**
 * Removes quantity from ingredient name if present
 * Example: "2 cups flour" -> "flour"
 */
export function removeQuantityFromName(name: string): string {
  const quantity = extractQuantityFromName(name);
  if (quantity) {
    return name.substring(quantity.length).trim();
  }
  return name;
}

