import type { DietPlan } from "@/types/diet-plan";
import type { MappedRecipe } from "@/types/spoonacular";

// Mock recipes for diet plans (in a real app, these would come from the API)
const createMockRecipe = (
  id: string,
  name: string,
  image?: string,
  calories?: number
): MappedRecipe => ({
  id,
  name,
  image: image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`,
  calories: calories || Math.floor(Math.random() * 500) + 200,
  readyInMinutes: Math.floor(Math.random() * 60) + 15,
  servings: 2,
  ingredients: [],
  instructions: [],
  summary: "",
  spoonacularId: id,
});

// Generate a 7-day meal plan
const generate7DayPlan = (breakfastRecipes: MappedRecipe[], lunchRecipes: MappedRecipe[], dinnerRecipes: MappedRecipe[]) => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    breakfast: breakfastRecipes[i % breakfastRecipes.length],
    lunch: lunchRecipes[i % lunchRecipes.length],
    dinner: dinnerRecipes[i % dinnerRecipes.length],
  }));
};

// Generate a 14-day meal plan
const generate14DayPlan = (breakfastRecipes: MappedRecipe[], lunchRecipes: MappedRecipe[], dinnerRecipes: MappedRecipe[]) => {
  return Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    breakfast: breakfastRecipes[i % breakfastRecipes.length],
    lunch: lunchRecipes[i % lunchRecipes.length],
    dinner: dinnerRecipes[i % dinnerRecipes.length],
  }));
};

// Generate a 21-day meal plan
const generate21DayPlan = (breakfastRecipes: MappedRecipe[], lunchRecipes: MappedRecipe[], dinnerRecipes: MappedRecipe[]) => {
  return Array.from({ length: 21 }, (_, i) => ({
    day: i + 1,
    breakfast: breakfastRecipes[i % breakfastRecipes.length],
    lunch: lunchRecipes[i % lunchRecipes.length],
    dinner: dinnerRecipes[i % dinnerRecipes.length],
  }));
};

export const MOCK_DIET_PLANS: DietPlan[] = [
  {
    id: "detox-7-day",
    title: "7-Day Detox Cleanse",
    description: "A gentle detox plan designed to reset your body, boost energy, and improve digestion with nutrient-dense, plant-based meals.",
    duration: 7,
    tags: ["Detox", "Vegan", "Gluten-Free"],
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    goal: "detox",
    estimatedWeightLoss: 1.5,
    avgCaloriesPerDay: 1400,
    macros: {
      protein: "15%",
      carbs: "60%",
      fats: "25%",
    },
    rating: 4.8,
    reviewCount: 234,
    dailyMeals: generate7DayPlan(
      [
        createMockRecipe("detox-bf-1", "Green Smoothie Bowl", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", 280),
        createMockRecipe("detox-bf-2", "Overnight Oats with Berries", "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop", 320),
        createMockRecipe("detox-bf-3", "Chia Pudding", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", 250),
      ],
      [
        createMockRecipe("detox-lunch-1", "Quinoa Salad Bowl", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 380),
        createMockRecipe("detox-lunch-2", "Green Goddess Salad", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 290),
        createMockRecipe("detox-lunch-3", "Vegetable Soup", "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", 220),
      ],
      [
        createMockRecipe("detox-dinner-1", "Roasted Vegetable Medley", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 350),
        createMockRecipe("detox-dinner-2", "Zucchini Noodles with Pesto", "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop", 310),
        createMockRecipe("detox-dinner-3", "Lentil Curry", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", 420),
      ]
    ),
  },
  {
    id: "weight-loss-14-day",
    title: "14-Day Weight Loss Challenge",
    description: "A balanced meal plan focused on sustainable weight loss with portion-controlled, protein-rich meals that keep you satisfied.",
    duration: 14,
    tags: ["Weight Loss", "High Protein", "Low Carb"],
    coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    goal: "weight-loss",
    estimatedWeightLoss: 3.5,
    avgCaloriesPerDay: 1500,
    macros: {
      protein: "35%",
      carbs: "35%",
      fats: "30%",
    },
    rating: 4.6,
    reviewCount: 189,
    dailyMeals: generate14DayPlan(
      [
        createMockRecipe("wl-bf-1", "Protein Pancakes", "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop", 350),
        createMockRecipe("wl-bf-2", "Greek Yogurt Parfait", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop", 280),
        createMockRecipe("wl-bf-3", "Egg White Scramble", "https://images.unsplash.com/photo-1588168333984-ff9c9b4a0ad6?w=400&h=300&fit=crop", 240),
      ],
      [
        createMockRecipe("wl-lunch-1", "Grilled Chicken Salad", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 420),
        createMockRecipe("wl-lunch-2", "Turkey Wrap", "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", 380),
        createMockRecipe("wl-lunch-3", "Salmon Bowl", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 450),
      ],
      [
        createMockRecipe("wl-dinner-1", "Lean Beef Stir Fry", "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", 480),
        createMockRecipe("wl-dinner-2", "Baked Cod with Vegetables", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 420),
        createMockRecipe("wl-dinner-3", "Turkey Meatballs", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 460),
      ]
    ),
  },
  {
    id: "skin-improvement-21-day",
    title: "21-Day Glow Up Plan",
    description: "Nourish your skin from within with antioxidant-rich foods, healthy fats, and collagen-boosting ingredients for a radiant complexion.",
    duration: 21,
    tags: ["Skin Health", "Antioxidants", "Omega-3"],
    coverImage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=600&fit=crop",
    goal: "skin-improvement",
    estimatedWeightLoss: 2.0,
    avgCaloriesPerDay: 1800,
    macros: {
      protein: "25%",
      carbs: "45%",
      fats: "30%",
    },
    rating: 4.9,
    reviewCount: 312,
    dailyMeals: generate21DayPlan(
      [
        createMockRecipe("skin-bf-1", "Avocado Toast with Berries", "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop", 380),
        createMockRecipe("skin-bf-2", "Acai Bowl", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", 320),
        createMockRecipe("skin-bf-3", "Omega-3 Smoothie", "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop", 290),
      ],
      [
        createMockRecipe("skin-lunch-1", "Salmon Salad", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 450),
        createMockRecipe("skin-lunch-2", "Mediterranean Bowl", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 420),
        createMockRecipe("skin-lunch-3", "Quinoa Power Bowl", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 400),
      ],
      [
        createMockRecipe("skin-dinner-1", "Grilled Salmon with Sweet Potato", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 520),
        createMockRecipe("skin-dinner-2", "Roasted Vegetables with Tahini", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 380),
        createMockRecipe("skin-dinner-3", "Chicken and Broccoli", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 450),
      ]
    ),
  },
  {
    id: "muscle-gain-14-day",
    title: "14-Day Muscle Builder",
    description: "High-protein meal plan designed to support muscle growth and recovery with nutrient-dense, calorie-rich meals.",
    duration: 14,
    tags: ["Muscle Gain", "High Protein", "Athlete"],
    coverImage: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop",
    goal: "muscle-gain",
    estimatedWeightLoss: -1.0, // Negative means weight gain (muscle)
    avgCaloriesPerDay: 2500,
    macros: {
      protein: "40%",
      carbs: "40%",
      fats: "20%",
    },
    rating: 4.7,
    reviewCount: 156,
    dailyMeals: generate14DayPlan(
      [
        createMockRecipe("mg-bf-1", "Protein Oatmeal", "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop", 550),
        createMockRecipe("mg-bf-2", "Egg and Sausage Scramble", "https://images.unsplash.com/photo-1588168333984-ff9c9b4a0ad6?w=400&h=300&fit=crop", 480),
        createMockRecipe("mg-bf-3", "Protein Smoothie Bowl", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", 520),
      ],
      [
        createMockRecipe("mg-lunch-1", "Chicken and Rice Bowl", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 680),
        createMockRecipe("mg-lunch-2", "Beef and Quinoa", "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", 720),
        createMockRecipe("mg-lunch-3", "Turkey and Sweet Potato", "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", 650),
      ],
      [
        createMockRecipe("mg-dinner-1", "Steak with Potatoes", "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", 850),
        createMockRecipe("mg-dinner-2", "Grilled Chicken and Pasta", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 780),
        createMockRecipe("mg-dinner-3", "Salmon and Rice", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 720),
      ]
    ),
  },
  {
    id: "energy-boost-7-day",
    title: "7-Day Energy Boost",
    description: "Kickstart your energy levels with balanced meals rich in complex carbs, healthy fats, and energizing nutrients.",
    duration: 7,
    tags: ["Energy", "Balanced", "Whole Foods"],
    coverImage: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=600&fit=crop",
    goal: "energy-boost",
    estimatedWeightLoss: 0.8,
    avgCaloriesPerDay: 2000,
    macros: {
      protein: "25%",
      carbs: "50%",
      fats: "25%",
    },
    rating: 4.5,
    reviewCount: 98,
    dailyMeals: generate7DayPlan(
      [
        createMockRecipe("energy-bf-1", "Whole Grain Toast with Eggs", "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop", 420),
        createMockRecipe("energy-bf-2", "Oatmeal with Nuts", "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop", 450),
        createMockRecipe("energy-bf-3", "Banana Pancakes", "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop", 480),
      ],
      [
        createMockRecipe("energy-lunch-1", "Quinoa Power Bowl", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", 520),
        createMockRecipe("energy-lunch-2", "Chicken Wrap", "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", 480),
        createMockRecipe("energy-lunch-3", "Pasta Salad", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 450),
      ],
      [
        createMockRecipe("energy-dinner-1", "Baked Chicken with Rice", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 580),
        createMockRecipe("energy-dinner-2", "Beef Stir Fry", "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", 620),
        createMockRecipe("energy-dinner-3", "Fish Tacos", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 550),
      ]
    ),
  },
];

