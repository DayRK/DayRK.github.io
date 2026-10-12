import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Footer from '@/components/Footer';
import { socialLinks } from '@/data/siteContent';
import { searchContent, fetchModuleVisibility } from '@/lib/db';
import { resolveModuleAccess } from '@/lib/visibility';
import { isModuleVisible } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search | Portfolio',
  description: 'Search projects, experience, certificates and writing.',
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const access = await resolveModuleAccess('search');
  if (!access.allowed) {
    notFound();
  }

  const { q } = await searchParams;
  const query = (q ?? '').trim().slice(0, 100);
  const visibility = await fetchModuleVisibility();

  let results: Awaited<ReturnType<typeof searchContent>> = {
    projects: [],
    experience: [],
    certificates: [],
    posts: [],
  };
  let loadFailed = false;

  if (query.length >= 2) {
    try {
      results = await searchContent(query);
    } catch (error) {
      loadFailed = true;
      console.error('Failed to search content', error);
    }
  }

  // A hidden module must not leak its contents through search results either.
  if (!isModuleVisible(visibility, 'projects')) results.projects = [];
  if (!isModuleVisible(visibility, 'experience')) results.experience = [];
  if (!isModuleVisible(visibility, 'certificates')) results.certificates = [];
  if (!isModuleVisible(visibility, 'blog')) results.posts = [];

  const visibleTotal =
    results.projects.length +
    results.experience.length +
    results.certificates.length +
    results.posts.length;

  return (
    <main id="main-content" className="portfolio-shell text-slate-100">
      <AnimatedBackground />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="glass-card rounded-[2rem] p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Search</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Find anything on this site</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Searches projects, experience, certificates and published writing.
          </p>

          {/* Plain GET form: no client JavaScript needed for a search box. */}
          <form action="/search" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Try 'React' or 'Next.js'"
                aria-label="Search query"
                className="w-full rounded-full border border-white/10 bg-slate-900/70 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/40"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-6 py-3 text-sm font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/20"
            >
              Search
            </button>
          </form>

          {loadFailed && (
            <p className="mt-4 text-sm text-slate-400">Search is unavailable right now. Please try again shortly.</p>
          )}
          {!loadFailed && query.length >= 2 && visibleTotal === 0 && (
            <p className="mt-4 text-sm text-slate-400">No matches for “{query}”.</p>
          )}
          {!loadFailed && query.length >= 2 && visibleTotal > 0 && (
            <p className="mt-4 text-sm text-slate-400">
              {visibleTotal} result{visibleTotal === 1 ? '' : 's'} for “{query}”.
            </p>
          )}
        </section>

        {results.projects.length > 0 && (
          <ResultGroup title="Projects">
            {results.projects.map((project) => (
              <ResultItem key={`project-${project.id}`} title={project.title} detail={project.summary} href={project.link} />
            ))}
          </ResultGroup>
        )}

        {results.experience.length > 0 && (
          <ResultGroup title="Experience">
            {results.experience.map((item) => (
              <ResultItem
                key={`experience-${item.id}`}
                title={`${item.role} — ${item.company}`}
                detail={item.description}
                href="/#experience"
              />
            ))}
          </ResultGroup>
        )}

        {results.certificates.length > 0 && (
          <ResultGroup title="Certificates">
            {results.certificates.map((item) => (
              <ResultItem
                key={`certificate-${item.id}`}
                title={item.title}
                detail={`Issued by ${item.issuer}`}
                href="/#certificates"
              />
            ))}
          </ResultGroup>
        )}

        {results.posts.length > 0 && (
          <ResultGroup title="Writing">
            {results.posts.map((post) => (
              <ResultItem
                key={`post-${post.id}`}
                title={post.title}
                detail={post.excerpt}
                href={`/blog/${post.slug}`}
                internal
              />
            ))}
          </ResultGroup>
        )}

        <Footer links={socialLinks} />
      </div>
    </main>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-[2rem] p-6 lg:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300">{title}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ResultItem({
  title,
  detail,
  href,
  internal = false,
}: {
  title: string;
  detail: string;
  href: string;
  internal?: boolean;
}) {
  const className =
    'block rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-5 transition hover:border-fuchsia-400/40';

  if (internal) {
    return (
      <Link href={href} className={className}>
        <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
    </a>
  );
}
