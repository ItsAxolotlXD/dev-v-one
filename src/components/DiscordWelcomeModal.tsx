import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DiscordWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordWelcomeModal: React.FC<DiscordWelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleJoin = () => {
    window.open('https://discord.gg/wcdjaDDayK', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="discord-welcome-container"
          id="discord-welcome-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop with zero blur */}
          <motion.div
            id="discord-welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 ContentDialog Box */}
          <motion.div
            id="discord-welcome-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-white dark:bg-black text-[#1a1a1a] dark:text-white rounded-none shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-[#e3008c] overflow-hidden"
          >
            {/* Header & Body Content */}
            <div className="px-6 pt-6 pb-2 space-y-2">
              <h2
                id="discord-welcome-title"
                className="text-[20px] font-normal text-neutral-900 dark:text-white tracking-tight leading-snug"
              >
                Join Sparkle Community?
              </h2>

              <p
                id="discord-welcome-subtitle"
                className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
              >
                Connect with broadcasting enthusiasts, share media recordings, and preserve iconic moments of Vietnamese television on Discord.
              </p>
            </div>

            {/* Actions Footer */}
            <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
              <button
                type="button"
                id="btn-discord-join"
                onClick={handleJoin}
                className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Join
              </button>
              <button
                type="button"
                id="btn-discord-close"
                onClick={onClose}
                className="fluent-btn-secondary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
