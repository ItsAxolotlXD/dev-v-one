import React, { useEffect } from 'react';
import { WINDOWS_LOADING_GIF } from '../constants/assets';

export interface TabSplashScreenProps {
  route?: string;
  label?: string;
  onFinish: () => void;
  duration?: number;
}

export const TabSplashScreen: React.FC<TabSplashScreenProps> = ({
  onFinish,
  duration = 2000,
}) => {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading..."
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 dark:bg-[#141414] select-none pointer-events-auto transition-opacity duration-200"
    >
      <div className="flex items-center justify-center">
        <img
          src={WINDOWS_LOADING_GIF}
          alt="Loading..."
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain select-none pointer-events-none drop-shadow-md"
          style={{ filter: 'hue-rotate(275deg) saturate(2.8) brightness(1.15)' }}
        />
      </div>
    </div>
  );
};
