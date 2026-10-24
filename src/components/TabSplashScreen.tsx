import React, { useEffect } from 'react';
import { Compass, FileText, Folder, Home, Image, LayoutGrid, Search, Settings, Sparkles, Tv, type LucideIcon } from 'lucide-react';
import { SpinningRing } from './SpinningRing';

interface TabSplashScreenProps {
  route: string;
  label?: string;
  onFinish: () => void;
  duration?: number;
}

const routeIcons: Array<[string, LucideIcon]> = [
  ['/search', Search],
  ['/settings', Settings],
  ['/home', Home],
  ['/', Home],
  ['/feed', Sparkles],
  ['/watch', Tv],
  ['/gallery', Image],
  ['/photos', Image],
  ['/files', Folder],
  ['/file-explorer', Folder],
  ['/notes', FileText],
  ['/explore', Compass],
];

function getRouteIcon(route: string): LucideIcon {
  return routeIcons.find(([prefix]) => route === prefix || route.startsWith(`${prefix}/`))?.[1] ?? LayoutGrid;
}

export const TabSplashScreen: React.FC<TabSplashScreenProps> = ({
  route,
  label = 'Loading',
  onFinish,
  duration = 2000,
}) => {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onFinish]);

  const Icon = getRouteIcon(route);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent text-white pointer-events-auto" aria-label={`${label} loading`}>
      <div className="flex flex-col items-center gap-5 text-center">
        <Icon className="h-12 w-12 text-[#ff2bbd]" strokeWidth={1.6} aria-hidden="true" />
        <SpinningRing size={42} strokeWidth={3.5} color="#ff2bbd" />
        <span className="text-sm font-medium tracking-wide text-white/70">{label}</span>
      </div>
    </div>
  );
};
