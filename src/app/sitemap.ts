import type { MetadataRoute } from 'next';
import { fetchPosts } from '@/lib/db';

const BASE_URL = 'https://jpbejare.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/resume`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  try {
    posts = await fetchPosts();
  } catch (error) {
    // A missing database must not break the sitemap — fall back to the static routes.
    console.error('Sitemap: failed to load posts', error);
  }

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      ...(post.createdAt ? { lastModified: new Date(post.createdAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...postRoutes];
}
