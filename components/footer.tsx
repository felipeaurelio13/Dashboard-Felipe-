import appPackage from '@/package.json';
import { toVersionLabel } from '@/lib/app-version';

export function AppFooter() {
  return (
    <footer className="mx-auto w-full max-w-md px-4 pb-20 pt-4 text-center text-xs text-slate-400">
      {toVersionLabel(appPackage.version)} · Mobile-first UX
    </footer>
  );
}
