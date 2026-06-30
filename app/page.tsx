import type { Metadata } from 'next';
import { generateHomeMetadata } from '@/lib/content/metadata';
import { apps } from '@/lib/content/apps';
import HomeClient from '@/components/home/HomeClient';

export function generateMetadata(): Metadata {
  return generateHomeMetadata();
}

export default function HomePage(): React.JSX.Element {
  return <HomeClient apps={apps} />;
}
