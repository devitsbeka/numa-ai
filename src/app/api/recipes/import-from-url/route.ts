import { NextRequest, NextResponse } from "next/server";
import { parseHtmlRecipe, parseJsonLdRecipe } from "@/utils/recipe-parsers";
import { calculateNutritionServer, enrichIngredients } from "@/utils/nutrition-calculator-server";
import type { CustomRecipe } from "@/types/custom-recipe";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Try to parse JSON-LD first
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    );

    let parsedData;
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(match.replace(/<script[^>]*>|<\/script>/gi, ""));
          // Handle both single objects and arrays
          const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
          
          for (const schema of schemas) {
            if (schema["@type"] === "Recipe" || schema["@type"] === "http://schema.org/Recipe") {
              parsedData = parseJsonLdRecipe(schema);
              if (parsedData) break;
            }
          }
          if (parsedData) break;
        } catch (e) {
          // Continue to next match or HTML parsing
        }
      }
    }

    // Fallback to HTML parsing
    if (!parsedData) {
      parsedData = parseHtmlRecipe(html);
    }

    // AI fallback if parsing failed or missing critical data
    if (!parsedData || !parsedData.name || !parsedData.ingredients || parsedData.ingredients.length === 0 || !parsedData.instructions || parsedData.instructions.length === 0) {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      
      if (openaiApiKey) {
        try {
          // Extract text content from HTML (remove scripts, styles, etc.)
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 15000); // Limit to avoid token limits

          const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [{
                role: "system",
                content: "You are a recipe extraction assistant. Extract recipe information from webpage content and return ONLY valid JSON, no other text."
              }, {
                role: "user",
                content: `Extract recipe information from this webpage content and return ONLY valid JSON in this exact format (no markdown, no explanations, ONLY JSON):

{
  "name": "Recipe name",
  "description": "Brief description",
  "prepTime": 0,
  "cookTime": 0,
  "servings": 4,
  "ingredients": [
    {"name": "ingredient name", "amount": 1, "unit": "g"}
  ],
  "instructions": ["step 1", "step 2"]
}

Webpage content:
${textContent}

Rules:
- Extract ALL ingredients with measurements
- Convert to standard units: g, kg, cup, tbsp, tsp, oz, lb, ml, l
- Extract ALL cooking steps
- If a field is not found, use the default shown above
- CRITICAL: Return ONLY the JSON object, no other text whatsoever`
              }],
              max_tokens: 3000,
              temperature: 0.1,
              response_format: { type: "json_object" }
            }),
          });

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            const content = openaiData.choices?.[0]?.message?.content;
            
            if (content) {
              try {
                let jsonStr = content.trim();
                jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  jsonStr = jsonMatch[0];
                }
                const aiParsed = JSON.parse(jsonStr);
                
                // Merge AI parsed data with existing parsed data
                parsedData = {
                  ...parsedData,
                  name: parsedData?.name || aiParsed.name,
                  description: parsedData?.description || aiParsed.description,
                  prepTime: parsedData?.prepTime || aiParsed.prepTime || 0,
                  cookTime: parsedData?.cookTime || aiParsed.cookTime || 0,
                  servings: parsedData?.servings || aiParsed.servings || 4,
                  ingredients: parsedData?.ingredients && parsedData.ingredients.length > 0 
                    ? parsedData.ingredients 
                    : aiParsed.ingredients || [],
                  instructions: parsedData?.instructions && parsedData.instructions.length > 0
                    ? parsedData.instructions
                    : aiParsed.instructions || [],
                };
              } catch (parseError) {
                console.error("Error parsing AI response:", parseError);
              }
            }
          }
        } catch (aiError) {
          console.error("AI fallback error:", aiError);
        }
      }
    }

    if (!parsedData || !parsedData.name) {
      return NextResponse.json(
        { success: false, error: "Could not extract recipe data from URL" },
        { status: 400 }
      );
    }

    // Ensure required fields have defaults
    let ingredients = parsedData.ingredients || [];
    
    // Enrich ingredients with images and IDs
    if (ingredients.length > 0) {
      try {
        ingredients = await enrichIngredients(ingredients);
      } catch (error) {
        console.error("Error enriching ingredients:", error);
        // Continue with unenriched ingredients if enrichment fails
      }
    }
    
    // Calculate nutrition from ingredients
    let nutrition;
    if (ingredients.length > 0) {
      try {
        nutrition = await calculateNutritionServer(ingredients);
      } catch (error) {
        console.error("Error calculating nutrition:", error);
        // Continue without nutrition if calculation fails
      }
    }

    const recipeData: Partial<CustomRecipe> = {
      name: parsedData.name,
      description: parsedData.description,
      cuisine: parsedData.cuisine,
      mealType: parsedData.mealType || "dinner",
      prepTime: parsedData.prepTime || 0,
      cookTime: parsedData.cookTime || 0,
      servings: parsedData.servings || 4,
      image: parsedData.image,
      ingredients,
      instructions: parsedData.instructions || [],
      nutrition: nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: recipeData,
    });
  } catch (error) {
    console.error("Error importing recipe from URL:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to import recipe from URL",
      },
      { status: 500 }
    );
  }
}

