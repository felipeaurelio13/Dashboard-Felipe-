import appPackage from '@/package.json';
import { toVersionLabel } from '@/lib/app-version';

export function AppFooter() {
  return (
    <footer className="px-4 py-3 text-xs text-slate-400">
      {toVersionLabel(appPackage.version)}
    </footer>
  );
}
