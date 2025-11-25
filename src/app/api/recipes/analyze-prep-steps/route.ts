import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { ingredients, instructions } = await request.json();

    if (!ingredients || !instructions) {
      return NextResponse.json(
        { error: "Ingredients and instructions are required" },
        { status: 400 }
      );
    }

    const prompt = `
      Analyze this recipe and identify explicit preparation steps (cutting, washing, marinating, chopping, slicing, etc.) 
      that are required for the ingredients but might be implied or buried in the main instructions.
      
      Ingredients:
      ${JSON.stringify(ingredients)}
      
      Instructions:
      ${JSON.stringify(instructions)}
      
      Return a JSON array of strings, where each string is a specific preparation step. 
      Only include steps that should happen BEFORE the main cooking process starts (Mise en place).
      Do not include obvious things like "get ingredients out". Focus on knife work, washing, and measuring if complex.
      Example: ["Dice the onions finely", "Peel and chop the carrots", "Wash the spinach thoroughly"]
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional chef's assistant helping with mise en place. Output ONLY valid JSON array of strings.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to get the array of steps
    // Expecting: { "prepSteps": [...] } or just the array inside a wrapper
    let prepSteps = [];
    try {
      const parsed = JSON.parse(content);
      // Handle case where model returns object with key vs array directly
      if (Array.isArray(parsed)) {
        prepSteps = parsed;
      } else if (parsed.prepSteps && Array.isArray(parsed.prepSteps)) {
        prepSteps = parsed.prepSteps;
      } else if (parsed.steps && Array.isArray(parsed.steps)) {
        prepSteps = parsed.steps;
      } else {
        // Fallback: check values
        prepSteps = Object.values(parsed).flat().filter(s => typeof s === 'string');
      }
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      return NextResponse.json({ prepSteps: [] });
    }

    return NextResponse.json({ prepSteps });
  } catch (error) {
    console.error("Error generating prep steps:", error);
    return NextResponse.json(
      { error: "Failed to generate prep steps" },
      { status: 500 }
    );
  }
}

