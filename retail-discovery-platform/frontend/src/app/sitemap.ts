import { MetadataRoute } from 'next';
import { MOCK_OFFERS, MOCK_STORES, MOCK_FLYERS } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/offers`, lastModified: new Date() },
    { url: `${baseUrl}/flyers`, lastModified: new Date() },
    { url: `${baseUrl}/stores`, lastModified: new Date() },
    { url: `${baseUrl}/categories`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
  ];

  const offerRoutes: MetadataRoute.Sitemap = MOCK_OFFERS.map((o) => ({
    url: `${baseUrl}/offers/${o.slug}`,
    lastModified: new Date(),
  }));

  const storeRoutes: MetadataRoute.Sitemap = MOCK_STORES.map((s) => ({
    url: `${baseUrl}/stores/${s.slug}`,
    lastModified: new Date(),
  }));

  const flyerRoutes: MetadataRoute.Sitemap = MOCK_FLYERS.map((f) => ({
    url: `${baseUrl}/flyers/${f.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...offerRoutes, ...storeRoutes, ...flyerRoutes];
}
