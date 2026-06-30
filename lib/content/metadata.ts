import type { Metadata } from 'next';
import { apps } from './apps';

export function generateHomeMetadata(): Metadata {
  return {
    title:       'TheDeveloper — Cinematic Portfolio',
    description: 'A cinematic portfolio of apps crafted with precision, creativity, and obsessive polish. 10+ apps. One unforgettable journey.',
    openGraph: {
      title:       'TheDeveloper — Cinematic Portfolio',
      description: '10+ apps. One unforgettable journey.',
      type:        'website',
      siteName:    'TheDeveloper',
    },
    twitter: {
      card:        'summary_large_image',
      title:       'TheDeveloper — Cinematic Portfolio',
      description: '10+ apps. One unforgettable journey.',
    },
  };
}

export function generateAppMetadata(slug: string): Metadata {
  const app = apps.find((a) => a.slug === slug);

  if (!app) {
    return {
      title:       'App Not Found — TheDeveloper',
      description: 'This application could not be found.',
    };
  }

  return {
    title:       `${app.name} — TheDeveloper`,
    description: app.tagline,
    openGraph: {
      title:       `${app.name} — TheDeveloper`,
      description: app.tagline,
      type:        'website',
      siteName:    'TheDeveloper',
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${app.name} — TheDeveloper`,
      description: app.tagline,
    },
  };
}
