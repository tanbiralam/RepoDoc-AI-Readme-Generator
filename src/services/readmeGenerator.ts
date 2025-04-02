import { ReadmeGenerationRequest, ReadmeGenerationResult, ReadmeSection } from '@/types';

/**
 * Generate a README using Claude AI based on repo information
 * This service calls the server-side API endpoint
 */
export const generateReadmeWithAI = async (
  request: ReadmeGenerationRequest
): Promise<{ result: ReadmeGenerationResult | null; error: Error | null }> => {
  try {
    const response = await fetch('/api/generate-readme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating README:', error);
    return { 
      result: generateBasicReadmeTemplate(
        request.repoName, 
        request.repoDescription, 
        request.repoLanguage
      ), 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

/**
 * Parse the generated README into sections
 */
export const parseReadmeSections = (content: string): ReadmeSection[] => {
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
};

/**
 * Fallback to generate a basic README template if AI generation fails
 */
export const generateBasicReadmeTemplate = (
  repoName: string,
  description?: string,
  language?: string
): ReadmeGenerationResult => {
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
};
