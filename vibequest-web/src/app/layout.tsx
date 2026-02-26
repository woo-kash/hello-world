import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// All pages are dynamic — Clerk auth requires runtime env vars
export const dynamic = 'force-dynamic';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VibeQuest — Learn to Code with AI',
  description: 'Story-driven AI coding adventures for kids aged 6–16. Teach your child to think like a programmer through fun missions powered by Claude AI.',
  openGraph: {
    title: 'VibeQuest — Learn to Code with AI',
    description: 'Story-driven AI coding adventures for kids aged 6–16.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
