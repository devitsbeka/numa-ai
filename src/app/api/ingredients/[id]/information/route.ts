import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const amount = searchParams.get('amount') || '100'; // Default to 100g

    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const url = `${SPOONACULAR_BASE_URL}/food/ingredients/${id}/information?amount=${amount}&unit=g&apiKey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract nutrition data
    const nutrition = {
      calories: data.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
      protein: data.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
      fat: data.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
      carbohydrates: data.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
      fiber: data.nutrition?.nutrients?.find((n: any) => n.name === 'Fiber')?.amount || 0,
    };

    return NextResponse.json({ success: true, nutrition });
  } catch (error) {
    console.error('Ingredient information error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

