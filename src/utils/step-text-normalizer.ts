/**
 * Normalizes recipe step instructions to ensure consistent formatting and length
 * Removes marketing copy, cleans up text, and standardizes character length
 */

// Patterns to identify and remove marketing/promotional content
const MARKETING_PATTERNS = [
  /sign up to receive/i,
  /subscribe to/i,
  /follow us on/i,
  /check out our/i,
  /visit our/i,
  /don't wait/i,
  /exclusive bonus/i,
  /free.*ebook/i,
  /when on social media/i,
  /when blog/i,
  /email.*sign up/i,
];

// Patterns to remove common recipe website noise
const NOISE_PATTERNS = [
  /^step \d+[:.]?\s*/i, // Remove "Step 1:" prefixes
  /^\d+[:.]?\s*/, // Remove leading numbers with colons
  /^\(.*?\)\s*/, // Remove parenthetical notes at start
];

/**
 * Removes marketing and promotional content from step text
 */
function removeMarketingContent(text: string): string {
  let cleaned = text;
  
  // Check if entire step is marketing content
  for (const pattern of MARKETING_PATTERNS) {
    if (pattern.test(cleaned)) {
      return ""; // Return empty to filter out
    }
  }
  
  // Remove marketing phrases from within text
  for (const pattern of MARKETING_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }
  
  return cleaned;
}

/**
 * Cleans up step text formatting
 */
function cleanStepText(text: string): string {
  if (!text || text.trim().length === 0) {
    return "";
  }
  
  let cleaned = text.trim();
  
  // Remove leading step numbers and prefixes
  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ");
  
  // Remove trailing punctuation artifacts
  cleaned = cleaned.replace(/[.,;:]+$/, "");
  
  return cleaned;
}

/**
 * Normalizes step length to target range (140-180 characters)
 * Attempts to maintain sentence boundaries when possible
 */
function normalizeLength(text: string, targetMin: number = 140, targetMax: number = 180): string {
  if (text.length <= targetMax) {
    return text;
  }
  
  // Try to find a good breaking point at sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length > 0) {
    let result = "";
    for (const sentence of sentences) {
      const candidate = (result + sentence).trim();
      if (candidate.length <= targetMax) {
        result = candidate;
      } else {
        break;
      }
    }
    
    if (result.length >= targetMin) {
      return result;
    }
  }
  
  // Fallback: truncate at word boundary near target
  const truncated = text.substring(0, targetMax);
  const lastSpace = truncated.lastIndexOf(" ");
  const lastPeriod = truncated.lastIndexOf(".");
  const lastExclamation = truncated.lastIndexOf("!");
  const lastQuestion = truncated.lastIndexOf("?");
  
  const breakPoint = Math.max(lastSpace, lastPeriod, lastExclamation, lastQuestion);
  
  if (breakPoint > targetMin * 0.7) {
    return text.substring(0, breakPoint + 1).trim();
  }
  
  // Final fallback: truncate at space
  if (lastSpace > targetMin * 0.7) {
    return text.substring(0, lastSpace).trim() + "...";
  }
  
  return truncated.trim() + "...";
}

/**
 * Main normalization function
 * Processes an array of step instructions to ensure consistent formatting
 */
export function normalizeStepInstructions(steps: string[]): string[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    return steps;
  }
  
  const normalized: string[] = [];
  
  for (const step of steps) {
    // Remove marketing content
    let cleaned = removeMarketingContent(step);
    
    // Skip if step was entirely marketing content
    if (!cleaned || cleaned.length === 0) {
      continue;
    }
    
    // Clean up formatting
    cleaned = cleanStepText(cleaned);
    
    // Skip if step is too short (likely not a real instruction)
    if (cleaned.length < 20) {
      continue;
    }
    
    // Normalize length
    cleaned = normalizeLength(cleaned);
    
    // Only add if we have meaningful content
    if (cleaned.length >= 20) {
      normalized.push(cleaned);
    }
  }
  
  // Ensure we have at least one step
  if (normalized.length === 0 && steps.length > 0) {
    // Fallback: return first step cleaned up
    const fallback = cleanStepText(steps[0]);
    if (fallback.length >= 20) {
      normalized.push(normalizeLength(fallback));
    } else {
      normalized.push("No step-by-step instructions available for this recipe.");
    }
  }
  
  return normalized;
}

