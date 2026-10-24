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

          {/* Windows 10 Blue Dialog Box */}
          <motion.div 
            id="custom-stream-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[500px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top thin caption */}
            <div className="px-6 py-2.5 bg-[#0063b1] text-xs font-normal text-white/90 select-none">
              Stream Settings
            </div>

            {/* Header Area */}
            <div className="p-6 pt-5 pb-3">
              <h2 className="text-2xl sm:text-[26px] font-normal text-white tracking-tight leading-snug">
                Configure M3U8 Stream & Playlist
              </h2>
              <p className="text-[13.5px] sm:text-sm text-white/90 leading-normal mt-1.5 font-normal">
                Paste a direct HLS stream URL or import an external .m3u playlist
              </p>

              {/* Segmented Tab Bar */}
              <div className="flex p-1 mt-3 bg-black/15 border border-white/20">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-1.5 rounded-none text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'single'
                      ? 'bg-white text-[#0078d4] font-semibold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Direct Stream (.m3u8)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('playlist')}
                  className={`flex-1 py-1.5 rounded-none text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'playlist'
                      ? 'bg-white text-[#0078d4] font-semibold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Import Playlist (.m3u)
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 pb-5 pt-1">
              {activeTab === 'single' ? (
                <form id="form-single-stream" onSubmit={handlePlaySingle} className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-medium text-white/95 mb-1">
                      Channel / Stream Title
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g., Live Sports Feed"
                      className="w-full px-3 py-2 rounded-none bg-black/20 border-2 border-white/60 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-white/95 mb-1">
                      HLS Stream URL (.m3u8) *
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://example.com/live/channel.m3u8"
                      className="w-full px-3 py-2 rounded-none bg-black/20 border-2 border-white/60 text-white placeholder:text-white/40 text-sm font-mono focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                  {/* Sample test streams buttons */}
                  <div>
                    <span className="text-[11px] font-medium text-white/80 block mb-1.5">
                      Sample test streams:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
                          setChannelName('Mux HLS Test Multi-Rate');
                        }}
                        className="px-2.5 py-1 rounded-none bg-black/15 text-[11px] text-white hover:bg-white/20 border border-white/30 cursor-pointer"
                      >
                        Mux HLS HD
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8');
                          setChannelName('Akamai Live Master HLS');
                        }}
                        className="px-2.5 py-1 rounded-none bg-black/15 text-[11px] text-white hover:bg-white/20 border border-white/30 cursor-pointer"
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
                      <label className="text-[13px] font-medium text-white/95">
                        Paste #EXTM3U Playlist Content
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-[11px] text-white/90 underline hover:text-white cursor-pointer font-medium"
                      >
                        Load sample playlist
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={playlistText}
                      onChange={(e) => setPlaylistText(e.target.value)}
                      placeholder={`#EXTM3U\n#EXTINF:-1 tvg-id="vtv1" tvg-name="VTV1 HD" group-title="VTV", VTV1 HD\nhttps://example.com/vtv1.m3u8`}
                      className="w-full p-2.5 rounded-none bg-black/20 border-2 border-white/60 text-white placeholder:text-white/40 text-xs font-mono focus:outline-none focus:border-white resize-none"
                    />
                  </div>

                  {parseStatus && (
                    <div className="p-2.5 bg-black/20 border border-white/20 text-xs flex items-center gap-2 text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>{parseStatus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#0078d4] px-6 py-4 pt-2 flex items-center justify-end gap-3">
              {activeTab === 'single' ? (
                <button
                  type="submit"
                  form="form-single-stream"
                  className="fluent-btn-primary min-w-[90px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportM3U}
                  className="fluent-btn-primary min-w-[90px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
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
