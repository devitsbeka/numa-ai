import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

// Get API key from environment
const getApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new Error('Spoonacular API key is not configured');
  }
  return apiKey;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ingredientName = searchParams.get('ingredient');

    if (!ingredientName) {
      return NextResponse.json(
        { success: false, error: 'ingredient parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    const url = `${SPOONACULAR_BASE_URL}/food/ingredients/substitutes?ingredientName=${encodeURIComponent(ingredientName)}&apiKey=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `API request failed with status ${response.status}`,
      }));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Normalize the response
    const substitutes = data.substitutes || [];
    const normalizedSubstitutes = substitutes.map((sub: any) => ({
      name: sub.name || sub,
      description: sub.description || `A good substitute for ${ingredientName}`,
      similarity: sub.similarity || 'medium',
    }));

    return NextResponse.json({
      success: true,
      data: {
        ingredient: ingredientName,
        substitutes: normalizedSubstitutes,
        message: data.message || null,
      },
    });
  } catch (error) {
    console.error('Substitution API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

