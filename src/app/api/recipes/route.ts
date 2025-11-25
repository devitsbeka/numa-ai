import { NextRequest, NextResponse } from 'next/server';
import {
  searchRecipesWithFilters,
  browseRecipes,
  getRandomRecipes,
  getRecipeInformation,
  mapRecipe,
  complexRecipeSearch,
} from '@/services/spoonacular';
import type { MealPlanBundle } from '@/types/spoonacular';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'search') {
      const ingredients = searchParams.get('ingredients')?.split(',').filter(Boolean) || [];
      const query = searchParams.get('query') || undefined;
      const calorieThreshold = searchParams.get('calorieThreshold') || undefined;
      const diet = searchParams.get('diet') || undefined;
      const number = parseInt(searchParams.get('number') || '10');

      const recipes = await searchRecipesWithFilters(ingredients, {
        query,
        calorieThreshold,
        diet,
        number,
      });

      return NextResponse.json({ success: true, data: recipes });
    }

    if (action === 'random') {
      const number = parseInt(searchParams.get('number') || '1');
      const randomRecipes = await getRandomRecipes({ number });

      if (randomRecipes.length > 0) {
        const detailedRecipe = await getRecipeInformation(randomRecipes[0].id, {
          includeNutrition: true,
        });
        const mappedRecipe = mapRecipe(randomRecipes[0], detailedRecipe);
        return NextResponse.json({ success: true, data: [mappedRecipe] });
      }

      return NextResponse.json({ success: true, data: [] });
    }

    if (action === 'details') {
      const recipeId = searchParams.get('recipeId');
      if (!recipeId) {
        return NextResponse.json(
          { success: false, error: 'recipeId parameter is required' },
          { status: 400 }
        );
      }

      const details = await getRecipeInformation(parseInt(recipeId), {
        includeNutrition: true,
      });
      const mappedRecipe = mapRecipe(details, details);
      return NextResponse.json({ success: true, data: mappedRecipe });
    }

    if (action === 'suggestions') {
      const ingredients = searchParams.get('ingredients')?.split(',').filter(Boolean) || [];
      const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean).map(id => parseInt(id)) || [];
      const number = parseInt(searchParams.get('number') || '5');

      const recipes = await searchRecipesWithFilters(ingredients, {
        number,
        query: undefined, // Don't use query for suggestions, use ingredients only
      });

      // Filter out excluded recipe IDs
      const filteredRecipes = recipes.filter(recipe => 
        !excludeIds.includes(recipe.spoonacularId || 0)
      );

      return NextResponse.json({ 
        success: true, 
        data: filteredRecipes.slice(0, number) 
      });
    }

    if (action === 'browse') {
      const type = searchParams.get('type') || undefined;
      const cuisine = searchParams.get('cuisine') || undefined;
      const minCalories = searchParams.get('minCalories') ? parseInt(searchParams.get('minCalories')!) : undefined;
      const maxCalories = searchParams.get('maxCalories') ? parseInt(searchParams.get('maxCalories')!) : undefined;
      const diet = searchParams.get('diet') || undefined;
      const sort = searchParams.get('sort') || 'popularity';
      const number = parseInt(searchParams.get('number') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const recipes = await browseRecipes({
        type,
        cuisine,
        minCalories,
        maxCalories,
        diet,
        sort,
        number,
        offset,
      });

      return NextResponse.json({ success: true, data: recipes });
    }

    if (action === 'meal-plans') {
      const duration = parseInt(searchParams.get('duration') || '14');
      const number = parseInt(searchParams.get('number') || '4'); // Number of bundles to generate

      // Calculate recipes needed (3 meals per day * duration)
      const recipesPerBundle = duration * 3;
      
      // Generate multiple bundles
      const bundles: MealPlanBundle[] = [];
      
      for (let i = 0; i < number; i++) {
        try {
          // Fetch diverse recipes for the bundle
          const response = await complexRecipeSearch({
            number: recipesPerBundle,
            addRecipeInformation: true,
            addRecipeNutrition: true,
            sort: 'random',
            offset: i * recipesPerBundle, // Offset to get different recipes for each bundle
          });

          // Fetch detailed info for each recipe
          const recipes = await Promise.all(
            response.results.slice(0, recipesPerBundle).map(async (result) => {
              try {
                const details = await getRecipeInformation(result.id, { includeNutrition: true });
                return mapRecipe(result, details);
              } catch (error) {
                console.error(`Failed to fetch details for recipe ${result.id}:`, error);
                return mapRecipe(result);
              }
            })
          );

          // Calculate total calories
          const totalCalories = recipes.reduce((sum, recipe) => sum + (recipe.calories || 0), 0);
          const avgCaloriesPerDay = Math.round(totalCalories / duration);

          // Generate description
          const cuisines = [...new Set(recipes.map(r => r.badges?.[0]).filter(Boolean))].slice(0, 2);
          const description = cuisines.length > 0
            ? `A ${duration}-day meal plan featuring ${cuisines.join(' and ')} cuisine`
            : `A ${duration}-day balanced meal plan with ${recipes.length} delicious recipes`;

          bundles.push({
            id: `bundle-${duration}-${i}-${Date.now()}`,
            duration,
            recipes,
            totalCalories: avgCaloriesPerDay,
            description,
            image: recipes[0]?.image,
          });
        } catch (error) {
          console.error(`Failed to generate bundle ${i}:`, error);
        }
      }

      return NextResponse.json({ success: true, data: bundles });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Route Error:', error);
    
    // Handle rate limiting (429) from Spoonacular
    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API rate limit exceeded. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

