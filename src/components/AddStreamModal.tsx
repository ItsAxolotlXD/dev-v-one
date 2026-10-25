import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';
import { Channel } from '../types';
import { useSettings } from '../hooks/useSettings';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (channel: Channel) => void;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose,
  onAddStream
}) => {
  const { settings } = useSettings();
  const [streamName, setStreamName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamQuality, setStreamQuality] = useState<'HD' | 'Full HD' | '4K' | 'SD'>('HD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const name = streamName.trim() || 'Custom Live Stream';
    const newChannel: Channel = {
      id: `custom-stream-${Date.now()}`,
      name: name,
      shortName: name,
      slug: `custom-${Date.now()}`,
      logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
      category: 'Special',
      quality: streamQuality,
      streamUrl: streamUrl.trim(),
      isLive: true,
      description: 'User-added live broadcast stream.',
      currentProgram: {
        title: name,
        startTime: '00:00',
        endTime: '24:00',
        progress: 50,
        description: 'Streaming via HLS M3U8 protocol.'
      }
    };

    onAddStream(newChannel);
    setStreamName('');
    setStreamUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="add-stream-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop with zero blur */}
          <motion.div
            id="add-stream-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 ContentDialog Box */}
          <motion.div
            id="add-stream-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-white dark:bg-[#2b2b2b] text-[#1a1a1a] dark:text-white rounded-none shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-neutral-300/80 dark:border-white/15 overflow-hidden"
          >
            {/* Header & Body Content Area */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 pt-6 pb-2 space-y-3">
                <div>
                  <h2 className="text-[20px] font-normal text-neutral-900 dark:text-white tracking-tight leading-snug">
                    Add New Live Stream
                  </h2>
                  <p className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-normal mt-1 font-normal">
                    Enter HLS / M3U8 stream details to watch directly
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Stream Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={streamName}
                      onChange={(e) => setStreamName(e.target.value)}
                      placeholder="e.g., Live Broadcast Feed"
                      className="w-full px-3 py-1.5 rounded-none bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:border-neutral-500 dark:focus:border-white/60 transition-all font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Stream URL (.m3u8) *
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://example.com/live/stream.m3u8"
                      className="w-full px-3 py-1.5 rounded-none bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm font-mono focus:outline-none focus:border-neutral-500 dark:focus:border-white/60 transition-all font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Quality
                    </label>
                    <div className="flex gap-2">
                      {(['SD', 'HD', 'Full HD', '4K'] as const).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setStreamQuality(q)}
                          className={`flex-1 py-1 rounded-none text-xs font-normal transition-all cursor-pointer ${
                            streamQuality === q
                              ? 'bg-neutral-800 text-white dark:bg-white dark:text-black font-medium'
                              : 'bg-neutral-100 dark:bg-black/20 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-white/15 hover:bg-neutral-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Footer */}
              <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  id="btn-add-stream-submit"
                  className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="fluent-btn-secondary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
