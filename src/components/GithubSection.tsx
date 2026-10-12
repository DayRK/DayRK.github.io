import { Star } from 'lucide-react';
import { fetchGithubRepos } from '@/lib/github';

// Server component: the GitHub call and token stay on the server, so nothing
// ships to the browser bundle.
export default async function GithubSection() {
  const repos = await fetchGithubRepos();

  if (repos.length === 0) return null;

  return (
    <section id="github" className="section">
      <div className="mb-10">
        <p className="eyebrow">005 / Open source</p>
        <h2 className="heading mt-2">Recent GitHub work</h2>
      </div>

      <ul className="grid gap-x-8 sm:grid-cols-2">
        {repos.map((repo) => (
          <li key={repo.id || repo.name} className="border-t py-5" style={{ borderColor: 'var(--line)' }}>
            <a href={repo.url} target="_blank" rel="noreferrer" className="group block">
              <h3 className="text-base font-semibold transition-colors">{repo.name}</h3>
              <p className="mt-1.5 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                {repo.description || 'No description yet.'}
              </p>
              <div className="mt-3 flex items-center gap-4 font-mono text-xs" style={{ color: 'var(--text-faint)' }}>
                {repo.language ? <span>{repo.language}</span> : null}
                {repo.stars > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} /> {repo.stars}
                  </span>
                ) : null}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
