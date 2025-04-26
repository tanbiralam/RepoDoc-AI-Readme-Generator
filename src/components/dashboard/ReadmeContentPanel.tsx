import { GitHubRepo, ReadmeGenerationResult } from "@/types";
import ReadmeEditor from "@/components/ReadmeEditor";
import ExportButtons from "@/components/ExportButtons";

interface ReadmeContentPanelProps {
  selectedRepo: GitHubRepo | null;
  readmeContent: string;
  readmeResult: ReadmeGenerationResult | null;
  generatingReadme: boolean;
  hasGithubConnection: boolean;
  showGitHubPrompt: boolean;
  onContentChange: (content: string) => void;
  onGenerateReadme: () => Promise<void>;
  onShowGitHubPrompt: () => void;
}

/**
 * Component for displaying the readme content and editor
 */
export function ReadmeContentPanel({
  selectedRepo,
  readmeContent,
  readmeResult,
  generatingReadme,
  hasGithubConnection,
  showGitHubPrompt,
  onContentChange,
  onGenerateReadme,
  onShowGitHubPrompt,
}: ReadmeContentPanelProps) {
  return (
    <div className="lg:col-span-2">
      {readmeContent ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/80">
              <h3 className="font-medium text-gray-900 flex items-center">
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
                README.md for {selectedRepo?.name}
              </h3>
            </div>
            <ReadmeEditor
              readmeContent={readmeContent}
              onChange={onContentChange}
              sections={readmeResult?.sections}
            />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
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
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                ></path>
              </svg>
              Export Options
            </h3>
            <ExportButtons
              readmeContent={readmeContent}
              selectedRepo={selectedRepo}
            />
          </div>
        </div>
      ) : selectedRepo ? (
        <GeneratingReadmePanel
          generatingReadme={generatingReadme}
          selectedRepo={selectedRepo}
          onGenerateReadme={onGenerateReadme}
        />
      ) : hasGithubConnection ? (
        <SelectRepositoryPanel />
      ) : (
        <GitHubConnectionRequiredPanel
          showGitHubPrompt={showGitHubPrompt}
          onShowGitHubPrompt={onShowGitHubPrompt}
        />
      )}
    </div>
  );
}

/**
 * Panel shown when a repository is selected but readme is not yet generated
 */
function GeneratingReadmePanel({
  generatingReadme,
  selectedRepo,
  onGenerateReadme,
}: {
  generatingReadme: boolean;
  selectedRepo: GitHubRepo;
  onGenerateReadme: () => Promise<void>;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-md animate-fadeIn">
      {generatingReadme ? (
        <div className="py-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <h3 className="mt-6 text-lg font-medium text-gray-900">
            Generating README...
          </h3>
          <p className="mt-2 text-gray-600">
            Please wait while we analyze your repository and generate a README
            file.
          </p>
        </div>
      ) : (
        <>
          <div className="mx-auto h-24 w-24 text-indigo-400 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <svg
              className="h-12 w-12"
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
          </div>
          <h3 className="text-xl font-medium text-gray-900">
            Ready to Generate README
          </h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Click the &quot;Generate README&quot; button in the repository panel
            to create a README for {selectedRepo.name}.
          </p>
          <button
            onClick={onGenerateReadme}
            disabled={generatingReadme}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate README
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Panel shown when user has GitHub connected but no repository selected
 */
function SelectRepositoryPanel() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-16 text-center transition-all duration-300 hover:shadow-md animate-fadeIn">
      <div className="mx-auto h-24 w-24 text-indigo-400 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 0l-8 4-8-4"
          ></path>
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900">Select a Repository</h3>
      <p className="mt-2 text-gray-600 max-w-md mx-auto">
        Choose a repository from the list to get started with generating a
        professional README.
      </p>
    </div>
  );
}

/**
 * Panel shown when GitHub connection is required
 */
function GitHubConnectionRequiredPanel({
  showGitHubPrompt,
  onShowGitHubPrompt,
}: {
  showGitHubPrompt: boolean;
  onShowGitHubPrompt: () => void;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-16 text-center transition-all duration-300 hover:shadow-md animate-fadeIn">
      <div className="mx-auto h-24 w-24 text-amber-400 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900">
        GitHub Connection Required
      </h3>
      <p className="mt-2 text-gray-600 max-w-md mx-auto">
        To generate README files, you need to connect your GitHub account. This
        allows us to access your repositories.
      </p>
      {!showGitHubPrompt && (
        <button
          onClick={onShowGitHubPrompt}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Connect GitHub
        </button>
      )}
    </div>
  );
}

export default ReadmeContentPanel;
