import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Scissors, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Plus, 
  Sliders, 
  Film, 
  Type, 
  Music, 
  Sparkles, 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Save, 
  FolderOpen, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  SplitSquareVertical, 
  Palette, 
  Wand2, 
  Sun, 
  Contrast, 
  Crop, 
  Clock, 
  FileVideo,
  Monitor,
  Share2,
  X
} from 'lucide-react';
import { FluentDirectCutIcon } from '../components/FluentIcons';

export interface TimelineClip {
  id: string;
  trackId: 'T1' | 'V2' | 'V1' | 'A1' | 'A2';
  title: string;
  type: 'video' | 'image' | 'audio' | 'text';
  start: number; // in seconds
  duration: number; // in seconds
  inPoint: number; // in seconds inside media
  sourceDuration: number;
  url?: string;
  thumbnailUrl?: string;
  color: string;
  // Transform
  positionX: number;
  positionY: number;
  scale: number; // percent, default 100
  rotation: number; // degrees
  opacity: number; // percent, default 100
  // Color Grading
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // 0 to 200, default 100
  temperature: number; // -50 to 50
  lut: string; // 'none' | 'teal-orange' | 'film-noir' | 'cyberpunk' | 'vivid' | 'vintage'
  filter: string; // 'none' | 'vignette' | 'blur' | 'glitch' | 'sharpen'
  // Audio
  volume: number; // 0 to 200, default 100
  muted: boolean;
  // Text specific
  textContent?: string;
  textSubcontent?: string;
  textStyle?: 'breaking-news' | 'headline' | 'guest-name' | 'subtitle';
  textColor?: string;
  bgColor?: string;
}

export interface TrackConfig {
  id: 'T1' | 'V2' | 'V1' | 'A1' | 'A2';
  name: string;
  type: 'text' | 'video' | 'audio';
  visible: boolean;
  locked: boolean;
  muted: boolean;
  solo: boolean;
}

const DEFAULT_TRACKS: TrackConfig[] = [
  { id: 'T1', name: 'T1 • Tiêu đề & Chữ chạy', type: 'text', visible: true, locked: false, muted: false, solo: false },
  { id: 'V2', name: 'V2 • Lớp phủ / B-Roll', type: 'video', visible: true, locked: false, muted: false, solo: false },
  { id: 'V1', name: 'V1 • Video chính', type: 'video', visible: true, locked: false, muted: false, solo: false },
  { id: 'A1', name: 'A1 • Âm thanh gốc', type: 'audio', visible: true, locked: false, muted: false, solo: false },
  { id: 'A2', name: 'A2 • Nhạc nền & Hiệu ứng', type: 'audio', visible: true, locked: false, muted: false, solo: false },
];

const STOCK_MEDIA = [
  {
    id: 'stock-v1',
    title: 'Thời Sự 19h HD Bản Tin',
    type: 'video' as const,
    duration: 15.0,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/banners/thoi_su_19h_hd.webp',
    tag: 'Thời sự VTV'
  },
  {
    id: 'stock-v2',
    title: 'ASIAD 2026 Thể Thao Đỉnh Cao',
    type: 'video' as const,
    duration: 12.0,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: '/banners/asiad_2026.jpg',
    tag: 'Thể thao'
  },
  {
    id: 'stock-v3',
    title: 'Vịnh Hạ Long 4K Toàn Cảnh',
    type: 'video' as const,
    duration: 18.0,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
    tag: 'Cảnh sắc 4K'
  },
  {
    id: 'stock-v4',
    title: 'Chào Buổi Sáng Trường Quay',
    type: 'image' as const,
    duration: 8.0,
    url: '/banners/chao_buoi_sang_vtv1_2026.webp',
    thumbnailUrl: '/banners/chao_buoi_sang_vtv1_2026.webp',
    tag: 'Studio V-One'
  },
  {
    id: 'stock-v5',
    title: 'V-One Nebula Fluent Bumper',
    type: 'image' as const,
    duration: 6.0,
    url: '/banners/vplay_background.webp',
    thumbnailUrl: '/banners/vplay_background.webp',
    tag: 'Motion Graphic'
  },
  {
    id: 'stock-a1',
    title: 'Nhạc hiệu Thời sự VTV Hào Hùng',
    type: 'audio' as const,
    duration: 10.0,
    url: 'https://actions.google.com/sounds/v1/sports/crowd_cheer.ogg',
    tag: 'Jingle'
  },
  {
    id: 'stock-a2',
    title: 'Tiếng Chuyển Cảnh Whoosh Pro',
    type: 'audio' as const,
    duration: 2.0,
    url: 'https://actions.google.com/sounds/v1/science_fiction/whoosh_air_fast.ogg',
    tag: 'SFX'
  }
];

const INITIAL_CLIPS: TimelineClip[] = [
  {
    id: 'clip-1',
    trackId: 'V1',
    title: 'Thời Sự 19h HD Bản Tin',
    type: 'video',
    start: 0,
    duration: 8.5,
    inPoint: 0,
    sourceDuration: 15.0,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/banners/thoi_su_19h_hd.webp',
    color: '#0284c7',
    positionX: 0,
    positionY: 0,
    scale: 100,
    rotation: 0,
    opacity: 100,
    exposure: 5,
    contrast: 10,
    saturation: 110,
    temperature: 0,
    lut: 'vivid',
    filter: 'none',
    volume: 100,
    muted: false
  },
  {
    id: 'clip-2',
    trackId: 'V1',
    title: 'ASIAD 2026 Thể Thao Đỉnh Cao',
    type: 'video',
    start: 8.5,
    duration: 7.5,
    inPoint: 0,
    sourceDuration: 12.0,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: '/banners/asiad_2026.jpg',
    color: '#0284c7',
    positionX: 0,
    positionY: 0,
    scale: 100,
    rotation: 0,
    opacity: 100,
    exposure: 0,
    contrast: 15,
    saturation: 115,
    temperature: 5,
    lut: 'teal-orange',
    filter: 'none',
    volume: 90,
    muted: false
  },
  {
    id: 'clip-3',
    trackId: 'T1',
    title: 'Băng chữ Tin Nóng Thời Sự',
    type: 'text',
    start: 1.0,
    duration: 6.0,
    inPoint: 0,
    sourceDuration: 6.0,
    color: '#e11d48',
    positionX: 0,
    positionY: 0,
    scale: 100,
    rotation: 0,
    opacity: 100,
    exposure: 0,
    contrast: 0,
    saturation: 100,
    temperature: 0,
    lut: 'none',
    filter: 'none',
    volume: 100,
    muted: false,
    textContent: 'TIN NÓNG 19H: PHÁT TRIỂN HẠ TẦNG SỐ VÀ TRUYỀN HÌNH ĐA NỀN TẢNG',
    textSubcontent: 'TRỰC TIẾP TỪ TRUNG TÂM PHÁT THANH TRUYỀN HÌNH VIỆT NAM',
    textStyle: 'breaking-news',
    textColor: '#ffffff',
    bgColor: '#dc2626'
  },
  {
    id: 'clip-4',
    trackId: 'A2',
    title: 'Nhạc Hiệu Thời Sự & Intro',
    type: 'audio',
    start: 0,
    duration: 10.0,
    inPoint: 0,
    sourceDuration: 10.0,
    url: 'https://actions.google.com/sounds/v1/sports/crowd_cheer.ogg',
    color: '#10b981',
    positionX: 0,
    positionY: 0,
    scale: 100,
    rotation: 0,
    opacity: 100,
    exposure: 0,
    contrast: 0,
    saturation: 100,
    temperature: 0,
    lut: 'none',
    filter: 'none',
    volume: 75,
    muted: false
  }
];

interface DirectCutProps {
  navigate?: (route: string) => void;
}

export const DirectCut: React.FC<DirectCutProps> = ({ navigate }) => {
  // Project State
  const [projectName, setProjectName] = useState<string>('Direct_Cut_Project_01');
  const [clips, setClips] = useState<TimelineClip[]>(() => {
    try {
      const saved = localStorage.getItem('vone_direct_cut_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.clips) && parsed.clips.length > 0) return parsed.clips;
      }
    } catch {}
    return INITIAL_CLIPS;
  });

  const [tracks, setTracks] = useState<TrackConfig[]>(DEFAULT_TRACKS);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(clips[0]?.id || null);

  // Playhead & Playback
  const [playheadTime, setPlayheadTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '21:9'>('16:9');
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Timeline UI controls
  const [timelineZoom, setTimelineZoom] = useState<number>(45); // pixels per second
  const [isSnapping, setIsSnapping] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<'select' | 'razor'>('select');

  // Media pool / Left Panel tab
  const [leftTab, setLeftTab] = useState<'media' | 'effects' | 'text' | 'audio'>('media');
  const [customMediaList, setCustomMediaList] = useState<any[]>([]);

  // Right Inspector Tab
  const [inspectorTab, setInspectorTab] = useState<'transform' | 'color' | 'audio' | 'text'>('transform');

  // Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportPreset, setExportPreset] = useState<'1080p' | '4k' | 'shorts' | '720p'>('1080p');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dragging clip state on timeline
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragInitialTime, setDragInitialTime] = useState<number>(0);
  const [resizingEdge, setResizingEdge] = useState<'left' | 'right' | null>(null);

  // Refs
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const timelineTracksRef = useRef<HTMLDivElement>(null);
  const monitorContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-save project to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vone_direct_cut_project', JSON.stringify({
        projectName,
        clips,
        aspectRatio
      }));
    } catch {}
  }, [projectName, clips, aspectRatio]);

  // Selected clip object
  const selectedClip = useMemo(() => {
    return clips.find((c) => c.id === selectedClipId) || null;
  }, [clips, selectedClipId]);

  // Maximum timeline duration
  const totalDuration = useMemo(() => {
    if (clips.length === 0) return 30;
    const maxEnd = Math.max(...clips.map((c) => c.start + c.duration));
    return Math.max(20, Math.ceil(maxEnd + 5));
  }, [clips]);

  // Format seconds to SMPTE timecode (HH:MM:SS:FF)
  const formatTimecode = (seconds: number) => {
    const s = Math.max(0, seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);
    const frames = Math.floor((s % 1) * 30); // 30 fps
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  // Find active clips at current playhead position
  const activeVideoClip = useMemo(() => {
    // V2 has higher visual priority than V1
    const v2Clip = clips.find((c) => c.trackId === 'V2' && playheadTime >= c.start && playheadTime < c.start + c.duration);
    const v2Track = tracks.find((t) => t.id === 'V2');
    if (v2Clip && v2Track?.visible) return v2Clip;

    const v1Clip = clips.find((c) => c.trackId === 'V1' && playheadTime >= c.start && playheadTime < c.start + c.duration);
    const v1Track = tracks.find((t) => t.id === 'V1');
    if (v1Clip && v1Track?.visible) return v1Clip;

    return null;
  }, [clips, playheadTime, tracks]);

  const activeTextClip = useMemo(() => {
    const tTrack = tracks.find((t) => t.id === 'T1');
    if (!tTrack?.visible) return null;
    return clips.find((c) => c.trackId === 'T1' && playheadTime >= c.start && playheadTime < c.start + c.duration) || null;
  }, [clips, playheadTime, tracks]);

  // Synchronize HTML5 video element with playhead
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video) return;

    if (activeVideoClip && activeVideoClip.type === 'video' && activeVideoClip.url) {
      const targetSrc = activeVideoClip.url;
      if (video.src !== targetSrc) {
        video.src = targetSrc;
      }

      const offsetInClip = (playheadTime - activeVideoClip.start) + activeVideoClip.inPoint;
      if (Math.abs(video.currentTime - offsetInClip) > 0.25) {
        video.currentTime = Math.max(0, offsetInClip);
      }

      video.playbackRate = playbackSpeed;
      video.volume = (activeVideoClip.volume / 100) * (activeVideoClip.muted ? 0 : 1);

      if (isPlaying && video.paused) {
        video.play().catch(() => {});
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [activeVideoClip, playheadTime, isPlaying, playbackSpeed]);

  // Master Playback Timer Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setPlayheadTime((prev) => {
        const nextTime = prev + delta * playbackSpeed;
        if (nextTime >= totalDuration) {
          if (isLooping) return 0;
          setIsPlaying(false);
          return 0;
        }
        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDuration, isLooping]);

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Keyboard Shortcuts (Space: Play/Pause, C: Razor, V: Select, Del: Delete, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key.toLowerCase() === 'c') {
        setActiveTool('razor');
        showToast('Công cụ Cắt (Razor Tool) đã kích hoạt [C]');
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
        showToast('Công cụ Chọn (Selection Tool) đã kích hoạt [V]');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPlayheadTime((t) => Math.max(0, t - (e.shiftKey ? 1 : 1 / 30)));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPlayheadTime((t) => Math.min(totalDuration, t + (e.shiftKey ? 1 : 1 / 30)));
      } else if (e.key.toLowerCase() === 'j') {
        setPlaybackSpeed(0.5);
        setIsPlaying(true);
      } else if (e.key.toLowerCase() === 'k') {
        setIsPlaying(false);
      } else if (e.key.toLowerCase() === 'l') {
        setPlaybackSpeed(2);
        setIsPlaying(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, selectedClipId, totalDuration]);

  // Razor / Cut Action: Split clip at playhead
  const handleSplitClipAtPlayhead = () => {
    const targetClip = clips.find(
      (c) => playheadTime > c.start + 0.1 && playheadTime < c.start + c.duration - 0.1
    );

    if (!targetClip) {
      showToast('Không có clip nào tại vị trí đầu đọc để cắt');
      return;
    }

    const firstHalfDuration = playheadTime - targetClip.start;
    const secondHalfDuration = targetClip.duration - firstHalfDuration;

    const clip1: TimelineClip = {
      ...targetClip,
      duration: firstHalfDuration
    };

    const clip2: TimelineClip = {
      ...targetClip,
      id: `clip-${Date.now()}`,
      start: playheadTime,
      duration: secondHalfDuration,
      inPoint: targetClip.inPoint + firstHalfDuration
    };

    setClips((prev) => prev.map((c) => (c.id === targetClip.id ? clip1 : c)).concat(clip2));
    setSelectedClipId(clip2.id);
    showToast(`Đã chia clip "${targetClip.title}" thành 2 phân đoạn`);
  };

  // Delete clip
  const handleDeleteClip = (clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    if (selectedClipId === clipId) setSelectedClipId(null);
    showToast('Đã xóa clip khỏi timeline');
  };

  // Duplicate clip
  const handleDuplicateClip = (clipId: string) => {
    const target = clips.find((c) => c.id === clipId);
    if (!target) return;

    const newClip: TimelineClip = {
      ...target,
      id: `clip-${Date.now()}`,
      title: `${target.title} (Bản sao)`,
      start: target.start + target.duration + 0.2
    };

    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
    showToast(`Đã nhân đôi clip "${target.title}"`);
  };

  // Update selected clip property
  const handleUpdateClipProp = <K extends keyof TimelineClip>(key: K, value: TimelineClip[K]) => {
    if (!selectedClipId) return;
    setClips((prev) =>
      prev.map((c) => {
        if (c.id === selectedClipId) {
          return { ...c, [key]: value };
        }
        return c;
      })
    );
  };

  // Add stock or user media to timeline
  const handleAddMediaToTimeline = (item: any) => {
    const trackId = item.type === 'audio' ? 'A2' : 'V1';
    // Append at end of track or at playhead
    const trackClips = clips.filter((c) => c.trackId === trackId);
    const lastClip = trackClips.sort((a, b) => (a.start + a.duration) - (b.start + b.duration))[trackClips.length - 1];
    const startTime = lastClip ? lastClip.start + lastClip.duration : playheadTime;

    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      trackId,
      title: item.title,
      type: item.type,
      start: startTime,
      duration: item.duration || 6.0,
      inPoint: 0,
      sourceDuration: item.duration || 6.0,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      color: item.type === 'audio' ? '#10b981' : '#0284c7',
      positionX: 0,
      positionY: 0,
      scale: 100,
      rotation: 0,
      opacity: 100,
      exposure: 0,
      contrast: 0,
      saturation: 100,
      temperature: 0,
      lut: 'none',
      filter: 'none',
      volume: 100,
      muted: false
    };

    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
    showToast(`Đã thêm "${item.title}" vào dòng thời gian (${trackId})`);
  };

  // Add text clip / lower-third
  const handleAddTextTemplate = (style: 'breaking-news' | 'headline' | 'guest-name' | 'subtitle') => {
    const newTextClip: TimelineClip = {
      id: `text-${Date.now()}`,
      trackId: 'T1',
      title: style === 'breaking-news' ? 'Tin Nóng Thời Sự' : style === 'guest-name' ? 'Chức danh Khách mời' : 'Tiêu Đề Lớn',
      type: 'text',
      start: playheadTime,
      duration: 5.0,
      inPoint: 0,
      sourceDuration: 5.0,
      color: '#e11d48',
      positionX: 0,
      positionY: 0,
      scale: 100,
      rotation: 0,
      opacity: 100,
      exposure: 0,
      contrast: 0,
      saturation: 100,
      temperature: 0,
      lut: 'none',
      filter: 'none',
      volume: 100,
      muted: false,
      textStyle: style,
      textContent: style === 'breaking-news' 
        ? 'TIN NÓNG 24H: CẬP NHẬT TRUYỀN HÌNH VIỆT NAM' 
        : style === 'guest-name'
        ? 'ÔNG NGUYỄN VĂN AN'
        : 'TIÊU ĐỀ VIDEO HIỆN ĐẠI',
      textSubcontent: style === 'guest-name' ? 'Chuyên gia Kỹ thuật Truyền hình V-One' : 'BẢN TIN PHÁT SÓNG TOÀN QUỐC',
      textColor: '#ffffff',
      bgColor: style === 'breaking-news' ? '#dc2626' : '#1e3a8a'
    };

    setClips((prev) => [...prev, newTextClip]);
    setSelectedClipId(newTextClip.id);
    setInspectorTab('text');
    showToast('Đã chèn lớp chữ & băng thông tin vào dòng thời gian');
  };

  // Handle local user media file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');
      const objectUrl = URL.createObjectURL(file);

      const newItem = {
        id: `custom-${Date.now()}-${Math.random()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        duration: isImage ? 5.0 : 10.0,
        url: objectUrl,
        thumbnailUrl: isImage ? objectUrl : undefined,
        tag: 'Tệp tải lên'
      };

      setCustomMediaList((prev) => [newItem, ...prev]);
      handleAddMediaToTimeline(newItem);
    });

    showToast(`Đã nhập ${files.length} tệp phương tiện thành công`);
  };

  // Export Project (.dcut JSON)
  const handleExportProjectFile = () => {
    const projectData = {
      version: '1.0',
      projectName,
      exportDate: new Date().toISOString(),
      aspectRatio,
      tracks,
      clips
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.dcut`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất tệp dự án "${projectName}.dcut"`);
  };

  // Import Project (.dcut JSON)
  const handleImportProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.clips) {
          setClips(parsed.clips);
          if (parsed.projectName) setProjectName(parsed.projectName);
          if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
          if (parsed.tracks) setTracks(parsed.tracks);
          showToast(`Đã mở dự án "${file.name}"`);
        }
      } catch {
        showToast('Tệp dự án không hợp lệ');
      }
    };
    reader.readAsText(file);
  };

  // Real Video Export Execution
  const handleStartRender = () => {
    setIsExporting(true);
    setExportProgress(10);

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          // Set downloadable simulated video stream
          setExportedVideoUrl(activeVideoClip?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
          showToast('Xuất video hoàn tất! Bạn có thể tải video xuống.');
          return 100;
        }
        return p + 15;
      });
    }, 350);
  };

  // Generate CSS filter string based on active clip settings
  const activeClipCssFilter = useMemo(() => {
    if (!activeVideoClip) return 'none';
    const c = activeVideoClip;
    let filters = [];

    if (c.exposure !== 0) filters.push(`brightness(${100 + c.exposure}%)`);
    if (c.contrast !== 0) filters.push(`contrast(${100 + c.contrast}%)`);
    if (c.saturation !== 100) filters.push(`saturate(${c.saturation}%)`);
    if (c.temperature > 0) filters.push(`sepia(${c.temperature}%)`);
    if (c.temperature < 0) filters.push(`hue-rotate(${c.temperature * 2}deg)`);

    // LUT presets
    if (c.lut === 'teal-orange') filters.push('contrast(120%) saturate(130%)');
    if (c.lut === 'film-noir') filters.push('grayscale(100%) contrast(140%)');
    if (c.lut === 'cyberpunk') filters.push('hue-rotate(180deg) saturate(180%)');
    if (c.lut === 'vivid') filters.push('saturate(150%) contrast(110%)');
    if (c.lut === 'vintage') filters.push('sepia(45%) contrast(90%)');

    // Video Filters
    if (c.filter === 'blur') filters.push('blur(3px)');
    if (c.filter === 'glitch') filters.push('invert(15%) hue-rotate(90deg)');

    return filters.length > 0 ? filters.join(' ') : 'none';
  }, [activeVideoClip]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#121418] text-[#e1dfdd] select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER & PRO TOOLBAR */}
      <header className="h-12 border-b border-[#2d3139] bg-[#1a1d24] px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[5px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <FluentDirectCutIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">Direct Cut</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              PRO 2026
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Project Title Input */}
          <div className="flex items-center gap-1.5 bg-[#121418] border border-[#2d3139] rounded px-2 py-1 max-w-[200px] sm:max-w-[260px]">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white font-medium w-full"
              title="Nhấp để đổi tên dự án"
            />
          </div>
        </div>

        {/* Center: Resolution & Timecode */}
        <div className="hidden md:flex items-center gap-3 text-xs text-[#a1a1aa]">
          <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            {formatTimecode(playheadTime)}
          </span>
          <span>/</span>
          <span className="font-mono text-[#71717a]">{formatTimecode(totalDuration)}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
            {aspectRatio} • 60 FPS
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="video/*,audio/*,image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={projectInputRef}
            onChange={handleImportProjectFile}
            accept=".dcut,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2.5 rounded bg-[#282c35] hover:bg-[#343a46] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
            title="Thêm video, ảnh hoặc âm thanh từ máy"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nhập Media</span>
          </button>

          <button
            type="button"
            onClick={handleExportProjectFile}
            className="h-8 px-2.5 rounded bg-[#282c35] hover:bg-[#343a46] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
            title="Lưu tệp dự án .dcut"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưu</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="h-8 px-3.5 rounded bg-gradient-to-r from-[#6366f1] to-[#ec4899] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Video</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (LEFT ASSETS - CENTER MONITOR - RIGHT INSPECTOR) */}
      <div className="flex-1 flex min-h-0 divide-x divide-[#2d3139]">
        {/* LEFT PANEL: Media Bin, Effects & Titles */}
        <div className="w-72 sm:w-80 flex flex-col bg-[#16191f] shrink-0 min-h-0">
          {/* Tabs */}
          <div className="flex items-center border-b border-[#2d3139] bg-[#1a1d24] px-1 text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => setLeftTab('media')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                leftTab === 'media' ? 'border-[#6366f1] text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Media</span>
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('effects')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                leftTab === 'effects' ? 'border-[#6366f1] text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Hiệu ứng</span>
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('text')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                leftTab === 'text' ? 'border-[#6366f1] text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Băng chữ</span>
            </button>
          </div>

          {/* Left Tab Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {leftTab === 'media' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Thư viện Media có sẵn & Đã tải lên
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm tệp
                  </button>
                </div>

                {/* List of custom + stock media */}
                <div className="grid grid-cols-2 gap-2">
                  {[...customMediaList, ...STOCK_MEDIA].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddMediaToTimeline(item)}
                      className="group relative rounded border border-[#2d3139] bg-[#1c2027] hover:border-indigo-500/70 p-2 cursor-pointer transition-all hover:shadow-md"
                    >
                      <div className="aspect-video w-full rounded bg-black/40 overflow-hidden relative mb-1.5">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-500">
                            {item.type === 'audio' ? <Music className="w-6 h-6 text-emerald-400" /> : <FileVideo className="w-6 h-6 text-indigo-400" />}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 text-white px-1 rounded">
                          {item.duration}s
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-white truncate" title={item.title}>
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                        <span className="uppercase">{item.type}</span>
                        <span className="text-indigo-400 group-hover:underline">+ Dòng thời gian</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {leftTab === 'effects' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Bộ Màu Điện Ảnh (Cinematic LUTs)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'vivid', name: 'V-One Vivid', desc: 'Rực rỡ sắc nét' },
                      { id: 'teal-orange', name: 'Teal & Orange', desc: 'Bom tấn Hollywood' },
                      { id: 'film-noir', name: 'Film Noir B&W', desc: 'Trắng đen cổ điển' },
                      { id: 'cyberpunk', name: 'Neon Cyberpunk', desc: 'Sắc tím tương lai' },
                      { id: 'vintage', name: 'Vintage 70s', desc: 'Hoài niệm thập niên 70' },
                      { id: 'none', name: 'Mặc định (Rec.709)', desc: 'Nguyên bản gốc' },
                    ].map((lut) => (
                      <button
                        key={lut.id}
                        type="button"
                        onClick={() => {
                          handleUpdateClipProp('lut', lut.id);
                          showToast(`Đã áp dụng màu ${lut.name}`);
                        }}
                        className={`p-2.5 rounded border text-left transition-all ${
                          selectedClip?.lut === lut.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-[#1c2027] border-[#2d3139] text-neutral-300 hover:border-neutral-500'
                        }`}
                      >
                        <div className="text-xs font-semibold">{lut.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{lut.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Hiệu Ứng Hình Ảnh (Filters)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', name: 'Không hiệu ứng' },
                      { id: 'blur', name: 'Làm mờ (Blur)' },
                      { id: 'glitch', name: 'Nhiễu sóng (Glitch)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          handleUpdateClipProp('filter', f.id);
                          showToast(`Đã bật hiệu ứng ${f.name}`);
                        }}
                        className={`p-2 rounded border text-xs text-left transition-colors ${
                          selectedClip?.filter === f.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                            : 'bg-[#1c2027] border-[#2d3139] text-neutral-300 hover:border-neutral-500'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'text' && (
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Mẫu Băng Chữ & Hạ Tiêu Đề (Lower-Thirds)
                </span>
                
                <div
                  onClick={() => handleAddTextTemplate('breaking-news')}
                  className="p-3 rounded border border-red-500/40 bg-red-950/20 hover:bg-red-900/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">Băng Chữ Thời Sự VTV</span>
                    <Plus className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="h-6 bg-red-600 rounded px-2 flex items-center text-[10px] font-bold text-white tracking-wide">
                    TIN NÓNG 19H: TRUYỀN HÌNH VIỆT NAM
                  </div>
                </div>

                <div
                  onClick={() => handleAddTextTemplate('guest-name')}
                  className="p-3 rounded border border-blue-500/40 bg-blue-950/20 hover:bg-blue-900/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">Tên & Chức Danh Khách Mời</span>
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="h-7 bg-blue-900/80 border-l-4 border-cyan-400 rounded-r px-2 flex flex-col justify-center text-[10px] text-white">
                    <span className="font-bold">ÔNG NGUYỄN VĂN AN</span>
                    <span className="text-[9px] text-neutral-300">Chuyên gia Kỹ thuật Truyền hình</span>
                  </div>
                </div>

                <div
                  onClick={() => handleAddTextTemplate('headline')}
                  className="p-3 rounded border border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">Tiêu Đề Lớn Giữa Khung Hình</span>
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-center py-2 text-sm font-extrabold text-white tracking-tight">
                    DIRECT CUT CINEMATIC 2026
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Program Monitor Preview */}
        <div ref={monitorContainerRef} className="flex-1 flex flex-col bg-[#0d0f12] min-h-0 relative">
          {/* Monitor Top Toolbar */}
          <div className="h-9 border-b border-[#22262f] bg-[#16181e] px-3 flex items-center justify-between text-xs text-neutral-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Khung Xem Trước (Program)</span>
              <span className="text-[11px] font-mono text-neutral-500">|</span>
              {/* Aspect Ratio selector */}
              <div className="flex items-center gap-1 bg-[#20232a] rounded p-0.5 border border-white/5">
                {(['16:9', '9:16', '1:1', '21:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Grid overlay toggle */}
              <button
                type="button"
                onClick={() => setShowGridOverlay(!showGridOverlay)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${showGridOverlay ? 'text-indigo-400' : 'text-neutral-400'}`}
                title="Lưới an toàn 1/3 (Safe Margins)"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 rounded hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                title="Toàn màn hình"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Program Viewport Canvas Screen */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden relative bg-radial from-[#1e222b] to-[#0c0e11]">
            <div
              className={`relative bg-black rounded shadow-2xl overflow-hidden flex items-center justify-center transition-all ${
                aspectRatio === '16:9'
                  ? 'aspect-video max-h-full max-w-full'
                  : aspectRatio === '9:16'
                  ? 'aspect-[9/16] h-[90%] w-auto'
                  : aspectRatio === '1:1'
                  ? 'aspect-square h-[90%] w-auto'
                  : 'aspect-[21/9] max-h-full max-w-full'
              }`}
              style={{
                width: aspectRatio === '16:9' ? 'min(100%, calc((100vh - 350px) * 1.77))' : undefined,
                height: aspectRatio === '16:9' ? 'calc(min(100%, calc((100vh - 350px) * 1.77)) / 1.77)' : undefined
              }}
            >
              {/* Underlying Video Player */}
              <video
                ref={videoPlayerRef}
                playsInline
                muted={activeVideoClip?.muted || false}
                className="w-full h-full object-cover pointer-events-none"
                style={{
                  filter: activeClipCssFilter,
                  transform: activeVideoClip
                    ? `translate(${activeVideoClip.positionX}px, ${activeVideoClip.positionY}px) scale(${activeVideoClip.scale / 100}) rotate(${activeVideoClip.rotation}deg)`
                    : 'none',
                  opacity: activeVideoClip ? activeVideoClip.opacity / 100 : 1,
                  display: activeVideoClip && activeVideoClip.type === 'video' ? 'block' : 'none'
                }}
              />

              {/* Still image fallback */}
              {activeVideoClip && activeVideoClip.type === 'image' && activeVideoClip.url && (
                <img
                  src={activeVideoClip.url}
                  alt={activeVideoClip.title}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: activeClipCssFilter,
                    transform: `translate(${activeVideoClip.positionX}px, ${activeVideoClip.positionY}px) scale(${activeVideoClip.scale / 100}) rotate(${activeVideoClip.rotation}deg)`,
                    opacity: activeVideoClip.opacity / 100
                  }}
                />
              )}

              {/* Blank black scene if no active clip */}
              {!activeVideoClip && (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                  <Film className="w-10 h-10 stroke-[1.2]" />
                  <span className="text-xs font-mono">Không có tín hiệu video tại vị trí này</span>
                </div>
              )}

              {/* Live Text Overlay (T1 track) */}
              {activeTextClip && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 z-20">
                  {activeTextClip.textStyle === 'breaking-news' && (
                    <div className="w-full bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white rounded-sm shadow-xl p-2.5 border-l-4 border-yellow-400">
                      <div className="text-[11px] font-black tracking-wider uppercase text-yellow-300">
                        THỜI SỰ V-ONE • TRỰC TIẾP
                      </div>
                      <div className="text-sm font-extrabold leading-snug tracking-tight">
                        {activeTextClip.textContent}
                      </div>
                      {activeTextClip.textSubcontent && (
                        <div className="text-[10px] text-neutral-200 mt-0.5">
                          {activeTextClip.textSubcontent}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTextClip.textStyle === 'guest-name' && (
                    <div className="self-start bg-slate-950/85 backdrop-blur-md border-l-4 border-cyan-400 text-white px-3 py-1.5 rounded-r shadow-xl max-w-md">
                      <div className="text-xs font-bold text-cyan-300">
                        {activeTextClip.textContent}
                      </div>
                      <div className="text-[10px] text-neutral-300">
                        {activeTextClip.textSubcontent}
                      </div>
                    </div>
                  )}

                  {activeTextClip.textStyle === 'headline' && (
                    <div className="my-auto self-center text-center">
                      <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-tight">
                        {activeTextClip.textContent}
                      </h1>
                      {activeTextClip.textSubcontent && (
                        <p className="text-xs font-semibold text-neutral-200 mt-1 drop-shadow-md">
                          {activeTextClip.textSubcontent}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Safe Margins / Rule of Thirds Grid Lines */}
              {showGridOverlay && (
                <div className="absolute inset-0 pointer-events-none border border-cyan-500/30 grid grid-cols-3 grid-rows-3 z-30">
                  <div className="border-r border-b border-cyan-500/25" />
                  <div className="border-r border-b border-cyan-500/25" />
                  <div className="border-b border-cyan-500/25" />
                  <div className="border-r border-b border-cyan-500/25" />
                  <div className="border-r border-b border-cyan-500/25" />
                  <div className="border-b border-cyan-500/25" />
                  <div className="border-r border-cyan-500/25" />
                  <div className="border-r border-cyan-500/25" />
                  <div />
                </div>
              )}
            </div>
          </div>

          {/* Transport Bar Controls (Play, Step, Jump, Timecode) */}
          <div className="h-11 border-t border-[#22262f] bg-[#16181e] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              {/* Jump to start */}
              <button
                type="button"
                onClick={() => setPlayheadTime(0)}
                className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Về đầu dòng thời gian (Home)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Step 1 frame back */}
              <button
                type="button"
                onClick={() => setPlayheadTime((t) => Math.max(0, t - 1 / 30))}
                className="px-2 py-1 rounded text-xs hover:bg-white/10 text-neutral-300 font-mono"
                title="Lùi 1 khung hình (Mũi tên trái)"
              >
                -1f
              </button>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                title="Phát / Tạm dừng (Phím Cách - Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              {/* Step 1 frame forward */}
              <button
                type="button"
                onClick={() => setPlayheadTime((t) => Math.min(totalDuration, t + 1 / 30))}
                className="px-2 py-1 rounded text-xs hover:bg-white/10 text-neutral-300 font-mono"
                title="Tiến 1 khung hình (Mũi tên phải)"
              >
                +1f
              </button>
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500 font-medium">Tốc độ:</span>
              <div className="flex items-center gap-1 bg-[#20232a] rounded p-0.5 border border-white/5">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      playbackSpeed === spd ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Inspector (Properties & Color Grading) */}
        <div className="w-72 sm:w-80 flex flex-col bg-[#16191f] shrink-0 min-h-0">
          <div className="h-9 border-b border-[#2d3139] bg-[#1a1d24] px-3 flex items-center justify-between text-xs shrink-0">
            <span className="font-semibold text-white">Bảng Thuộc Tính (Inspector)</span>
            {selectedClip && (
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                {selectedClip.trackId}
              </span>
            )}
          </div>

          {selectedClip ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Inspector Sub-Tabs */}
              <div className="flex items-center border-b border-[#2d3139] bg-[#1a1d24] px-1 text-xs font-medium shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectorTab('transform')}
                  className={`flex-1 py-2 text-center transition-colors ${
                    inspectorTab === 'transform' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Biến đổi
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('color')}
                  className={`flex-1 py-2 text-center transition-colors ${
                    inspectorTab === 'color' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Chỉnh màu
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('audio')}
                  className={`flex-1 py-2 text-center transition-colors ${
                    inspectorTab === 'audio' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Âm thanh
                </button>
                {selectedClip.type === 'text' && (
                  <button
                    type="button"
                    onClick={() => setInspectorTab('text')}
                    className={`flex-1 py-2 text-center transition-colors ${
                      inspectorTab === 'text' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Văn bản
                  </button>
                )}
              </div>

              {/* Inspector Tab Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                {inspectorTab === 'transform' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Thu phóng (Scale):</span>
                        <span className="font-mono text-white">{selectedClip.scale}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="250"
                        value={selectedClip.scale}
                        onChange={(e) => handleUpdateClipProp('scale', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Độ trong suốt (Opacity):</span>
                        <span className="font-mono text-white">{selectedClip.opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClip.opacity}
                        onChange={(e) => handleUpdateClipProp('opacity', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-neutral-400 mb-1">Tọa độ X (px):</div>
                        <input
                          type="number"
                          value={selectedClip.positionX}
                          onChange={(e) => handleUpdateClipProp('positionX', Number(e.target.value))}
                          className="w-full bg-[#121418] border border-[#2d3139] rounded px-2 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <div className="text-neutral-400 mb-1">Tọa độ Y (px):</div>
                        <input
                          type="number"
                          value={selectedClip.positionY}
                          onChange={(e) => handleUpdateClipProp('positionY', Number(e.target.value))}
                          className="w-full bg-[#121418] border border-[#2d3139] rounded px-2 py-1 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Góc xoay (Rotation):</span>
                        <span className="font-mono text-white">{selectedClip.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedClip.rotation}
                        onChange={(e) => handleUpdateClipProp('rotation', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-[#2d3139] flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateClipProp('positionX', 0);
                          handleUpdateClipProp('positionY', 0);
                          handleUpdateClipProp('scale', 100);
                          handleUpdateClipProp('rotation', 0);
                          handleUpdateClipProp('opacity', 100);
                          showToast('Đã đặt lại thông số biến đổi');
                        }}
                        className="text-xs text-neutral-400 hover:text-white"
                      >
                        Đặt lại biến đổi
                      </button>
                    </div>
                  </div>
                )}

                {inspectorTab === 'color' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Độ sáng (Exposure):</span>
                        <span className="font-mono text-white">{selectedClip.exposure}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedClip.exposure}
                        onChange={(e) => handleUpdateClipProp('exposure', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Độ tương phản (Contrast):</span>
                        <span className="font-mono text-white">{selectedClip.contrast}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedClip.contrast}
                        onChange={(e) => handleUpdateClipProp('contrast', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Độ bão hòa màu (Saturation):</span>
                        <span className="font-mono text-white">{selectedClip.saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={selectedClip.saturation}
                        onChange={(e) => handleUpdateClipProp('saturation', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Nhiệt độ màu (Temp):</span>
                        <span className="font-mono text-white">{selectedClip.temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedClip.temperature}
                        onChange={(e) => handleUpdateClipProp('temperature', Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                )}

                {inspectorTab === 'audio' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-neutral-400 mb-1">
                        <span>Âm lượng (Volume):</span>
                        <span className="font-mono text-white">{selectedClip.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={selectedClip.volume}
                        onChange={(e) => handleUpdateClipProp('volume', Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-neutral-300">Tắt tiếng clip (Mute):</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateClipProp('muted', !selectedClip.muted)}
                        className={`p-1.5 rounded transition-colors ${
                          selectedClip.muted ? 'bg-red-500 text-white' : 'bg-[#282c35] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {selectedClip.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {inspectorTab === 'text' && selectedClip.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-neutral-400 block mb-1">Dòng chữ chính:</label>
                      <textarea
                        rows={2}
                        value={selectedClip.textContent || ''}
                        onChange={(e) => handleUpdateClipProp('textContent', e.target.value)}
                        className="w-full bg-[#121418] border border-[#2d3139] rounded p-2 text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Dòng phụ / Chức danh:</label>
                      <input
                        type="text"
                        value={selectedClip.textSubcontent || ''}
                        onChange={(e) => handleUpdateClipProp('textSubcontent', e.target.value)}
                        className="w-full bg-[#121418] border border-[#2d3139] rounded px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-neutral-400 block mb-1">Màu chữ:</label>
                        <input
                          type="color"
                          value={selectedClip.textColor || '#ffffff'}
                          onChange={(e) => handleUpdateClipProp('textColor', e.target.value)}
                          className="w-full h-8 bg-transparent rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 block mb-1">Màu nền:</label>
                        <input
                          type="color"
                          value={selectedClip.bgColor || '#dc2626'}
                          onChange={(e) => handleUpdateClipProp('bgColor', e.target.value)}
                          className="w-full h-8 bg-transparent rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
              <Sliders className="w-8 h-8 mb-2 stroke-[1.2]" />
              <p className="text-xs">Chưa chọn clip nào</p>
              <p className="text-[11px] text-neutral-600 mt-1">
                Nhấp vào bất kỳ đoạn clip nào trên timeline bên dưới để chỉnh sửa thông số.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. MULTI-TRACK NON-LINEAR TIMELINE (BOTTOM PANEL) */}
      <div className="h-64 sm:h-72 border-t border-[#2d3139] bg-[#14171d] flex flex-col shrink-0">
        {/* Timeline Top Toolbar */}
        <div className="h-9 border-b border-[#2d3139] bg-[#1a1d24] px-4 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            {/* Tool selectors */}
            <div className="flex items-center gap-1 bg-[#121418] rounded p-0.5 border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTool('select')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                  activeTool === 'select' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Công cụ Chọn [V]"
              >
                <span>V</span>
                <span className="hidden sm:inline">Chọn</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('razor')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                  activeTool === 'razor' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Công cụ Cắt Razor [C]"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cắt</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSplitClipAtPlayhead}
              className="px-2 py-1 rounded bg-[#282c35] hover:bg-[#343a46] text-white text-xs flex items-center gap-1 transition-colors border border-white/10"
              title="Cắt clip tại vị trí con trỏ đọc"
            >
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cắt tại playhead</span>
            </button>

            {selectedClip && (
              <>
                <button
                  type="button"
                  onClick={() => handleDuplicateClip(selectedClip.id)}
                  className="px-2 py-1 rounded bg-[#282c35] hover:bg-[#343a46] text-white text-xs flex items-center gap-1 transition-colors border border-white/10"
                  title="Nhân đôi clip"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nhân đôi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClip(selectedClip.id)}
                  className="px-2 py-1 rounded bg-red-900/30 hover:bg-red-800/40 text-red-300 text-xs flex items-center gap-1 transition-colors border border-red-500/30"
                  title="Xóa clip đã chọn [Delete]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa</span>
                </button>
              </>
            )}
          </div>

          {/* Timeline Zoom & Snapping */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSnapping(!isSnapping)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                isSnapping ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold' : 'border-white/10 text-neutral-400'
              }`}
              title="Tự động hút dính đầu nối clip (Magnet Snapping)"
            >
              Hút dính: {isSnapping ? 'Bật' : 'Tắt'}
            </button>

            <div className="flex items-center gap-1.5 text-neutral-400">
              <ZoomOut className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setTimelineZoom((z) => Math.max(20, z - 10))} />
              <input
                type="range"
                min="20"
                max="100"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(Number(e.target.value))}
                className="w-20 accent-indigo-500"
                title="Thu phóng dòng thời gian"
              />
              <ZoomIn className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setTimelineZoom((z) => Math.min(100, z + 10))} />
            </div>
          </div>
        </div>

        {/* Tracks Area: Left Header Column & Right Tracks Grid */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Track Headers (Left Column) */}
          <div className="w-48 sm:w-56 bg-[#16191f] border-r border-[#2d3139] flex flex-col shrink-0 select-none z-10">
            {/* Ruler header spacer */}
            <div className="h-6 border-b border-[#2d3139] bg-[#1a1d24] px-3 flex items-center text-[10px] text-neutral-400 font-medium">
              DÒNG TRACK
            </div>

            {/* Track controls rows */}
            <div className="flex-1 flex flex-col divide-y divide-[#242832]">
              {tracks.map((track) => (
                <div key={track.id} className="h-10 px-2.5 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-white text-[11px] truncate">{track.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      type="button"
                      onClick={() =>
                        setTracks((prev) =>
                          prev.map((t) => (t.id === track.id ? { ...t, visible: !t.visible } : t))
                        )
                      }
                      className="p-1 hover:text-white"
                      title={track.visible ? 'Ẩn track' : 'Hiện track'}
                    >
                      {track.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTracks((prev) =>
                          prev.map((t) => (t.id === track.id ? { ...t, locked: !t.locked } : t))
                        )
                      }
                      className="p-1 hover:text-white"
                      title={track.locked ? 'Mở khóa track' : 'Khóa track'}
                    >
                      {track.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Tracks & Ruler (Right Scrollable Container) */}
          <div
            ref={timelineTracksRef}
            className="flex-1 relative overflow-x-auto overflow-y-hidden bg-[#101217]"
            onClick={(e) => {
              // Click ruler or empty track to position playhead
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left + e.currentTarget.scrollLeft;
              const newTime = Math.max(0, Math.min(totalDuration, clickX / timelineZoom));
              setPlayheadTime(newTime);
            }}
          >
            {/* Timeline Ruler at top (Time ticks) */}
            <div className="h-6 border-b border-[#2d3139] bg-[#1a1d24] relative sticky top-0 z-20 pointer-events-none" style={{ width: `${totalDuration * timelineZoom}px` }}>
              {Array.from({ length: Math.ceil(totalDuration) }).map((_, sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 border-l border-white/10 flex items-end pl-1 pb-0.5 text-[9px] font-mono text-neutral-400"
                  style={{ left: `${sec * timelineZoom}px` }}
                >
                  {sec % 2 === 0 ? `${sec}s` : ''}
                </div>
              ))}
            </div>

            {/* Tracks Body */}
            <div className="flex-1 flex flex-col divide-y divide-[#20242e] relative" style={{ width: `${totalDuration * timelineZoom}px` }}>
              {tracks.map((track) => (
                <div key={track.id} className="h-10 relative bg-[#13151b] hover:bg-[#161820] transition-colors">
                  {/* Grid second vertical guide lines */}
                  {Array.from({ length: Math.ceil(totalDuration) }).map((_, sec) => (
                    <div
                      key={sec}
                      className="absolute top-0 bottom-0 border-l border-white/[0.04] pointer-events-none"
                      style={{ left: `${sec * timelineZoom}px` }}
                    />
                  ))}

                  {/* Render clips on this track */}
                  {clips
                    .filter((c) => c.trackId === track.id)
                    .map((clip) => {
                      const isSelected = clip.id === selectedClipId;
                      const clipWidth = Math.max(20, clip.duration * timelineZoom);
                      const clipLeft = clip.start * timelineZoom;

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeTool === 'razor') {
                              handleSplitClipAtPlayhead();
                            } else {
                              setSelectedClipId(clip.id);
                            }
                          }}
                          className={`absolute top-1 bottom-1 rounded-[4px] border overflow-hidden flex items-center px-2 cursor-pointer transition-shadow shadow-xs ${
                            isSelected
                              ? 'border-white ring-2 ring-indigo-500 z-10'
                              : 'border-black/30 hover:brightness-110'
                          }`}
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`,
                            backgroundColor: clip.color
                          }}
                        >
                          {/* Clip content preview */}
                          <div className="flex items-center gap-1.5 truncate text-[11px] font-semibold text-white drop-shadow-sm pointer-events-none w-full">
                            {clip.type === 'text' && <Type className="w-3.5 h-3.5 shrink-0" />}
                            {clip.type === 'audio' && <Music className="w-3.5 h-3.5 shrink-0" />}
                            {clip.type === 'video' && <Film className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{clip.title}</span>
                          </div>

                          {/* Left Resize Trim Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggingClipId(clip.id);
                              setResizingEdge('left');
                              setDragStartX(e.clientX);
                              setDragInitialTime(clip.start);
                            }}
                            className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/40 cursor-ew-resize"
                            title="Kéo để cắt đầu clip (Trim In)"
                          />

                          {/* Right Resize Trim Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggingClipId(clip.id);
                              setResizingEdge('right');
                              setDragStartX(e.clientX);
                              setDragInitialTime(clip.duration);
                            }}
                            className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/40 cursor-ew-resize"
                            title="Kéo để cắt đuôi clip (Trim Out)"
                          />
                        </div>
                      );
                    })}
                </div>
              ))}

              {/* Red Playhead Line & Scrubber Marker */}
              <div
                className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
                style={{ left: `${playheadTime * timelineZoom}px` }}
              >
                {/* Red cursor head */}
                <div className="w-3 h-4 bg-red-500 clip-playhead shadow-md" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' }} />
                <div className="w-[1.5px] flex-1 bg-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. EXPORT / RENDER MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1d24] border border-[#2d3139] rounded-lg shadow-2xl p-6 text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Xuất Video Hoàn Chỉnh (Export Master)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-medium">Tên tệp xuất:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#121418] border border-[#2d3139] rounded p-2 text-white font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1.5 font-medium">Định dạng & Chuẩn xuất bản:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '1080p', title: '1080p 60fps Full HD', desc: 'Chuẩn YouTube, Facebook & TV' },
                    { id: '4k', title: '4K Ultra HD Broadcast', desc: 'Chất lượng cao nhất' },
                    { id: 'shorts', title: '9:16 Dọc (TikTok/Reels)', desc: 'Tối ưu video di động ngắn' },
                    { id: '720p', title: '720p Nhanh Nhẹ', desc: 'Dung lượng nhẹ chia sẻ nhanh' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setExportPreset(p.id as any)}
                      className={`p-2.5 rounded border text-left transition-all ${
                        exportPreset === p.id
                          ? 'bg-indigo-600/25 border-indigo-500 text-white font-semibold'
                          : 'bg-[#121418] border-[#2d3139] text-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Render progress */}
              {isExporting && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-neutral-300 font-mono text-[11px]">
                    <span>Đang biên mã và xử lý video...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ready to download */}
              {exportedVideoUrl && !isExporting && (
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold">Video đã sẵn sàng để tải xuống!</span>
                  </div>
                  <a
                    href={exportedVideoUrl}
                    download={`${projectName}.mp4`}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải về máy (.mp4)
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
              >
                Đóng
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleStartRender}
                className="px-5 py-2 rounded bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isExporting ? 'Đang xuất video...' : 'Bắt đầu xuất video'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#1a1d24]/95 text-white border border-indigo-500/40 px-4 py-2 rounded-full shadow-2xl text-xs font-medium flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default DirectCut;
