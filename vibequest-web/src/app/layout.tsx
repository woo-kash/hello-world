import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// All pages are dynamic — Clerk auth requires runtime env vars
export const dynamic = 'force-dynamic';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
});

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
        <body className={`${nunito.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
