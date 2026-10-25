import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';

interface UnsavedSettingsModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const UnsavedSettingsModal: React.FC<UnsavedSettingsModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}) => {
  const { settings } = useSettings();

  // Listen for Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="unsaved-settings-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop with zero blur */}
          <motion.div
            id="unsaved-settings-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 ContentDialog Box */}
          <motion.div
            id="unsaved-settings-modal-dialog"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.22,
                ease: [0.1, 0.9, 0.2, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.88,
              transition: {
                duration: 0.16,
                ease: 'easeIn'
              }
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[500px] bg-white dark:bg-black text-[#1a1a1a] dark:text-white rounded-none shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-[#e3008c] overflow-hidden"
          >
            {/* Header & Body Content */}
            <div className="px-6 pt-6 pb-2 space-y-2">
              <h2
                id="unsaved-settings-modal-title"
                className="text-[20px] font-light text-neutral-900 dark:text-white tracking-tight leading-snug"
              >
                Save your changes?
              </h2>

              <p
                id="unsaved-settings-modal-description"
                className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
              >
                Remember to save your changes first! If you leave now, all of your settings won't be saved. Do you want to save your changes?
              </p>
            </div>

            {/* Actions Footer */}
            <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
              <button
                type="button"
                id="btn-unsaved-settings-save-changes"
                onClick={onSave}
                className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Yes
              </button>
              <button
                type="button"
                id="btn-unsaved-settings-keep-current"
                onClick={onDiscard}
                className="fluent-btn-secondary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                No
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
