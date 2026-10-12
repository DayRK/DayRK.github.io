/**
 * GitHub API integration.
 *
 * Runs only on the server. The optional token raises the rate limit (60 -> 5000
 * requests per hour); it is never sent to the browser.
 *
 * Failures are swallowed on purpose: a dead GitHub should never take the
 * portfolio down with it.
 */

export type GithubRepo = {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  updatedAt: string;
};

type GithubApiRepo = {
  id?: number;
  name?: string;
  description?: string | null;
  html_url?: string;
  language?: string | null;
  stargazers_count?: number;
  updated_at?: string;
  fork?: boolean;
  archived?: boolean;
};

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'DayRK';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Cached for an hour, so the portfolio does not spend its GitHub allowance on
// every page view.
const REVALIDATE_SECONDS = 60 * 60;

export async function fetchGithubRepos(limit = 6): Promise<GithubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'jan-patrick-portfolio',
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } }
    );

    if (!response.ok) {
      console.error('GitHub request failed:', response.status);
      return [];
    }

    const data = (await response.json()) as GithubApiRepo[];

    return (Array.isArray(data) ? data : [])
      .filter((repo) => !repo.fork && !repo.archived)
      .map((repo) => ({
        id: Number(repo.id ?? 0),
        name: String(repo.name ?? ''),
        description: String(repo.description ?? ''),
        url: String(repo.html_url ?? ''),
        language: String(repo.language ?? ''),
        stars: Number(repo.stargazers_count ?? 0),
        updatedAt: String(repo.updated_at ?? ''),
      }))
      .filter((repo) => repo.name.length > 0)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, limit);
  } catch (error) {
    console.error('GitHub request error:', error);
    return [];
  }
}
