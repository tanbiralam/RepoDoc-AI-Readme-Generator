/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReadmeGenerationRequest,
  ReadmeGenerationResult,
  ReadmeSection,
} from "@/types";

// Helper function for consistent logging
const logReadmeGen = (stage: string, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[README-GEN][${timestamp}][${stage}] ${message}`,
    data ? JSON.stringify(data) : ""
  );

  // Only attempt to use localStorage in browser environment
  if (typeof window !== "undefined") {
    try {
      const logs = JSON.parse(localStorage.getItem("readme_ai_logs") || "[]");
      logs.push({ timestamp, stage, message, data: data || null });
      localStorage.setItem("readme_ai_logs", JSON.stringify(logs));
    } catch (e) {
      console.warn("Error storing log in localStorage:", e);
    }
  }
};

/**
 * Generate a README using Claude AI based on repo information
 * This service calls the server-side API endpoint
 */
export const generateReadmeWithAI = async (
  request: ReadmeGenerationRequest
): Promise<{ result: ReadmeGenerationResult | null; error: Error | null }> => {
  logReadmeGen("START", "Beginning README generation with AI", { request });

  try {
    logReadmeGen(
      "API_CALL",
      "Sending request to /api/generate-readme endpoint",
      {
        requestSize: JSON.stringify(request).length,
        hasPackageJson: !!request.packageJson,
        packageJsonLength: request.packageJson?.length || 0,
        hasCurrentReadme: !!request.currentReadme,
        currentReadmeLength: request.currentReadme?.length || 0,
      }
    );

    const startTime = Date.now();
    const response = await fetch("/api/generate-readme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const requestDuration = Date.now() - startTime;

    logReadmeGen(
      "API_RESPONSE",
      `Received response from API in ${requestDuration}ms`,
      {
        status: response.status,
        statusText: response.statusText,
        duration: requestDuration,
      }
    );

    // Get the response text first for logging
    const responseText = await response.text();

    // Try to parse JSON from response text
    let data: unknown;
    try {
      data = JSON.parse(responseText);
      logReadmeGen("PARSE_JSON", "Successfully parsed JSON from response", {
        hasResult: !!(data as any)?.result,
        hasError: !!(data as any)?.error,
        contentLength: (data as any)?.result?.content?.length || 0,
      });
    } catch (parseError) {
      logReadmeGen("PARSE_ERROR", "Failed to parse JSON from response", {
        responseText: responseText.substring(0, 200) + "...",
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new Error(
        `Failed to parse API response: ${
          parseError instanceof Error ? parseError.message : String(parseError)
        }`
      );
    }

    // Handle rate limit response (status 429)
    if (response.status === 429) {
      const error = (data as any)?.error || "Rate limit exceeded";
      logReadmeGen("RATE_LIMIT", "Rate limit exceeded", {
        error,
        limit: (data as any)?.limit,
        resetTime: (data as any)?.resetTime,
      });
      throw new Error(`Rate limiting error: ${error}`);
    }

    // Handle error response (even with 200 status code)
    if ((data as any)?.error && !(data as any)?.result) {
      logReadmeGen("API_ERROR", "API returned error in response body", {
        error: (data as any)?.error,
        status: response.status,
      });
      throw new Error(`API error: ${(data as any)?.error}`);
    }

    // Handle case where the API returns a 500 status but still includes a fallback template
    if (!response.ok) {
      // If the response has a result from the fallback template, use it but also log the error
      if ((data as any)?.result) {
        logReadmeGen(
          "FALLBACK_FROM_SERVER",
          "Using fallback template from server",
          {
            error: (data as any)?.error,
            status: response.status,
            templateSections: (data as any)?.result.sections?.length || 0,
          }
        );

        return {
          result: (data as any)?.result as ReadmeGenerationResult,
          error: new Error(
            (data as any)?.error || `API returned status ${response.status}`
          ),
        };
      }

      // Otherwise throw an error
      logReadmeGen(
        "API_ERROR_STATUS",
        `API returned error status: ${response.status}`,
        {
          status: response.status,
          statusText: response.statusText,
          responsePreview: responseText.substring(0, 200) + "...",
        }
      );
      throw new Error(
        `API returned status: ${response.status} - ${responseText}`
      );
    }

    // Log successful parsing
    logReadmeGen("PARSE_SUCCESS", `Processed API response successfully`, {
      hasResult: !!(data as any)?.result,
      contentLength: (data as any)?.result?.content?.length || 0,
      sectionCount: (data as any)?.result?.sections?.length || 0,
    });

    logReadmeGen("COMPLETE", "Successfully generated README", {
      totalTime: Date.now() - startTime,
      contentLength: (data as any)?.result?.content?.length || 0,
    });

    return {
      result: (data as any)?.result as ReadmeGenerationResult,
      error: null,
    };
  } catch (error) {
    logReadmeGen("ERROR", "Error in generateReadmeWithAI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      result: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Parse the generated README into sections
 */
export const parseReadmeSections = (content: string): ReadmeSection[] => {
  logReadmeGen("PARSE_SECTIONS", "Parsing README content into sections", {
    contentLength: content.length,
    lineCount: content.split("\n").length,
  });

  const sections: ReadmeSection[] = [];
  const lines = content.split("\n");

  let currentSection: ReadmeSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line is a heading
    if (line.startsWith("# ")) {
      // If we already have a current section, add it to the list
      if (currentSection) {
        sections.push(currentSection);
        logReadmeGen(
          "SECTION_ADDED",
          `Added section: ${currentSection.title}`,
          {
            level: currentSection.level,
            contentLength: currentSection.content.length,
          }
        );
      }

      // Start a new section with an H1 heading
      currentSection = {
        title: line.substring(2).trim(),
        content: line + "\n",
        level: 1,
      };
      logReadmeGen(
        "SECTION_STARTED",
        `Started new H1 section: ${currentSection.title}`,
        { lineNumber: i }
      );
    } else if (line.startsWith("## ")) {
      // If we already have a current section, add it to the list
      if (currentSection) {
        sections.push(currentSection);
        logReadmeGen(
          "SECTION_ADDED",
          `Added section: ${currentSection.title}`,
          {
            level: currentSection.level,
            contentLength: currentSection.content.length,
          }
        );
      }

      // Start a new section with an H2 heading
      currentSection = {
        title: line.substring(3).trim(),
        content: line + "\n",
        level: 2,
      };
      logReadmeGen(
        "SECTION_STARTED",
        `Started new H2 section: ${currentSection.title}`,
        { lineNumber: i }
      );
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
      logReadmeGen(
        "SECTION_STARTED",
        "Started introduction section (no heading)",
        { lineNumber: i }
      );
    }
  }

  // Add the last section if there is one
  if (currentSection) {
    sections.push(currentSection);
    logReadmeGen(
      "SECTION_ADDED",
      `Added final section: ${currentSection.title}`,
      {
        level: currentSection.level,
        contentLength: currentSection.content.length,
      }
    );
  }

  logReadmeGen(
    "PARSE_COMPLETE",
    `Parsed ${sections.length} sections from README content`,
    {
      sectionCount: sections.length,
    }
  );

  return sections;
};

/**
 * Fallback to generate a basic README template if AI generation fails
 */
export const generateBasicReadmeTemplate = (
  repoName: string,
  description?: string,
  language?: string
): ReadmeGenerationResult => {
  logReadmeGen("TEMPLATE", "Generating basic README template", {
    repoName,
    description: description || "none provided",
    language: language || "unknown",
  });

  // Installation command based on language
  const installCommand =
    language === "JavaScript" || language === "TypeScript"
      ? "npm install"
      : language === "Python"
      ? "pip install -r requirements.txt"
      : "Install dependencies";

  // Example code language
  const codeLanguage =
    language === "JavaScript" || language === "TypeScript"
      ? "javascript"
      : language === "Python"
      ? "python"
      : "";

  const content = `# ${repoName}

${description ? description + "\n\n" : ""}## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
${installCommand}
\`\`\`

## Usage

\`\`\`${codeLanguage}
// Example code
\`\`\`

## Contributing

Contributions are welcome!

## License

MIT
`;

  logReadmeGen("TEMPLATE_CONTENT", "Generated basic README content", {
    contentLength: content.length,
    lineCount: content.split("\n").length,
  });

  const sections = parseReadmeSections(content);

  logReadmeGen(
    "TEMPLATE_COMPLETE",
    "Completed basic README template generation",
    {
      sectionCount: sections.length,
    }
  );

  return {
    content,
    sections,
  };
};
