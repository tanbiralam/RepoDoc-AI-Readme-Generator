import { GitHubRepo } from "@/types";

interface ReadmeGenerationViewProps {
  selectedRepo: GitHubRepo;
  generatingReadme: boolean;
  onGenerateReadme: () => Promise<void>;
}

export default function ReadmeGenerationView({
  selectedRepo,
  generatingReadme,
  onGenerateReadme,
}: ReadmeGenerationViewProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-800 p-8 transition-all duration-300 hover:shadow-blue-500/5 animate-fadeIn">
      {generatingReadme ? (
        <div className="py-6 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
          <h3 className="mt-6 text-lg font-medium text-gray-100">
            Generating README...
          </h3>
          <p className="mt-2 text-gray-400">
            Please wait while we analyze your repository and generate a README
            file.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center">
              <div className="h-16 w-16 text-blue-400 rounded-full bg-blue-900/30 border border-blue-700 flex items-center justify-center mr-4">
                <svg
                  className="h-8 w-8"
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
              <div className="text-left">
                <h3 className="text-2xl font-medium text-gray-100">
                  {selectedRepo.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {selectedRepo.full_name}
                </p>
                {selectedRepo.description && (
                  <p className="mt-2 text-sm text-gray-400 max-w-md">
                    {selectedRepo.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onGenerateReadme}
              disabled={generatingReadme}
              className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center self-center md:self-start"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Generate README
            </button>
          </div>

          <div className="mt-8 p-5 bg-gray-800/60 rounded-lg border border-gray-700">
            <h4 className="text-md font-medium text-gray-100 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-400"
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
              What will be included
            </h4>
            <p className="text-sm text-gray-400">
              We&apos;ll analyze your repository and generate a comprehensive
              README that includes project description, installation
              instructions, usage examples, and more based on your repository
              content.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-400 mr-2 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm">Project overview</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-400 mr-2 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm">
                  Installation steps
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-400 mr-2 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm">Usage examples</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-400 mr-2 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm">
                  License information
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
