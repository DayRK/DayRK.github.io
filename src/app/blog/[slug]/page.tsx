import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import Footer from '@/components/Footer';
import { socialLinks } from '@/data/siteContent';
import { fetchPostBySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug).catch(() => null);

  if (!post) {
    return { title: 'Post not found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug).catch((error) => {
    console.error('Failed to load post', error);
    return null;
  });

  if (!post) {
    notFound();
  }

  return (
    <main id="main-content" className="portfolio-shell text-slate-100">
      <AnimatedBackground />
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <article className="glass-card rounded-[2rem] p-8 lg:p-10">
          <Link href="/blog" className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
            ← Back to writing
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
            {post.kind === 'research' ? 'Research' : 'Blog'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm text-slate-400">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
          </p>
          <p className="mt-6 text-base leading-8 text-slate-200">{post.excerpt}</p>

          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-medium text-fuchsia-200">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rendered as plain text so stored content can never inject markup. */}
          <div className="mt-8 whitespace-pre-wrap text-[0.95rem] leading-8 text-slate-300">
            {post.content}
          </div>
        </article>

        <Footer links={socialLinks} />
      </div>
    </main>
  );
}
