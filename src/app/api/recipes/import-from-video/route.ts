import { NextRequest, NextResponse } from "next/server";
import { calculateNutritionServer, enrichIngredients } from "@/utils/nutrition-calculator-server";
import type { CustomRecipe } from "@/types/custom-recipe";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const videoUrl = formData.get("videoUrl") as string | null;

    if (!videoFile && !videoUrl) {
      return NextResponse.json(
        { success: false, error: "No video file or URL provided" },
        { status: 400 }
      );
    }

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

    // Convert video to base64 if it's a file
    let videoData: string | null = null;
    
    if (videoFile) {
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Check file size (OpenAI has limits)
      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > 25) {
        return NextResponse.json(
          {
            success: false,
            error: "Video file is too large. Maximum size is 25MB. Please try a shorter video or use a URL instead.",
          },
          { status: 400 }
        );
      }
      
      videoData = buffer.toString("base64");
    }

    let parsedData;
    
    try {
      // For video files, we'll extract audio and transcribe it
      // Note: OpenAI doesn't directly support video in Vision API, so we use Whisper for audio
      
      if (videoFile && videoData) {
        // Use OpenAI Whisper API for audio transcription
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("model", "whisper-1");
        formData.append("prompt", "This is a cooking recipe video. Extract all recipe information including ingredients, measurements, and cooking instructions.");

        const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
          },
          body: formData,
        });

        if (!whisperResponse.ok) {
          const errorData = await whisperResponse.json().catch(() => ({}));
          if (whisperResponse.status === 429) {
            throw new Error("OpenAI API rate limit exceeded. Please wait a few minutes and try again.");
          }
          throw new Error(`Whisper API error: ${whisperResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const whisperData = await whisperResponse.json();
        const transcript = whisperData.text;

        if (!transcript || transcript.trim().length < 20) {
          throw new Error("Could not extract meaningful audio from video");
        }

        // Use GPT to extract structured recipe data from transcript
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{
              role: "user",
              content: `Extract recipe information from this video transcript and format it as JSON:

Transcript:
${transcript}

Return ONLY valid JSON in this exact format (no additional text):
{
  "name": "Recipe name",
  "description": "Brief description",
  "prepTime": number (in minutes, or 0 if not mentioned),
  "cookTime": number (in minutes, or 0 if not mentioned),
  "servings": number (or 4 if not mentioned),
  "ingredients": [
    {"name": "ingredient name", "amount": number, "unit": "g/cup/tbsp/etc"}
  ],
  "instructions": ["step 1", "step 2", "step 3"]
}

Extract ALL mentioned ingredients with measurements. Convert to standard units.`
            }],
            max_tokens: 2000,
            temperature: 0.2,
          }),
        });

        if (!gptResponse.ok) {
          const errorData = await gptResponse.json().catch(() => ({}));
          if (gptResponse.status === 429) {
            throw new Error("OpenAI API rate limit exceeded. Please wait a few minutes and try again.");
          }
          throw new Error(`GPT API error: ${gptResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const gptData = await gptResponse.json();
        const content = gptData.choices?.[0]?.message?.content;
        
        if (!content) {
          throw new Error("No content received from GPT");
        }

        // Parse the JSON response
        const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
        parsedData = JSON.parse(jsonStr);
        
      } else if (videoUrl) {
        // For YouTube URLs, use YouTube Data API v3 to fetch video details and captions
        const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        
        if (!youtubeMatch) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid YouTube URL format. Please provide a valid YouTube link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)",
            },
            { status: 400 }
          );
        }

        const videoId = youtubeMatch[1];
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        
        if (!youtubeApiKey) {
          return NextResponse.json(
            {
              success: false,
              error: "YouTube API key not configured. Please set YOUTUBE_API_KEY in your environment variables.",
            },
            { status: 500 }
          );
        }

        try {
          // Step 1: Get video details (title, description)
          const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeApiKey}&part=snippet,contentDetails`;
          const videoDetailsResponse = await fetch(videoDetailsUrl);

          if (!videoDetailsResponse.ok) {
            const errorData = await videoDetailsResponse.json().catch(() => ({}));
            if (videoDetailsResponse.status === 403) {
              throw new Error("YouTube API quota exceeded or API key invalid. Please check your API key configuration.");
            }
            if (videoDetailsResponse.status === 429) {
              throw new Error("YouTube API rate limit exceeded. Please wait a few minutes and try again.");
            }
            throw new Error(`YouTube API error: ${videoDetailsResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
          }

          const videoDetailsData = await videoDetailsResponse.json();
          
          if (!videoDetailsData.items || videoDetailsData.items.length === 0) {
            throw new Error("Video not found. Please check the YouTube URL.");
          }

          const videoSnippet = videoDetailsData.items[0].snippet;
          const videoTitle = videoSnippet.title || "";
          const videoDescription = videoSnippet.description || "";

          // Step 2: List available captions
          const captionsListUrl = `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${youtubeApiKey}&part=snippet`;
          const captionsListResponse = await fetch(captionsListUrl);

          let transcript = "";
          let transcriptSource = "";

          // Try to get captions if available
          if (captionsListResponse.ok) {
            try {
              const captionsData = await captionsListResponse.json();
              
              if (captionsData.items && captionsData.items.length > 0) {
                // Find the best caption track (prefer English, then auto-generated, then any)
                const captionTracks = captionsData.items;
                const preferredCaption = 
                  captionTracks.find((c: any) => c.snippet.language === 'en' && c.snippet.trackKind !== 'asr') ||
                  captionTracks.find((c: any) => c.snippet.language === 'en') ||
                  captionTracks.find((c: any) => c.snippet.trackKind !== 'asr') ||
                  captionTracks[0];

                if (preferredCaption) {
                  // Step 3: Try to download caption text
                  // Note: captions.download may require OAuth2 for some videos
                  const captionDownloadUrl = `https://www.googleapis.com/youtube/v3/captions/${preferredCaption.id}?key=${youtubeApiKey}&tfmt=srt`;
                  const captionDownloadResponse = await fetch(captionDownloadUrl);

                  if (captionDownloadResponse.ok) {
                    const captionText = await captionDownloadResponse.text();
                    
                    // Parse SRT format and extract text
                    // SRT format: sequence number, timestamp, text, blank line
                    const srtLines = captionText.split('\n');
                    const textLines: string[] = [];
                    
                    for (let i = 0; i < srtLines.length; i++) {
                      const line = srtLines[i].trim();
                      // Skip sequence numbers and timestamps
                      if (line && !/^\d+$/.test(line) && !line.includes('-->')) {
                        // Remove HTML tags if present
                        const cleanLine = line.replace(/<[^>]*>/g, '').trim();
                        if (cleanLine) {
                          textLines.push(cleanLine);
                        }
                      }
                    }
                    
                    if (textLines.length > 0) {
                      transcript = textLines.join(' ');
                      transcriptSource = "captions";
                    }
                  }
                  // If caption download fails (may require OAuth2), we'll fall back to description
                }
              }
            } catch (captionError) {
              // If caption listing/parsing fails, continue to use description
              console.log("Could not fetch captions, using description:", captionError);
            }
          }

          // Fallback to description if no captions available
          if (!transcript || transcript.length < 50) {
            transcript = videoDescription;
            transcriptSource = "description";
          }

          // Combine title and transcript for better context
          const fullText = `${videoTitle}\n\n${transcript}`;

          if (!transcript || transcript.length < 100) {
            return NextResponse.json(
              {
                success: false,
                error: "Could not extract sufficient recipe information from this YouTube video. The video may not have captions or a detailed description. Please try:\n1. Downloading the video (max 25MB) and uploading it directly\n2. Using URL import if the recipe is written on a website\n3. Taking a screenshot of the recipe and using image import",
              },
              { status: 400 }
            );
          }

          // Step 4: Use GPT-4 to extract structured recipe data
          const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [{
                role: "system",
                content: "You are a recipe extraction assistant. Extract recipe information from YouTube video transcripts or descriptions and return ONLY valid JSON. Be thorough in extracting all ingredients with measurements and all cooking instructions."
              }, {
                role: "user",
                content: `Extract recipe information from this YouTube video ${transcriptSource === "captions" ? "transcript" : "description"} and return ONLY valid JSON:

Video Title: ${videoTitle}

${transcriptSource === "captions" ? "Transcript" : "Description"}:
${transcript}

Return in this exact format (ONLY JSON, no other text):
{
  "name": "Recipe name (use video title if appropriate)",
  "description": "Brief description of the recipe",
  "prepTime": number (in minutes, or 0 if not mentioned),
  "cookTime": number (in minutes, or 0 if not mentioned),
  "servings": number (or 4 if not mentioned),
  "ingredients": [
    {"name": "ingredient name", "amount": number, "unit": "g/cup/tbsp/tsp/etc"}
  ],
  "instructions": ["step 1", "step 2", "step 3"]
}

Extract ALL mentioned ingredients with measurements. Convert to standard units. Extract ALL cooking steps mentioned in the ${transcriptSource === "captions" ? "transcript" : "description"}.`
              }],
              max_tokens: 3000,
              temperature: 0.1,
              response_format: { type: "json_object" }
            }),
          });

          if (!gptResponse.ok) {
            const errorData = await gptResponse.json().catch(() => ({}));
            if (gptResponse.status === 429) {
              throw new Error("OpenAI API rate limit exceeded. Please wait a few minutes and try again.");
            }
            throw new Error(`GPT API error: ${gptResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
          }

          const gptData = await gptResponse.json();
          const content = gptData.choices?.[0]?.message?.content;
          
          if (!content) {
            throw new Error("No content received from AI");
          }

          parsedData = JSON.parse(content);
          
        } catch (error) {
          console.error("YouTube processing error:", error);
          return NextResponse.json(
            {
              success: false,
              error: error instanceof Error 
                ? `Failed to extract recipe from YouTube video: ${error.message}`
                : "Failed to extract recipe from YouTube video. Please try:\n1. Downloading the video (under 25MB) and uploading it directly\n2. Using URL import if the recipe is on a website\n3. Taking a screenshot and using image import",
            },
            { status: 400 }
          );
        }
      }
      
    } catch (error) {
      console.error("Video processing error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error 
            ? `Failed to extract recipe from video: ${error.message}`
            : "Failed to extract recipe from video",
        },
        { status: 500 }
      );
    }

    if (!parsedData || !parsedData.name) {
      return NextResponse.json(
        { success: false, error: "Could not extract recipe data from video" },
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
    console.error("Error importing recipe from video:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to import recipe from video",
      },
      { status: 500 }
    );
  }
}

