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
        <motion.div
          key="under-construction-modal-container"
          id="under-construction-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop without background blur */}
          <motion.div
            id="under-construction-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* 2. Dialog Modal Box - Windows 10 ContentDialog Style */}
          <motion.div
            id="under-construction-modal-dialog"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              transition: {
                duration: 0.22,
                ease: [0.1, 0.9, 0.2, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.92,
              y: 8,
              transition: {
                duration: 0.16,
                ease: 'easeIn'
              }
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[500px] bg-white dark:bg-black text-[#1a1a1a] dark:text-white rounded-none shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-[#e3008c] overflow-hidden"
          >
            {/* Header & Body Content Area - Native ContentDialog */}
            <div className="px-6 pt-6 pb-2 space-y-2">
              <h2
                id="under-construction-modal-title"
                className="text-[20px] font-normal text-neutral-900 dark:text-white tracking-tight leading-snug"
              >
                {title}
              </h2>

              <p
                id="under-construction-modal-description"
                className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
              >
                {description}
              </p>
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
              <button
                type="button"
                id="btn-under-construction-close"
                onClick={onClose}
                className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                {buttonText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
