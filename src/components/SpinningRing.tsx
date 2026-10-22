import React from 'react';

export const WINDOWS_8_LOADER_GIF = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Windows-8-loader.gif?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original';

interface SpinningRingProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  ariaLabel?: string;
}

/**
 * Windows 8 loading spinning circle loader GIF.
 * Updated to official Windows 8 loader gif per request.
 */
export const SpinningRing: React.FC<SpinningRingProps> = ({
  size = 48,
  className = '',
  ariaLabel = 'Đang tải...'
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={WINDOWS_8_LOADER_GIF}
        alt="Loading..."
        className="w-full h-full object-contain pointer-events-none select-none"
        style={{
          width: size,
          height: size,
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'block',
        }}
        aria-hidden="true"
        loading="eager"
      />
    </div>
  );
};
