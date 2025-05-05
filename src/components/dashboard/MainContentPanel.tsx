import { GitHubRepo, ReadmeSection } from "@/types";
import GitHubConnectionView from "./GitHubConnectionView";
import ReadmeEditorView from "./ReadmeEditorView";
import ReadmeGenerationView from "./ReadmeGenerationView";
import SelectRepoView from "./SelectRepoView";

interface MainContentPanelProps {
  hasGithubConnection: boolean;
  readmeContent: string;
  selectedRepo: GitHubRepo | null;
  generatingReadme: boolean;
  readmeSections?: ReadmeSection[];
  onReadmeContentChange: (content: string) => void;
  onGenerateReadme: () => Promise<void>;
}

export default function MainContentPanel({
  hasGithubConnection,
  readmeContent,
  selectedRepo,
  generatingReadme,
  readmeSections,
  onReadmeContentChange,
  onGenerateReadme,
}: MainContentPanelProps) {
  return (
    <div className="lg:col-span-2">
      {!hasGithubConnection ? (
        <GitHubConnectionView />
      ) : readmeContent ? (
        <ReadmeEditorView
          readmeContent={readmeContent}
          selectedRepo={selectedRepo}
          sections={readmeSections}
          onChange={onReadmeContentChange}
        />
      ) : selectedRepo ? (
        <ReadmeGenerationView
          selectedRepo={selectedRepo}
          generatingReadme={generatingReadme}
          onGenerateReadme={onGenerateReadme}
        />
      ) : (
        <SelectRepoView />
      )}
    </div>
  );
}
