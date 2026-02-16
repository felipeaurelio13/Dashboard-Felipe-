'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/today', label: 'Hoy' },
  { href: '/week', label: 'Semana' },
  { href: '/month', label: 'Mes' },
  { href: '/logs', label: 'Logs' },
  { href: '/settings', label: 'Ajustes' }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md border-t border-slate-800/90 bg-slate-950/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-14 items-center justify-center text-center text-xs font-medium transition ${isActive ? 'text-sky-300' : 'text-slate-300 hover:text-sky-100'}`}
                href={tab.href}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
