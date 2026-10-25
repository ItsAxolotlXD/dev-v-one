import React, { useEffect } from 'react';
import { LayoutGrid, type LucideIcon } from 'lucide-react';
import {
  FluentArticlesIcon,
  FluentCraftmineIcon,
  FluentFileExplorerIcon,
  FluentHomeIcon,
  FluentNotesIcon,
  FluentPhotosIcon,
  FluentSearchIcon,
  FluentSettingsIcon,
  FluentTilesIcon,
  FluentWatchIcon,
} from './FluentIcons';
import { SpinningRing } from './SpinningRing';

interface TabSplashScreenProps {
  route: string;
  label?: string;
  onFinish: () => void;
  duration?: number;
}

type SplashIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const routeIcons: Array<[string, SplashIcon]> = [
  ['/search', FluentSearchIcon],
  ['/settings', FluentSettingsIcon],
  ['/home', FluentHomeIcon],
  ['/', FluentHomeIcon],
  ['/feed', FluentArticlesIcon],
  ['/watch', FluentWatchIcon],
  ['/gallery', FluentPhotosIcon],
  ['/photos', FluentPhotosIcon],
  ['/files', FluentFileExplorerIcon],
  ['/file-explorer', FluentFileExplorerIcon],
  ['/notes', FluentNotesIcon],
  ['/craftmine', FluentCraftmineIcon],
  ['/tiles', FluentTilesIcon],
];

function getRouteIcon(route: string): SplashIcon {
  return routeIcons.find(([prefix]) => route === prefix || route.startsWith(`${prefix}/`))?.[1] ?? LayoutGrid;
}

export const TabSplashScreen: React.FC<TabSplashScreenProps> = ({
  route,
  label = 'Loading',
  onFinish,
  duration = 350,
}) => {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onFinish]);

  const Icon = getRouteIcon(route);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-inherit text-white pointer-events-auto" aria-label={`${label} loading`}>
      <div className="flex flex-col items-center gap-5 text-center">
        <Icon className="size-12 shrink-0" aria-hidden="true" />
        <SpinningRing size={42} strokeWidth={3.5} color="#ff2bbd" />
        <span className="text-sm font-medium tracking-wide text-white/70">{label}</span>
      </div>
    </div>
  );
};
