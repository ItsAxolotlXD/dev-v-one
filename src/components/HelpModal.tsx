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

          {/* Windows 10 Blue Dialog Box */}
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[580px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top caption */}
            <div className="pl-3.5 pr-4 py-1.5 bg-[#0063b1] text-xs font-[350] text-white/90 select-none">
              Help & Navigation
            </div>

            {/* Header & Body Content Area */}
            <div className="px-6 py-3.5 max-h-[70vh] overflow-y-auto space-y-2 font-[350]">
              <h2
                style={{ fontWeight: 350 }}
                className="text-xl sm:text-[22px] font-[350] text-white tracking-tight leading-snug"
              >
                Help & Keyboard Shortcuts
              </h2>
              <p
                style={{ fontWeight: 350 }}
                className="text-xs sm:text-[13px] text-white/90 leading-relaxed font-[350]"
              >
                Quick navigation shortcuts and tips for using Sparkle (Dev)
              </p>

              <div className="mt-2 space-y-1.5 font-[350]">
                <div className="space-y-1">
                  {shortcuts.map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1 bg-black/15 border border-white/15 text-xs text-white font-[350]"
                    >
                      <span className="text-white/95 font-[350]">{sc.desc}</span>
                      <kbd className="px-2 py-0.5 font-mono text-[10px] text-white font-[350] bg-white/20 border border-white/30">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-black/15 border border-white/15 text-[11px] text-white/90 space-y-0.5 leading-relaxed font-[350]">
                  <p className="font-[350] text-white">💡 Quick Tips:</p>
                  <p>• Use the Tools menu on the toolbar to import custom M3U8 streams or export playlists.</p>
                  <p>• When reading articles, Tools provides instant AI summaries and Microsoft Word (.docx) export.</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#0078d4] px-6 py-2 pb-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
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
                Close
              </button>
              <button
                type="button"
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
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
