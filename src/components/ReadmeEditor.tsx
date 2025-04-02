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

  useEffect(() => {
    setContent(readmeContent);
  }, [readmeContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">README Preview</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditMode(false)}
            className={`px-3 py-1 text-sm rounded-md ${!editMode ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setEditMode(true)}
            className={`px-3 py-1 text-sm rounded-md ${editMode ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Edit
          </button>
        </div>
      </div>

      {sections && !editMode && (
        <div className="flex border-b">
          <div className="w-1/4 border-r overflow-y-auto max-h-96">
            <ul className="divide-y">
              {sections.map((section: ReadmeSection, index: number) => (
                <li key={index} className="p-3 hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm font-medium">{section.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-3/4 p-6 overflow-y-auto max-h-96 prose prose-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {(!sections || editMode) && (
        <div className="flex flex-col md:flex-row border-b">
          <div className="w-full md:w-1/2 border-r">
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="# README Content"
            />
          </div>
          <div className="w-full md:w-1/2 p-6 overflow-y-auto h-96 prose prose-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 flex items-center justify-between text-xs text-gray-500">
        <span>Use Markdown syntax for formatting</span>
        <a 
          href="https://www.markdownguide.org/cheat-sheet/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Markdown Cheat Sheet
        </a>
      </div>
    </div>
  );
}
