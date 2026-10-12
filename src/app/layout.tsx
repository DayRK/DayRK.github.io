import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Providers from './providers';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const BASE_URL = 'https://jpbejare.me';
const SITE_NAME = 'Jan Patrick Bejare | Portfolio';
const SITE_DESCRIPTION =
  'Portfolio of Jan Patrick Bejare, a full stack web application developer based in Manila — projects, experience, certificates and writing.';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: '%s | Jan Patrick Bejare',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  keywords: [
    'Jan Patrick Bejare',
    'Full Stack Developer',
    'Web Developer',
    'Next.js',
    'React',
    'TypeScript',
    'Portfolio',
    'Manila',
  ],
  authors: [{ name: 'Jan Patrick Bejare', url: BASE_URL }],
  creator: 'Jan Patrick Bejare',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'en_PH',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
