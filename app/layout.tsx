import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HODL — We Never Sell',
  description: 'HODL — Hold on for dear life. Into the vault. Out of circulation. We never sell.',
  openGraph: {
    title: 'HODL — We Never Sell',
    description: 'Into the vault. Out of circulation. Once HODL goes in, it never comes out.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/archivo-latin-900-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
