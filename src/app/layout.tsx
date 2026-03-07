import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'RouteBoost — AI Growth Assistant for Food Trucks',
  description:
    'RouteBoost uses AI to help food trucks, pop-ups, and mobile catering choose better locations, post on social media automatically, and get booked for events — so every day is a good day.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  manifest: '/manifest.webmanifest',
  keywords: [
    'food truck app',
    'food truck marketing',
    'food truck location planning',
    'AI food truck',
    'food truck social media',
    'mobile food business',
    'food truck software',
    'food truck booking',
    'pop-up shop app',
    'food truck growth',
  ],
  authors: [{ name: 'RouteBoost' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'RouteBoost — AI Growth Assistant for Food Trucks',
    description:
      'AI helps food trucks choose better locations, post on social media automatically, and get booked for events. Never have a slow day again.',
    url: 'https://routeboost.dev',
    siteName: 'RouteBoost',
    images: [
      {
        url: '/icons/OGimage.png',
        width: 1200,
        height: 630,
        alt: 'RouteBoost — AI Growth Assistant for Food Trucks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RouteBoost — AI Growth Assistant for Food Trucks',
    description:
      'AI helps food trucks choose better locations, post on social media automatically, and get booked for events.',
    images: ['/icons/OGimage.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RouteBoost',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-XEW2BG097D" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XEW2BG097D');
      `}</Script>
    </html>
  );
}