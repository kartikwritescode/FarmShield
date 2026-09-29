import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../providers/LanguageProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { ToastProvider } from '../components/ui/Toast';
import { AuthModal } from '../components/auth/AuthModal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FarmShield - Digital Farm Management & MRL Portal',
  description: 'Digital farm management portal for Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) monitoring in livestock & aquaculture.',
};

import { QueryProvider } from '../providers/QueryProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-teal-700 selection:text-white" suppressHydrationWarning>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="flex-1 flex flex-col">{children}</div>
                <AuthModal />
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
