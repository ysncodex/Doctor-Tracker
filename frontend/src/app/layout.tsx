import type { Metadata, Viewport } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';
import './globals.css';

// Self-hosted by Next at build time; no runtime request to Google.
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-face',
  display: 'swap',
});

const body = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body-face',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Doctor Tracker | Healthcare Administration',
  description: 'Manage doctors, patients, and healthcare analytics.',
};

export const viewport: Viewport = {
  themeColor: '#072f2b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
