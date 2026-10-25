import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Upload, CheckCircle2 } from 'lucide-react';
import { parseM3UPlaylist, SAMPLE_M3U_TEMPLATE } from '../utils/m3uParser';
import { Channel } from '../types';
import { useSettings } from '../hooks/useSettings';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomChannel: (channel: Channel) => void;
  onImportPlaylist: (newChannels: Channel[]) => void;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onPlayCustomChannel,
  onImportPlaylist
}) => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'single' | 'playlist'>('single');
  const [streamUrl, setStreamUrl] = useState('');
  const [channelName, setChannelName] = useState('Custom Live Stream');
  const [playlistText, setPlaylistText] = useState('');
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  const handlePlaySingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const customChannel: Channel = {
      id: `custom-${Date.now()}`,
      name: channelName.trim() || 'Custom M3U8 Stream',
      shortName: channelName.trim() || 'Custom Stream',
      slug: `custom-${Date.now()}`,
      logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
      category: 'Special',
      quality: 'HD',
      streamUrl: streamUrl.trim(),
      isLive: true,
      description: 'Stream configured by user.',
      currentProgram: {
        title: channelName.trim() || 'Custom Live Stream',
        startTime: '00:00',
        endTime: '24:00',
        progress: 50,
        description: 'Streaming live via HLS/M3U8 protocol.'
      }
    };

    onPlayCustomChannel(customChannel);
    onClose();
  };

  const handleImportM3U = () => {
    if (!playlistText.trim()) return;
    try {
      const parsed = parseM3UPlaylist(playlistText);
      if (parsed.length === 0) {
        setParseStatus('No valid channels found in the M3U playlist content.');
        return;
      }

      const fullChannels: Channel[] = parsed.map((p, idx) => ({
        id: p.id || `m3u-${Date.now()}-${idx}`,
        name: p.name || `Channel ${idx + 1}`,
        shortName: p.name || `Channel ${idx + 1}`,
        slug: p.slug || `m3u-ch-${idx + 1}`,
        logo: p.logo || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
        category: p.category || 'Special',
        quality: p.quality || 'HD',
        streamUrl: p.streamUrl || '',
        isLive: true,
        description: p.description || 'Channel imported from external M3U playlist.',
        currentProgram: p.currentProgram || {
          title: p.name || 'Live Program',
          startTime: '00:00',
          endTime: '24:00',
          progress: 50,
          description: 'Live broadcast.'
        }
      }));

      onImportPlaylist(fullChannels);
      setParseStatus(`Successfully imported ${fullChannels.length} channels!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setParseStatus('Failed to parse M3U playlist. Please check format.');
    }
  };

  const handleLoadSample = () => {
    setPlaylistText(SAMPLE_M3U_TEMPLATE);
    setParseStatus('Sample playlist loaded. Click "Import Playlist" to load channels.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="custom-stream-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop without blur */}
          <motion.div 
            id="custom-stream-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Windows 10 ContentDialog Box */}
          <motion.div
            id="custom-stream-dialog"
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
            {/* Header Area */}
            <div className="px-6 pt-6 pb-2">
              <h2
                id="custom-stream-title"
                className="text-[20px] font-light text-neutral-900 dark:text-white tracking-tight leading-snug"
              >
                Configure M3U8 Stream & Playlist
              </h2>
              <p className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-normal mt-1 font-normal">
                Paste a direct HLS stream URL or import an external .m3u playlist
              </p>

              {/* Segmented Tab Bar */}
              <div className="flex p-1 mt-3 bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-1 rounded-none text-xs font-normal transition-all cursor-pointer ${
                    activeTab === 'single'
                      ? 'bg-white dark:bg-[#383838] text-neutral-900 dark:text-white font-medium shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Direct Stream (.m3u8)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('playlist')}
                  className={`flex-1 py-1 rounded-none text-xs font-normal transition-all cursor-pointer ${
                    activeTab === 'playlist'
                      ? 'bg-white dark:bg-[#383838] text-neutral-900 dark:text-white font-medium shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Import Playlist (.m3u)
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 pb-2 pt-1">
              {activeTab === 'single' ? (
                <form id="form-single-stream" onSubmit={handlePlaySingle} className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Channel / Stream Title
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g., Live Sports Feed"
                      className="w-full px-3 py-1.5 rounded-none bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:border-neutral-500 dark:focus:border-white/60 transition-all font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      HLS Stream URL (.m3u8) *
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://example.com/live/channel.m3u8"
                      className="w-full px-3 py-1.5 rounded-none bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm font-mono focus:outline-none focus:border-neutral-500 dark:focus:border-white/60 transition-all font-normal"
                    />
                  </div>

                  {/* Sample test streams buttons */}
                  <div>
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                      Sample test streams:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
                          setChannelName('Mux HLS Test Multi-Rate');
                        }}
                        className="px-2.5 py-1 rounded-none bg-neutral-100 dark:bg-black/20 text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/15 cursor-pointer"
                      >
                        Mux HLS HD
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8');
                          setChannelName('Akamai Live Master HLS');
                        }}
                        className="px-2.5 py-1 rounded-none bg-neutral-100 dark:bg-black/20 text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/15 cursor-pointer"
                      >
                        Akamai Live HD
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
                        Paste #EXTM3U Playlist Content
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-[11px] text-sky-600 dark:text-sky-400 underline hover:underline cursor-pointer font-medium"
                      >
                        Load sample playlist
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={playlistText}
                      onChange={(e) => setPlaylistText(e.target.value)}
                      placeholder={`#EXTM3U\n#EXTINF:-1 tvg-id="vtv1" tvg-name="VTV1 HD" group-title="VTV", VTV1 HD\nhttps://example.com/vtv1.m3u8`}
                      className="w-full p-2.5 rounded-none bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs font-mono focus:outline-none focus:border-neutral-500 dark:focus:border-white/60 resize-none font-normal"
                    />
                  </div>

                  {parseStatus && (
                    <div className="p-2.5 bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/10 text-xs flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{parseStatus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
              {activeTab === 'single' ? (
                <button
                  type="submit"
                  form="form-single-stream"
                  className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportM3U}
                  className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
