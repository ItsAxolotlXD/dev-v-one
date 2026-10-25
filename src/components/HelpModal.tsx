import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();

  const shortcuts = [
    { key: 'Alt + 1', desc: 'Home' },
    { key: 'Alt + 2', desc: 'Spotlight Search' },
    { key: 'Alt + 3', desc: 'Tools Menu' },
    { key: 'Alt + 4', desc: 'Settings' },
    { key: 'Alt + 5', desc: 'Most Recent Channel' },
    { key: '⌘ + K / Ctrl + K', desc: 'Quick Spotlight Search' },
    { key: 'Space', desc: 'Play / Pause Live TV Stream' },
    { key: 'M', desc: 'Mute / Unmute Audio' },
    { key: 'F', desc: 'Fullscreen Player' },
    { key: 'T', desc: 'Theater Mode' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop with zero blur */}
          <motion.div
            id="help-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 ContentDialog Box */}
          <motion.div
            id="help-modal-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[540px] bg-white dark:bg-[#2b2b2b] text-[#1a1a1a] dark:text-white rounded-none shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-neutral-300/80 dark:border-white/15 overflow-hidden"
          >
            {/* Header & Body Content Area */}
            <div className="px-6 pt-6 pb-2 max-h-[70vh] overflow-y-auto space-y-2 font-normal">
              <h2
                className="text-[20px] font-normal text-neutral-900 dark:text-white tracking-tight leading-snug"
              >
                Help & Keyboard Shortcuts
              </h2>
              <p
                className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
              >
                Quick navigation shortcuts and tips for using Sparkle (Dev)
              </p>

              <div className="mt-3 space-y-2">
                <div className="space-y-1">
                  {shortcuts.map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/10 text-xs text-neutral-800 dark:text-neutral-200 font-normal"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">{sc.desc}</span>
                      <kbd className="px-2 py-0.5 font-mono text-[10px] text-neutral-900 dark:text-white bg-white dark:bg-white/10 border border-neutral-300 dark:border-white/20">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300 space-y-1 leading-relaxed">
                  <p className="font-semibold text-neutral-900 dark:text-white">💡 Quick Tips:</p>
                  <p>• Use the Tools menu on the toolbar to import custom M3U8 streams or export playlists.</p>
                  <p>• When reading articles, Tools provides instant AI summaries and Microsoft Word (.docx) export.</p>
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
                onClick={onClose}
                className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
