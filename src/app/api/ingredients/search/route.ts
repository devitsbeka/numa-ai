import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'query parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const url = `${SPOONACULAR_BASE_URL}/food/ingredients/search?query=${encodeURIComponent(query)}&number=5&apiKey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, results: data.results || [] });
  } catch (error) {
    console.error('Ingredient search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}


