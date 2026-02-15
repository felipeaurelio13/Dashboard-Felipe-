'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { flushOutbox } from '@/lib/sync';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = async () => {
      setOnline(true);
      await flushOutbox();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/sw.js").catch(() => null); }
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto max-w-md min-h-screen pb-20">
        <div className="sticky top-0 z-10 p-2 text-sm text-center bg-slate-900 border-b border-slate-800">
          {online ? 'Conectado' : 'Offline: cambios en cola'}
        </div>
        {children}
      </div>
    </QueryClientProvider>
  );
}
