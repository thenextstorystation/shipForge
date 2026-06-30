import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title:       'TheDeveloper — Cinematic Portfolio',
  description: 'A cinematic portfolio of apps crafted with precision, creativity, and obsessive polish.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        {/* Fixed ambient background — CSS-animated, no JS required */}
        <div className="bg-scene" aria-hidden="true">
          <div className="bg-mesh" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="orb orb-4" />
          <div className="orb orb-5" />
          <div className="bg-grid" />
          <div className="bg-vignette" />
        </div>

        <div className="page">
          {children}
        </div>
      </body>
    </html>
  );
}
