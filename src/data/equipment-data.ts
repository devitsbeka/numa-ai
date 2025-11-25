import type { Equipment } from "@/types/equipment";

/**
 * Comprehensive list of kitchen equipment
 * Organized by category with gamified descriptions
 */
export const KITCHEN_EQUIPMENT: Equipment[] = [
  // Knives & Cutting
  {
    id: "chefs-knife",
    name: "Chef's Knife",
    description: "The foundation of every kitchen. Master precision cutting and unlock advanced chopping techniques.",
    category: "Knives & Cutting",
    icon: "🔪",
    status: "unlocked",
    capabilities: ["Chopping", "Dicing", "Mincing", "Slicing"],
    rarity: "common",
  },
  {
    id: "paring-knife",
    name: "Paring Knife",
    description: "Perfect for delicate work. Unlock intricate cutting techniques and fruit preparation.",
    category: "Knives & Cutting",
    icon: "🔪",
    status: "unlocked",
    capabilities: ["Precision Cutting", "Fruit Prep", "Garnishing"],
    rarity: "common",
  },
  {
    id: "serrated-knife",
    name: "Serrated Knife",
    description: "Essential for bread and tomatoes. Never crush delicate items again.",
    category: "Knives & Cutting",
    icon: "🔪",
    status: "unlocked",
    capabilities: ["Bread Slicing", "Tomato Cutting", "Soft Items"],
    rarity: "common",
  },
  {
    id: "mandoline-slicer",
    name: "Mandoline Slicer",
    description: "Achieve perfect, uniform slices every time. Unlock professional presentation skills.",
    category: "Knives & Cutting",
    icon: "⚙️",
    status: "locked",
    unlockRequirement: "Complete 20 recipes with slicing techniques",
    capabilities: ["Uniform Slicing", "Professional Presentation", "Time Saving"],
    rarity: "uncommon",
  },

  // Cooking Appliances
  {
    id: "stovetop",
    name: "Stovetop",
    description: "The heart of your kitchen. Unlock sautéing, boiling, and pan-frying techniques.",
    category: "Cooking Appliances",
    icon: "🔥",
    status: "unlocked",
    capabilities: ["Sautéing", "Boiling", "Pan-frying", "Simmering"],
    rarity: "common",
  },
  {
    id: "oven",
    name: "Oven",
    description: "Master the art of baking and roasting. Unlock a world of baked goods and roasted dishes.",
    category: "Cooking Appliances",
    icon: "🔥",
    status: "unlocked",
    capabilities: ["Baking", "Roasting", "Broiling", "Slow Cooking"],
    rarity: "common",
  },
  {
    id: "grill",
    name: "Grill",
    description: "Unlock the smoky, charred flavors of grilling. Perfect for meats, vegetables, and more.",
    category: "Cooking Appliances",
    icon: "🔥",
    status: "locked",
    unlockRequirement: "Complete 15 recipes using high-heat cooking",
    capabilities: ["Grilling", "Charring", "Smoky Flavors", "Outdoor Cooking"],
    rarity: "uncommon",
  },
  {
    id: "sous-vide",
    name: "Sous Vide",
    description: "Precision cooking at its finest. Achieve perfect doneness every time with this advanced technique.",
    category: "Cooking Appliances",
    icon: "🌡️",
    status: "locked",
    unlockRequirement: "Master 5 advanced cooking techniques",
    capabilities: ["Precision Cooking", "Perfect Doneness", "Advanced Techniques"],
    rarity: "rare",
  },
  {
    id: "air-fryer",
    name: "Air Fryer",
    description: "Crispy, golden results with less oil. Unlock healthier frying alternatives.",
    category: "Cooking Appliances",
    icon: "💨",
    status: "locked",
    unlockRequirement: "Complete 10 recipes requiring frying",
    capabilities: ["Air Frying", "Healthier Frying", "Crispy Results"],
    rarity: "uncommon",
  },
  {
    id: "pressure-cooker",
    name: "Pressure Cooker",
    description: "Cook meals in minutes that normally take hours. Unlock time-saving superpowers.",
    category: "Cooking Appliances",
    icon: "⚡",
    status: "locked",
    unlockRequirement: "Complete 25 recipes total",
    capabilities: ["Fast Cooking", "Tenderizing", "Time Saving"],
    rarity: "uncommon",
  },

  // Preparation Tools
  {
    id: "cutting-board",
    name: "Cutting Board",
    description: "Your workspace for all prep work. Essential for safe and efficient cooking.",
    category: "Preparation Tools",
    icon: "🪵",
    status: "unlocked",
    capabilities: ["Safe Cutting", "Food Prep"],
    rarity: "common",
  },
  {
    id: "blender",
    name: "Blender",
    description: "Create smoothies, sauces, and purees. Unlock liquid-based recipes and smooth textures.",
    category: "Preparation Tools",
    icon: "🌀",
    status: "locked",
    unlockRequirement: "Complete 5 recipes requiring blending",
    capabilities: ["Blending", "Pureeing", "Smoothies", "Sauces"],
    rarity: "uncommon",
  },
  {
    id: "food-processor",
    name: "Food Processor",
    description: "The ultimate prep machine. Chop, shred, and mix with precision and speed.",
    category: "Preparation Tools",
    icon: "⚙️",
    status: "locked",
    unlockRequirement: "Complete 10 recipes with complex prep work",
    capabilities: ["Chopping", "Shredding", "Mixing", "Dough Making"],
    rarity: "uncommon",
  },
  {
    id: "stand-mixer",
    name: "Stand Mixer",
    description: "Professional-grade mixing power. Unlock advanced baking and dough techniques.",
    category: "Preparation Tools",
    icon: "🍰",
    status: "locked",
    unlockRequirement: "Complete 15 baking recipes",
    capabilities: ["Mixing", "Kneading", "Whipping", "Advanced Baking"],
    rarity: "rare",
  },
  {
    id: "mortar-pestle",
    name: "Mortar & Pestle",
    description: "Traditional grinding tool. Unlock authentic spice preparation and flavor extraction.",
    category: "Preparation Tools",
    icon: "🪨",
    status: "locked",
    unlockRequirement: "Complete 8 recipes using whole spices",
    capabilities: ["Grinding Spices", "Flavor Extraction", "Traditional Methods"],
    rarity: "uncommon",
  },

  // Baking Equipment
  {
    id: "baking-sheet",
    name: "Baking Sheet",
    description: "Essential for cookies, roasted vegetables, and more. Your baking foundation.",
    category: "Baking Equipment",
    icon: "🍪",
    status: "unlocked",
    capabilities: ["Baking", "Roasting", "Cookie Making"],
    rarity: "common",
  },
  {
    id: "muffin-tin",
    name: "Muffin Tin",
    description: "Perfect for muffins, cupcakes, and individual portions. Unlock portion-controlled baking.",
    category: "Baking Equipment",
    icon: "🧁",
    status: "unlocked",
    capabilities: ["Muffins", "Cupcakes", "Individual Portions"],
    rarity: "common",
  },
  {
    id: "dutch-oven",
    name: "Dutch Oven",
    description: "Versatile heavy pot for braising, baking, and slow cooking. Unlock one-pot wonders.",
    category: "Baking Equipment",
    icon: "🍲",
    status: "locked",
    unlockRequirement: "Complete 12 one-pot recipes",
    capabilities: ["Braising", "Baking Bread", "Slow Cooking", "One-Pot Meals"],
    rarity: "uncommon",
  },
  {
    id: "cast-iron-skillet",
    name: "Cast Iron Skillet",
    description: "The workhorse of the kitchen. Perfect searing and even heat distribution.",
    category: "Baking Equipment",
    icon: "🍳",
    status: "locked",
    unlockRequirement: "Complete 10 recipes requiring searing",
    capabilities: ["Searing", "Even Cooking", "Versatile Cooking"],
    rarity: "uncommon",
  },

  // Specialty Tools
  {
    id: "pasta-maker",
    name: "Pasta Maker",
    description: "Create fresh pasta from scratch. Unlock authentic Italian cooking techniques.",
    category: "Specialty Tools",
    icon: "🍝",
    status: "locked",
    unlockRequirement: "Complete 5 Italian recipes",
    capabilities: ["Fresh Pasta", "Italian Cuisine", "Advanced Techniques"],
    rarity: "rare",
  },
  {
    id: "ice-cream-maker",
    name: "Ice Cream Maker",
    description: "Craft artisanal frozen treats. Unlock dessert mastery and creative flavors.",
    category: "Specialty Tools",
    icon: "🍦",
    status: "locked",
    unlockRequirement: "Complete 8 dessert recipes",
    capabilities: ["Ice Cream", "Frozen Desserts", "Creative Flavors"],
    rarity: "rare",
  },
  {
    id: "smoker",
    name: "Smoker",
    description: "Unlock deep, smoky flavors. Master the art of low and slow cooking.",
    category: "Specialty Tools",
    icon: "💨",
    status: "locked",
    unlockRequirement: "Master 3 advanced cooking techniques and complete 30 recipes",
    capabilities: ["Smoking", "Low & Slow", "Deep Flavors", "BBQ"],
    rarity: "epic",
  },
  {
    id: "wok",
    name: "Wok",
    description: "Essential for stir-frying and Asian cuisine. Unlock high-heat cooking techniques.",
    category: "Specialty Tools",
    icon: "🥘",
    status: "locked",
    unlockRequirement: "Complete 8 Asian-inspired recipes",
    capabilities: ["Stir-Frying", "High-Heat Cooking", "Asian Cuisine"],
    rarity: "uncommon",
  },

  // Storage & Organization
  {
    id: "spice-rack",
    name: "Spice Rack",
    description: "Organize your spices for easy access. Unlock flavor experimentation.",
    category: "Storage & Organization",
    icon: "🧂",
    status: "unlocked",
    capabilities: ["Spice Organization", "Flavor Access"],
    rarity: "common",
  },
  {
    id: "herb-garden",
    name: "Herb Garden",
    description: "Grow fresh herbs at home. Unlock the freshest flavors possible.",
    category: "Storage & Organization",
    icon: "🌿",
    status: "locked",
    unlockRequirement: "Use fresh herbs in 15 recipes",
    capabilities: ["Fresh Herbs", "Garden-to-Table", "Premium Flavors"],
    rarity: "uncommon",
  },
];

/**
 * Get equipment by category
 */
export function getEquipmentByCategory(category: Equipment["category"]): Equipment[] {
  return KITCHEN_EQUIPMENT.filter((eq) => eq.category === category);
}

/**
 * Get unlocked equipment
 */
export function getUnlockedEquipment(): Equipment[] {
  return KITCHEN_EQUIPMENT.filter((eq) => eq.status === "unlocked");
}

/**
 * Get locked equipment
 */
export function getLockedEquipment(): Equipment[] {
  return KITCHEN_EQUIPMENT.filter((eq) => eq.status === "locked");
}

/**
 * Get equipment by ID
 */
export function getEquipmentById(id: string): Equipment | undefined {
  return KITCHEN_EQUIPMENT.find((eq) => eq.id === id);
}

/**
 * Get all equipment categories
 */
export function getEquipmentCategories(): Equipment["category"][] {
  return Array.from(new Set(KITCHEN_EQUIPMENT.map((eq) => eq.category)));
}


