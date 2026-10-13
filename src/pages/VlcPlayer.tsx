import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  Repeat,
  Shuffle,
  Camera,
  FolderOpen,
  Globe,
  Sliders,
  Film,
  Music,
  List,
  Info,
  Clock,
  Sparkles,
  RotateCw,
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Settings,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FluentVlcColorIcon } from '../components/FluentIcons';

interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'audio';
  duration?: string;
  artist?: string;
  source: 'sample' | 'local' | 'network';
}

const SAMPLE_MEDIA: PlaylistItem[] = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny (Blender Animation HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    duration: '09:56',
    artist: 'Blender Foundation',
    source: 'sample'
  },
  {
    id: 'sample-2',
    title: 'Tears of Steel (Sci-Fi Cinema 4K)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video',
    duration: '12:14',
    artist: 'Mango Open Movie',
    source: 'sample'
  },
  {
    id: 'sample-3',
    title: 'Elephants Dream (Open Movie Project)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'video',
    duration: '10:53',
    artist: 'Orange Animation Studio',
    source: 'sample'
  },
  {
    id: 'sample-4',
    title: 'For Bigger Blazes (Action Demo)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    duration: '00:15',
    artist: 'Chromecast Samples',
    source: 'sample'
  },
  {
    id: 'sample-5',
    title: 'V-One Cyber Beats & Synthwave (Hi-Res Audio)',
    url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    type: 'audio',
    duration: '02:45',
    artist: 'V-One Audio Lab',
    source: 'sample'
  }
];

const EQUALIZER_BANDS = [
  { freq: '60Hz', value: 60 },
  { freq: '170Hz', value: 170 },
  { freq: '310Hz', value: 310 },
  { freq: '600Hz', value: 600 },
  { freq: '1kHz', value: 1000 },
  { freq: '3kHz', value: 3000 },
  { freq: '6kHz', value: 6000 },
  { freq: '12kHz', value: 12000 },
  { freq: '14kHz', value: 14000 },
  { freq: '16kHz', value: 16000 }
];

const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 0, 1, 2],
  Rock: [4, 3, -1, -2, 0, 2, 4, 5, 5, 5],
  Pop: [-1, 1, 3, 4, 3, 0, -1, -1, 1, 2],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  Classical: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
  Techno: [5, 4, 2, 0, -2, 0, 2, 4, 4, 3],
  Vocal: [-2, -2, 0, 3, 4, 4, 2, 0, -1, -2]
};

export const VlcPlayer: React.FC = () => {
  // Playback state
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(SAMPLE_MEDIA);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100); // 0 to 200% (VLC signature)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [showRemainingTime, setShowRemainingTime] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // OSD Notification
  const [osdMessage, setOsdMessage] = useState<string>('');
  const osdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // UI Panels
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(true);
  const [showEqualizerModal, setShowEqualizerModal] = useState<boolean>(false);
  const [showVideoEffectsModal, setShowVideoEffectsModal] = useState<boolean>(false);
  const [showNetworkStreamModal, setShowNetworkStreamModal] = useState<boolean>(false);
  const [showMediaInfoModal, setShowMediaInfoModal] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [playlistSearch, setPlaylistSearch] = useState<string>('');
  const [networkUrlInput, setNetworkUrlInput] = useState<string>('');

  // Video adjustments
  const [aspectRatio, setAspectRatio] = useState<'default' | '16:9' | '4:3' | '1:1' | '21:9' | 'fill'>('default');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [hue, setHue] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  // Audio Equalizer
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [eqPreset, setEqPreset] = useState<string>('Flat');
  const [isEqEnabled, setIsEqEnabled] = useState<boolean>(false);
  const [preamp, setPreamp] = useState<number>(0);

  // Subtitles
  const [subtitleTrack, setSubtitleTrack] = useState<string>('off');
  const [subtitleDelay, setSubtitleDelay] = useState<number>(0);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const biquadFiltersRef = useRef<BiquadFilterNode[]>([]);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const currentItem = playlist[currentIndex] || playlist[0];

  const showOsd = useCallback((msg: string) => {
    setOsdMessage(msg);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {
      setOsdMessage('');
    }, 2000);
  }, []);

  // Initialize Web Audio API for 200% Volume Boost and Equalizer
  const initAudioNodes = useCallback(() => {
    if (!videoRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(videoRef.current);
      sourceNodeRef.current = source;

      const gain = ctx.createGain();
      gainNodeRef.current = gain;

      // Create 10 Equalizer filters
      const filters = EQUALIZER_BANDS.map((band) => {
        const filter = ctx.createBiquadFilter();
        filter.type = band.value <= 60 ? 'lowshelf' : band.value >= 14000 ? 'highshelf' : 'peaking';
        filter.frequency.value = band.value;
        filter.gain.value = 0;
        return filter;
      });
      biquadFiltersRef.current = filters;

      // Chain: Source -> Filter 0 -> Filter 1 ... -> Gain -> Destination
      let lastNode: AudioNode = source;
      filters.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });
      lastNode.connect(gain);
      gain.connect(ctx.destination);
    } catch {
      // Audio graph already connected or restricted
    }
  }, []);

  // Update volume and over-amplification
  useEffect(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = 0;
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
      return;
    }

    if (volume <= 100) {
      videoRef.current.volume = volume / 100;
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 1.0;
    } else {
      // VLC over-amplification boost up to 200%
      videoRef.current.volume = 1.0;
      const boostFactor = volume / 100; // up to 2.0x
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = boostFactor;
      }
    }
  }, [volume, isMuted]);

  // Update Equalizer
  useEffect(() => {
    if (!biquadFiltersRef.current.length) return;
    biquadFiltersRef.current.forEach((filter, idx) => {
      const g = isEqEnabled ? (eqGains[idx] || 0) + preamp : 0;
      filter.gain.value = g;
    });
  }, [eqGains, isEqEnabled, preamp]);

  // Format time (HH:MM:SS or MM:SS)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    initAudioNodes();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        showOsd('Phát');
      }).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      showOsd('Tạm dừng');
    }
  };

  // Stop
  const handleStop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
    showOsd('Dừng phát');
  };

  // Frame by frame step (iconic VLC feature)
  const handleFrameStep = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 0.04);
    showOsd('Bước tiếp 1 khung hình (+0.04s)');
  };

  // Skip ±10 seconds
  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const nextTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = nextTime;
    showOsd(`${seconds > 0 ? '+' : ''}${seconds}s (${formatTime(nextTime)})`);
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Next / Prev track
  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else if (nextIdx >= playlist.length) {
      nextIdx = 0;
    }
    setCurrentIndex(nextIdx);
    setIsPlaying(true);
    showOsd(`Chuyển bài: ${playlist[nextIdx]?.title || ''}`);
  }, [currentIndex, isShuffle, playlist, showOsd]);

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = playlist.length - 1;
    setCurrentIndex(prevIdx);
    setIsPlaying(true);
    showOsd(`Chuyển bài: ${playlist[prevIdx]?.title || ''}`);
  };

  // Speed change
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    showOsd(`Tốc độ: ${rate}x`);
    setShowSpeedMenu(false);
  };

  // Take Snapshot
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `VLC_Snapshot_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        showOsd('Đã lưu ảnh chụp khung hình (PNG)!');
      }
    } catch {
      showOsd('Không thể chụp hình (giới hạn CORS)');
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        showOsd('Toàn màn hình');
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        showOsd('Thoát toàn màn hình');
      }).catch(() => {});
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showOsd('Tắt Picture-in-Picture');
      } else {
        await videoRef.current.requestPictureInPicture();
        showOsd('Bật Picture-in-Picture');
      }
    } catch {
      showOsd('Trình duyệt không hỗ trợ PiP');
    }
  };

  // Open Local File
  const handleOpenFileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: PlaylistItem[] = [];

    Array.from(files).forEach((file: File) => {
      const isAudio = file.type.startsWith('audio/') || Boolean(file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i));
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: file.name,
        url,
        type: isAudio ? 'audio' : 'video',
        artist: 'Tệp nội bộ',
        source: 'local'
      });
    });

    if (newItems.length > 0) {
      setPlaylist((prev) => [...newItems, ...prev]);
      setCurrentIndex(0);
      setIsPlaying(true);
      showOsd(`Đã nạp ${newItems.length} tệp phương tiện`);
    }
  };

  // Open Network Stream
  const handleOpenNetworkStream = () => {
    const url = networkUrlInput.trim();
    if (!url) return;
    const isAudio = url.match(/\.(mp3|wav|ogg|flac|aac|m4a)($|\?)/i);
    const newItem: PlaylistItem = {
      id: `net-${Date.now()}`,
      title: url.split('/').pop()?.split('?')[0] || 'Luồng mạng trực tuyến',
      url,
      type: isAudio ? 'audio' : 'video',
      artist: 'Network Stream',
      source: 'network'
    };
    setPlaylist((prev) => [newItem, ...prev]);
    setCurrentIndex(0);
    setIsPlaying(true);
    setShowNetworkStreamModal(false);
    setNetworkUrlInput('');
    showOsd('Đang mở luồng mạng...');
  };

  // Equalizer Preset selection
  const handleApplyPreset = (name: string) => {
    const preset = EQ_PRESETS[name];
    if (preset) {
      setEqPreset(name);
      setEqGains([...preset]);
      setIsEqEnabled(true);
      showOsd(`Bộ chỉnh âm: ${name}`);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          showOsd(isMuted ? 'Bật âm' : 'Tắt âm');
          break;
        case 's':
          e.preventDefault();
          handleStop();
          break;
        case 'e':
          e.preventDefault();
          handleFrameStep();
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip(5);
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkip(-5);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.min(200, prev + 5);
            showOsd(`Âm lượng: ${next}%`);
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.max(0, prev - 5);
            showOsd(`Âm lượng: ${next}%`);
            return next;
          });
          break;
        case 'n':
          e.preventDefault();
          handleNextTrack();
          break;
        case 'p':
          e.preventDefault();
          handlePrevTrack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextTrack, isMuted, showOsd]);

  // Video aspect ratio & filter styles
  const videoFilterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) rotate(${rotation}deg)`;

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video object-cover';
      case '4:3':
        return 'aspect-4/3 object-cover';
      case '1:1':
        return 'aspect-square object-cover';
      case '21:9':
        return 'aspect-[21/9] object-cover';
      case 'fill':
        return 'w-full h-full object-fill';
      default:
        return 'w-full h-full object-contain';
    }
  };

  // Filtered playlist
  const filteredPlaylist = playlist.filter((item) =>
    item.title.toLowerCase().includes(playlistSearch.toLowerCase()) ||
    (item.artist && item.artist.toLowerCase().includes(playlistSearch.toLowerCase()))
  );

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col bg-[#f9f9f9] dark:bg-[#1a1a1a] text-black dark:text-white transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : 'h-[calc(100vh-64px)] min-h-[620px] rounded-[10px] overflow-hidden border border-black/10 dark:border-white/10 shadow-sm'
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Menu Bar (VLC Classic Menu styled in V-One design language) */}
      <div className="h-10 px-3 bg-white dark:bg-[#202020] border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0 text-xs">
        {/* Left: VLC Cone Emblem & Menus */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2 pr-2 border-r border-black/10 dark:border-white/10">
            <FluentVlcColorIcon className="w-5 h-5 shrink-0" />
            <span className="font-bold tracking-tight text-[#ea580c] hidden sm:inline">
              VLC
            </span>
            <span className="text-[11px] font-semibold text-black dark:text-neutral-300 hidden md:inline">
              Media Player
            </span>
          </div>

          {/* Menus */}
          <div className="flex items-center gap-0.5 text-neutral-700 dark:text-neutral-300">
            {/* Media Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'media' ? null : 'media')}
                className={`px-2 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-medium ${
                  activeMenu === 'media' ? 'bg-[#ea580c]/15 text-[#ea580c]' : ''
                }`}
              >
                Media
              </button>
              {activeMenu === 'media' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1.5 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenFileClick();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5" /> Mở tệp phương tiện...
                    </span>
                    <span className="text-[10px] text-neutral-400">Ctrl+O</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNetworkStreamModal(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> Mở luồng mạng URL...
                    </span>
                    <span className="text-[10px] text-neutral-400">Ctrl+N</span>
                  </button>
                  <div className="my-1 border-t border-black/5 dark:border-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      handleTakeSnapshot();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5" /> Chụp khung hình
                    </span>
                    <span className="text-[10px] text-neutral-400">Shift+S</span>
                  </button>
                </div>
              )}
            </div>

            {/* Playback Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'playback' ? null : 'playback')}
                className={`px-2 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-medium ${
                  activeMenu === 'playback' ? 'bg-[#ea580c]/15 text-[#ea580c]' : ''
                }`}
              >
                Playback
              </button>
              {activeMenu === 'playback' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1.5 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      togglePlay();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span>{isPlaying ? 'Tạm dừng' : 'Phát'}</span>
                    <span className="text-[10px] text-neutral-400">Space</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleStop();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span>Dừng lại</span>
                    <span className="text-[10px] text-neutral-400">S</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleFrameStep();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span>Tiến từng khung hình</span>
                    <span className="text-[10px] text-neutral-400">E</span>
                  </button>
                  <div className="my-1 border-t border-black/5 dark:border-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      handleNextTrack();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    Bài kế tiếp (N)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePrevTrack();
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    Bài trước (P)
                  </button>
                </div>
              )}
            </div>

            {/* Audio Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'audio' ? null : 'audio')}
                className={`px-2 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-medium ${
                  activeMenu === 'audio' ? 'bg-[#ea580c]/15 text-[#ea580c]' : ''
                }`}
              >
                Audio
              </button>
              {activeMenu === 'audio' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1.5 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEqualizerModal(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5" /> Bộ chỉnh âm (Equalizer)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVolume(125);
                      showOsd('Âm lượng: 125% (VLC Boost)');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    Khuếch đại âm lượng 125%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVolume(200);
                      showOsd('Âm lượng: 200% (VLC Max Boost)');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    Khuếch đại cực đại 200%
                  </button>
                  <div className="my-1 border-t border-black/5 dark:border-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    {isMuted ? 'Bật âm thanh (M)' : 'Tắt tiếng (M)'}
                  </button>
                </div>
              )}
            </div>

            {/* Video Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'video' ? null : 'video')}
                className={`px-2 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-medium ${
                  activeMenu === 'video' ? 'bg-[#ea580c]/15 text-[#ea580c]' : ''
                }`}
              >
                Video
              </button>
              {activeMenu === 'video' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1.5 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoEffectsModal(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> Hiệu ứng & Bộ lọc màu...
                    </span>
                  </button>
                  <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Tỷ lệ khung hình
                  </div>
                  {(['default', '16:9', '4:3', '1:1', '21:9', 'fill'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => {
                        setAspectRatio(ratio);
                        showOsd(`Tỷ lệ: ${ratio}`);
                        setActiveMenu(null);
                      }}
                      className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                    >
                      <span className="capitalize">{ratio}</span>
                      {aspectRatio === ratio && <Check className="w-3 h-3 text-[#ea580c]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tools Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
                className={`px-2 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-medium ${
                  activeMenu === 'tools' ? 'bg-[#ea580c]/15 text-[#ea580c]' : ''
                }`}
              >
                Tools
              </button>
              {activeMenu === 'tools' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1.5 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEqualizerModal(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span>Hiệu ứng âm thanh & hình ảnh</span>
                    <span className="text-[10px] text-neutral-400">Ctrl+E</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMediaInfoModal(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
                  >
                    <span>Thông tin Codec & Media</span>
                    <span className="text-[10px] text-neutral-400">Ctrl+I</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right quick actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPlaylist(!showPlaylist)}
            title={showPlaylist ? 'Ẩn danh sách phát' : 'Hiện danh sách phát'}
            className={`px-2 py-1 rounded-[5px] flex items-center gap-1 text-xs transition-colors cursor-pointer ${
              showPlaylist
                ? 'bg-[#ea580c] text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-black/10'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Playlist</span>
          </button>
          <button
            type="button"
            onClick={handleOpenFileClick}
            title="Mở tệp từ máy tính"
            className="w-7 h-7 rounded-[5px] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-[#ea580c]" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            className="w-7 h-7 rounded-[5px] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main View Area: Video Player + Playlist Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left/Center: Video Player Viewport */}
        <div
          className="flex-1 flex flex-col justify-between bg-black relative overflow-hidden group select-none"
          onClick={() => {
            if (activeMenu) setActiveMenu(null);
          }}
        >
          {/* OSD Message Notification */}
          {osdMessage && (
            <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
              <span>{osdMessage}</span>
            </div>
          )}

          {/* Video or Audio Placeholder Container */}
          <div
            className="relative flex-1 flex items-center justify-center w-full h-full overflow-hidden cursor-pointer"
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
          >
            {currentItem?.type === 'audio' ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#ea580c] via-[#ff7700] to-amber-500 p-1 shadow-2xl animate-spin-slow">
                  <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center border-4 border-black/40">
                    <Music className="w-16 h-16 text-[#ea580c] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {currentItem.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {currentItem.artist || 'Audio Track'} • V-One High Fidelity
                  </p>
                </div>
              </div>
            ) : null}

            <video
              ref={videoRef}
              src={currentItem?.url}
              className={`${currentItem?.type === 'audio' ? 'hidden' : getAspectRatioClass()}`}
              style={{ filter: videoFilterStyle }}
              playsInline
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration || 0);
                  if (isPlaying) videoRef.current.play().catch(() => {});
                }
              }}
              onEnded={() => {
                if (repeatMode === 'one') {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().catch(() => {});
                  }
                } else if (repeatMode === 'all' || isShuffle || currentIndex < playlist.length - 1) {
                  handleNextTrack();
                } else {
                  setIsPlaying(false);
                }
              }}
            />

            {/* Play/Pause center overlay indicator on hover or pause */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl pl-1">
                  <Play className="w-8 h-8 fill-white text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Floating Control Bar (VLC Orange & V-One Fluent Style) */}
          <div
            className="w-full bg-[#1a1a1a]/95 backdrop-blur-md border-t border-white/10 px-3 sm:px-5 py-2.5 z-20 shrink-0 text-white transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrubber Progress Slider */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-mono text-neutral-300 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 group/bar py-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#ea580c] transition-all hover:h-2"
                  style={{
                    background: `linear-gradient(to right, #ea580c 0%, #ff7700 ${(currentTime / (duration || 1)) * 100}%, #333 ${(currentTime / (duration || 1)) * 100}%, #333 100%)`
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowRemainingTime(!showRemainingTime)}
                title="Nhấn để đổi giữa tổng thời gian & thời gian còn lại"
                className="text-[11px] font-mono text-neutral-300 w-14 text-left hover:text-[#ea580c] cursor-pointer"
              >
                {showRemainingTime ? `-${formatTime(duration - currentTime)}` : formatTime(duration)}
              </button>
            </div>

            {/* Control Buttons Grid */}
            <div className="flex items-center justify-between gap-2">
              {/* Left playback cluster */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </button>

                {/* Stop button */}
                <button
                  type="button"
                  onClick={handleStop}
                  title="Dừng phát (S)"
                  className="w-7 h-7 rounded-[4px] hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Frame Step button (VLC feature) */}
                <button
                  type="button"
                  onClick={handleFrameStep}
                  title="Tiến từng khung hình (E)"
                  className="w-7 h-7 rounded-[4px] hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer text-xs font-bold"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-[1px] bg-white/20 mx-0.5" />

                {/* Prev & Next */}
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  title="Bài trước (P)"
                  className="w-7 h-7 rounded-[4px] hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTrack}
                  title="Bài kế tiếp (N)"
                  className="w-7 h-7 rounded-[4px] hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Rewind -10s & Forward +10s */}
                <button
                  type="button"
                  onClick={() => handleSkip(-10)}
                  title="Lùi 10 giây (←)"
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer hidden md:inline"
                >
                  -10s
                </button>
                <button
                  type="button"
                  onClick={() => handleSkip(10)}
                  title="Tua tới 10 giây (→)"
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer hidden md:inline"
                >
                  +10s
                </button>
              </div>

              {/* Center cluster: Repeat & Shuffle & Speed */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Repeat mode */}
                <button
                  type="button"
                  onClick={() => {
                    const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
                    setRepeatMode(next);
                    showOsd(`Lặp lại: ${next === 'off' ? 'Tắt' : next === 'all' ? 'Tất cả' : 'Một bài'}`);
                  }}
                  title={`Lặp lại: ${repeatMode}`}
                  className={`w-7 h-7 rounded-[4px] flex items-center justify-center cursor-pointer transition-colors ${
                    repeatMode !== 'off' ? 'bg-[#ea580c]/20 text-[#ea580c]' : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  {repeatMode === 'one' && <span className="text-[8px] font-bold ml-0.5">1</span>}
                </button>

                {/* Shuffle mode */}
                <button
                  type="button"
                  onClick={() => {
                    setIsShuffle(!isShuffle);
                    showOsd(isShuffle ? 'Tắt phát ngẫu nhiên' : 'Bật phát ngẫu nhiên');
                  }}
                  title="Phát ngẫu nhiên"
                  className={`w-7 h-7 rounded-[4px] flex items-center justify-center cursor-pointer transition-colors ${
                    isShuffle ? 'bg-[#ea580c]/20 text-[#ea580c]' : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                {/* Playback Speed selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    title="Tốc độ phát"
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-neutral-300 hover:text-[#ea580c] hover:bg-white/10 cursor-pointer"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-28 bg-[#252525] rounded-lg shadow-xl border border-white/10 py-1 z-50 text-xs">
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleSpeedChange(rate)}
                          className={`w-full px-3 py-1 text-left flex items-center justify-between hover:bg-[#ea580c]/20 hover:text-[#ea580c] ${
                            playbackRate === rate ? 'text-[#ea580c] font-bold' : 'text-neutral-300'
                          }`}
                        >
                          <span>{rate}x</span>
                          {playbackRate === rate && <Check className="w-3 h-3 text-[#ea580c]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right cluster: Volume boost (up to 200%), Equalizer & Tools */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Volume & Boost slider (Famous VLC 125% - 200% feature!) */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? 'Bật âm (M)' : 'Tắt tiếng (M)'}
                    className="text-neutral-300 hover:text-[#ea580c] cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : volume > 100 ? (
                      <Volume2 className="w-4 h-4 text-[#ea580c]" />
                    ) : volume > 50 ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <Volume1 className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-16 sm:w-24 flex items-center relative">
                    <input
                      type="range"
                      min={0}
                      max={200}
                      step={1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setVolume(val);
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
                      style={{
                        background: isMuted
                          ? '#444'
                          : volume > 100
                          ? `linear-gradient(to right, #ea580c 0%, #ea580c 50%, #ef4444 ${(volume / 200) * 100}%, #444 ${(volume / 200) * 100}%, #444 100%)`
                          : `linear-gradient(to right, #ea580c 0%, #ea580c ${(volume / 200) * 100}%, #444 ${(volume / 200) * 100}%, #444 100%)`
                      }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-mono min-w-[32px] ${
                      volume > 125 ? 'text-red-400 font-bold' : volume > 100 ? 'text-[#ea580c] font-bold' : 'text-neutral-300'
                    }`}
                  >
                    {isMuted ? '0%' : `${volume}%`}
                  </span>
                </div>

                {/* Snapshot button */}
                <button
                  type="button"
                  onClick={handleTakeSnapshot}
                  title="Chụp ảnh khung hình (PNG)"
                  className="w-7 h-7 rounded-[4px] hover:bg-white/10 text-neutral-300 hover:text-[#ea580c] flex items-center justify-center cursor-pointer hidden sm:flex"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                {/* Equalizer Modal Toggle */}
                <button
                  type="button"
                  onClick={() => setShowEqualizerModal(true)}
                  title="Bộ chỉnh âm Equalizer"
                  className={`w-7 h-7 rounded-[4px] hover:bg-white/10 flex items-center justify-center cursor-pointer ${
                    isEqEnabled ? 'text-[#ea580c]' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title="Toàn màn hình (F)"
                  className="w-7 h-7 rounded-[4px] hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dockable Playlist Drawer (Fluent V-One Style with "Let's chat Copilot" search layout) */}
        {showPlaylist && (
          <div className="w-72 sm:w-80 bg-white dark:bg-[#202020] border-l border-black/10 dark:border-white/10 flex flex-col shrink-0 z-20">
            {/* Playlist Header */}
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FluentVlcColorIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold tracking-tight">Danh sách phát</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ea580c]/15 text-[#ea580c] font-semibold">
                  {playlist.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleOpenFileClick}
                  title="Thêm tệp..."
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-[#ea580c] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlaylist(false)}
                  title="Đóng danh sách"
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Playlist Search Bar (Styled strictly matching the "Let's chat Copilot" layout) */}
            <div className="p-2.5 border-b border-black/10 dark:border-white/10">
              <div className="relative w-full h-8 flex items-center px-2.5 rounded-[6px] bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 focus-within:border-[#ea580c] focus-within:ring-1 focus-within:ring-[#ea580c] transition-all">
                <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={playlistSearch}
                  onChange={(e) => setPlaylistSearch(e.target.value)}
                  placeholder="Tìm kiếm danh sách phát..."
                  className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
                />
                {playlistSearch && (
                  <button
                    type="button"
                    onClick={() => setPlaylistSearch('')}
                    className="text-neutral-400 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Playlist Items List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {filteredPlaylist.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  Không tìm thấy tệp phương tiện phù hợp
                </div>
              ) : (
                filteredPlaylist.map((item, idx) => {
                  const isCurrent = playlist[currentIndex]?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        const originalIndex = playlist.findIndex((p) => p.id === item.id);
                        if (originalIndex !== -1) {
                          setCurrentIndex(originalIndex);
                          setIsPlaying(true);
                        }
                      }}
                      className={`group/item w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#ea580c]/15 text-[#ea580c] font-medium border border-[#ea580c]/30 shadow-xs'
                          : 'hover:bg-black/5 dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3">
                              <span className="w-0.5 h-3 bg-[#ea580c] animate-pulse" />
                              <span className="w-0.5 h-2 bg-[#ea580c] animate-pulse delay-75" />
                              <span className="w-0.5 h-3.5 bg-[#ea580c] animate-pulse delay-150" />
                            </div>
                          ) : item.type === 'audio' ? (
                            <Music className="w-3.5 h-3.5 text-neutral-400" />
                          ) : (
                            <Film className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs truncate font-medium">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {item.artist || (item.source === 'sample' ? 'Mẫu VLC' : 'Tệp nạp')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.duration && (
                          <span className="text-[10px] font-mono text-neutral-400">
                            {item.duration}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlaylist((prev) => prev.filter((p) => p.id !== item.id));
                          }}
                          title="Xóa khỏi danh sách"
                          className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-500 rounded transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowNetworkStreamModal(true)}
                className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-[#ea580c] cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Thêm luồng URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaylist([]);
                  showOsd('Đã xóa toàn bộ danh sách');
                }}
                className="text-neutral-400 hover:text-red-500 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: VLC 10-Band Equalizer (Classic VLC Equalizer Dialog) */}
      {showEqualizerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 p-5 text-neutral-900 dark:text-white animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#ea580c]" />
                <h3 className="text-sm font-bold">Bộ điều chỉnh âm thanh (Equalizer 10 dải)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEqualizerModal(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enable switch & Preset selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-black/10 dark:border-white/10 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEqEnabled}
                  onChange={(e) => {
                    initAudioNodes();
                    setIsEqEnabled(e.target.checked);
                    showOsd(e.target.checked ? 'Đã bật Equalizer' : 'Đã tắt Equalizer');
                  }}
                  className="rounded text-[#ea580c] focus:ring-[#ea580c] cursor-pointer"
                />
                <span className="font-semibold">Kích hoạt Equalizer</span>
              </label>

              {/* Preset Selector */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-[11px]">Cài đặt mẫu:</span>
                <select
                  value={eqPreset}
                  onChange={(e) => handleApplyPreset(e.target.value)}
                  className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs outline-none cursor-pointer"
                >
                  {Object.keys(EQ_PRESETS).map((preset) => (
                    <option key={preset} value={preset} className="dark:bg-[#222]">
                      {preset}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 10-Band Sliders */}
            <div className="py-4">
              <div className="grid grid-cols-10 gap-2 items-end h-44 px-2">
                {EQUALIZER_BANDS.map((band, idx) => (
                  <div key={band.freq} className="flex flex-col items-center h-full justify-between">
                    <span className="text-[9px] font-mono text-neutral-400">
                      {eqGains[idx] > 0 ? `+${eqGains[idx]}` : eqGains[idx]}dB
                    </span>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={eqGains[idx]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setEqGains((prev) => {
                          const updated = [...prev];
                          updated[idx] = val;
                          return updated;
                        });
                        setIsEqEnabled(true);
                      }}
                      className="h-28 w-1.5 appearance-none bg-neutral-300 dark:bg-neutral-700 rounded-lg cursor-pointer accent-[#ea580c] [writing-mode:vertical-lr] [direction:rtl]"
                    />
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                      {band.freq}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preamp */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-600 dark:text-neutral-300">Tiền khuếch đại (Preamp):</span>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={1}
                  value={preamp}
                  onChange={(e) => setPreamp(parseInt(e.target.value))}
                  className="w-28 accent-[#ea580c] cursor-pointer"
                />
                <span className="font-mono text-neutral-400">{preamp > 0 ? `+${preamp}` : preamp}dB</span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyPreset('Flat')}
                className="px-3 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-[#ea580c]/20 hover:text-[#ea580c] transition-colors"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VLC Video Adjustments & Effects */}
      {showVideoEffectsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 p-5 text-neutral-900 dark:text-white animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ea580c]" />
                <h3 className="text-sm font-bold">Hiệu ứng hình ảnh & Bộ lọc Video</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoEffectsModal(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              {/* Brightness */}
              <div className="flex items-center justify-between">
                <span>Độ sáng (Brightness):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-32 accent-[#ea580c] cursor-pointer"
                  />
                  <span className="font-mono w-10 text-right">{brightness}%</span>
                </div>
              </div>

              {/* Contrast */}
              <div className="flex items-center justify-between">
                <span>Độ tương phản (Contrast):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-32 accent-[#ea580c] cursor-pointer"
                  />
                  <span className="font-mono w-10 text-right">{contrast}%</span>
                </div>
              </div>

              {/* Saturation */}
              <div className="flex items-center justify-between">
                <span>Độ bão hòa (Saturation):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-32 accent-[#ea580c] cursor-pointer"
                  />
                  <span className="font-mono w-10 text-right">{saturation}%</span>
                </div>
              </div>

              {/* Hue */}
              <div className="flex items-center justify-between">
                <span>Góc màu (Hue):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="w-32 accent-[#ea580c] cursor-pointer"
                  />
                  <span className="font-mono w-10 text-right">{hue}°</span>
                </div>
              </div>

              {/* Rotation */}
              <div className="flex items-center justify-between">
                <span>Xoay khung hình:</span>
                <div className="flex items-center gap-1">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotation(deg)}
                      className={`px-2 py-1 rounded ${
                        rotation === deg ? 'bg-[#ea580c] text-white' : 'bg-black/5 dark:bg-white/10'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                  setHue(0);
                  setRotation(0);
                  showOsd('Đã khôi phục hiệu ứng video gốc');
                }}
                className="px-3 py-1.5 rounded bg-black/5 dark:bg-white/10 hover:bg-neutral-200 text-xs"
              >
                Khôi phục mặc định
              </button>
              <button
                type="button"
                onClick={() => setShowVideoEffectsModal(false)}
                className="px-4 py-1.5 rounded bg-[#ea580c] text-white text-xs font-semibold hover:bg-[#ea580c]/90"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Open Network Stream */}
      {showNetworkStreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 p-5 text-neutral-900 dark:text-white animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#ea580c]" />
                <h3 className="text-sm font-bold">Mở luồng mạng trực tuyến (Network Stream)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNetworkStreamModal(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Nhập địa chỉ URL phát trực tiếp (HLS, MP4, MP3, WebM):
                </label>
                {/* Input box styled in the "Let's chat Copilot" design */}
                <div className="w-full h-9 flex items-center px-3 rounded-[6px] bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 focus-within:border-[#ea580c] focus-within:ring-1 focus-within:ring-[#ea580c]">
                  <Globe className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="url"
                    value={networkUrlInput}
                    onChange={(e) => setNetworkUrlInput(e.target.value)}
                    placeholder="https://example.com/live/stream.m3u8 hoặc stream.mp4"
                    className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick sample streams */}
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">
                  Hoặc chọn luồng mẫu sẵn có:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNetworkUrlInput('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                    className="px-2.5 py-1.5 rounded-md bg-black/5 dark:bg-white/5 hover:bg-[#ea580c]/15 hover:text-[#ea580c] text-left truncate transition-colors"
                  >
                    🐰 Big Buck Bunny HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkUrlInput('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4')}
                    className="px-2.5 py-1.5 rounded-md bg-black/5 dark:bg-white/5 hover:bg-[#ea580c]/15 hover:text-[#ea580c] text-left truncate transition-colors"
                  >
                    🚀 Tears of Steel 4K
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkUrlInput('https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3')}
                    className="px-2.5 py-1.5 rounded-md bg-black/5 dark:bg-white/5 hover:bg-[#ea580c]/15 hover:text-[#ea580c] text-left truncate transition-colors"
                  >
                    🎧 Synthwave Audio Stream
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkUrlInput('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4')}
                    className="px-2.5 py-1.5 rounded-md bg-black/5 dark:bg-white/5 hover:bg-[#ea580c]/15 hover:text-[#ea580c] text-left truncate transition-colors"
                  >
                    🐘 Elephants Dream
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNetworkStreamModal(false)}
                className="px-3 py-1.5 rounded bg-black/5 dark:bg-white/10 hover:bg-neutral-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleOpenNetworkStream}
                className="px-4 py-1.5 rounded bg-[#ea580c] text-white font-semibold hover:bg-[#ea580c]/90"
              >
                Mở luồng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Media & Codec Information */}
      {showMediaInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 p-5 text-neutral-900 dark:text-white animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#ea580c]" />
                <h3 className="text-sm font-bold">Thông tin phương tiện & Codec</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaInfoModal(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 space-y-1.5">
                <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                  Tiêu đề: {currentItem?.title}
                </p>
                <p className="text-neutral-500 truncate">
                  Đường dẫn: {currentItem?.url}
                </p>
                <p className="text-neutral-500">
                  Loại tệp: {currentItem?.type === 'video' ? 'Video Stream / Container' : 'Audio Track'}
                </p>
              </div>

              <div className="space-y-1 text-neutral-600 dark:text-neutral-300">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span>Thời lượng:</span>
                  <span className="font-mono">{formatTime(duration)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span>Độ phân giải:</span>
                  <span className="font-mono">{videoRef.current?.videoWidth || 1920} x {videoRef.current?.videoHeight || 1080}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span>Tỷ lệ khung hình:</span>
                  <span className="capitalize">{aspectRatio}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span>Codec Video:</span>
                  <span className="font-mono">H.264 / AVC (MPEG-4 Part 10)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span>Codec Âm thanh:</span>
                  <span className="font-mono">AAC (MPEG-4 Audio) / 48000 Hz Stereo</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Engine phát:</span>
                  <span className="text-[#ea580c] font-semibold">VLC Web Core + Web Audio API</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaInfoModal(false)}
                className="px-4 py-1.5 rounded bg-[#ea580c] text-white text-xs font-semibold hover:bg-[#ea580c]/90"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
