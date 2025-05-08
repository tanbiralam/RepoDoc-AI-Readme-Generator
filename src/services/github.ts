import { Octokit } from "@octokit/rest";
import { GitHubRepo } from "@/types";

/**
 * Fetch public repositories for a GitHub user
 */
export const fetchPublicRepos = async (
  username: string
): Promise<{ repos: GitHubRepo[]; error: Error | null }> => {
  try {
    const octokit = new Octokit();

    const { data } = await octokit.repos.listForUser({
      username,
      sort: "updated",
      per_page: 100,
    });

    const repos: GitHubRepo[] = data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      private: repo.private,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
    }));

    return { repos, error: null };
  } catch (error) {
    console.error("Error fetching public repos:", error);
    return { repos: [], error: error as Error };
  }
};

/**
 * Fetch repositories for the authenticated user (includes private repos if authorized)
 */
export const fetchUserRepos = async (
  token: string
): Promise<{ repos: GitHubRepo[]; error: Error | null }> => {
  try {
    const octokit = new Octokit({
      auth: token,
    });

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    const repos: GitHubRepo[] = data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      private: repo.private,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
    }));

    return { repos, error: null };
  } catch (error) {
    console.error("Error fetching user repos:", error);
    return { repos: [], error: error as Error };
  }
};

/**
 * Get repository details by owner and repo name
 */
export const getRepoDetails = async (
  owner: string,
  repo: string,
  token?: string
): Promise<{ repo: GitHubRepo | null; error: Error | null }> => {
  try {
    const octokit = new Octokit(token ? { auth: token } : {});

    const { data } = await octokit.repos.get({
      owner,
      repo,
    });

    const repoDetails: GitHubRepo = {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      private: data.private,
      language: data.language,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      updated_at: data.updated_at,
      topics: data.topics || [],
    };

    return { repo: repoDetails, error: null };
  } catch (error) {
    console.error("Error getting repo details:", error);
    return { repo: null, error: error as Error };
  }
};

/**
 * Get the package.json file content from a repository
 */
export const getPackageJson = async (
  owner: string,
  repo: string,
  token?: string
): Promise<{ content: string | null; error: Error | null }> => {
  try {
    const octokit = new Octokit(token ? { auth: token } : {});

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "package.json",
    });

    if ("content" in data) {
      const decodedContent = Buffer.from(data.content, "base64").toString(
        "utf-8"
      );
      return { content: decodedContent, error: null };
    }

    throw new Error("package.json not found or not a file");
  } catch (error) {
    // Return null content but not error if file simply doesn't exist
    if ((error as any).status === 404) {
      console.log(`package.json not found in ${owner}/${repo} repository`);
      return { content: null, error: null };
    }

    console.error("Error getting package.json:", error);
    return { content: null, error: error as Error };
  }
};

/**
 * Get the README.md file content from a repository
 */
export const getReadmeContent = async (
  owner: string,
  repo: string,
  token?: string
): Promise<{ content: string | null; error: Error | null }> => {
  try {
    const octokit = new Octokit(token ? { auth: token } : {});

    const { data } = await octokit.repos.getReadme({
      owner,
      repo,
    });

    if ("content" in data) {
      const decodedContent = Buffer.from(data.content, "base64").toString(
        "utf-8"
      );
      return { content: decodedContent, error: null };
    }

    throw new Error("README.md not found or not accessible");
  } catch (error) {
    // Return null content but not error if file simply doesn't exist
    if ((error as any).status === 404) {
      return { content: null, error: null };
    }

    console.error("Error getting README.md:", error);
    return { content: null, error: error as Error };
  }
};

/**
 * Commit a new or updated README to a GitHub repository
 */
export const commitReadmeToRepo = async (
  owner: string,
  repo: string,
  content: string,
  token: string,
  message: string = "Update README.md via GitHub README Generator"
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const octokit = new Octokit({ auth: token });

    // First check if README.md already exists
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: "README.md",
      });

      if ("sha" in data) {
        sha = data.sha;
      }
    } catch (error) {
      // README.md doesn't exist, that's fine
    }

    // Create or update the README.md file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "README.md",
      message,
      content: Buffer.from(content).toString("base64"),
      sha, // Include SHA if updating existing file
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error committing README to repo:", error);
    return { success: false, error: error as Error };
  }
};
