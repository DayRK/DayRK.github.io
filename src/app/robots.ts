import type { MetadataRoute } from 'next';

const BASE_URL = 'https://jpbejare.me';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the admin area and the API out of search results.
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
