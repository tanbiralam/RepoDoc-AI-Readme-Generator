import { useState } from "react";
import { GitHubRepo } from "@/types";
import ReadmeEditor from "@/components/ReadmeEditor";
import ExportButtons from "@/components/ExportButtons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReadmeGeneratorProps {
  readmeContent: string;
  selectedRepo: GitHubRepo | null;
  onReadmeContentChange: (content: string) => void;
  error: string | null;
}

export default function ReadmeGenerator({
  readmeContent,
  selectedRepo,
  onReadmeContentChange,
  error,
}: ReadmeGeneratorProps) {
  const [readmeFormat, setReadmeFormat] = useState<"preview" | "markdown">(
    "preview"
  );

  return (
    <div className="flex-grow">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedRepo ? (
        <>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 mb-6 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                Generated README
              </h2>

              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          readmeFormat === "preview" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setReadmeFormat("preview")}
                        className="text-xs h-8"
                      >
                        Preview
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View the rendered markdown</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          readmeFormat === "markdown" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setReadmeFormat("markdown")}
                        className="text-xs h-8"
                      >
                        Markdown
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View and edit the raw markdown</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="relative min-h-[350px] border border-gray-200 rounded-lg">
              <ReadmeEditor
                readmeContent={readmeContent || ""}
                onChange={onReadmeContentChange}
              />
            </div>

            <ExportButtons
              readmeContent={readmeContent}
              selectedRepo={selectedRepo}
            />
          </div>
        </>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-[400px]">
          <svg
            className="w-12 h-12 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            No README Generated Yet
          </h3>
          <p className="text-gray-500 max-w-md">
            Select a repository from the sidebar and click &quot;Generate
            README&quot; to create a professional README file for your project.
          </p>
        </div>
      )}
    </div>
  );
}
