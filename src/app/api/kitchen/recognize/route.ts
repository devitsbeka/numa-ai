import { NextRequest, NextResponse } from 'next/server';
import { getIngredientCategory, getStorageArea } from '@/utils/storage-categorizer';
import { getDefaultQuantity } from '@/utils/quantity-parser';
import { get3DIconForIngredient } from '@/utils/ingredient-icon-map';

/**
 * API route to recognize ingredients from images using OpenAI Vision
 * Accepts image data (base64 or file) and returns recognized ingredient information
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    // Use OpenAI Vision API
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Uses vision capabilities
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and identify any food ingredients or products visible. For each ingredient/product you identify, provide:
1. The ingredient/product name (be specific, e.g., "Tomato" not "Vegetable")
2. Estimated quantity if visible (e.g., "2 cups", "500g", "1 bottle", "As needed" if not visible)
3. Any additional notes about the product (brand, type, etc.)

Return your response as a JSON array of objects with this exact structure:
[
  {
    "name": "Ingredient name",
    "quantity": "Quantity or 'As needed'",
    "notes": "Any additional notes"
  }
]

If you see multiple items, include all of them. If you see no food items, return an empty array [].`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI Vision API error:', errorData);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    // Parse JSON from response (may be wrapped in markdown code blocks)
    let parsedItems: Array<{ name: string; quantity?: string; notes?: string }> = [];
    
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedItems = JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, try to extract structured data from text
      console.error('Failed to parse JSON, attempting text extraction:', parseError);
      // Fallback: return empty array if we can't parse
      return NextResponse.json({
        success: false,
        items: [],
        error: 'Could not parse ingredient data from image',
      });
    }

    if (!Array.isArray(parsedItems)) {
      return NextResponse.json({
        success: false,
        items: [],
        error: 'Invalid response format',
      });
    }

    // Process each recognized item: determine category and storage area
    const processedItems = await Promise.all(
      parsedItems.map(async (item) => {
        const name = item.name?.trim();
        if (!name) return null;

        // Get quantity or default
        const quantity = getDefaultQuantity(name, item.quantity);

        // Determine category and storage area using existing utilities
        let category;
        let storageArea;

        try {
          category = await getIngredientCategory(name);
          storageArea = await getStorageArea(name);
        } catch (error) {
          console.error(`Error determining category/storage for ${name}:`, error);
          // Fallback to sync versions
          const { getIngredientCategorySync, getStorageAreaSync } = await import('@/utils/storage-categorizer');
          category = getIngredientCategorySync(name);
          storageArea = getStorageAreaSync(name);
        }

        return {
          name,
          quantity,
          category,
          storageArea,
          notes: item.notes || undefined,
          image: get3DIconForIngredient(name),
        };
      })
    );

    // Filter out null items
    const validItems = processedItems.filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({
      success: true,
      items: validItems,
    });
  } catch (error) {
    console.error('Error recognizing ingredients:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while recognizing ingredients',
      },
      { status: 500 }
    );
  }
}

