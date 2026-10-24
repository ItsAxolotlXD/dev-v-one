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

          {/* Windows 10 Blue Dialog Box */}
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top thin caption */}
            <div className="px-6 py-2.5 bg-[#0063b1] text-xs font-normal text-white/90 select-none">
              Live TV
            </div>

            {/* Header & Body Content Area */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 pt-5 pb-5 space-y-3">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-normal text-white tracking-tight leading-snug">
                    Add New Live Stream
                  </h2>
                  <p className="text-[13.5px] sm:text-sm text-white/90 leading-normal mt-1.5 font-normal">
                    Enter HLS / M3U8 stream details to watch directly
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[13px] font-medium text-white/95 mb-1">
                      Stream Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={streamName}
                      onChange={(e) => setStreamName(e.target.value)}
                      placeholder="e.g., Live Broadcast Feed"
                      className="w-full px-3 py-2 rounded-none bg-black/20 border-2 border-white/60 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-white/95 mb-1">
                      Stream URL (.m3u8) *
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://example.com/live/stream.m3u8"
                      className="w-full px-3 py-2 rounded-none bg-black/20 border-2 border-white/60 text-white placeholder:text-white/40 text-sm font-mono focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-white/95 mb-1.5">
                      Quality
                    </label>
                    <div className="flex gap-2">
                      {(['SD', 'HD', 'Full HD', '4K'] as const).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setStreamQuality(q)}
                          className={`flex-1 py-1.5 rounded-none text-xs font-medium transition-all cursor-pointer border-2 ${
                            streamQuality === q
                              ? 'bg-white text-[#0078d4] border-white'
                              : 'bg-transparent text-white border-white/60 hover:border-white'
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
              <div className="fluent-modal-footer bg-[#0078d4] px-6 py-4 pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  id="btn-add-stream-submit"
                  className="fluent-btn-primary min-w-[100px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="fluent-btn-secondary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
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
