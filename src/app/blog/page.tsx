import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, FlaskConical } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Footer from '@/components/Footer';
import { socialLinks } from '@/data/siteContent';
import { fetchPosts, fetchModuleVisibility } from '@/lib/db';
import { resolveModuleAccess } from '@/lib/visibility';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Writing | Blog & Research',
  description: 'Notes, tutorials and research write-ups.',
};

export default async function BlogIndexPage() {
  // Hidden from the public: a visitor gets a 404, the admin still sees it.
  const access = await resolveModuleAccess('blog');
  if (!access.allowed) {
    notFound();
  }

  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  let loadFailed = false;

  const visibility = await fetchModuleVisibility();

  try {
    posts = await fetchPosts();
  } catch (error) {
    loadFailed = true;
    console.error('Failed to load posts', error);
  }

  return (
    <main id="main-content" className="portfolio-shell text-slate-100">
      <AnimatedBackground />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="glass-card rounded-[2rem] p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Blog & Research</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Writing and research notes</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Tutorials, build notes and longer research write-ups. Published posts only.
          </p>

          {loadFailed && (
            <p className="mt-4 text-sm text-slate-400">
              Writing is unavailable right now. Please check back in a moment.
            </p>
          )}

          {!loadFailed && posts.length === 0 && (
            <p className="mt-4 text-sm text-slate-400">No posts published yet. Check back soon.</p>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id || post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card block rounded-[1.5rem] p-5 transition hover:border-fuchsia-400/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                  {post.kind === 'research' ? <FlaskConical size={14} /> : <FileText size={14} />}
                  {post.kind === 'research' ? 'Research' : 'Blog'}
                </span>
                {post.createdAt ? (
                  <span className="text-xs text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">{post.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">{post.excerpt}</p>
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-medium text-fuchsia-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </section>

        <Footer links={socialLinks} />
      </div>
    </main>
  );
}
