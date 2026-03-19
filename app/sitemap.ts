import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://resumeats-nine.vercel.app';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/builder`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/scanner`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];
}
