import './globals.css';
import { Providers } from '@/components/providers';
import { BottomNav } from '@/components/bottom-nav';
import { AppFooter } from '@/components/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ritual OS',
  description: 'Sistema semanal/mensual de gestión, offline-first.',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <main className="p-3 space-y-3">{children}</main>
          <AppFooter />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
