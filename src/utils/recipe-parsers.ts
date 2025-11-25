import type { CustomRecipe, CustomRecipeIngredient } from "@/types/custom-recipe";

export interface ParsedRecipeData {
  name?: string;
  description?: string;
  cuisine?: string;
  mealType?: CustomRecipe["mealType"];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: string;
  ingredients?: CustomRecipeIngredient[];
  instructions?: string[];
}

/**
 * Parse recipe from JSON-LD structured data
 */
export function parseJsonLdRecipe(jsonLd: any): ParsedRecipeData | null {
  try {
    const recipe = Array.isArray(jsonLd) ? jsonLd[0] : jsonLd;
    
    if (recipe["@type"] !== "Recipe" && recipe["@type"] !== "http://schema.org/Recipe") {
      return null;
    }

    const ingredients: CustomRecipeIngredient[] = [];
    if (recipe.recipeIngredient) {
      const ingredientList = Array.isArray(recipe.recipeIngredient)
        ? recipe.recipeIngredient
        : [recipe.recipeIngredient];
      
      ingredientList.forEach((ing: string) => {
        const parsed = parseIngredient(ing);
        if (parsed) ingredients.push(parsed);
      });
    }

    const instructions: string[] = [];
    if (recipe.recipeInstructions) {
      const instructionList = Array.isArray(recipe.recipeInstructions)
        ? recipe.recipeInstructions
        : [recipe.recipeInstructions];
      
      instructionList.forEach((inst: any) => {
        if (typeof inst === "string") {
          instructions.push(inst);
        } else if (inst.text) {
          instructions.push(inst.text);
        } else if (inst["@type"] === "HowToStep" && inst.text) {
          instructions.push(inst.text);
        }
      });
    }

    return {
      name: recipe.name,
      description: recipe.description,
      image: typeof recipe.image === "string" ? recipe.image : recipe.image?.[0]?.url || recipe.image?.[0],
      prepTime: parseTime(recipe.prepTime),
      cookTime: parseTime(recipe.cookTime),
      servings: parseServings(recipe.recipeYield),
      ingredients,
      instructions,
    };
  } catch (error) {
    console.error("Error parsing JSON-LD:", error);
    return null;
  }
}

/**
 * Parse recipe from HTML content (server-side compatible)
 */
export function parseHtmlRecipe(html: string): ParsedRecipeData | null {
  // Try to find JSON-LD first
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      const parsed = parseJsonLdRecipe(jsonLd);
      if (parsed) return parsed;
    } catch (e) {
      // Continue to HTML parsing
    }
  }

  // Fallback to regex-based HTML parsing (works in Node.js)
  
  // Try to find recipe name
  let name: string | undefined;
  const nameMatches = [
    html.match(/<h1[^>]*class=["'][^"']*recipe[^"']*["'][^>]*>(.*?)<\/h1>/i),
    html.match(/<h1[^>]*>(.*?)<\/h1>/i),
    html.match(/<[^>]*itemprop=["']name["'][^>]*>(.*?)<\/[^>]+>/i),
  ];
  for (const match of nameMatches) {
    if (match && match[1]) {
      name = stripHtmlTags(match[1]).trim();
      if (name) break;
    }
  }

  // Try to find description
  let description: string | undefined;
  const descMatches = [
    html.match(/<[^>]*itemprop=["']description["'][^>]*>(.*?)<\/[^>]+>/i),
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i),
    html.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>(.*?)<\/p>/i),
  ];
  for (const match of descMatches) {
    if (match && match[1]) {
      description = stripHtmlTags(match[1]).trim();
      if (description) break;
    }
  }

  // Try to find image
  let image: string | undefined;
  const imageMatches = [
    html.match(/<[^>]*itemprop=["']image["'][^>]*content=["']([^"']+)["']/i),
    html.match(/<[^>]*itemprop=["']image["'][^>]*>.*?<img[^>]*src=["']([^"']+)["']/i),
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i),
    html.match(/<img[^>]*class=["'][^"']*recipe[^"']*["'][^>]*src=["']([^"']+)["']/i),
  ];
  for (const match of imageMatches) {
    if (match && match[1]) {
      image = match[1].trim();
      if (image) break;
    }
  }

  // Try to find ingredients using regex
  const ingredients: CustomRecipeIngredient[] = [];
  const ingredientPatterns = [
    /<[^>]*itemprop=["']recipeIngredient["'][^>]*>(.*?)<\/[^>]+>/gi,
    /<li[^>]*class=["'][^"']*ingredient[^"']*["'][^>]*>(.*?)<\/li>/gi,
    /<[^>]*class=["'][^"']*ingredient[^"']*["'][^>]*>(.*?)<\/[^>]+>/gi,
  ];
  
  for (const pattern of ingredientPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match && match[1]) {
        const text = stripHtmlTags(match[1]).trim();
        if (text) {
          const parsed = parseIngredient(text);
          if (parsed) ingredients.push(parsed);
        }
      }
    }
    if (ingredients.length > 0) break;
  }

  // Try to find instructions using regex
  const instructions: string[] = [];
  const instructionPatterns = [
    /<[^>]*itemprop=["']recipeInstructions["'][^>]*>.*?<li[^>]*>(.*?)<\/li>/gi,
    /<[^>]*itemprop=["']recipeInstructions["'][^>]*>.*?<p[^>]*>(.*?)<\/p>/gi,
    /<li[^>]*class=["'][^"']*instruction[^"']*["'][^>]*>(.*?)<\/li>/gi,
    /<li[^>]*class=["'][^"']*step[^"']*["'][^>]*>(.*?)<\/li>/gi,
  ];
  
  for (const pattern of instructionPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match && match[1]) {
        const text = stripHtmlTags(match[1]).trim();
        if (text && text.length > 10) {
          instructions.push(text);
        }
      }
    }
    if (instructions.length > 0) break;
  }

  // Try to find prep/cook time
  let prepTime: number | undefined;
  const prepTimeMatches = [
    html.match(/<[^>]*itemprop=["']prepTime["'][^>]*content=["']([^"']+)["']/i),
    html.match(/<[^>]*class=["'][^"']*prep[^"']*["'][^>]*>(.*?)<\/[^>]+>/i),
  ];
  for (const match of prepTimeMatches) {
    if (match && match[1]) {
      prepTime = parseTime(match[1]);
      if (prepTime) break;
    }
  }

  let cookTime: number | undefined;
  const cookTimeMatches = [
    html.match(/<[^>]*itemprop=["']cookTime["'][^>]*content=["']([^"']+)["']/i),
    html.match(/<[^>]*class=["'][^"']*cook[^"']*["'][^>]*>(.*?)<\/[^>]+>/i),
  ];
  for (const match of cookTimeMatches) {
    if (match && match[1]) {
      cookTime = parseTime(match[1]);
      if (cookTime) break;
    }
  }

  // Try to find servings
  let servings: number | undefined;
  const servingMatches = [
    html.match(/<[^>]*itemprop=["']recipeYield["'][^>]*>(.*?)<\/[^>]+>/i),
    html.match(/<[^>]*class=["'][^"']*serving[^"']*["'][^>]*>(.*?)<\/[^>]+>/i),
  ];
  for (const match of servingMatches) {
    if (match && match[1]) {
      servings = parseServings(stripHtmlTags(match[1]));
      if (servings) break;
    }
  }

  return {
    name: name || undefined,
    description: description || undefined,
    image: image || undefined,
    prepTime,
    cookTime,
    servings,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    instructions: instructions.length > 0 ? instructions : undefined,
  };
}

/**
 * Strip HTML tags from a string
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse ingredient string into structured format
 */
function parseIngredient(text: string): CustomRecipeIngredient | null {
  if (!text || !text.trim()) return null;

  // Common patterns: "2 cups flour", "1/2 tsp salt", "200g butter"
  const patterns = [
    /^(\d+(?:\/\d+)?(?:\.\d+)?)\s*(cup|cups|tbsp|tsp|oz|lb|g|kg|ml|l|fl\s*oz)\s+(.+)$/i,
    /^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFraction(match[1]);
      const unit = match[2]?.toLowerCase().trim() || "g";
      const name = match[3]?.trim() || match[2]?.trim() || text;

      return {
        name,
        amount: amount || 1,
        unit: unit === "cup" || unit === "cups" ? "cup" : unit,
      };
    }
  }

  // Fallback: treat entire string as name with default amount
  return {
    name: text.trim(),
    amount: 1,
    unit: "g",
  };
}

/**
 * Parse fraction string to number
 */
function parseFraction(str: string): number {
  if (str.includes("/")) {
    const [num, den] = str.split("/").map(Number);
    return num / den;
  }
  return parseFloat(str) || 1;
}

/**
 * Parse ISO 8601 duration or time string to minutes
 */
function parseTime(timeStr: string | null | undefined): number | undefined {
  if (!timeStr) return undefined;

  // ISO 8601 duration: PT30M, PT1H30M
  const isoMatch = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || "0", 10);
    const minutes = parseInt(isoMatch[2] || "0", 10);
    return hours * 60 + minutes;
  }

  // Plain number (assume minutes)
  const numMatch = timeStr.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return undefined;
}

/**
 * Parse servings/yield string to number
 */
function parseServings(yieldStr: string | null | undefined): number | undefined {
  if (!yieldStr) return undefined;

  const numMatch = yieldStr.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return undefined;
}

/**
 * Parse recipe from plain text (for OCR/image extraction)
 */
export function parseTextRecipe(text: string): ParsedRecipeData | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  
  let name: string | undefined;
  let description: string | undefined;
  const ingredients: CustomRecipeIngredient[] = [];
  const instructions: string[] = [];
  let inIngredients = false;
  let inInstructions = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Detect sections
    if (line.includes("ingredient")) {
      inIngredients = true;
      inInstructions = false;
      continue;
    }
    if (line.includes("instruction") || line.includes("direction") || line.includes("step")) {
      inIngredients = false;
      inInstructions = true;
      continue;
    }

    // First non-empty line is likely the name
    if (!name && i < 3 && lines[i].length > 3 && lines[i].length < 100) {
      name = lines[i];
      continue;
    }

    // Parse ingredients
    if (inIngredients || (line.match(/^\d+/) && !inInstructions)) {
      const parsed = parseIngredient(lines[i]);
      if (parsed) ingredients.push(parsed);
    }

    // Parse instructions
    if (inInstructions || (line.match(/^\d+[\.\)]/) && !inIngredients)) {
      const cleaned = lines[i].replace(/^\d+[\.\)]\s*/, "");
      if (cleaned.length > 10) {
        instructions.push(cleaned);
      }
    }
  }

  return {
    name,
    description,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    instructions: instructions.length > 0 ? instructions : undefined,
  };
}

