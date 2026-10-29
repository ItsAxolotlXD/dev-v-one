import React from 'react';
import { WINDOWS_LOADING_GIF } from '../constants/assets';

interface TabLoadingScreenProps {
  route?: string;
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`w-full h-full flex-1 flex items-center justify-center min-h-[60vh] sm:min-h-[70vh] py-12 select-none my-auto pointer-events-none bg-black dark:bg-[#141414] ${className}`}
    >
      <img
        src={WINDOWS_LOADING_GIF}
        alt="Loading..."
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain select-none pointer-events-none drop-shadow-md"
        style={{ filter: 'hue-rotate(275deg) saturate(2.8) brightness(1.15)' }}
      />
    </div>
  );
};
