import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { SpinningRing } from './SpinningRing';

interface TabSplashScreenProps {
  label?: string;
  onFinish: () => void;
  duration?: number;
}

export const TabSplashScreen: React.FC<TabSplashScreenProps> = ({
  label = 'Loading',
  onFinish,
  duration = 2000,
}) => {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-transparent text-white">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] shadow-lg ring-1 ring-white/10">
          <Search className="h-8 w-8 text-[#ff2bbd]" aria-hidden="true" />
        </div>
        <SpinningRing size={28} strokeWidth={3} color="#ff2bbd" />
        <span className="text-xs font-medium tracking-wide text-white/70">{label}</span>
      </div>
    </div>
  );
};
