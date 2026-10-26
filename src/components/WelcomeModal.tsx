import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
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
          key="welcome-modal-container"
          id="welcome-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop without background blur */}
          <motion.div
            id="welcome-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* 2. Dialog Modal Box - Windows 10 ContentDialog Style */}
          <motion.div
            id="welcome-modal-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[520px] bg-white dark:bg-black text-[#1a1a1a] dark:text-white rounded-none shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-[#e3008c] overflow-hidden"
          >
            {/* Header & Body Content Area - Native UWP ContentDialog */}
            <div className="px-6 pt-6 pb-2 space-y-2">
              <h2
                id="welcome-modal-title"
                className="text-[20px] font-normal text-neutral-900 dark:text-white tracking-tight leading-snug"
              >
                Software Update Successful
              </h2>

              <p
                id="welcome-modal-description"
                className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
              >
                Your Sparkle (Dev) experience has been updated with the Microsoft Fluent Design System, featuring seamless navigation, smooth animations, and high-definition live streaming.
              </p>

              {/* Version Specs */}
              <div className="mt-3 p-3 bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/10 space-y-1.5 select-text text-xs text-neutral-800 dark:text-neutral-200 font-normal">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Software Version</span>
                  <span className="font-medium text-neutral-900 dark:text-white">26.11</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Release Build</span>
                  <span className="font-medium text-neutral-900 dark:text-white">261013</span>
                </div>
                <div className="pt-1.5 mt-1 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Design System</span>
                  <span className="font-medium text-neutral-900 dark:text-white">Microsoft Fluent Design</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Close
              </button>
              <button
                type="button"
                id="btn-welcome-close"
                onClick={onClose}
                className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
