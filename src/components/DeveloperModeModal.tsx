import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface DeveloperModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
}

export const DeveloperModeModal: React.FC<DeveloperModeModalProps> = ({
  isOpen,
  onClose,
  onActivate,
}) => {
  const { settings } = useSettings();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset when opened
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setShowPassword(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleActivate = () => {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Please enter exactly 6 characters.');
      inputRef.current?.focus();
      return;
    }
    // Activated successfully
    setError(null);
    onActivate();
    onClose();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="developer-mode-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop with zero blur */}
          <motion.div
            id="developer-mode-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 Blue Dialog Box */}
          <motion.div
            id="developer-mode-modal-dialog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              transition: {
                duration: 0.15,
                ease: 'easeOut',
              },
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[580px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top thin caption */}
            <div className="pl-3.5 pr-4 py-1.5 bg-[#0063b1] text-xs font-[350] text-white/90 select-none">
              Developer Settings
            </div>

            {/* Header & Body Content Area */}
            <div className="px-6 py-3.5 space-y-2 font-[350]">
              <h2
                id="developer-mode-modal-title"
                style={{ fontWeight: 350 }}
                className="text-xl sm:text-[22px] font-[350] text-white tracking-tight leading-snug"
              >
                Activate Developer Mode?
              </h2>

              <p
                id="developer-mode-modal-description"
                style={{ fontWeight: 350 }}
                className="text-xs sm:text-[13px] text-white/95 leading-relaxed font-[350]"
              >
                Enter the 6-character security code to unlock advanced diagnostic tools and experimental system settings.
              </p>

              {/* 6-character Code Input Field */}
              <div className="mt-2">
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-white/70 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    id="input-developer-code"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.slice(0, 6));
                      if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDownInput}
                    placeholder="••••••"
                    className="w-full bg-black/20 border-2 border-white/60 rounded-none pl-9 pr-10 py-1.5 text-center text-base font-mono tracking-[0.3em] text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-all font-[350]"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-white/70 hover:text-white transition-colors cursor-pointer p-1"
                    title={showPassword ? 'Hide code' : 'Show code'}
                    aria-label={showPassword ? 'Hide code' : 'Show code'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-amber-300 mt-1.5 px-1 font-[350]">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#0078d4] px-6 py-2 pb-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-devmode-activate"
                onClick={handleActivate}
                style={{
                  border: '2px solid #FFFFFF',
                  borderBottom: '2px solid #FFFFFF',
                  boxSizing: 'border-box',
                  fontWeight: 350,
                  height: '28px',
                }}
                className="fluent-btn-primary min-w-[80px] h-[28px] px-4 py-0 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-xs font-[350] rounded-none transition-colors cursor-pointer text-center inline-flex items-center justify-center"
              >
                Activate
              </button>
              <button
                type="button"
                id="btn-devmode-close"
                onClick={onClose}
                style={{
                  border: '2px solid #FFFFFF',
                  borderBottom: '2px solid #FFFFFF',
                  boxSizing: 'border-box',
                  fontWeight: 350,
                  height: '28px',
                }}
                className="fluent-btn-secondary min-w-[80px] h-[28px] px-4 py-0 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-xs font-[350] rounded-none transition-colors cursor-pointer text-center inline-flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
