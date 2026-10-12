import { Star } from 'lucide-react';
import { fetchGithubRepos } from '@/lib/github';

// Server component: the GitHub call and token stay on the server, and nothing
// is hidden behind a client bundle.
export default async function GithubSection() {
  const repos = await fetchGithubRepos();

  // Hide the section entirely when GitHub is unreachable or has no repos.
  if (repos.length === 0) {
    return null;
  }

  return (
    <section id="github" className="glass-card rounded-[2rem] p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Open Source</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Recent GitHub work</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">Public repositories, newest activity first.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <a
            key={repo.id || repo.name}
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-5 transition hover:border-fuchsia-400/40"
          >
            <h3 className="text-lg font-semibold tracking-tight text-white">{repo.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-7 text-slate-300">
              {repo.description || 'No description yet.'}
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              {repo.language ? <span>{repo.language}</span> : null}
              {repo.stars > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Star size={13} /> {repo.stars}
                </span>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
