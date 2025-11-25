/**
 * Cooking Terms Dictionary
 * Maps cooking terms to skill IDs for automatic detection and linking
 */

import type { CookingTerm } from "@/types/learn";

export const COOKING_TERMS: CookingTerm[] = [
  // Cutting Techniques
  { term: "chop", skillId: "chopping", variations: ["chopped", "chopping", "chops"] },
  { term: "dice", skillId: "dicing", variations: ["diced", "dicing", "dices"] },
  { term: "mince", skillId: "mincing", variations: ["minced", "mincing", "minces"] },
  { term: "julienne", skillId: "julienne", variations: ["julienned", "julienning"] },
  { term: "slice", skillId: "slicing", variations: ["sliced", "slicing", "slices"] },
  { term: "grate", skillId: "grating", variations: ["grated", "grating", "grates"] },
  { term: "shred", skillId: "shredding", variations: ["shredded", "shredding", "shreds"] },
  { term: "peel", skillId: "peeling", variations: ["peeled", "peeling", "peels"] },
  { term: "trim", skillId: "trimming", variations: ["trimmed", "trimming", "trims"] },
  { term: "cube", skillId: "cubing", variations: ["cubed", "cubing", "cubes"] },
  { term: "chiffonade", skillId: "chiffonade", variations: ["chiffonaded"] },

  // Cooking Methods
  { term: "boil", skillId: "boiling", variations: ["boiled", "boiling", "boils"] },
  { term: "sauté", skillId: "sauteing", variations: ["sautéed", "sautéeing", "sautés"] },
  { term: "braise", skillId: "braising", variations: ["braised", "braising", "braises"] },
  { term: "roast", skillId: "roasting", variations: ["roasted", "roasting", "roasts"] },
  { term: "bake", skillId: "baking", variations: ["baked", "baking", "bakes"] },
  { term: "grill", skillId: "grilling", variations: ["grilled", "grilling", "grills"] },
  { term: "steam", skillId: "steaming", variations: ["steamed", "steaming", "steams"] },
  { term: "fry", skillId: "frying", variations: ["fried", "frying", "fries"] },
  { term: "deep fry", skillId: "deep-frying", variations: ["deep fried", "deep frying"] },
  { term: "stir-fry", skillId: "stir-frying", variations: ["stir fried", "stir frying"] },
  { term: "poach", skillId: "poaching", variations: ["poached", "poaching", "poaches"] },
  { term: "simmer", skillId: "simmering", variations: ["simmered", "simmering", "simmers"] },
  { term: "sear", skillId: "searing", variations: ["seared", "searing", "sears"] },
  { term: "blanch", skillId: "blanching", variations: ["blanched", "blanching", "blanches"] },
  { term: "broil", skillId: "broiling", variations: ["broiled", "broiling", "broils"] },
  { term: "braise", skillId: "braising", variations: ["braised", "braising", "braises"] },
  { term: "stew", skillId: "stewing", variations: ["stewed", "stewing", "stews"] },
  { term: "smoke", skillId: "smoking", variations: ["smoked", "smoking", "smokes"] },

  // Preparation Techniques
  { term: "marinate", skillId: "marinating", variations: ["marinated", "marinating", "marinates"] },
  { term: "season", skillId: "seasoning", variations: ["seasoned", "seasoning", "seasons"] },
  { term: "temper", skillId: "tempering", variations: ["tempered", "tempering", "tempers"] },
  { term: "whisk", skillId: "whisking", variations: ["whisked", "whisking", "whisks"] },
  { term: "fold", skillId: "folding", variations: ["folded", "folding", "folds"] },
  { term: "knead", skillId: "kneading", variations: ["kneaded", "kneading", "kneads"] },
  { term: "whip", skillId: "whipping", variations: ["whipped", "whipping", "whips"] },
  { term: "cream", skillId: "creaming", variations: ["creamed", "creaming", "creams"] },
  { term: "emulsify", skillId: "emulsifying", variations: ["emulsified", "emulsifying", "emulsifies"] },
  { term: "reduce", skillId: "reducing", variations: ["reduced", "reducing", "reduces"] },
  { term: "deglaze", skillId: "deglazing", variations: ["deglazed", "deglazing", "deglazes"] },
  { term: "caramelize", skillId: "caramelizing", variations: ["caramelized", "caramelizing", "caramelizes"] },
  { term: "sweat", skillId: "sweating", variations: ["sweated", "sweating", "sweats"] },
  { term: "bloom", skillId: "blooming", variations: ["bloomed", "blooming", "blooms"] },
  { term: "temper", skillId: "tempering", variations: ["tempered", "tempering", "tempers"] },

  // Equipment & Tools
  { term: "mandoline", skillId: "mandoline", variations: ["mandolin"] },
  { term: "mortar and pestle", skillId: "mortar-pestle", variations: ["mortar & pestle"] },
  { term: "food processor", skillId: "food-processor", variations: [] },
  { term: "stand mixer", skillId: "stand-mixer", variations: ["kitchenaid", "mixer"] },
  { term: "immersion blender", skillId: "immersion-blender", variations: ["stick blender", "hand blender"] },
  { term: "dutch oven", skillId: "dutch-oven", variations: ["enameled cast iron"] },
  { term: "cast iron", skillId: "cast-iron", variations: ["cast iron skillet", "cast iron pan"] },
  { term: "wok", skillId: "wok", variations: ["wok cooking"] },

  // Nutrition Terms
  { term: "macronutrients", skillId: "macronutrients", variations: ["macros", "macro nutrients"] },
  { term: "protein", skillId: "protein", variations: ["proteins"] },
  { term: "carbohydrates", skillId: "carbohydrates", variations: ["carbs", "carbohydrate"] },
  { term: "fats", skillId: "fats", variations: ["fat", "dietary fat"] },
  { term: "fiber", skillId: "fiber", variations: ["dietary fiber", "fibre"] },
  { term: "vitamins", skillId: "vitamins", variations: ["vitamin"] },
  { term: "minerals", skillId: "minerals", variations: ["mineral"] },
  { term: "antioxidants", skillId: "antioxidants", variations: ["antioxidant"] },
  { term: "omega-3", skillId: "omega-3", variations: ["omega 3", "omega3"] },
  { term: "saturated fat", skillId: "saturated-fat", variations: ["saturated fats"] },
  { term: "unsaturated fat", skillId: "unsaturated-fat", variations: ["unsaturated fats"] },
  { term: "trans fat", skillId: "trans-fat", variations: ["trans fats"] },

  // Health Terms
  { term: "heart-healthy", skillId: "heart-healthy", variations: ["heart healthy"] },
  { term: "low-sodium", skillId: "low-sodium", variations: ["low sodium", "reduced sodium"] },
  { term: "low-carb", skillId: "low-carb", variations: ["low carb", "low carbohydrate"] },
  { term: "keto", skillId: "keto", variations: ["ketogenic", "keto diet"] },
  { term: "paleo", skillId: "paleo", variations: ["paleolithic"] },
  { term: "vegan", skillId: "vegan", variations: ["veganism"] },
  { term: "vegetarian", skillId: "vegetarian", variations: ["vegetarianism"] },
  { term: "gluten-free", skillId: "gluten-free", variations: ["gluten free", "gf"] },
  { term: "dairy-free", skillId: "dairy-free", variations: ["dairy free", "non-dairy"] },
  { term: "anti-inflammatory", skillId: "anti-inflammatory", variations: ["anti inflammatory"] },
];

/**
 * Creates a regex pattern for a cooking term that matches the term and its variations
 */
export function createTermPattern(term: string, variations: string[] = []): RegExp {
  const allForms = [term, ...variations].map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = `\\b(${allForms.join('|')})\\b`;
  return new RegExp(pattern, 'gi');
}

/**
 * Finds all cooking terms in a text string
 */
export function findCookingTerms(text: string): Array<{ term: string; skillId: string; index: number; length: number }> {
  const matches: Array<{ term: string; skillId: string; index: number; length: number }> = [];
  
  // Sort terms by length (longest first) to match "deep fry" before "fry"
  const sortedTerms = [...COOKING_TERMS].sort((a, b) => {
    const aLength = Math.max(a.term.length, ...(a.variations || []).map(v => v.length));
    const bLength = Math.max(b.term.length, ...(b.variations || []).map(v => v.length));
    return bLength - aLength;
  });

  for (const cookingTerm of sortedTerms) {
    const pattern = createTermPattern(cookingTerm.term, cookingTerm.variations || []);
    let match: RegExpExecArray | null;
    
    while ((match = pattern.exec(text)) !== null) {
      const currentMatch = match;
      // Check if this match overlaps with an existing match
      const overlaps = matches.some(m => 
        (currentMatch.index >= m.index && currentMatch.index < m.index + m.length) ||
        (m.index >= currentMatch.index && m.index < currentMatch.index + currentMatch[0].length)
      );
      
      if (!overlaps) {
        matches.push({
          term: currentMatch[0],
          skillId: cookingTerm.skillId,
          index: currentMatch.index,
          length: currentMatch[0].length,
        });
      }
    }
  }

  // Sort matches by index
  return matches.sort((a, b) => a.index - b.index);
}

