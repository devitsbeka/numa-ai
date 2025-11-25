/**
 * Converts a string to title case
 * Handles common exceptions and special cases
 */
export function toTitleCase(str: string): string {
  if (!str) return str;

  // Common words that should remain lowercase (unless first word)
  const lowercaseWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in',
    'into', 'nor', 'of', 'on', 'or', 'the', 'to', 'with', 'via',
  ]);

  // Words that should always be uppercase
  const uppercaseWords = new Set(['id', 'api', 'ui', 'ux']);

  return str
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      
      // Always uppercase first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      
      // Always uppercase special words
      if (uppercaseWords.has(lower)) {
        return word.toUpperCase();
      }
      
      // Keep lowercase words lowercase (unless they're the first word)
      if (lowercaseWords.has(lower)) {
        return lower;
      }
      
      // Title case everything else
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

