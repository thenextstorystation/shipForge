import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apps } from '@/lib/content/apps';
import { generateAppMetadata } from '@/lib/content/metadata';
import AppDetailClient from '@/components/detail/AppDetailClient';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams(): Array<{ slug: string }> {
  return apps.map((app) => ({ slug: app.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  return generateAppMetadata(params.slug);
}

export default function AppDetailPage({ params }: PageProps): React.JSX.Element {
  const app = apps.find((a) => a.slug === params.slug);

  if (!app) {
    notFound();
  }

  return <AppDetailClient app={app} />;
}
