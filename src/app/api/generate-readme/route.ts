import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ReadmeGenerationRequest, ReadmeGenerationResult, ReadmeSection } from '@/types';

// Initialize Anthropic client with Claude API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

/**
 * API route handler for README generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReadmeGenerationRequest;
    const { repoName, repoDescription, repoLanguage, packageJson, mainFiles, currentReadme } = body;
    
    // Construct the prompt for README generation
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
      prompt += `Main Files: ${mainFiles.join(', ')}\n`;
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

    // Call Claude API to generate the README
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      system: 'You are an expert software developer that creates professional README.md files for GitHub repositories.',
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Parse the response content
    const content = message.content.find(c => c.type === 'text')?.text || '';
    
    // Parse the generated README into sections
    const sections = parseReadmeSections(content);
    
    const result: ReadmeGenerationResult = {
      content,
      sections,
    };
    
    return NextResponse.json({ result, error: null });
  } catch (error) {
    console.error('Error generating README:', error);
    
    // Get request body for fallback template
    let repoName = 'Repository';
    let repoDescription = '';
    let repoLanguage = '';
    
    try {
      const requestBody = await request.json() as ReadmeGenerationRequest;
      repoName = requestBody.repoName;
      repoDescription = requestBody.repoDescription || '';
      repoLanguage = requestBody.repoLanguage || '';
    } catch {}
    
    // Fallback to basic template if AI generation fails
    const basicTemplate = generateBasicReadmeTemplate(
      repoName, 
      repoDescription, 
      repoLanguage
    );
    
    return NextResponse.json(
      { result: basicTemplate, error: 'Failed to generate README with AI. Using basic template instead.' },
      { status: 500 }
    );
  }
}

/**
 * Parse the generated README into sections
 */
function parseReadmeSections(content: string): ReadmeSection[] {
  const sections: ReadmeSection[] = [];
  const lines = content.split('\n');
  
  let currentSection: ReadmeSection | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a heading
    if (line.startsWith('# ')) {
      // If we already have a current section, add it to the list
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start a new section with an H1 heading
      currentSection = {
        title: line.substring(2).trim(),
        content: line + '\n',
        level: 1,
      };
    } else if (line.startsWith('## ')) {
      // If we already have a current section, add it to the list
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start a new section with an H2 heading
      currentSection = {
        title: line.substring(3).trim(),
        content: line + '\n',
        level: 2,
      };
    } else if (currentSection) {
      // Add this line to the current section's content
      currentSection.content += line + '\n';
    } else {
      // If we don't have a current section yet, create one for the preamble
      currentSection = {
        title: 'Introduction',
        content: line + '\n',
        level: 0,
      };
    }
  }
  
  // Add the last section if there is one
  if (currentSection) {
    sections.push(currentSection);
  }
  
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
  const content = `# ${repoName}\n\n${
    description ? description + '\n\n' : ''
  }## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Installation\n\n\`\`\`bash\n${
    language === 'JavaScript' || language === 'TypeScript'
      ? 'npm install'
      : language === 'Python'
      ? 'pip install -r requirements.txt'
      : 'Install dependencies'
  }\n\`\`\`\n\n## Usage\n\n\`\`\`${
    language === 'JavaScript' || language === 'TypeScript'
      ? 'javascript'
      : language === 'Python'
      ? 'python'
      : ''
  }\n// Example code\n\`\`\`\n\n## Contributing\n\nContributions are welcome!\n\n## License\n\nMIT\n`;

  const sections = parseReadmeSections(content);

  return {
    content,
    sections,
  };
}
