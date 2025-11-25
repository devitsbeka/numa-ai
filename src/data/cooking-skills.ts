/**
 * Cooking Skills Database
 * Comprehensive collection of cooking skills, techniques, and knowledge
 */

import type { Skill } from "@/types/learn";

export const COOKING_SKILLS: Skill[] = [
  // Cutting Techniques
  {
    id: "chopping",
    name: "Chopping",
    slug: "chopping",
    category: "technique",
    description: "Master the art of chopping vegetables and ingredients into uniform pieces.",
    content: `# Chopping

Chopping is one of the most fundamental knife skills in cooking. It involves cutting ingredients into small, uniform pieces.

## Basic Technique

1. **Hold the knife correctly**: Grip the handle firmly with your dominant hand, with your thumb and index finger on either side of the blade near the handle.

2. **Use the claw grip**: Curl your fingers on your non-dominant hand to protect them while holding the ingredient.

3. **Rocking motion**: Use a smooth rocking motion with the knife, keeping the tip of the blade on the cutting board.

4. **Consistent size**: Aim for uniform pieces to ensure even cooking.

## Tips

- Keep your knife sharp - a dull knife is more dangerous than a sharp one
- Use a stable cutting board
- Practice makes perfect - start with softer vegetables like onions
- For harder vegetables, use a heavier knife or cleaver`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["dicing", "mincing", "knife-skills"],
  },
  {
    id: "dicing",
    name: "Dicing",
    slug: "dicing",
    category: "technique",
    description: "Learn to dice vegetables into perfect small cubes for even cooking and presentation.",
    content: `# Dicing

Dicing creates uniform cube-shaped pieces, typically ranging from 1/4 inch (small dice) to 3/4 inch (large dice).

## Technique

1. **Start with chopping**: First, cut your ingredient into planks or slices
2. **Stack and cut**: Stack the slices and cut into strips
3. **Rotate and dice**: Turn the strips 90 degrees and cut into cubes

## Dice Sizes

- **Large dice**: 3/4 inch cubes
- **Medium dice**: 1/2 inch cubes
- **Small dice**: 1/4 inch cubes
- **Brunoise**: 1/8 inch cubes (very fine dice)`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["chopping", "julienne", "knife-skills"],
  },
  {
    id: "mincing",
    name: "Mincing",
    slug: "mincing",
    category: "technique",
    description: "Create fine, uniform pieces perfect for garlic, herbs, and aromatics.",
    content: `# Mincing

Mincing produces the smallest possible pieces, creating a paste-like consistency ideal for distributing flavor evenly.

## Technique

1. **Start with chopping**: Begin by roughly chopping the ingredient
2. **Gather and mince**: Gather the pieces together and continue chopping with a rocking motion
3. **Optional: Use a mezzaluna**: For herbs, a mezzaluna (curved blade) can speed up the process

## Common Uses

- Garlic and ginger
- Fresh herbs (parsley, cilantro, basil)
- Shallots and small onions
- Creating pastes and flavor bases`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["chopping", "knife-skills"],
  },
  {
    id: "julienne",
    name: "Julienne",
    slug: "julienne",
    category: "technique",
    description: "Create thin matchstick strips for vegetables, perfect for stir-fries and salads.",
    content: `# Julienne

Julienne creates thin, uniform matchstick strips, typically 1/8 inch thick and 2-3 inches long.

## Technique

1. **Trim and square**: Trim the ends and square off the sides of your vegetable
2. **Cut into planks**: Slice into 1/8 inch thick planks
3. **Stack and slice**: Stack the planks and slice into matchsticks

## Common Uses

- Carrots, bell peppers, and celery for stir-fries
- Garnishes for salads and soups
- Crudité platters
- Asian-style dishes`,
    difficulty: "intermediate",
    estimatedTime: 15,
    relatedSkills: ["dicing", "slicing", "knife-skills"],
  },
  {
    id: "slicing",
    name: "Slicing",
    slug: "slicing",
    category: "technique",
    description: "Master uniform slicing for consistent cooking and beautiful presentation.",
    content: `# Slicing

Slicing creates thin, even pieces that cook uniformly and look professional.

## Technique

1. **Steady hand**: Keep your non-dominant hand steady with the claw grip
2. **Consistent angle**: Maintain the same angle throughout the cut
3. **Even pressure**: Apply even pressure for uniform thickness

## Types of Slices

- **Thin slices**: 1/16 to 1/8 inch (for raw applications)
- **Medium slices**: 1/4 to 1/2 inch (for cooking)
- **Thick slices**: 1/2 inch or more (for roasting, grilling)`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["chopping", "knife-skills"],
  },
  {
    id: "knife-skills",
    name: "Knife Skills Fundamentals",
    slug: "knife-skills",
    category: "technique",
    description: "Essential knife skills every cook should master for safe and efficient cooking.",
    content: `# Knife Skills Fundamentals

Proper knife skills are the foundation of good cooking. They make prep work faster, safer, and more enjoyable.

## Choosing the Right Knife

- **Chef's knife**: 8-10 inch, all-purpose workhorse
- **Paring knife**: 3-4 inch, for detailed work
- **Serrated knife**: For bread and tomatoes
- **Boning knife**: For meat and fish

## Basic Grips

1. **Handle grip**: Standard grip for beginners
2. **Pinch grip**: Professional grip with thumb and index finger on blade
3. **Claw grip**: Protects fingers while holding ingredients

## Safety Tips

- Always use a sharp knife (dull knives slip)
- Keep your cutting board stable
- Never catch a falling knife
- Store knives properly in a block or magnetic strip`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["chopping", "dicing", "slicing"],
  },

  // Cooking Methods
  {
    id: "boiling",
    name: "Boiling",
    slug: "boiling",
    category: "technique",
    description: "Understand when and how to boil ingredients for perfect texture and flavor.",
    content: `# Boiling

Boiling is cooking food in water or other liquid at 212°F (100°C).

## When to Boil

- Pasta, rice, and grains
- Hard vegetables (potatoes, carrots)
- Eggs
- Blanching vegetables

## Technique

1. **Bring to a rolling boil**: Large bubbles breaking the surface
2. **Add salt**: Season the water (should taste like mild seawater)
3. **Add ingredients**: Add food once water is boiling
4. **Maintain boil**: Keep at a rolling boil for the duration

## Tips

- Use plenty of water for pasta and grains
- Don't overcrowd the pot
- Start timing once water returns to boil
- Use a lid to speed up the process`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["simmering", "blanching"],
  },
  {
    id: "sauteing",
    name: "Sautéing",
    slug: "sauteing",
    category: "technique",
    description: "Master the quick-cooking method that brings out flavors through high heat and constant motion.",
    content: `# Sautéing

Sautéing cooks food quickly in a small amount of fat over high heat with constant motion.

## Technique

1. **Heat the pan**: Preheat over medium-high to high heat
2. **Add fat**: Use oil or butter (butter burns at high heat, use clarified butter or oil)
3. **Add ingredients**: Add food in a single layer
4. **Keep moving**: Constantly toss or stir to prevent burning
5. **Cook quickly**: Usually 2-5 minutes

## Best For

- Vegetables (mushrooms, peppers, onions)
- Tender cuts of meat
- Seafood
- Quick-cooking proteins

## Tips

- Don't overcrowd the pan
- Use a pan with sloped sides for easy tossing
- Have all ingredients prepped before starting`,
    difficulty: "intermediate",
    estimatedTime: 15,
    relatedSkills: ["stir-frying", "searing"],
  },
  {
    id: "braising",
    name: "Braising",
    slug: "braising",
    category: "technique",
    description: "Learn slow-cooking with moist heat to transform tough cuts into tender, flavorful dishes.",
    content: `# Braising

Braising combines searing and slow cooking in liquid to tenderize tough cuts of meat and vegetables.

## Technique

1. **Sear first**: Brown the meat on all sides in a hot pan
2. **Add aromatics**: Add vegetables, herbs, and spices
3. **Add liquid**: Cover 1/3 to 1/2 of the meat with liquid (wine, stock, or water)
4. **Cover and cook**: Cover tightly and cook low and slow (300-325°F)
5. **Finish in oven**: Transfer to oven for even heat distribution

## Best For

- Tough cuts of meat (chuck, brisket, short ribs)
- Root vegetables
- Hearty greens (collards, kale)

## Tips

- Use a heavy-bottomed pot with a tight-fitting lid
- Don't boil - keep at a gentle simmer
- Cook until fork-tender`,
    difficulty: "advanced",
    estimatedTime: 30,
    relatedSkills: ["roasting", "stewing"],
  },
  {
    id: "roasting",
    name: "Roasting",
    slug: "roasting",
    category: "technique",
    description: "Master dry-heat cooking in the oven for caramelized, flavorful results.",
    content: `# Roasting

Roasting uses dry heat in an oven to cook food, creating caramelization and concentrated flavors.

## Technique

1. **Preheat oven**: Always preheat to the correct temperature
2. **Prepare ingredients**: Cut uniformly for even cooking
3. **Season well**: Use oil, salt, and spices
4. **Single layer**: Don't overcrowd the pan
5. **Roast until done**: Check internal temperature for meat

## Best For

- Large cuts of meat
- Whole vegetables
- Root vegetables
- Poultry

## Tips

- Use a roasting pan with a rack for air circulation
- Baste for moisture and flavor
- Let meat rest after roasting
- Use a meat thermometer for accuracy`,
    difficulty: "intermediate",
    estimatedTime: 20,
    relatedSkills: ["baking", "grilling"],
  },
  {
    id: "baking",
    name: "Baking",
    slug: "baking",
    category: "technique",
    description: "Understand the science and art of baking for perfect breads, pastries, and casseroles.",
    content: `# Baking

Baking uses dry heat in an enclosed oven to cook food, essential for breads, pastries, and casseroles.

## Key Principles

1. **Temperature control**: Oven temperature is critical
2. **Timing**: Follow recipes precisely, especially for baked goods
3. **Preheating**: Always preheat the oven
4. **Positioning**: Use the correct oven rack position

## Best For

- Breads and pastries
- Casseroles and gratins
- Baked desserts
- En croute dishes

## Tips

- Use an oven thermometer to verify temperature
- Rotate pans halfway through for even baking
- Don't open the oven door too often
- Let baked goods cool properly before serving`,
    difficulty: "intermediate",
    estimatedTime: 25,
    relatedSkills: ["roasting"],
  },
  {
    id: "grilling",
    name: "Grilling",
    slug: "grilling",
    category: "technique",
    description: "Master outdoor cooking with direct and indirect heat for smoky, charred flavors.",
    content: `# Grilling

Grilling uses direct or indirect heat to cook food, creating distinctive charred flavors and grill marks.

## Direct vs Indirect Heat

- **Direct**: Food directly over heat source (for quick-cooking items)
- **Indirect**: Food away from heat source (for larger, slower-cooking items)

## Technique

1. **Preheat grill**: Heat for 10-15 minutes
2. **Clean grates**: Clean while hot
3. **Oil grates**: Prevent sticking
4. **Cook to temperature**: Use a thermometer
5. **Rest before serving**: Let meat rest after grilling

## Best For

- Steaks, burgers, and chops
- Vegetables
- Seafood
- Poultry

## Tips

- Create heat zones (hot and cool)
- Don't move food too much - let it develop a sear
- Use a lid for indirect grilling
- Keep a spray bottle of water for flare-ups`,
    difficulty: "intermediate",
    estimatedTime: 20,
    relatedSkills: ["roasting", "searing"],
  },
  {
    id: "steaming",
    name: "Steaming",
    slug: "steaming",
    category: "technique",
    description: "Learn gentle cooking with steam to preserve nutrients and delicate flavors.",
    content: `# Steaming

Steaming cooks food with the heat of steam, preserving nutrients and creating tender, moist results.

## Technique

1. **Add water**: Fill steamer with water (don't let it touch the food)
2. **Bring to boil**: Heat until water is boiling
3. **Add food**: Place food in steamer basket
4. **Cover and steam**: Cover tightly and steam until done
5. **Check doneness**: Test with a fork or knife

## Best For

- Vegetables (especially delicate ones)
- Seafood and fish
- Dumplings and buns
- Eggs

## Tips

- Don't let water boil dry
- Keep water at a steady boil
- Don't overcook - vegetables should be bright and crisp-tender
- Season after steaming for best flavor`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["boiling"],
  },
  {
    id: "simmering",
    name: "Simmering",
    slug: "simmering",
    category: "technique",
    description: "Master gentle cooking in liquid just below boiling for soups, stocks, and braises.",
    content: `# Simmering

Simmering cooks food in liquid at 180-200°F, just below boiling, for gentle, even cooking.

## Technique

1. **Bring to boil**: Start with a rolling boil
2. **Reduce heat**: Lower to maintain gentle bubbles
3. **Maintain temperature**: Keep at a steady simmer
4. **Skim if needed**: Remove foam or impurities
5. **Cook until done**: Check doneness regularly

## Best For

- Stocks and broths
- Soups and stews
- Poaching eggs
- Cooking grains

## Tips

- A true simmer has small bubbles, not large ones
- Use a lid partially to control temperature
- Don't let it come to a full boil
- Stir occasionally to prevent sticking`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["boiling", "braising"],
  },
  {
    id: "searing",
    name: "Searing",
    slug: "searing",
    category: "technique",
    description: "Create a perfect crust on meats and vegetables for maximum flavor.",
    content: `# Searing

Searing browns the surface of food at high heat, creating a flavorful crust through the Maillard reaction.

## Technique

1. **Heat the pan**: Use high heat (cast iron works best)
2. **Dry the surface**: Pat food completely dry
3. **Add fat**: Use oil with high smoke point
4. **Sear without moving**: Let develop a crust (2-3 minutes)
5. **Flip and repeat**: Sear all sides

## Best For

- Steaks and chops
- Chicken and fish
- Vegetables (mushrooms, onions)
- Starting braises and stews

## Tips

- Don't move food too early - let it release naturally
- Use enough oil to prevent sticking
- Work in batches to avoid overcrowding
- Let meat come to room temperature first`,
    difficulty: "intermediate",
    estimatedTime: 15,
    relatedSkills: ["sauteing", "roasting"],
  },
  {
    id: "blanching",
    name: "Blanching",
    slug: "blanching",
    category: "technique",
    description: "Quick-cook and shock vegetables to preserve color, texture, and nutrients.",
    content: `# Blanching

Blanching briefly cooks vegetables in boiling water, then shocks them in ice water to stop cooking.

## Technique

1. **Boil water**: Bring large pot of salted water to boil
2. **Prepare ice bath**: Large bowl of ice water
3. **Blanch briefly**: Cook 30 seconds to 2 minutes
4. **Shock immediately**: Transfer to ice water
5. **Drain well**: Remove excess water

## Best For

- Vegetables before freezing
- Preparing vegetables for salads
- Brightening green vegetables
- Peeling tomatoes and peaches

## Tips

- Use plenty of water
- Don't overcook - vegetables should be crisp-tender
- Shock immediately to preserve color
- Dry well after shocking`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["boiling"],
  },
  {
    id: "stir-frying",
    name: "Stir-Frying",
    slug: "stir-frying",
    category: "technique",
    description: "Master high-heat, quick-cooking Asian technique for crisp, flavorful vegetables and proteins.",
    content: `# Stir-Frying

Stir-frying cooks food quickly over very high heat with constant stirring, creating wok hei (breath of the wok).

## Technique

1. **Heat wok**: Get it smoking hot
2. **Add oil**: Swirl to coat
3. **Add aromatics**: Garlic, ginger, scallions first
4. **Add protein**: Cook until nearly done
5. **Add vegetables**: Hardest first, softest last
6. **Add sauce**: Toss to coat
7. **Serve immediately**: Best eaten right away

## Best For

- Asian-style dishes
- Quick vegetable sides
- Tender cuts of meat
- Seafood

## Tips

- Prep everything before starting (mise en place)
- Use a wok or large skillet
- Keep heat very high
- Don't overcook - vegetables should be crisp`,
    difficulty: "intermediate",
    estimatedTime: 20,
    relatedSkills: ["sauteing"],
  },
  {
    id: "poaching",
    name: "Poaching",
    slug: "poaching",
    category: "technique",
    description: "Learn gentle cooking in liquid for delicate proteins like eggs and fish.",
    content: `# Poaching

Poaching cooks food gently in liquid at 160-180°F, just below simmering, for tender, moist results.

## Technique

1. **Heat liquid**: Bring to a gentle simmer
2. **Add acid**: Vinegar or lemon juice helps proteins set
3. **Create vortex**: For eggs, swirl water to create a whirlpool
4. **Add food gently**: Lower into liquid carefully
5. **Cook gently**: Maintain temperature, don't boil
6. **Remove carefully**: Use a slotted spoon

## Best For

- Eggs
- Fish and seafood
- Pears and other fruits
- Chicken breast

## Tips

- Use fresh eggs for poaching
- Don't let liquid come to a full boil
- Be gentle when adding food
- Use a timer for consistency`,
    difficulty: "intermediate",
    estimatedTime: 15,
    relatedSkills: ["simmering"],
  },
  {
    id: "deep-frying",
    name: "Deep-Frying",
    slug: "deep-frying",
    category: "technique",
    description: "Master the art of deep-frying for crispy, golden results while maintaining food safety.",
    content: `# Deep-Frying

Deep-frying cooks food by submerging it in hot oil, creating a crispy exterior and moist interior.

## Technique

1. **Choose oil**: Use oil with high smoke point (peanut, canola, vegetable)
2. **Heat to temperature**: 350-375°F (use a thermometer)
3. **Dry food**: Pat food completely dry
4. **Don't overcrowd**: Fry in batches
5. **Drain well**: Use a wire rack or paper towels
6. **Season immediately**: While still hot

## Best For

- French fries and chips
- Fried chicken
- Tempura and fritters
- Donuts and churros

## Safety Tips

- Never leave hot oil unattended
- Use a deep pot (oil should be 3-4 inches deep)
- Keep a lid nearby (never use water on oil fires)
- Use a thermometer to monitor temperature
- Let oil cool completely before disposing`,
    difficulty: "advanced",
    estimatedTime: 25,
    relatedSkills: ["frying"],
  },
  {
    id: "stewing",
    name: "Stewing",
    slug: "stewing",
    category: "technique",
    description: "Create hearty, one-pot meals by slow-cooking in flavorful liquid.",
    content: `# Stewing

Stewing cooks food slowly in liquid, creating tender, flavorful one-pot meals.

## Technique

1. **Brown ingredients**: Sear meat and vegetables first
2. **Add liquid**: Cover with stock, wine, or water
3. **Bring to simmer**: Then reduce to low heat
4. **Cook slowly**: 1-3 hours until tender
5. **Thicken if needed**: Use flour, cornstarch, or reduction

## Best For

- Tough cuts of meat
- Root vegetables
- Hearty one-pot meals
- Comfort food dishes

## Tips

- Use a heavy-bottomed pot
- Don't boil - keep at a gentle simmer
- Skim fat and foam as needed
- Taste and adjust seasoning throughout`,
    difficulty: "intermediate",
    estimatedTime: 30,
    relatedSkills: ["braising", "simmering"],
  },

  // Preparation Techniques
  {
    id: "marinating",
    name: "Marinating",
    slug: "marinating",
    category: "technique",
    description: "Enhance flavor and tenderness by marinating proteins and vegetables.",
    content: `# Marinating

Marinating soaks food in a flavorful liquid to add flavor and tenderize.

## Basic Marinade Components

- **Acid**: Vinegar, citrus juice, wine (tenderizes)
- **Oil**: Helps distribute flavors and prevents sticking
- **Aromatics**: Garlic, herbs, spices (add flavor)
- **Salt**: Enhances flavor and helps penetration

## Technique

1. **Combine ingredients**: Mix marinade components
2. **Add food**: Submerge completely
3. **Marinate**: Refrigerate for appropriate time
4. **Don't over-marinate**: Can make meat mushy
5. **Pat dry**: Before cooking

## Timing Guidelines

- **Fish**: 15-30 minutes
- **Chicken**: 2-4 hours
- **Beef**: 4-24 hours
- **Vegetables**: 30 minutes to 2 hours

## Tips

- Use non-reactive containers (glass, plastic, stainless steel)
- Don't reuse marinade that touched raw meat
- Marinate in the refrigerator
- Turn food occasionally for even distribution`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["seasoning"],
  },
  {
    id: "seasoning",
    name: "Seasoning",
    slug: "seasoning",
    category: "technique",
    description: "Master the art of seasoning to bring out the best flavors in your dishes.",
    content: `# Seasoning

Seasoning enhances and balances flavors in food using salt, pepper, herbs, and spices.

## Basic Seasoning

- **Salt**: Enhances natural flavors (use kosher or sea salt)
- **Pepper**: Adds heat and complexity (freshly ground is best)
- **Acid**: Brightens flavors (lemon, vinegar)
- **Herbs**: Fresh or dried, add at different times
- **Spices**: Toast whole spices for maximum flavor

## When to Season

- **Before cooking**: Salt meat and vegetables ahead of time
- **During cooking**: Add herbs and spices as you cook
- **At the end**: Adjust final seasoning, add fresh herbs

## Tips

- Taste as you go
- Season in layers
- Use salt to balance sweetness
- Don't be afraid of salt - it's essential
- Fresh herbs at the end, dried herbs earlier`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["marinating"],
  },
  {
    id: "tempering",
    name: "Tempering",
    slug: "tempering",
    category: "technique",
    description: "Learn to gradually heat ingredients to prevent curdling and ensure smooth textures.",
    content: `# Tempering

Tempering gradually raises the temperature of sensitive ingredients to prevent curdling or breaking.

## Common Uses

- Adding eggs to hot liquids (for custards, sauces)
- Melting chocolate
- Adding dairy to hot mixtures

## Technique (for eggs)

1. **Heat base**: Warm your liquid base
2. **Whisk eggs**: Beat eggs in a separate bowl
3. **Add hot liquid slowly**: Drizzle hot liquid into eggs while whisking
4. **Return to heat**: Add tempered mixture back to pot
5. **Cook gently**: Don't let it boil

## Tips

- Go slowly - rushing causes curdling
- Whisk constantly
- Use room temperature eggs
- Don't let the mixture boil after tempering`,
    difficulty: "advanced",
    estimatedTime: 20,
    relatedSkills: ["whisking"],
  },
  {
    id: "whisking",
    name: "Whisking",
    slug: "whisking",
    category: "technique",
    description: "Master whisking techniques for sauces, dressings, and aerated mixtures.",
    content: `# Whisking

Whisking incorporates air, combines ingredients, and creates smooth, light textures.

## Types of Whisks

- **Ball whisk**: All-purpose, good for most tasks
- **French whisk**: Narrow, for small bowls
- **Flat whisk**: For sauces in pans
- **Balloon whisk**: For whipping cream and eggs

## Techniques

- **Circular motion**: For general mixing
- **Figure-8 motion**: For incorporating air
- **Side-to-side**: For breaking up lumps

## Best For

- Salad dressings and vinaigrettes
- Sauces and gravies
- Whipping cream and eggs
- Combining dry ingredients

## Tips

- Use the right size whisk for your bowl
- Whisk in one direction for best results
- Don't over-whisk (can break emulsions)
- Clean immediately - dried-on food is hard to remove`,
    difficulty: "beginner",
    estimatedTime: 10,
    relatedSkills: ["emulsifying"],
  },
  {
    id: "emulsifying",
    name: "Emulsifying",
    slug: "emulsifying",
    category: "technique",
    description: "Create stable emulsions for mayonnaise, vinaigrettes, and creamy sauces.",
    content: `# Emulsifying

Emulsifying combines two liquids that don't normally mix (like oil and vinegar) into a stable mixture.

## Technique

1. **Start with base**: Begin with the heavier liquid (vinegar, egg yolk)
2. **Add oil slowly**: Drizzle oil in a thin stream while whisking
3. **Whisk constantly**: Keep the mixture moving
4. **Add gradually**: Don't rush - slow and steady wins
5. **Stabilize**: Add an emulsifier if needed (mustard, egg yolk)

## Common Emulsions

- **Mayonnaise**: Oil + egg yolk + acid
- **Vinaigrette**: Oil + vinegar + mustard
- **Hollandaise**: Butter + egg yolk + acid
- **Aioli**: Oil + garlic + egg yolk

## Tips

- All ingredients should be room temperature
- Whisk in one direction
- If it breaks, start over with a fresh base
- Add a little of the broken mixture to the new base`,
    difficulty: "advanced",
    estimatedTime: 25,
    relatedSkills: ["whisking"],
  },
  {
    id: "reducing",
    name: "Reducing",
    slug: "reducing",
    category: "technique",
    description: "Concentrate flavors by reducing liquids to create rich sauces and glazes.",
    content: `# Reducing

Reducing evaporates water from a liquid, concentrating flavors and thickening the mixture.

## Technique

1. **Start with liquid**: Stock, wine, or sauce
2. **Simmer uncovered**: Allow water to evaporate
3. **Stir occasionally**: Prevent sticking and burning
4. **Reduce to desired consistency**: Usually 1/2 to 1/3 original volume
5. **Season at the end**: Flavors concentrate, so season carefully

## Best For

- Pan sauces
- Glazes
- Syrups
- Concentrated stocks

## Tips

- Use a wide pan for faster reduction
- Don't over-reduce - can become too salty
- Taste frequently
- Can take 10-30 minutes depending on volume
- Add butter or cream at the end for richness`,
    difficulty: "intermediate",
    estimatedTime: 20,
    relatedSkills: ["simmering"],
  },
  {
    id: "caramelizing",
    name: "Caramelizing",
    slug: "caramelizing",
    category: "technique",
    description: "Transform sugars through heat to create deep, complex flavors and golden colors.",
    content: `# Caramelizing

Caramelizing breaks down sugars through heat, creating rich, complex flavors and golden-brown color.

## Types

- **Dry caramelizing**: Melting sugar alone (for desserts)
- **Wet caramelizing**: With water (easier, less likely to burn)
- **Vegetable caramelization**: Cooking vegetables until sugars brown

## Technique (for onions)

1. **Slice uniformly**: Even slices cook evenly
2. **Heat pan**: Medium-low heat
3. **Add fat**: Butter or oil
4. **Cook slowly**: 20-40 minutes, stirring occasionally
5. **Be patient**: Low and slow is key

## Best For

- Onions (classic caramelized onions)
- Sugar (for caramel sauce)
- Vegetables (carrots, fennel)
- Fruits (apples, pears)

## Tips

- Low heat prevents burning
- Don't rush - true caramelization takes time
- Add a pinch of salt to help draw out moisture
- Deglaze with wine or stock for pan sauces`,
    difficulty: "intermediate",
    estimatedTime: 25,
    relatedSkills: ["sautéing"],
  },

  // Equipment Skills
  {
    id: "mandoline",
    name: "Using a Mandoline",
    slug: "mandoline",
    category: "equipment",
    description: "Safely use a mandoline to create uniform slices and julienne cuts.",
    content: `# Using a Mandoline

A mandoline creates perfectly uniform slices, julienne, and waffle cuts with speed and precision.

## Safety First

- **Always use the guard**: Never use without the food holder
- **Watch your fingers**: Keep hands away from the blade
- **Use a stable surface**: Secure the mandoline
- **Cut away from you**: Position blade away from your body

## Technique

1. **Set thickness**: Adjust blade to desired thickness
2. **Secure mandoline**: Place on stable surface
3. **Use guard**: Always use the food holder
4. **Slice with even pressure**: Push down smoothly
5. **Stop before the end**: Don't slice the last bit

## Best For

- Potatoes (for chips, gratins)
- Vegetables (for salads, pickles)
- Fruits (for tarts, garnishes)
- Creating uniform cuts quickly

## Tips

- Keep blades sharp
- Clean immediately after use
- Store safely with blade guard
- Use for large quantities`,
    difficulty: "intermediate",
    estimatedTime: 15,
    relatedSkills: ["slicing", "julienne"],
  },
  {
    id: "mortar-pestle",
    name: "Mortar and Pestle",
    slug: "mortar-pestle",
    category: "equipment",
    description: "Master the traditional tool for grinding spices, making pastes, and releasing flavors.",
    content: `# Mortar and Pestle

A mortar and pestle grinds and crushes ingredients, releasing essential oils and creating pastes.

## Types

- **Granite**: Heavy, best for hard spices
- **Marble**: Smooth, good for pastes
- **Ceramic**: Lightweight, for herbs
- **Wood**: Traditional, for lighter grinding

## Technique

1. **Add ingredients**: Start with hardest ingredients
2. **Grind in circles**: Use circular motion
3. **Add softer ingredients**: Gradually add
4. **Work to paste**: Continue until desired consistency
5. **Scrape sides**: Use pestle to scrape down sides

## Best For

- Grinding spices (fresh is best)
- Making pastes (garlic, ginger, curry)
- Crushing herbs
- Making pesto and aioli

## Tips

- Use a grinding motion, not pounding
- Work in small batches
- Clean thoroughly (spices can linger)
- Season new mortar with rice before first use`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["mincing"],
  },
  {
    id: "food-processor",
    name: "Food Processor",
    slug: "food-processor",
    category: "equipment",
    description: "Efficiently use a food processor for chopping, pureeing, and mixing.",
    content: `# Food Processor

A food processor quickly chops, purees, and mixes ingredients with precision and speed.

## Attachments

- **S-blade**: Chopping, pureeing, mixing
- **Shredding disc**: For vegetables and cheese
- **Slicing disc**: Uniform slices

## Technique

1. **Prep ingredients**: Cut to fit feed tube
2. **Pulse, don't puree**: Use pulse for control
3. **Work in batches**: Don't overcrowd
4. **Scrape sides**: Stop and scrape as needed
5. **Don't over-process**: Can become mushy

## Best For

- Chopping large quantities
- Making pesto and sauces
- Pureeing soups
- Making doughs and batters

## Tips

- Use pulse for better control
- Don't process too long (creates heat)
- Keep blade sharp
- Clean immediately (food dries and sticks)`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["chopping"],
  },
  {
    id: "stand-mixer",
    name: "Stand Mixer",
    slug: "stand-mixer",
    category: "equipment",
    description: "Master your stand mixer for baking, whipping, and kneading.",
    content: `# Stand Mixer

A stand mixer handles heavy mixing tasks hands-free, essential for serious bakers.

## Attachments

- **Paddle**: Mixing, creaming
- **Whisk**: Whipping, aerating
- **Dough hook**: Kneading bread

## Technique

1. **Start slow**: Begin on low speed
2. **Scrape bowl**: Stop and scrape sides
3. **Increase speed gradually**: Don't jump to high
4. **Watch for over-mixing**: Stop when done
5. **Clean attachments**: Immediately after use

## Best For

- Bread dough
- Whipping cream and egg whites
- Mixing batters
- Creaming butter and sugar

## Tips

- Use correct attachment for task
- Don't walk away - watch the process
- Lock head before starting
- Use correct speed (low for heavy, high for light)`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["whisking", "kneading"],
  },
  {
    id: "cast-iron",
    name: "Cast Iron Cooking",
    slug: "cast-iron",
    category: "equipment",
    description: "Care for and cook with cast iron for superior heat retention and non-stick properties.",
    content: `# Cast Iron Cooking

Cast iron provides even heat distribution, excellent searing, and can go from stovetop to oven.

## Seasoning

1. **Clean thoroughly**: Remove all rust and old seasoning
2. **Apply oil**: Thin layer of vegetable oil
3. **Bake upside down**: 450°F for 1 hour
4. **Cool in oven**: Let cool completely
5. **Repeat**: Build up layers of seasoning

## Cooking

- **Preheat slowly**: Let pan heat gradually
- **Use enough fat**: Prevents sticking
- **Don't use high heat**: Medium-high is usually enough
- **Clean while warm**: Easier to clean
- **Dry completely**: Prevent rust

## Best For

- Searing steaks
- Frying and pan-frying
- Baking (cornbread, frittatas)
- One-pan meals

## Care Tips

- Never soak in water
- Don't use soap (usually)
- Dry thoroughly after cleaning
- Store with paper towel inside
- Re-season if needed`,
    difficulty: "intermediate",
    estimatedTime: 25,
    relatedSkills: ["searing", "roasting"],
  },
  {
    id: "wok",
    name: "Wok Cooking",
    slug: "wok",
    category: "equipment",
    description: "Master wok cooking for authentic stir-fries with proper heat control and technique.",
    content: `# Wok Cooking

A wok's shape and material create the perfect environment for stir-frying with high heat and quick cooking.

## Types

- **Carbon steel**: Traditional, best for high heat
- **Stainless steel**: Easier maintenance
- **Non-stick**: For lower heat cooking

## Seasoning (carbon steel)

1. **Scrub**: Remove protective coating
2. **Heat**: Heat over high flame
3. **Oil**: Swirl oil to coat
4. **Repeat**: Build up seasoning layers

## Technique

1. **Heat wok**: Get it smoking hot
2. **Add oil**: Swirl to coat
3. **Cook in order**: Aromatics, protein, vegetables
4. **Keep moving**: Constant stirring
5. **Serve hot**: Best eaten immediately

## Best For

- Stir-fries
- Deep-frying
- Steaming (with steamer insert)
- One-pot meals

## Tips

- Use high heat (gas is best)
- Prep everything first
- Don't overcrowd
- Work quickly
- Clean while hot`,
    difficulty: "intermediate",
    estimatedTime: 20,
    relatedSkills: ["stir-frying"],
  },

  // Nutrition Skills
  {
    id: "macronutrients",
    name: "Understanding Macronutrients",
    slug: "macronutrients",
    category: "nutrition",
    description: "Learn about proteins, carbohydrates, and fats and their roles in nutrition.",
    content: `# Understanding Macronutrients

Macronutrients are the three main nutrients your body needs in large amounts: protein, carbohydrates, and fats.

## Protein

- **Function**: Builds and repairs tissues, makes enzymes and hormones
- **Sources**: Meat, fish, eggs, dairy, legumes, nuts
- **Calories**: 4 per gram
- **Daily need**: 0.8g per kg body weight (minimum)

## Carbohydrates

- **Function**: Primary energy source for body and brain
- **Types**: Simple (sugars) and complex (starches, fiber)
- **Sources**: Grains, fruits, vegetables, legumes
- **Calories**: 4 per gram
- **Daily need**: 45-65% of total calories

## Fats

- **Function**: Energy storage, vitamin absorption, hormone production
- **Types**: Saturated, unsaturated, trans
- **Sources**: Oils, nuts, seeds, avocado, fatty fish
- **Calories**: 9 per gram
- **Daily need**: 20-35% of total calories

## Balancing Macros

- No one-size-fits-all ratio
- Depends on goals (weight loss, muscle gain, maintenance)
- Quality matters more than exact ratios
- Focus on whole foods`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["protein", "carbohydrates", "fats"],
  },
  {
    id: "protein",
    name: "Protein in Cooking",
    slug: "protein",
    category: "nutrition",
    description: "Understand protein sources, cooking methods, and nutritional benefits.",
    content: `# Protein in Cooking

Protein is essential for building and maintaining muscle, and it's found in many delicious foods.

## Complete vs Incomplete Proteins

- **Complete**: Contains all essential amino acids (animal proteins, quinoa, soy)
- **Incomplete**: Missing some amino acids (most plant proteins)
- **Solution**: Combine plant proteins (rice + beans = complete)

## Best Sources

- **Animal**: Chicken, fish, eggs, lean beef, pork
- **Plant**: Beans, lentils, tofu, tempeh, nuts, seeds
- **Dairy**: Greek yogurt, cottage cheese, milk

## Cooking Tips

- Don't overcook (becomes tough)
- Use marinades to tenderize
- Rest meat after cooking
- Cook to proper temperature for safety

## Daily Recommendations

- Sedentary: 0.8g per kg body weight
- Active: 1.2-1.7g per kg body weight
- Athletes: 1.6-2.2g per kg body weight`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["macronutrients"],
  },
  {
    id: "carbohydrates",
    name: "Carbohydrates Explained",
    slug: "carbohydrates",
    category: "nutrition",
    description: "Learn about simple and complex carbs, their roles, and best sources.",
    content: `# Carbohydrates Explained

Carbohydrates are your body's primary energy source, but not all carbs are created equal.

## Simple Carbohydrates

- **What**: Sugars (glucose, fructose, sucrose)
- **Sources**: Fruits, honey, table sugar, refined grains
- **Effect**: Quick energy, blood sugar spike
- **When to eat**: Before/during exercise, post-workout

## Complex Carbohydrates

- **What**: Starches and fiber
- **Sources**: Whole grains, legumes, vegetables
- **Effect**: Sustained energy, stable blood sugar
- **When to eat**: Throughout the day

## Fiber

- **Soluble**: Dissolves in water (oats, beans, apples)
- **Insoluble**: Doesn't dissolve (whole grains, vegetables)
- **Benefits**: Digestive health, satiety, blood sugar control
- **Daily need**: 25-30g

## Best Choices

- Whole grains (brown rice, quinoa, oats)
- Legumes (beans, lentils)
- Vegetables (especially starchy: sweet potatoes, corn)
- Fruits (whole fruits, not juice)

## Tips

- Choose whole over refined
- Pair with protein and fat for balance
- Time carbs around activity
- Don't fear carbs - they're essential`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["macronutrients", "fiber"],
  },
  {
    id: "fats",
    name: "Healthy Fats",
    slug: "fats",
    category: "nutrition",
    description: "Understand different types of fats and how to incorporate healthy fats into your diet.",
    content: `# Healthy Fats

Fats are essential for health, but the type of fat matters more than the amount.

## Types of Fats

### Unsaturated Fats (Healthy)

- **Monounsaturated**: Olive oil, avocado, nuts
- **Polyunsaturated**: Fish, walnuts, flaxseeds
- **Omega-3**: Fatty fish, chia seeds, walnuts
- **Omega-6**: Vegetable oils, seeds

### Saturated Fats

- **Sources**: Red meat, butter, full-fat dairy
- **Recommendation**: Limit to 10% of calories
- **Note**: Not all saturated fat is equal

### Trans Fats (Avoid)

- **Sources**: Processed foods, fried foods
- **Health impact**: Increases heart disease risk
- **Label check**: "Partially hydrogenated" = trans fat

## Best Sources

- Fatty fish (salmon, mackerel, sardines)
- Nuts and seeds
- Avocado
- Olive oil
- Dark chocolate (in moderation)

## Cooking with Fats

- Use olive oil for low-medium heat
- Use avocado/coconut oil for high heat
- Butter for flavor (moderate heat)
- Avoid overheating (creates harmful compounds)`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["macronutrients"],
  },
  {
    id: "fiber",
    name: "Dietary Fiber",
    slug: "fiber",
    category: "nutrition",
    description: "Learn about fiber types, benefits, and how to increase fiber in your diet.",
    content: `# Dietary Fiber

Fiber is a type of carbohydrate that your body can't digest, but it's crucial for health.

## Types of Fiber

### Soluble Fiber

- **Dissolves in water**: Forms gel-like substance
- **Benefits**: Lowers cholesterol, regulates blood sugar
- **Sources**: Oats, beans, apples, citrus fruits

### Insoluble Fiber

- **Doesn't dissolve**: Adds bulk to stool
- **Benefits**: Promotes regularity, prevents constipation
- **Sources**: Whole grains, vegetables, nuts

## Health Benefits

- Digestive health
- Heart health (lowers cholesterol)
- Blood sugar control
- Weight management (increases satiety)
- Gut health (feeds beneficial bacteria)

## Daily Recommendations

- **Men**: 30-38g per day
- **Women**: 21-25g per day
- **Most people**: Get only 15g per day

## Increasing Fiber

- Start slowly (prevents digestive upset)
- Drink plenty of water
- Choose whole grains
- Eat more fruits and vegetables
- Add legumes to meals
- Snack on nuts and seeds

## Tips

- Increase gradually
- Stay hydrated
- Get fiber from food, not supplements
- Mix soluble and insoluble sources`,
    difficulty: "beginner",
    estimatedTime: 15,
    relatedSkills: ["carbohydrates"],
  },
  {
    id: "vitamins",
    name: "Vitamins and Minerals",
    slug: "vitamins",
    category: "nutrition",
    description: "Understand essential vitamins and minerals and their food sources.",
    content: `# Vitamins and Minerals

Vitamins and minerals are micronutrients essential for health, found in a variety of foods.

## Fat-Soluble Vitamins

- **Vitamin A**: Vision, immune function (sweet potatoes, carrots, spinach)
- **Vitamin D**: Bone health, immune function (fatty fish, eggs, sunlight)
- **Vitamin E**: Antioxidant (nuts, seeds, vegetable oils)
- **Vitamin K**: Blood clotting, bone health (leafy greens, broccoli)

## Water-Soluble Vitamins

- **Vitamin C**: Immune function, collagen (citrus, bell peppers, broccoli)
- **B Vitamins**: Energy metabolism (whole grains, meat, legumes)
  - B12: Only in animal products (important for vegetarians)

## Key Minerals

- **Calcium**: Bone health (dairy, leafy greens, fortified foods)
- **Iron**: Oxygen transport (red meat, beans, spinach)
- **Magnesium**: Muscle function, energy (nuts, seeds, whole grains)
- **Zinc**: Immune function (meat, shellfish, legumes)
- **Potassium**: Blood pressure (bananas, potatoes, beans)

## Getting Enough

- Eat a varied diet
- Focus on whole foods
- Include colorful fruits and vegetables
- Consider supplements if deficient (consult doctor)
- Some nutrients need others for absorption (vitamin C helps iron)`,
    difficulty: "beginner",
    estimatedTime: 25,
    relatedSkills: ["antioxidants"],
  },
  {
    id: "antioxidants",
    name: "Antioxidants",
    slug: "antioxidants",
    category: "nutrition",
    description: "Learn about antioxidants, their benefits, and antioxidant-rich foods.",
    content: `# Antioxidants

Antioxidants protect your cells from damage caused by free radicals, reducing disease risk.

## What Are Antioxidants?

- **Free radicals**: Unstable molecules that damage cells
- **Antioxidants**: Neutralize free radicals
- **Oxidative stress**: Imbalance that leads to disease

## Key Antioxidants

- **Vitamin C**: Citrus, berries, bell peppers
- **Vitamin E**: Nuts, seeds, vegetable oils
- **Beta-carotene**: Carrots, sweet potatoes, leafy greens
- **Lycopene**: Tomatoes, watermelon
- **Flavonoids**: Berries, tea, dark chocolate
- **Selenium**: Brazil nuts, seafood

## Health Benefits

- Reduce inflammation
- Lower heart disease risk
- May reduce cancer risk
- Support brain health
- Slow aging process

## Best Sources

- **Berries**: Blueberries, strawberries, raspberries
- **Dark leafy greens**: Spinach, kale, collards
- **Nuts**: Walnuts, almonds
- **Dark chocolate**: 70%+ cocoa
- **Tea**: Green and black tea
- **Spices**: Turmeric, cinnamon, oregano

## Tips

- Eat a rainbow of colors
- Don't rely on supplements (food is better)
- Cook some vegetables (increases some antioxidants)
- Eat raw some vegetables (preserves others)
- Variety is key`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["vitamins"],
  },
  {
    id: "omega-3",
    name: "Omega-3 Fatty Acids",
    slug: "omega-3",
    category: "nutrition",
    description: "Understand omega-3 benefits, sources, and how to get enough in your diet.",
    content: `# Omega-3 Fatty Acids

Omega-3s are essential fatty acids crucial for brain and heart health.

## Types of Omega-3

- **ALA** (Alpha-linolenic acid): Plant sources, body converts to EPA/DHA
- **EPA** (Eicosapentaenoic acid): Fish sources, anti-inflammatory
- **DHA** (Docosahexaenoic acid): Fish sources, brain health

## Health Benefits

- Heart health (reduces triglycerides, lowers blood pressure)
- Brain function and development
- Reduces inflammation
- May improve mental health
- Supports eye health

## Best Sources

- **Fatty fish**: Salmon, mackerel, sardines, herring (best source of EPA/DHA)
- **Plant sources**: Flaxseeds, chia seeds, walnuts, hemp seeds (ALA)
- **Algae**: For vegetarians (DHA)
- **Fish oil**: Supplements

## Recommendations

- **Fish**: 2 servings per week (3.5oz each)
- **ALA**: 1.6g per day (men), 1.1g per day (women)
- **EPA/DHA**: 250-500mg combined per day

## Tips

- Choose low-mercury fish (salmon, sardines)
- Limit high-mercury fish (tuna, swordfish)
- Plant sources need conversion (less efficient)
- Consider supplements if you don't eat fish
- Store fish oil supplements in fridge`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["fats"],
  },

  // Health Skills
  {
    id: "heart-healthy",
    name: "Heart-Healthy Cooking",
    slug: "heart-healthy",
    category: "health",
    description: "Learn cooking techniques and ingredient choices that support heart health.",
    content: `# Heart-Healthy Cooking

Heart-healthy cooking focuses on reducing saturated fat, sodium, and processed foods while increasing nutrients.

## Key Principles

- **Reduce saturated fat**: Choose lean proteins, limit red meat
- **Increase omega-3s**: Eat fatty fish regularly
- **Limit sodium**: Use herbs and spices instead
- **Increase fiber**: Whole grains, fruits, vegetables
- **Choose healthy fats**: Olive oil, avocado, nuts

## Cooking Methods

- **Steaming**: Preserves nutrients, no added fat
- **Grilling**: Fat drips away
- **Roasting**: Use minimal oil
- **Stir-frying**: Quick, uses less oil
- **Poaching**: No added fat needed

## Best Ingredients

- **Proteins**: Fish, skinless poultry, legumes
- **Grains**: Oats, quinoa, brown rice
- **Vegetables**: Leafy greens, colorful vegetables
- **Fats**: Olive oil, avocado, nuts
- **Herbs and spices**: Replace salt

## Tips

- Remove skin from poultry
- Trim visible fat from meat
- Use cooking spray instead of butter
- Read labels for sodium content
- Make your own sauces and dressings
- Focus on whole foods`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["low-sodium", "omega-3"],
  },
  {
    id: "low-sodium",
    name: "Low-Sodium Cooking",
    slug: "low-sodium",
    category: "health",
    description: "Reduce sodium in your cooking while maintaining flavor through herbs, spices, and techniques.",
    content: `# Low-Sodium Cooking

Reducing sodium doesn't mean sacrificing flavor - it means getting creative with seasonings.

## Why Reduce Sodium?

- **High blood pressure**: Major risk factor
- **Heart disease**: Increases risk
- **Kidney health**: Reduces strain
- **Water retention**: Causes bloating

## Daily Recommendations

- **General**: Less than 2,300mg per day
- **High risk**: Less than 1,500mg per day
- **Average intake**: 3,400mg per day (too high!)

## Flavor Alternatives

- **Acid**: Lemon, lime, vinegar brighten flavors
- **Herbs**: Fresh herbs add complexity
- **Spices**: Cumin, paprika, turmeric add depth
- **Aromatics**: Garlic, onion, ginger
- **Umami**: Mushrooms, tomatoes, soy sauce (low-sodium)

## Cooking Tips

- **Don't salt while cooking**: Add at the end
- **Use salt-free seasonings**: Many blends available
- **Rinse canned foods**: Reduces sodium by 40%
- **Make your own stocks**: Control the salt
- **Read labels**: Sodium hides in unexpected places

## High-Sodium Foods to Limit

- Processed foods
- Canned soups and vegetables
- Deli meats
- Cheese
- Condiments (ketchup, soy sauce)
- Restaurant food`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["heart-healthy", "seasoning"],
  },
  {
    id: "low-carb",
    name: "Low-Carb Cooking",
    slug: "low-carb",
    category: "health",
    description: "Learn to cook delicious low-carb meals while maintaining nutrition and flavor.",
    content: `# Low-Carb Cooking

Low-carb cooking focuses on reducing carbohydrates while maintaining flavor and nutrition.

## What Is Low-Carb?

- **Strict**: 20-50g carbs per day (keto)
- **Moderate**: 50-100g carbs per day
- **Liberal**: 100-150g carbs per day
- **Standard diet**: 200-300g carbs per day

## Low-Carb Ingredients

- **Proteins**: All meats, fish, eggs
- **Vegetables**: Leafy greens, broccoli, cauliflower, zucchini
- **Fats**: Oils, butter, avocado, nuts
- **Dairy**: Cheese, cream, Greek yogurt (in moderation)
- **Fruits**: Berries (in moderation)

## Cooking Techniques

- **Roasting**: Brings out natural flavors
- **Grilling**: Adds flavor without carbs
- **Sautéing**: Quick and flavorful
- **Steaming**: Preserves nutrients
- **Spiralizing**: Makes vegetables into "noodles"

## Substitutions

- **Cauliflower rice**: Instead of rice
- **Zucchini noodles**: Instead of pasta
- **Lettuce wraps**: Instead of bread
- **Almond flour**: Instead of wheat flour
- **Stevia/monk fruit**: Instead of sugar

## Tips

- Focus on whole foods
- Read labels (carbs hide everywhere)
- Meal prep helps
- Don't forget vegetables (they have carbs but are nutritious)
- Stay hydrated
- Get enough fiber`,
    difficulty: "intermediate",
    estimatedTime: 25,
    relatedSkills: ["keto"],
  },
  {
    id: "keto",
    name: "Keto Cooking",
    slug: "keto",
    category: "health",
    description: "Master ketogenic cooking with high-fat, low-carb recipes and techniques.",
    content: `# Keto Cooking

The ketogenic diet is very low-carb (20-50g per day) and high-fat, putting your body into ketosis.

## Keto Macros

- **Carbs**: 5-10% of calories (20-50g per day)
- **Protein**: 20-25% of calories
- **Fat**: 70-75% of calories

## Keto-Friendly Foods

- **Proteins**: All meats, fish, eggs
- **Fats**: Oils, butter, avocado, coconut oil
- **Vegetables**: Leafy greens, broccoli, cauliflower, zucchini (low-carb)
- **Dairy**: Full-fat cheese, cream, butter
- **Nuts**: Almonds, walnuts, macadamias (in moderation)

## Foods to Avoid

- Grains (wheat, rice, oats)
- Sugar and sweeteners (except stevia, monk fruit, erythritol)
- Most fruits (except small amounts of berries)
- Starchy vegetables (potatoes, corn, peas)
- Legumes (beans, lentils)

## Cooking Tips

- **Use healthy fats**: Olive oil, avocado oil, coconut oil
- **Don't fear fat**: It's your primary energy source
- **Watch hidden carbs**: In sauces, condiments, processed foods
- **Meal prep**: Essential for success
- **Stay hydrated**: Important for ketosis

## Common Mistakes

- Not eating enough fat
- Eating too much protein
- Not tracking carbs accurately
- Not getting enough electrolytes
- Giving up too soon (keto flu is temporary)`,
    difficulty: "advanced",
    estimatedTime: 30,
    relatedSkills: ["low-carb"],
  },
  {
    id: "vegan",
    name: "Vegan Cooking",
    slug: "vegan",
    category: "health",
    description: "Learn to cook delicious, nutritious vegan meals without animal products.",
    content: `# Vegan Cooking

Vegan cooking excludes all animal products, focusing on plant-based ingredients for nutrition and flavor.

## Key Nutrients to Focus On

- **Protein**: Legumes, tofu, tempeh, seitan, nuts
- **Iron**: Legumes, leafy greens, fortified cereals
- **Calcium**: Fortified plant milks, leafy greens, tahini
- **B12**: Fortified foods or supplements (essential!)
- **Omega-3**: Flaxseeds, chia seeds, walnuts, algae

## Protein Sources

- **Legumes**: Beans, lentils, chickpeas
- **Soy**: Tofu, tempeh, edamame
- **Seitan**: Wheat gluten (high protein)
- **Nuts and seeds**: Almonds, peanuts, hemp seeds
- **Quinoa**: Complete protein

## Cooking Techniques

- **Roasting**: Brings out vegetable flavors
- **Sautéing**: Quick and flavorful
- **Steaming**: Preserves nutrients
- **Blending**: For sauces, dressings, smoothies
- **Fermenting**: For flavor and probiotics

## Substitutions

- **Milk**: Plant milks (almond, oat, soy)
- **Butter**: Vegan butter, coconut oil, olive oil
- **Eggs**: Flax eggs, chia eggs, applesauce (baking)
- **Cheese**: Nutritional yeast, cashew cream, store-bought vegan cheese
- **Honey**: Maple syrup, agave, date syrup

## Tips

- Focus on whole foods
- Learn to cook beans from scratch
- Experiment with spices and herbs
- Don't rely on processed vegan foods
- Meal prep helps
- Get B12 supplement`,
    difficulty: "intermediate",
    estimatedTime: 30,
    relatedSkills: ["vegetarian"],
  },
  {
    id: "vegetarian",
    name: "Vegetarian Cooking",
    slug: "vegetarian",
    category: "health",
    description: "Master vegetarian cooking with diverse protein sources and flavorful plant-based meals.",
    content: `# Vegetarian Cooking

Vegetarian cooking excludes meat but includes eggs and dairy, offering flexibility and nutrition.

## Types of Vegetarianism

- **Lacto-ovo**: Eats eggs and dairy
- **Lacto**: Eats dairy, no eggs
- **Ovo**: Eats eggs, no dairy
- **Pescatarian**: Eats fish (technically not vegetarian)

## Protein Sources

- **Eggs**: Versatile and complete protein
- **Dairy**: Greek yogurt, cottage cheese, cheese
- **Legumes**: Beans, lentils, chickpeas
- **Soy**: Tofu, tempeh, edamame
- **Nuts and seeds**: Almonds, peanuts, hemp seeds
- **Quinoa**: Complete protein grain

## Cooking Techniques

- **Roasting**: Vegetables become sweet and caramelized
- **Sautéing**: Quick and flavorful
- **Baking**: For casseroles and baked dishes
- **Steaming**: Preserves nutrients
- **Grilling**: For vegetables and halloumi

## Meal Ideas

- **Breakfast**: Eggs, Greek yogurt, oatmeal
- **Lunch**: Grain bowls, salads, wraps
- **Dinner**: Stir-fries, curries, pasta dishes
- **Snacks**: Nuts, hummus, cheese

## Tips

- Focus on variety
- Combine proteins (rice + beans = complete)
- Don't forget iron (pair with vitamin C)
- Include healthy fats
- Experiment with new ingredients
- Meal prep helps`,
    difficulty: "beginner",
    estimatedTime: 25,
    relatedSkills: ["vegan"],
  },
  {
    id: "gluten-free",
    name: "Gluten-Free Cooking",
    slug: "gluten-free",
    category: "health",
    description: "Learn to cook delicious gluten-free meals for celiac disease or gluten sensitivity.",
    content: `# Gluten-Free Cooking

Gluten-free cooking excludes wheat, barley, rye, and other gluten-containing grains.

## What Contains Gluten?

- **Grains**: Wheat, barley, rye, spelt, farro
- **Hidden sources**: Soy sauce, beer, some processed foods
- **Cross-contamination**: Shared equipment, surfaces

## Gluten-Free Grains

- **Rice**: All varieties
- **Quinoa**: Complete protein
- **Oats**: Certified gluten-free (cross-contamination risk)
- **Corn**: Cornmeal, polenta
- **Buckwheat**: Despite name, gluten-free
- **Millet**: Small grain, versatile
- **Amaranth**: High protein
- **Teff**: Ethiopian grain

## Flours

- **Almond flour**: High protein, low carb
- **Coconut flour**: High fiber, very absorbent
- **Rice flour**: Neutral flavor
- **Tapioca flour**: For binding
- **Chickpea flour**: High protein
- **Blends**: Often work best for baking

## Cooking Tips

- **Read labels**: Gluten hides in unexpected places
- **Avoid cross-contamination**: Separate equipment, surfaces
- **Experiment with flours**: Different flours for different uses
- **Use binders**: Xanthan gum, psyllium husk for baking
- **Focus on naturally GF foods**: Meat, fish, vegetables, fruits

## Substitutions

- **Pasta**: Rice noodles, quinoa pasta, zucchini noodles
- **Bread**: GF bread, lettuce wraps, corn tortillas
- **Soy sauce**: Tamari (GF), coconut aminos
- **Flour**: GF flour blends for baking

## Tips

- Don't assume processed foods are GF
- Check labels every time (recipes change)
- When in doubt, cook from scratch
- Focus on whole foods (naturally GF)
- Join GF communities for support`,
    difficulty: "intermediate",
    estimatedTime: 25,
    relatedSkills: [],
  },
  {
    id: "anti-inflammatory",
    name: "Anti-Inflammatory Cooking",
    slug: "anti-inflammatory",
    category: "health",
    description: "Learn to cook with anti-inflammatory foods to reduce chronic inflammation.",
    content: `# Anti-Inflammatory Cooking

Anti-inflammatory cooking focuses on foods that reduce chronic inflammation, linked to many diseases.

## Anti-Inflammatory Foods

- **Fatty fish**: Salmon, mackerel, sardines (omega-3)
- **Leafy greens**: Spinach, kale, collards
- **Berries**: Blueberries, strawberries, raspberries
- **Nuts**: Walnuts, almonds
- **Olive oil**: Extra virgin
- **Tomatoes**: Lycopene
- **Turmeric**: Curcumin (powerful anti-inflammatory)
- **Ginger**: Reduces inflammation
- **Green tea**: Antioxidants

## Foods to Limit

- **Processed foods**: High in inflammatory compounds
- **Refined sugar**: Increases inflammation
- **Trans fats**: Highly inflammatory
- **Excess omega-6**: Vegetable oils (balance with omega-3)
- **Red meat**: In excess, can be inflammatory

## Cooking Methods

- **Steaming**: Preserves nutrients
- **Roasting**: Brings out flavors
- **Sautéing**: Quick, uses healthy fats
- **Raw**: Some vegetables best raw

## Spices and Herbs

- **Turmeric**: Add to curries, smoothies, golden milk
- **Ginger**: Fresh in stir-fries, teas
- **Garlic**: Anti-inflammatory properties
- **Cinnamon**: Blood sugar control
- **Rosemary**: Antioxidants

## Tips

- Focus on whole foods
- Include omega-3 rich foods
- Use herbs and spices liberally
- Limit processed foods
- Stay hydrated
- Get enough sleep (reduces inflammation)`,
    difficulty: "beginner",
    estimatedTime: 20,
    relatedSkills: ["antioxidants", "omega-3"],
  },
];

/**
 * Get a skill by ID
 */
export function getSkillById(id: string): Skill | undefined {
  return COOKING_SKILLS.find(skill => skill.id === id);
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: Skill["category"]): Skill[] {
  return COOKING_SKILLS.filter(skill => skill.category === category);
}

/**
 * Get all skill IDs
 */
export function getAllSkillIds(): string[] {
  return COOKING_SKILLS.map(skill => skill.id);
}

