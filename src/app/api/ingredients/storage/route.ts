import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to determine storage area for an ingredient using LLM
 * Uses a small LLM model to intelligently determine where ingredients should be stored
 */
export async function POST(request: NextRequest) {
  try {
    const { ingredientName } = await request.json();

    if (!ingredientName || typeof ingredientName !== 'string') {
      return NextResponse.json(
        { error: 'Ingredient name is required' },
        { status: 400 }
      );
    }

    // Use OpenAI API (or another LLM provider)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback to keyword-based if no API key
      return NextResponse.json({
        storageArea: categorizeByKeywords(ingredientName),
        category: categorizeCategoryByKeywords(ingredientName),
      });
    }

    // Call LLM with focused prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a food storage expert. Determine where an ingredient should be stored based on food safety and preservation best practices.

Storage areas:
- "fridge": Refrigerator (2-4°C) - for fresh produce, dairy, meat, seafood, leftovers, opened condiments
- "freezer": Freezer (-18°C or below) - for frozen foods, raw meat/seafood for long-term storage, ice cream
- "pantry": Pantry/room temperature - for dry goods, canned foods, unopened items, root vegetables, spices

Examples:
- shrimp -> freezer (if raw/frozen) or fridge (if cooked/fresh)
- potatoes -> pantry
- fish -> freezer (if raw) or fridge (if fresh/cooked)
- cream soup -> fridge
- milk -> fridge
- flour -> pantry
- frozen vegetables -> freezer
- fresh tomatoes -> fridge
- canned beans -> pantry
- butter -> fridge
- bread -> pantry (or fridge if you want it to last longer)
- eggs -> fridge
- onions -> pantry
- garlic -> pantry

Respond ONLY with a JSON object: {"storageArea": "fridge"|"freezer"|"pantry", "category": "produce"|"dairy"|"meat"|"seafood"|"frozen"|"pantry"|"beverages"|"condiments"|"spices"|"other"}`,
          },
          {
            role: 'user',
            content: `Where should "${ingredientName}" be stored? Respond with JSON only.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from LLM');
    }

    // Parse JSON response
    let result;
    try {
      // Extract JSON from response (in case LLM adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError, 'Content:', content);
      // Fallback to keyword-based
      return NextResponse.json({
        storageArea: categorizeByKeywords(ingredientName),
        category: categorizeCategoryByKeywords(ingredientName),
      });
    }

    // Validate response
    if (!result.storageArea || !['fridge', 'freezer', 'pantry'].includes(result.storageArea)) {
      return NextResponse.json({
        storageArea: categorizeByKeywords(ingredientName),
        category: result.category || categorizeCategoryByKeywords(ingredientName),
      });
    }

    return NextResponse.json({
      storageArea: result.storageArea,
      category: result.category || categorizeCategoryByKeywords(ingredientName),
    });
  } catch (error) {
    console.error('Error determining storage area with LLM:', error);
    
    // Fallback to keyword-based categorization
    try {
      const { ingredientName } = await request.json().catch(() => ({ ingredientName: '' }));
      return NextResponse.json({
        storageArea: categorizeByKeywords(ingredientName || ''),
        category: categorizeCategoryByKeywords(ingredientName || ''),
      });
    } catch {
      return NextResponse.json({
        storageArea: 'pantry',
        category: 'other',
      });
    }
  }
}

/**
 * Fallback keyword-based storage categorization
 */
function categorizeByKeywords(ingredientName: string): 'fridge' | 'freezer' | 'pantry' {
  const lowerName = ingredientName.toLowerCase();

  // Freezer keywords (check first - most specific)
  // Raw seafood typically goes in freezer for storage
  const freezerKeywords = [
    'frozen', 'ice cream', 'ice', 'frozen vegetables', 'frozen fruit',
    'frozen meat', 'frozen fish', 'frozen chicken', 'frozen berries',
  ];
  
  // Seafood - check if it's raw (typically frozen) vs cooked/fresh
  const rawSeafoodKeywords = ['shrimp', 'prawn', 'lobster', 'crab', 'scallop', 'fish', 'salmon', 'tuna', 'cod'];
  const isRawSeafood = rawSeafoodKeywords.some(keyword => lowerName.includes(keyword)) && 
                       !lowerName.includes('cooked') && 
                       !lowerName.includes('fresh') &&
                       !lowerName.includes('smoked');
  
  if (isRawSeafood) {
    return 'freezer';
  }
  
  for (const keyword of freezerKeywords) {
    if (lowerName.includes(keyword)) {
      return 'freezer';
    }
  }

  // Fridge keywords
  const fridgeKeywords = [
    // Dairy
    'milk', 'cheese', 'yogurt', 'cream', 'butter', 'sour cream', 'cottage cheese',
    'mozzarella', 'cheddar', 'parmesan', 'eggs', 'egg',
    // Fresh produce
    'lettuce', 'spinach', 'kale', 'arugula', 'greens', 'salad',
    'tomato', 'cucumber', 'bell pepper', 'pepper', 'carrot', 'celery',
    'broccoli', 'cauliflower', 'cabbage', 'mushroom', 'zucchini',
    'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'cherry',
    'apple', 'pear', 'orange', 'lemon', 'lime', 'avocado',
    // Fresh meat (but not raw seafood - that goes in freezer)
    'chicken', 'beef', 'pork', 'turkey', 'meat',
    'bacon', 'sausage', 'ham',
    // Cooked/fresh seafood
    'cooked fish', 'cooked shrimp', 'cooked salmon', 'fresh fish', 'smoked salmon',
    // Prepared foods
    'soup', 'stew', 'sauce', 'dressing', 'mayonnaise', 'mustard', 'ketchup',
  ];

  for (const keyword of fridgeKeywords) {
    if (lowerName.includes(keyword)) {
      return 'fridge';
    }
  }

  // Pantry keywords
  const pantryKeywords = [
    'potato', 'potatoes', 'onion', 'onions', 'garlic', 'ginger',
    'flour', 'sugar', 'salt', 'spice', 'herbs', 'dried',
    'rice', 'pasta', 'noodle', 'quinoa', 'lentil', 'bean', 'chickpea',
    'canned', 'can', 'jar', 'olive oil', 'oil', 'vinegar', 'soy sauce',
    'stock', 'broth', 'honey', 'syrup', 'extract', 'vanilla',
    'baking powder', 'baking soda', 'yeast', 'cocoa', 'chocolate',
    'nuts', 'almond', 'walnut', 'peanut', 'cashew',
    'bread', 'cracker', 'cereal', 'oat', 'granola',
  ];

  for (const keyword of pantryKeywords) {
    if (lowerName.includes(keyword)) {
      return 'pantry';
    }
  }

  // Default to pantry for unknown items
  return 'pantry';
}

/**
 * Fallback keyword-based category categorization
 */
function categorizeCategoryByKeywords(ingredientName: string): string {
  const lowerName = ingredientName.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    produce: [
      'lettuce', 'spinach', 'kale', 'arugula', 'greens', 'salad',
      'tomato', 'cucumber', 'bell pepper', 'pepper', 'carrot', 'celery',
      'broccoli', 'cauliflower', 'cabbage', 'mushroom', 'zucchini',
      'onion', 'garlic', 'ginger', 'herbs', 'parsley', 'cilantro', 'basil',
      'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'cherry',
      'apple', 'pear', 'orange', 'lemon', 'lime', 'avocado', 'banana',
      'potato', 'potatoes',
    ],
    dairy: [
      'milk', 'cheese', 'yogurt', 'cream', 'butter', 'sour cream',
      'cottage cheese', 'mozzarella', 'cheddar', 'parmesan', 'eggs', 'egg',
    ],
    meat: [
      'chicken', 'beef', 'pork', 'turkey', 'lamb', 'duck', 'meat',
      'steak', 'ground', 'bacon', 'sausage', 'ham', 'prosciutto',
    ],
    seafood: [
      'fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'seafood',
      'scallop', 'lobster', 'crab', 'mussel', 'oyster',
    ],
    frozen: [
      'frozen', 'ice', 'ice cream', 'frozen vegetables', 'frozen fruit',
    ],
    pantry: [
      'flour', 'sugar', 'salt', 'rice', 'pasta', 'noodle', 'quinoa',
      'lentil', 'bean', 'chickpea', 'canned', 'can', 'jar',
    ],
    beverages: [
      'juice', 'soda', 'water', 'coffee', 'tea', 'wine', 'beer',
    ],
    condiments: [
      'mayonnaise', 'mustard', 'ketchup', 'sauce', 'dressing',
      'olive oil', 'oil', 'vinegar', 'soy sauce',
    ],
    spices: [
      'pepper', 'spice', 'herbs', 'dried', 'cinnamon', 'paprika',
      'cumin', 'oregano', 'thyme', 'rosemary', 'basil',
    ],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }

  return 'other';
}
