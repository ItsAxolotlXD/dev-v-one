import React, { useEffect, useState } from 'react';
import { SpinningRing } from './SpinningRing';

const LOGO_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7bX9C6ZMjpXAbn0eXLI2Wk6ZhwUwk0.png';
const MICROSOFT_LOGO_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-r1SabPVCokA68COSioto4rPEgZkHxF.png';

const WINDOWS_LOADING_GIF = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original';

interface SplashScreenProps {
  duration?: number; // duration in ms, defaults to 5600ms (2 loops of 2.8s loading gif)
  onFinish?: () => void;
  subtitle?: string;
  isClosable?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  duration = 5600,
  onFinish,
  subtitle,
  isClosable = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const dismiss = () => {
    setIsVisible(false);
    onFinish?.();
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
      className={`fixed inset-0 z-[99999] bg-[#1b1f24] dark:bg-[#1b1f24] text-white dark:text-white flex flex-col items-center justify-center select-none ${isClosable ? 'cursor-pointer' : ''}`}
    >
      {/* Splash content: logo, spinning ring and subtitle all centered together with enlarged gap */}
      <div className="flex flex-col items-center justify-center gap-12 sm:gap-16 text-center px-6 max-w-md w-full">
        {/* Logo web in the center */}
        <div className="flex items-center justify-center">
          {!logoError ? (
            <img
              src={LOGO_SRC}
              alt="Microsoft Edge Dev"
              referrerPolicy="no-referrer"
              className="h-16 sm:h-20 md:h-24 w-auto max-w-[180px] sm:max-w-[220px] object-contain drop-shadow-md transition-all"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[#4cc2ff] font-black text-5xl sm:text-6xl tracking-tighter">V</span>
          )}
        </div>

        {/* Windows loading gif running exactly for 2 loops (5.6s) */}
        <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
          <div className="w-9 h-9 flex items-center justify-center">
            <img
              src={WINDOWS_LOADING_GIF}
              alt="Loading"
              className="w-8 h-8 object-contain"
              style={{ filter: 'hue-rotate(275deg) saturate(2.8) brightness(1.15)' }}
            />
          </div>
          {subtitle && (
            <p className="text-[12.5px] sm:text-[13.5px] text-[#FFFFFF]/90 dark:text-[#FFFFFF]/90 font-normal tracking-wide max-w-md">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <img
        src={MICROSOFT_LOGO_SRC}
        alt="Microsoft"
        className="microsoft-splash-logo absolute bottom-5 left-1/2 w-28 max-w-[40vw] -translate-x-1/2 object-contain opacity-90 sm:bottom-7 sm:w-36"
        style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      />
    </div>
  );
};
