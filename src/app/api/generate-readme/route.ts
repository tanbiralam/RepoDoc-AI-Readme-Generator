import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ReadmeGenerationRequest,
  ReadmeGenerationResult,
  ReadmeSection,
} from "@/types";

// Initialize API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize AI client
const geminiAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Create a simple server-side logging function
const logAI = (stage: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[SERVER-AI][${timestamp}][${stage}] ${message}`,
    data ? JSON.stringify(data) : ""
  );
};

/**
 * API route handler for README generation
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  logAI("REQUEST", "Received README generation request");

  // Check if API key is available
  if (!GEMINI_API_KEY || !geminiAI) {
    logAI("CONFIG_ERROR", "Gemini API key is missing");
    return NextResponse.json(
      {
        error:
          "Gemini API key is not configured. Please add GEMINI_API_KEY to environment variables.",
      },
      { status: 500 }
    );
  }

  logAI("MODEL", "Using Gemini model for README generation");

  try {
    // Parse request body
    let body: ReadmeGenerationRequest;
    try {
      const requestBody = await request.text();
      logAI("REQUEST_BODY", "Parsed request body", {
        size: requestBody.length,
        bodyPreview: requestBody.substring(0, 200) + "...",
      });

      body = JSON.parse(requestBody) as ReadmeGenerationRequest;
    } catch (parseError) {
      logAI("PARSE_ERROR", "Failed to parse request body", {
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
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
      logAI("VALIDATION_ERROR", "Missing required field: repoName");
      return NextResponse.json(
        { error: "Missing required field: repoName" },
        { status: 400 }
      );
    }

    logAI("REQUEST_PARSED", "Extracted request parameters", {
      repoName,
      hasDescription: !!repoDescription,
      language: repoLanguage || "not specified",
      hasPackageJson: !!packageJson,
      packageJsonSize: packageJson?.length || 0,
      hasMainFiles: !!mainFiles?.length,
      mainFilesCount: mainFiles?.length || 0,
      hasCurrentReadme: !!currentReadme,
      currentReadmeSize: currentReadme?.length || 0,
    });

    // Construct the prompt for README generation
    logAI("PROMPT_BUILD", "Building prompt for Gemini model");
    let prompt = `Generate a comprehensive, professional README.md for a GitHub repository with the following details:\n\n`;

    prompt += `Repository Name: ${repoName}\n`;

    if (repoDescription) {
      prompt += `Repository Description: ${repoDescription}\n`;
    }

    if (repoLanguage) {
      prompt += `Primary Language: ${repoLanguage}\n`;
    }

    if (packageJson) {
      prompt += `package.json Content: ${packageJson}\n`;
    }

    if (mainFiles && mainFiles.length > 0) {
      prompt += `Main Files: ${mainFiles.join(", ")}\n`;
    }

    if (currentReadme) {
      prompt += `Current README Content (to use as reference): ${currentReadme}\n`;
    }

    prompt += `\nThe README should include the following sections:\n`;
    prompt += `1. Title and Description\n`;
    prompt += `2. Features\n`;
    prompt += `3. Installation\n`;
    prompt += `4. Usage\n`;
    prompt += `5. API/Components Documentation (if applicable)\n`;
    prompt += `6. Configuration\n`;
    prompt += `7. Contributing\n`;
    prompt += `8. License\n\n`;

    prompt += `Format the README using proper Markdown syntax with headings, code blocks, lists, and emphasis where appropriate.\n`;
    prompt += `Make it professional, comprehensive, and visually structured.`;

    logAI("PROMPT_COMPLETE", "Prompt construction complete", {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 200) + "...",
    });

    // Generate README with Gemini
    let content = "";

    try {
      logAI("GEMINI_CALL", "Calling Gemini API", { model: "gemini-2.0-flash" });
      const aiCallStartTime = Date.now();

      // Initialize model and generate content
      const geminiModel = geminiAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      content = response.text();

      const aiCallDuration = Date.now() - aiCallStartTime;
      logAI(
        "GEMINI_RESPONSE",
        `Received response from Gemini in ${aiCallDuration}ms`,
        {
          contentLength: content.length,
          contentPreview: content.substring(0, 200) + "...",
        }
      );

      // Check if we got a valid response
      if (!content || content.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }
    } catch (aiError) {
      logAI("GEMINI_ERROR", "Error calling Gemini API", {
        error: aiError instanceof Error ? aiError.message : String(aiError),
        stack: aiError instanceof Error ? aiError.stack : undefined,
      });

      // Fall back to template
      const basicTemplate = generateBasicReadmeTemplate(
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
    logAI("SECTION_PARSE", "Parsing README into sections");
    const sections = parseReadmeSections(content);

    logAI("SECTION_COMPLETE", "Parsed README sections", {
      sectionCount: sections.length,
      sectionTitles: sections.map((s) => s.title),
    });

    const result: ReadmeGenerationResult = {
      content,
      sections,
    };

    const totalDuration = Date.now() - requestStartTime;
    logAI(
      "SUCCESS",
      `Successfully generated README with Gemini in ${totalDuration}ms`,
      {
        totalTime: totalDuration,
        contentLength: content.length,
        sectionCount: sections.length,
      }
    );

    return NextResponse.json({ result, error: null });
  } catch (error) {
    const errorTime = Date.now() - requestStartTime;
    logAI("ERROR", `Error generating README after ${errorTime}ms`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
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

      logAI("FALLBACK_PARAMS", "Recovered parameters for fallback template", {
        repoName,
        hasDescription: !!repoDescription,
        language: repoLanguage || "not specified",
      });
    } catch (parseError) {
      logAI("FALLBACK_ERROR", "Could not parse request for fallback template", {
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
      });
    }

    // Fallback to basic template if AI generation fails
    logAI("FALLBACK", "Generating basic README template as fallback");
    const basicTemplate = generateBasicReadmeTemplate(
      repoName,
      repoDescription,
      repoLanguage
    );

    logAI("FALLBACK_COMPLETE", "Generated fallback template", {
      contentLength: basicTemplate.content.length,
      sectionCount: basicTemplate.sections.length,
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

/**
 * Parse the generated README into sections
 */
function parseReadmeSections(content: string): ReadmeSection[] {
  const sectionStartTime = Date.now();
  logAI("SECTION_PARSE_START", "Starting README section parsing", {
    contentLength: content.length,
    lineCount: content.split("\n").length,
  });

  const sections: ReadmeSection[] = [];
  const lines = content.split("\n");

  let currentSection: ReadmeSection | null = null;
  let sectionCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line is a heading
    if (line.startsWith("# ")) {
      // If we already have a current section, add it to the list
      if (currentSection) {
        sections.push(currentSection);
        sectionCount++;
      }

      // Start a new section with an H1 heading
      currentSection = {
        title: line.substring(2).trim(),
        content: line + "\n",
        level: 1,
      };

      logAI("SECTION_H1", `Found H1 section: ${currentSection.title}`, {
        lineNumber: i,
      });
    } else if (line.startsWith("## ")) {
      // If we already have a current section, add it to the list
      if (currentSection) {
        sections.push(currentSection);
        sectionCount++;
      }

      // Start a new section with an H2 heading
      currentSection = {
        title: line.substring(3).trim(),
        content: line + "\n",
        level: 2,
      };

      logAI("SECTION_H2", `Found H2 section: ${currentSection.title}`, {
        lineNumber: i,
      });
    } else if (currentSection) {
      // Add this line to the current section's content
      currentSection.content += line + "\n";
    } else {
      // If we don't have a current section yet, create one for the preamble
      currentSection = {
        title: "Introduction",
        content: line + "\n",
        level: 0,
      };

      logAI(
        "SECTION_INTRO",
        "Created introduction section for content without heading",
        { lineNumber: i }
      );
    }
  }

  // Add the last section if there is one
  if (currentSection) {
    sections.push(currentSection);
    sectionCount++;
  }

  const sectionDuration = Date.now() - sectionStartTime;
  logAI(
    "SECTION_PARSE_COMPLETE",
    `Completed README section parsing in ${sectionDuration}ms`,
    {
      sectionCount: sections.length,
      parsingTime: sectionDuration,
    }
  );

  return sections;
}

/**
 * Fallback to generate a basic README template if AI generation fails
 */
function generateBasicReadmeTemplate(
  repoName: string,
  description?: string,
  language?: string
): ReadmeGenerationResult {
  logAI("BASIC_TEMPLATE", "Generating basic README template", {
    repoName,
    hasDescription: !!description,
    language: language || "not specified",
  });

  const content = `# ${repoName}\n\n${
    description ? description + "\n\n" : ""
  }## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Installation\n\n\`\`\`bash\n${
    language === "JavaScript" || language === "TypeScript"
      ? "npm install"
      : language === "Python"
      ? "pip install -r requirements.txt"
      : "Install dependencies"
  }\n\`\`\`\n\n## Usage\n\n\`\`\`${
    language === "JavaScript" || language === "TypeScript"
      ? "javascript"
      : language === "Python"
      ? "python"
      : ""
  }\n// Example code\n\`\`\`\n\n## Contributing\n\nContributions are welcome!\n\n## License\n\nMIT\n`;

  logAI("BASIC_CONTENT", "Generated basic README content", {
    contentLength: content.length,
  });

  const sections = parseReadmeSections(content);

  logAI("BASIC_COMPLETE", "Completed basic README template generation", {
    sectionCount: sections.length,
  });

  return {
    content,
    sections,
  };
}
