import React from 'react';

export interface WindowsToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
  disabled?: boolean;
  className?: string;
  showText?: boolean;
  onText?: string;
  offText?: string;
}

export const WindowsToggleSwitch: React.FC<WindowsToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  title,
  disabled = false,
  className = '',
  showText = true,
  onText = 'On',
  offText = 'Off'
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            onChange(!checked);
          }
        }}
        title={title}
        className="toggle-switch-btn focus:outline-none disabled:opacity-40"
      >
        <span className="toggle-switch-thumb" />
      </button>

      {showText && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              onChange(!checked);
            }
          }}
          className="text-sm font-normal text-white cursor-pointer select-none leading-none"
        >
          {checked ? onText : offText}
        </span>
      )}
    </div>
  );
};

export default WindowsToggleSwitch;
