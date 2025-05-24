import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { ReadmeGenerationRequest, ReadmeGenerationResult } from "@/types";
import { logWithTime } from "@/utils/logging";
import { buildReadmeGenerationPrompt } from "@/services/promptBuilder";
import {
  parseReadmeSections,
  generateBasicReadmeTemplate as generateTemplate,
} from "@/services/readmeGenerator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rateLimit";

// Initialize API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize AI client
const geminiAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * API route handler for README generation
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  logWithTime("REQUEST", { message: "Received README generation request" });

  try {
    // Apply AI-specific rate limiting
    const rateLimitResponse = await rateLimit(request, "AI_GENERATION");
    if (rateLimitResponse) {
      logWithTime("RATE_LIMIT", {
        message: "Rate limit exceeded for README generation",
      });
      return rateLimitResponse;
    }

    // Verify user is authenticated
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      logWithTime("AUTH_ERROR", { message: "Unauthorized access attempt" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if API key is available
    if (!GEMINI_API_KEY || !geminiAI) {
      logWithTime("CONFIG_ERROR", { message: "Gemini API key is missing" });
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please add GEMINI_API_KEY to environment variables.",
        },
        { status: 500 }
      );
    }

    logWithTime("MODEL", {
      message: "Using Gemini model for README generation",
    });

    // Parse request body
    let body: ReadmeGenerationRequest;
    try {
      const requestBody = await request.text();
      logWithTime("REQUEST_BODY", {
        message: "Parsed request body",
        data: {
          size: requestBody.length,
          bodyPreview: requestBody.substring(0, 200) + "...",
        },
      });

      body = JSON.parse(requestBody) as ReadmeGenerationRequest;
    } catch (parseError) {
      logWithTime("PARSE_ERROR", {
        message: "Failed to parse request body",
        data: {
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
      });

      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    const {
      repoName,
      repoDescription,
      repoLanguage,
      packageJson,
      mainFiles,
      currentReadme,
    } = body;

    // Validate required fields
    if (!repoName) {
      logWithTime("VALIDATION_ERROR", {
        message: "Missing required field: repoName",
      });
      return NextResponse.json(
        { error: "Missing required field: repoName" },
        { status: 400 }
      );
    }

    logWithTime("REQUEST_PARSED", {
      message: "Extracted request parameters",
      data: {
        repoName,
        hasDescription: !!repoDescription,
        language: repoLanguage || "not specified",
        hasPackageJson: !!packageJson,
        packageJsonSize: packageJson?.length || 0,
        hasMainFiles: !!mainFiles?.length,
        mainFilesCount: mainFiles?.length || 0,
        hasCurrentReadme: !!currentReadme,
        currentReadmeSize: currentReadme?.length || 0,
      },
    });

    // Construct the prompt for README generation
    logWithTime("PROMPT_BUILD", {
      message: "Building prompt for Gemini model",
    });
    const prompt = buildReadmeGenerationPrompt(body);

    logWithTime("PROMPT_COMPLETE", {
      message: "Prompt construction complete",
      data: {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 200) + "...",
      },
    });

    // Generate README with Gemini
    let content = "";

    try {
      logWithTime("GEMINI_CALL", {
        message: "Calling Gemini API",
        data: { model: "gemini-2.0-flash" },
      });
      const aiCallStartTime = Date.now();

      // Initialize model and generate content
      const geminiModel = geminiAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      content = response.text();

      const aiCallDuration = Date.now() - aiCallStartTime;
      logWithTime("GEMINI_RESPONSE", {
        message: `Received response from Gemini in ${aiCallDuration}ms`,
        data: {
          contentLength: content.length,
          contentPreview: content.substring(0, 200) + "...",
        },
      });

      // Check if we got a valid response
      if (!content || content.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }
    } catch (aiError) {
      logWithTime("GEMINI_ERROR", {
        message: "Error calling Gemini API",
        data: {
          error: aiError instanceof Error ? aiError.message : String(aiError),
          stack: aiError instanceof Error ? aiError.stack : undefined,
        },
      });

      // Fall back to template
      const basicTemplate = generateTemplate(
        repoName,
        repoDescription,
        repoLanguage
      );

      return NextResponse.json(
        {
          result: basicTemplate,
          error: `Error calling Gemini API: ${
            aiError instanceof Error ? aiError.message : String(aiError)
          }`,
        },
        { status: 500 }
      );
    }

    // Parse the generated README into sections
    logWithTime("SECTION_PARSE", { message: "Parsing README into sections" });
    const sections = parseReadmeSections(content);

    logWithTime("SECTION_COMPLETE", {
      message: "Parsed README sections",
      data: {
        sectionCount: sections.length,
        sectionTitles: sections.map((s) => s.title),
      },
    });

    const result: ReadmeGenerationResult = {
      content,
      sections,
    };

    const totalDuration = Date.now() - requestStartTime;
    logWithTime("SUCCESS", {
      message: `Successfully generated README with Gemini in ${totalDuration}ms`,
      data: {
        totalTime: totalDuration,
        contentLength: content.length,
        sectionCount: sections.length,
      },
    });

    return NextResponse.json({ result, error: null });
  } catch (error) {
    const errorTime = Date.now() - requestStartTime;
    logWithTime("ERROR", {
      message: `Error generating README after ${errorTime}ms`,
      data: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    console.error("Error generating README:", error);

    // Get request body for fallback template
    let repoName = "Repository";
    let repoDescription = "";
    let repoLanguage = "";

    try {
      const requestBody = await request.text();
      const body = JSON.parse(requestBody) as ReadmeGenerationRequest;
      repoName = body.repoName;
      repoDescription = body.repoDescription || "";
      repoLanguage = body.repoLanguage || "";

      logWithTime("FALLBACK_PARAMS", {
        message: "Recovered parameters for fallback template",
        data: {
          repoName,
          hasDescription: !!repoDescription,
          language: repoLanguage || "not specified",
        },
      });
    } catch (parseError) {
      logWithTime("FALLBACK_ERROR", {
        message: "Could not parse request for fallback template",
        data: {
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
      });
    }

    // Fallback to basic template if AI generation fails
    logWithTime("FALLBACK", {
      message: "Generating basic README template as fallback",
    });
    const basicTemplate = generateTemplate(
      repoName,
      repoDescription,
      repoLanguage
    );

    logWithTime("FALLBACK_COMPLETE", {
      message: "Generated fallback template",
      data: {
        contentLength: basicTemplate.content.length,
        sectionCount: basicTemplate.sections.length,
      },
    });

    return NextResponse.json(
      {
        result: basicTemplate,
        error:
          "Failed to generate README with Gemini. Using basic template instead.",
      },
      { status: 500 }
    );
  }
}
