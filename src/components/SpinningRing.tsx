import React from 'react';
import { useSettings } from '../hooks/useSettings';

const LEGACY_PROGRESS_GIF = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original';

interface SpinningRingProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  ariaLabel?: string;
}

/**
 * Fluent Windows-style thick spinning progress ring.
 * Features a circular track and an animated arc in #4cc2ff.
 */
export const SpinningRing: React.FC<SpinningRingProps> = ({
  size = 48,
  strokeWidth = 5,
  className = '',
  color = '#4cc2ff',
  ariaLabel = 'Đang tải...'
}) => {
  const { settings } = useSettings();

  if (settings.legacyProgressDots) {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={LEGACY_PROGRESS_GIF}
          alt=""
          className="h-full w-full object-contain"
          style={{ filter: 'hue-rotate(275deg) saturate(2.8) brightness(1.15)' }}
        />
      </div>
    );
  }

  const radius = 18;
  const circumference = 2 * Math.PI * radius; // ~113.1
  // Arc length is approximately 25-30% of the circumference for standard Fluent ProgressRing
  const strokeDasharray = `${circumference * 0.3} ${circumference * 0.7}`;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        className={`fluent-spinning-ring ${className}`}
        style={{
          width: size,
          height: size,
          animation: 'fluent-progress-spin 1s linear infinite',
          transformOrigin: 'center center',
          display: 'block'
        }}
        aria-hidden="true"
      >
        {/* Thick spinning arc without background */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          style={{
            transformOrigin: '22px 22px'
          }}
        />
      </svg>
    </div>
  );
};
