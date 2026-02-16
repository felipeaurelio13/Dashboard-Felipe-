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
          <a href="#main-content" className="skip-link">Saltar al contenido</a>
          <main id="main-content" className="mx-auto w-full max-w-md space-y-3 px-3 pb-28 pt-4">{children}</main>
          <AppFooter />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
