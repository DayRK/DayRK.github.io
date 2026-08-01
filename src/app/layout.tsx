import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jan Patrick Bejare | Portfolio',
  description: 'Portfolio of Jan Patrick Bejare — software engineer and product-focused developer.',
  metadataBase: new URL('https://jpbejare.me'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
