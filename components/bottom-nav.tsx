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
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-slate-800 bg-slate-900">
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              className={`block text-center py-4 min-h-12 ${pathname === tab.href ? 'text-sky-400' : 'text-slate-300'}`}
              href={tab.href}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
