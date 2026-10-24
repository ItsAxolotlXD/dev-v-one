import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';

interface UnderConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export const UnderConstructionModal: React.FC<UnderConstructionModalProps> = ({
  isOpen,
  onClose,
  title = 'Under construction',
  description = 'This feature is working in progress and might be available in future builds.',
  buttonText = 'Understood',
}) => {
  const { settings } = useSettings();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="under-construction-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop without background blur */}
          <motion.div
            id="under-construction-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* 2. Dialog Modal Box - Windows 10 Solid Blue Dialog Style */}
          <motion.div
            id="under-construction-modal-dialog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.98,
              transition: {
                duration: 0.15,
                ease: 'easeOut'
              }
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[580px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top thin caption bar */}
            <div className="pl-3.5 pr-4 py-1.5 bg-[#0063b1] text-xs font-[350] text-white/90 select-none">
              Sparkle System Notice
            </div>

            {/* Header & Body Content Area */}
            <div className="px-6 py-3.5 space-y-1.5 font-[350]">
              <h2
                id="under-construction-modal-title"
                style={{ fontWeight: 350 }}
                className="text-xl sm:text-[22px] font-[350] text-white tracking-tight leading-snug"
              >
                {title}
              </h2>

              <p
                id="under-construction-modal-description"
                style={{ fontWeight: 350 }}
                className="text-xs sm:text-[13px] text-white/95 leading-relaxed font-[350]"
              >
                {description}
              </p>
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#0078d4] px-6 py-2 pb-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-under-construction-close"
                onClick={onClose}
                style={{
                  border: '2px solid #FFFFFF',
                  borderBottom: '2px solid #FFFFFF',
                  boxSizing: 'border-box',
                  fontWeight: 350,
                  height: '28px',
                }}
                className="fluent-btn-primary min-w-[80px] h-[28px] px-4 py-0 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-xs font-[350] rounded-none transition-colors cursor-pointer text-center inline-flex items-center justify-center"
              >
                {buttonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
