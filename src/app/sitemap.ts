import type { MetadataRoute } from 'next';
import { fetchPosts, fetchModuleVisibility } from '@/lib/db';
import { isModuleVisible } from '@/lib/modules';

const BASE_URL = 'https://jpbejare.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A hidden module must not be advertised to search engines either.
  const visibility = await fetchModuleVisibility();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'monthly', priority: 1 },
  ];

  if (isModuleVisible(visibility, 'blog')) {
    staticRoutes.push({ url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 });
  }

  if (isModuleVisible(visibility, 'resume')) {
    staticRoutes.push({ url: `${BASE_URL}/resume`, changeFrequency: 'monthly', priority: 0.6 });
  }

  if (!isModuleVisible(visibility, 'blog')) {
    return staticRoutes;
  }

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
