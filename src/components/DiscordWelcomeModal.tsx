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
        <div
          id="discord-welcome-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop with zero blur */}
          <motion.div
            id="discord-welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 Blue Dialog Box */}
          <motion.div
            id="discord-welcome-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top thin caption */}
            <div className="px-6 py-2.5 bg-[#0063b1] text-xs font-normal text-white/90 select-none">
              Community Connection
            </div>

            {/* Header & Body Content */}
            <div className="p-6 pt-5 pb-5 space-y-2">
              <h2
                id="discord-welcome-title"
                className="text-2xl sm:text-[26px] font-normal text-white tracking-tight leading-snug"
              >
                Join Sparkle Community?
              </h2>

              <p
                id="discord-welcome-subtitle"
                className="text-[13.5px] sm:text-sm text-white/95 leading-relaxed font-normal"
              >
                Connect with broadcasting enthusiasts, share media recordings, and preserve iconic moments of Vietnamese television on Discord.
              </p>
            </div>

            {/* Actions Footer */}
            <div className="fluent-modal-footer bg-[#0078d4] px-6 py-4 pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                id="btn-discord-join"
                onClick={handleJoin}
                className="fluent-btn-primary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
              >
                Join
              </button>
              <button
                type="button"
                id="btn-discord-close"
                onClick={onClose}
                className="fluent-btn-secondary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
