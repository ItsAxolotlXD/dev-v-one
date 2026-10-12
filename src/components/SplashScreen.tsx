import React, { useEffect, useState } from 'react';
import { SpinningRing } from './SpinningRing';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/d/d4/V-one-dev.png/revision/latest?cb=20261012151735';

interface SplashScreenProps {
  duration?: number; // duration in ms, default 700ms for fast startup
  onFinish?: () => void;
  subtitle?: string;
  isClosable?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  duration = 700,
  onFinish,
  subtitle,
  isClosable = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const dismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, 180);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isClosable) {
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [duration, isClosable]);

  if (!isVisible) return null;

  return (
    <div
      id="vplay-splash-screen"
      onClick={() => {
        if (isClosable) dismiss();
      }}
      className={`fixed inset-0 z-[99999] bg-[#1b1f24] dark:bg-[#1b1f24] text-white dark:text-white flex flex-col items-center justify-center select-none transition-all duration-200 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isClosable ? 'cursor-pointer' : ''}`}
    >
      {/* Splash content: logo, spinning ring and subtitle all centered together with enlarged gap */}
      <div className="flex flex-col items-center justify-center gap-12 sm:gap-16 text-center px-6 max-w-md w-full">
        {/* Logo web in the center */}
        <div className="flex items-center justify-center">
          {!logoError ? (
            <img
              src={LOGO_SRC}
              alt="V-One (Dev)"
              referrerPolicy="no-referrer"
              className="h-16 sm:h-20 md:h-24 w-auto max-w-[180px] sm:max-w-[220px] object-contain drop-shadow-md transition-all"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[#4cc2ff] font-black text-5xl sm:text-6xl tracking-tighter">V</span>
          )}
        </div>

        {/* Spinning ring and subtitle centered with generous spacing below logo */}
        <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
          <SpinningRing size={34} strokeWidth={4} color="#4cc2ff" />
          {subtitle && (
            <p className="text-[12.5px] sm:text-[13.5px] text-[#FFFFFF]/90 dark:text-[#FFFFFF]/90 font-normal tracking-wide max-w-md">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
