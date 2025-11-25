import { NextRequest, NextResponse } from "next/server";
import { parseTextRecipe } from "@/utils/recipe-parsers";
import { calculateNutritionServer, enrichIngredients } from "@/utils/nutrition-calculator-server";
import type { CustomRecipe } from "@/types/custom-recipe";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // For now, we'll use a placeholder approach
    // In production, you would:
    // 1. Use Tesseract.js for client-side OCR, or
    // 2. Use a cloud OCR service (Google Vision API, AWS Textract, etc.), or
    // 3. Use OpenAI GPT-4 Vision API for better extraction

    // Convert image to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Use OpenAI Vision API for intelligent recipe extraction
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    let parsedData;
    
    try {
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
            content: "You are a recipe extraction assistant. You MUST respond with valid JSON only, no other text. If you cannot extract a recipe, return a JSON object with minimal fields."
          }, {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Extract recipe information from this image and return ONLY valid JSON in this exact format (no markdown, no explanations, ONLY JSON):

{
  "name": "Recipe name",
  "description": "Brief description",
  "prepTime": 0,
  "cookTime": 0,
  "servings": 4,
  "ingredients": [
    {"name": "ingredient name", "amount": 1, "unit": "g"}
  ],
  "instructions": ["step 1"]
}

Rules:
- Use ONLY the format shown above
- Extract ALL visible ingredients with measurements
- Convert to standard units: g, kg, cup, tbsp, tsp, oz, lb, ml, l
- If a field is not visible, use the default shown above
- CRITICAL: Return ONLY the JSON object, no other text whatsoever` 
              },
              { 
                type: "image_url", 
                image_url: { 
                  url: `data:${imageFile.type};base64,${base64Image}`,
                  detail: "high"
                } 
              }
            ]
          }],
          max_tokens: 2000,
          temperature: 0.1,
          response_format: { type: "json_object" }
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        if (openaiResponse.status === 429) {
          throw new Error("OpenAI API rate limit exceeded. Please wait a few minutes and try again.");
        }
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const openaiData = await openaiResponse.json();
      const content = openaiData.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Parse the JSON response
      try {
        // Remove markdown code blocks if present
        let jsonStr = content.trim();
        
        // Remove markdown code blocks
        jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        // Try to find JSON object in the response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        
        parsedData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Received content:", content);
        throw new Error(`Failed to parse AI response as JSON. The image might not contain a clear recipe, or the text is not readable. Please try a clearer image.`);
      }
      
    } catch (error) {
      console.error("OpenAI Vision API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error 
            ? `Failed to extract recipe from image: ${error.message}`
            : "Failed to extract recipe from image using AI vision",
        },
        { status: 500 }
      );
    }

    if (!parsedData || !parsedData.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract recipe data from image. The image might not contain a clear recipe, or the text is not readable. Please try a clearer image.",
        },
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

    // Ensure required fields have defaults
    const recipeData: Partial<CustomRecipe> = {
      name: parsedData.name,
      description: parsedData.description,
      cuisine: parsedData.cuisine,
      mealType: parsedData.mealType || "dinner",
      prepTime: parsedData.prepTime || 0,
      cookTime: parsedData.cookTime || 0,
      servings: parsedData.servings || 4,
      image: `data:${imageFile.type};base64,${base64Image}`, // Store as data URL
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
    console.error("Error importing recipe from image:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to import recipe from image",
      },
      { status: 500 }
    );
  }
}

