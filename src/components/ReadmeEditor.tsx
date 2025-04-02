import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReadmeGenerationResult, ReadmeSection } from '@/types';

interface ReadmeEditorProps {
  readmeContent: string;
  onChange: (content: string) => void;
  sections?: ReadmeGenerationResult['sections'];
}

export default function ReadmeEditor({ readmeContent, onChange, sections }: ReadmeEditorProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [content, setContent] = useState<string>(readmeContent);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  useEffect(() => {
    setContent(readmeContent);
  }, [readmeContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const scrollToSection = (index: number) => {
    setActiveSection(index);
    // Could implement scroll to section functionality here
    // For simplicity, we're just highlighting the active section for now
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-md">
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">README Preview</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditMode(false)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${!editMode ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setEditMode(true)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${editMode ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Edit
          </button>
        </div>
      </div>

      {sections && !editMode && (
        <div className="flex border-b-2 border-gray-200">
          <div className="w-1/4 border-r-2 border-gray-200 overflow-y-auto max-h-[500px] bg-gray-50">
            <ul className="divide-y divide-gray-200">
              {sections.map((section: ReadmeSection, index: number) => (
                <li 
                  key={index} 
                  className={`p-3 hover:bg-blue-50 cursor-pointer transition-colors ${activeSection === index ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                  onClick={() => scrollToSection(index)}
                >
                  <span className={`text-sm ${section.level === 1 ? 'font-bold text-gray-800' : 'font-medium text-gray-700'} ${activeSection === index ? 'text-blue-700' : ''}`}>
                    {section.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-3/4 p-6 overflow-y-auto max-h-[500px] prose prose-blue prose-headings:font-bold prose-headings:text-gray-900 max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {(!sections || editMode) && (
        <div className="flex flex-col md:flex-row border-b-2 border-gray-200">
          <div className="w-full md:w-1/2 border-r-2 border-gray-200">
            <div className="bg-gray-50 p-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-700">MARKDOWN EDITOR</span>
            </div>
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-[500px] p-5 font-mono text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 leading-relaxed border-0"
              placeholder="# README Content"
              spellCheck="false"
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-gray-50 p-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-700">PREVIEW</span>
            </div>
            <div className="p-6 overflow-y-auto h-[500px] prose prose-blue prose-headings:font-bold prose-headings:text-gray-900 max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-4 flex items-center justify-between text-sm text-gray-600 border-t border-gray-200">
        <span className="font-medium">Use Markdown syntax for formatting</span>
        <a 
          href="https://www.markdownguide.org/cheat-sheet/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-semibold flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Markdown Cheat Sheet
        </a>
      </div>
    </div>
  );
}
