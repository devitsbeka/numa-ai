/**
 * Utility to fetch ingredient images from Spoonacular API
 */

export async function fetchIngredientImage(ingredientName: string): Promise<string | undefined> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      return undefined;
    }

    // Search for ingredient
    const response = await fetch(
      `/api/ingredients/search?query=${encodeURIComponent(ingredientName)}`
    );

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    if (data.success && data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      if (firstResult.image) {
        return `https://img.spoonacular.com/ingredients_100x100/${firstResult.image}`;
      }
    }

    return undefined;
  } catch (error) {
    console.error(`Error fetching image for ${ingredientName}:`, error);
    return undefined;
  }
}

/**
 * Fetch images for multiple ingredients in parallel
 */
export async function fetchIngredientImages(
  ingredientNames: string[]
): Promise<Record<string, string | undefined>> {
  const results: Record<string, string | undefined> = {};

  // Fetch in parallel with limit to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < ingredientNames.length; i += batchSize) {
    const batch = ingredientNames.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (name) => {
        const image = await fetchIngredientImage(name);
        return { name, image };
      })
    );

    batchResults.forEach(({ name, image }) => {
      results[name.toLowerCase()] = image;
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < ingredientNames.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

