import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Tv,
  Radio,
  FileText,
  Image as ImageIcon,
  Grid,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  ChevronDown,
  X,
  Palette,
  Volume2,
  TrendingUp,
  Clock,
  Calendar as CalendarIcon,
  Sun,
  CloudSun,
  Mail,
  Users,
  Compass,
  FileSpreadsheet,
  FileCode,
  Gamepad2,
  Camera,
  Play,
  Layers,
  ShoppingBag,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Channel } from '../types';
import { CHANNELS_DATA } from '../data/channels';
import { useSettings } from '../hooks/useSettings';

export type TileSize = '1x1' | '2x1' | '2x2' | '4x4' | '5x5';
export type TileCategory = 'channel' | 'app' | 'file' | 'photo' | 'weather' | 'calendar' | 'clock' | 'news' | 'finance';

export interface LiveTileItem {
  id: string;
  title: string;
  subtitle?: string;
  category: TileCategory;
  size: TileSize;
  color: string; // Solid flat hex color (no gradient)
  route?: string;
  iconName?: string;
  groupName?: string;
  isLive?: boolean;
  data?: {
    channelId?: string;
    channelSlug?: string;
    logo?: string;
    imageUrl?: string;
    fileType?: 'word' | 'excel' | 'pdf' | 'note' | 'powerpoint';
    fileSize?: string;
    badge?: string;
    description?: string;
  };
}

export const SOLID_METRO_COLORS = [
  { name: 'Cobalt Blue', hex: '#0078d4' },
  { name: 'Crimson Red', hex: '#d83b01' },
  { name: 'Emerald Green', hex: '#008a00' },
  { name: 'Purple', hex: '#603cba' },
  { name: 'Magenta Pink', hex: '#d80073' },
  { name: 'Cyan Sky', hex: '#00a4ef' },
  { name: 'Warm Orange', hex: '#fa6800' },
  { name: 'Lime Green', hex: '#65a30d' },
  { name: 'Deep Navy', hex: '#1e3a8a' },
  { name: 'Dark Teal', hex: '#00aba9' },
  { name: 'Slate Gray', hex: '#334155' },
  { name: 'Deep Violet', hex: '#7c3aed' },
];

export const TILE_SIZES: { value: TileSize; label: string; desc: string }[] = [
  { value: '1x1', label: '1 × 1 (Nhỏ)', desc: '1 ô vuông nhỏ biểu tượng' },
  { value: '2x1', label: '2 × 1 (Rộng nhỏ)', desc: '2 cột × 1 hàng ngang' },
  { value: '2x2', label: '2 × 2 (Trung bình)', desc: '2 cột × 2 hàng vuông chuẩn' },
  { value: '4x4', label: '4 × 4 (Lớn)', desc: '4 cột × 4 hàng màn hình lớn' },
  { value: '5x5', label: '5 × 5 (Cực lớn)', desc: '5 cột × 5 hàng Hero Tile' },
];

const DEFAULT_TILES: LiveTileItem[] = [
  // Group: Apps & Tools
  {
    id: 'tile-store',
    title: 'Store',
    subtitle: 'Microsoft Store',
    category: 'app',
    size: '2x2',
    color: '#0078d4',
    route: '/store',
    iconName: 'store',
    groupName: 'Ứng dụng & Tiện ích',
    isLive: true
  },
  {
    id: 'tile-weather',
    title: 'Thời tiết',
    subtitle: 'Hà Nội',
    category: 'weather',
    size: '2x2',
    color: '#00a4ef',
    route: '/widgets',
    iconName: 'weather',
    groupName: 'Ứng dụng & Tiện ích',
    isLive: true
  },
  {
    id: 'tile-calendar',
    title: 'Calendar',
    subtitle: 'Lịch công việc',
    category: 'calendar',
    size: '2x1',
    color: '#008a00',
    route: '/calendar',
    iconName: 'calendar',
    groupName: 'Ứng dụng & Tiện ích',
    isLive: true
  },
  {
    id: 'tile-mail',
    title: 'Mail',
    subtitle: 'Hộp thư điện tử',
    category: 'app',
    size: '2x1',
    color: '#008a00',
    route: '/mail',
    iconName: 'mail',
    groupName: 'Ứng dụng & Tiện ích',
    isLive: true
  },
  {
    id: 'tile-edge',
    title: 'Edge Browser',
    subtitle: 'Duyệt web tốc độ cao',
    category: 'app',
    size: '2x1',
    color: '#0078d4',
    route: '/edge',
    iconName: 'edge',
    groupName: 'Ứng dụng & Tiện ích'
  },
  {
    id: 'tile-clock',
    title: 'Clock',
    subtitle: 'Báo thức & Giờ thế giới',
    category: 'clock',
    size: '2x1',
    color: '#d80073',
    route: '/clock',
    iconName: 'clock',
    groupName: 'Ứng dụng & Tiện ích',
    isLive: true
  },
  {
    id: 'tile-camera',
    title: 'Camera',
    subtitle: 'Máy ảnh HD',
    category: 'app',
    size: '2x1',
    color: '#d83b01',
    route: '/camera',
    iconName: 'camera',
    groupName: 'Ứng dụng & Tiện ích'
  },
  {
    id: 'tile-calc',
    title: 'Máy tính',
    category: 'app',
    size: '1x1',
    color: '#7c3aed',
    route: '/calculator',
    iconName: 'calc',
    groupName: 'Ứng dụng & Tiện ích'
  },
  {
    id: 'tile-taskmgr',
    title: 'Task Manager',
    category: 'app',
    size: '1x1',
    color: '#334155',
    route: '/tasks',
    iconName: 'taskmgr',
    groupName: 'Ứng dụng & Tiện ích'
  },
  {
    id: 'tile-swiftbank',
    title: 'Swift Bank',
    subtitle: 'Tài chính số',
    category: 'finance',
    size: '2x2',
    color: '#008a00',
    route: '/swift-bank',
    iconName: 'bank',
    groupName: 'Ứng dụng & Tiện ích',
    isLive: true
  },

  // Group: TV & Media
  {
    id: 'tile-vtv1',
    title: 'VTV1 HD',
    subtitle: 'Thời sự 19h • Trực tiếp',
    category: 'channel',
    size: '4x4',
    color: '#d83b01',
    route: '/live-tv?channel=vtv1',
    groupName: 'Truyền hình & Đa phương tiện',
    isLive: true,
    data: {
      channelId: 'vtv1',
      channelSlug: 'vtv1',
      logo: '/banners/thoi_su_19h_hd.webp',
      badge: 'Trực tiếp'
    }
  },
  {
    id: 'tile-vtv3',
    title: 'VTV3 HD',
    subtitle: 'Giải trí đỉnh cao',
    category: 'channel',
    size: '2x1',
    color: '#fa6800',
    route: '/live-tv?channel=vtv3',
    groupName: 'Truyền hình & Đa phương tiện',
    data: {
      channelId: 'vtv3',
      channelSlug: 'vtv3'
    }
  },
  {
    id: 'tile-htv7',
    title: 'HTV7 HD',
    subtitle: 'Chương trình 2 Ngày 1 Đêm',
    category: 'channel',
    size: '2x2',
    color: '#0078d4',
    route: '/live-tv?channel=htv7',
    groupName: 'Truyền hình & Đa phương tiện',
    isLive: true,
    data: {
      channelId: 'htv7',
      channelSlug: 'htv7'
    }
  },
  {
    id: 'tile-vlc',
    title: 'VLC Player',
    subtitle: 'Media Player',
    category: 'app',
    size: '2x2',
    color: '#fa6800',
    route: '/vlc',
    iconName: 'vlc',
    groupName: 'Truyền hình & Đa phương tiện',
    isLive: true
  },
  {
    id: 'tile-vov',
    title: 'VOV Giao Thông',
    subtitle: 'Radio 91.0 MHz',
    category: 'channel',
    size: '1x1',
    color: '#00aba9',
    route: '/live-tv?channel=vov-giao-thong-hcm',
    groupName: 'Truyền hình & Đa phương tiện',
    data: {
      channelId: 'vov-giao-thong-hcm',
      channelSlug: 'vov-gt-hcm'
    }
  },
  {
    id: 'tile-news-ticker',
    title: 'VnExpress',
    subtitle: 'Tin tức thời sự 24/7',
    category: 'news',
    size: '2x2',
    color: '#1e3a8a',
    route: '/news',
    iconName: 'news',
    groupName: 'Truyền hình & Đa phương tiện',
    isLive: true
  },

  // Group: Photos
  {
    id: 'tile-photos-live',
    title: 'Photos',
    subtitle: 'Khoảnh khắc kỷ niệm',
    category: 'photo',
    size: '4x4',
    color: '#b91d47',
    route: '/photos',
    iconName: 'photos',
    groupName: 'Bộ sưu tập & Ảnh',
    isLive: true,
    data: {
      imageUrl: '/banners/chao_buoi_sang_vtv1_2026.webp'
    }
  },
  {
    id: 'tile-photo-autumn',
    title: 'Hà Nội Mùa Thu',
    subtitle: 'Ảnh chân dung',
    category: 'photo',
    size: '2x2',
    color: '#d83b01',
    route: '/photos',
    groupName: 'Bộ sưu tập & Ảnh',
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'tile-photo-danang',
    title: 'Cầu Rồng Đà Nẵng',
    category: 'photo',
    size: '2x1',
    color: '#0078d4',
    route: '/photos',
    groupName: 'Bộ sưu tập & Ảnh',
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80'
    }
  },

  // Group: Files & Documents
  {
    id: 'tile-doc-asiad',
    title: 'Lich_Phat_Song_ASIAD_2026.pdf',
    subtitle: 'Tài liệu PDF • 2.4 MB',
    category: 'file',
    size: '2x1',
    color: '#d83b01',
    route: '/notes',
    groupName: 'Tài liệu & Tệp tin',
    data: {
      fileType: 'pdf',
      fileSize: '2.4 MB'
    }
  },
  {
    id: 'tile-doc-swift',
    title: 'Sao_Ke_Thang_10_SwiftBank.xlsx',
    subtitle: 'Bảng tính Excel • 420 KB',
    category: 'file',
    size: '2x1',
    color: '#008a00',
    route: '/notes',
    groupName: 'Tài liệu & Tệp tin',
    data: {
      fileType: 'excel',
      fileSize: '420 KB'
    }
  },
  {
    id: 'tile-doc-notes',
    title: 'Ghi chú công việc tuần mới.docx',
    subtitle: 'Tài liệu Word • 1.1 MB',
    category: 'file',
    size: '2x1',
    color: '#0078d4',
    route: '/notes',
    groupName: 'Tài liệu & Tệp tin',
    data: {
      fileType: 'word',
      fileSize: '1.1 MB'
    }
  },
  {
    id: 'tile-doc-quick',
    title: 'Sticky Note',
    category: 'file',
    size: '1x1',
    color: '#fa6800',
    route: '/notes',
    groupName: 'Tài liệu & Tệp tin',
    data: {
      fileType: 'note'
    }
  },

  // Group: Social & Creative
  {
    id: 'tile-social',
    title: 'Swift Social',
    subtitle: 'Mạng xã hội & Tin 24h',
    category: 'app',
    size: '2x2',
    color: '#d83b01',
    route: '/swift-social',
    iconName: 'social',
    groupName: 'Cộng đồng & Sáng tạo',
    isLive: true
  },
  {
    id: 'tile-friends',
    title: 'Friends',
    subtitle: '100 bạn bè trực tuyến',
    category: 'app',
    size: '2x1',
    color: '#603cba',
    route: '/friends',
    iconName: 'friends',
    groupName: 'Cộng đồng & Sáng tạo'
  },
  {
    id: 'tile-craftmine',
    title: 'Craftmine 3D',
    subtitle: 'Thế giới khối hộp Sandbox',
    category: 'app',
    size: '2x2',
    color: '#65a30d',
    route: '/craftmine',
    iconName: 'craftmine',
    groupName: 'Cộng đồng & Sáng tạo'
  },
  {
    id: 'tile-photopea',
    title: 'Photopea Studio',
    subtitle: 'Biên tập đồ họa chuyên nghiệp',
    category: 'app',
    size: '2x1',
    color: '#00aba9',
    route: '/photopea',
    iconName: 'photopea',
    groupName: 'Cộng đồng & Sáng tạo'
  }
];

const PHOTO_CAROUSEL_IMAGES = [
  '/banners/chao_buoi_sang_vtv1_2026.webp',
  '/banners/thoi_su_19h_hd.webp',
  '/banners/asiad_2026.jpg',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
];

const BREAKING_NEWS_SNIPPETS = [
  'Thị trường công nghệ đón nhận làn sóng nâng cấp AI thế hệ mới',
  'Hạ tầng số Việt Nam bứt phá với các giải pháp streaming đa nền tảng',
  'Dự báo thời tiết các khu vực trên cả nước trong tuần mới mát mẻ',
  'Đại hội Thể thao Châu Á ASIAD 2026 chuẩn bị khởi tranh các môn võ thuật',
  'Swift Bank ra mắt phương thức thanh toán không chạm Fluent Pay'
];

interface LiveTilesHomeProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onNavigate: (route: string) => void;
}

export const LiveTilesHome: React.FC<LiveTilesHomeProps> = ({
  channels,
  onSelectChannel,
  onNavigate
}) => {
  const { updateSetting } = useSettings();

  // Load custom pinned tiles from localStorage or defaults
  const [tiles, setTiles] = useState<LiveTileItem[]>(() => {
    try {
      const saved = localStorage.getItem('vone_live_tiles_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TILES;
  });

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('vone_live_tiles_items', JSON.stringify(tiles));
    } catch {}
  }, [tiles]);

  // Live timer tick for clock tile (HH:MM:SS)
  const [liveTime, setLiveTime] = useState<string>('00:00:00');
  const [liveDate, setLiveDate] = useState<{ dayNum: number; dayName: string; monthStr: string }>({
    dayNum: new Date().getDate(),
    dayName: 'Thứ Sáu',
    monthStr: 'Tháng 10'
  });

  useEffect(() => {
    const updateTicker = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('vi-VN', { hour12: false }));
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      setLiveDate({
        dayNum: now.getDate(),
        dayName: days[now.getDay()],
        monthStr: `Tháng ${now.getMonth() + 1}`
      });
    };
    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, []);

  // Photo carousel index for live photo tile
  const [photoIndex, setPhotoIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % PHOTO_CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // News ticker index
  const [newsIndex, setNewsIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % BREAKING_NEWS_SNIPPETS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live TV flip state
  const [isTvFlipped, setIsTvFlipped] = useState(false);
  useEffect(() => {
    const flipTimer = setInterval(() => {
      setIsTvFlipped((prev) => !prev);
    }, 6000);
    return () => clearInterval(flipTimer);
  }, []);

  // Horizontal scroll container ref & methods
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -480 : 480;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      if (!e.ctrlKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollContainerRef.current.scrollLeft += e.deltaY * 1.35;
      }
    }
  };

  // Listen for global context menu "Pin to Live Tiles" trigger
  useEffect(() => {
    const handleOpenPinModal = () => setIsPinModalOpen(true);
    window.addEventListener('vplay-open-pin-tile', handleOpenPinModal);
    return () => window.removeEventListener('vplay-open-pin-tile', handleOpenPinModal);
  }, []);

  // Floating Tile Context Menu (styled identically to Windows 10/Global Context Menu)
  const [tileContextMenu, setTileContextMenu] = useState<{
    tile: LiveTileItem;
    x: number;
    y: number;
  } | null>(null);
  const [openTileSubmenu, setOpenTileSubmenu] = useState<'resize' | 'color' | null>(null);
  const tileSubmenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close tile context menu on outside click, scroll, or escape
  useEffect(() => {
    if (!tileContextMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#tile-custom-context-menu')) {
        setTileContextMenu(null);
        setOpenTileSubmenu(null);
      }
    };
    const handleScroll = () => {
      setTileContextMenu(null);
      setOpenTileSubmenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTileContextMenu(null);
        setOpenTileSubmenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tileContextMenu]);

  // Pin Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinTab, setPinTab] = useState<'channels' | 'apps' | 'files' | 'photos'>('channels');
  const [pinSearchQuery, setPinSearchQuery] = useState('');
  const [selectedPinSize, setSelectedPinSize] = useState<TileSize>('2x2');
  const [selectedPinColor, setSelectedPinColor] = useState<string>('#0078d4');

  // Filter groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    tiles.forEach((t) => {
      if (t.groupName) {
        set.add(t.groupName);
      }
    });
    if (tiles.some((t) => !t.groupName)) {
      set.add('Chung');
    }
    if (set.size === 0) {
      set.add('Ứng dụng & Tiện ích');
    }
    return Array.from(set);
  }, [tiles]);

  // Active Tile Flip Animation on Click to Open
  const [flippingTileId, setFlippingTileId] = useState<string | null>(null);

  // Click on a tile with 3D Flip Launch Animation
  const handleTileClick = (tile: LiveTileItem) => {
    if (flippingTileId) return;
    setFlippingTileId(tile.id);

    setTimeout(() => {
      if (tile.category === 'channel' && tile.data?.channelId) {
        const found = channels.find((c) => c.id === tile.data?.channelId || c.slug === tile.data?.channelSlug);
        if (found) {
          onSelectChannel(found);
        }
        onNavigate(tile.route || `/live-tv?channel=${tile.data.channelSlug || tile.data.channelId}`);
        setFlippingTileId(null);
        return;
      }

      if (tile.route) {
        onNavigate(tile.route);
      }
      setFlippingTileId(null);
    }, 380);
  };

  // Change tile size
  const handleResizeTile = (tileId: string, size: TileSize) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, size } : t))
    );
    setTileContextMenu(null);
    setOpenTileSubmenu(null);
  };

  // Change tile color
  const handleChangeColor = (tileId: string, color: string) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, color } : t))
    );
    setTileContextMenu(null);
    setOpenTileSubmenu(null);
  };

  // Toggle live tile
  const handleToggleLive = (tileId: string) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isLive: !t.isLive } : t))
    );
  };

  // Unpin tile
  const handleUnpinTile = (tileId: string) => {
    setTiles((prev) => prev.filter((t) => t.id !== tileId));
    setTileContextMenu(null);
    setOpenTileSubmenu(null);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm('Đặt lại tất cả các ô Live Tiles về mặc định?')) {
      setTiles(DEFAULT_TILES);
      try {
        localStorage.removeItem('vone_live_tiles_items');
      } catch {}
    }
  };

  // Drag-and-drop rearrangement state
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
  const [dragOverTileId, setDragOverTileId] = useState<string | null>(null);

  const handleDropTile = (targetTileId: string) => {
    if (!draggedTileId || draggedTileId === targetTileId) {
      setDraggedTileId(null);
      setDragOverTileId(null);
      return;
    }

    setTiles((prev) => {
      const dragIdx = prev.findIndex((t) => t.id === draggedTileId);
      const targetIdx = prev.findIndex((t) => t.id === targetTileId);
      if (dragIdx === -1 || targetIdx === -1) return prev;

      const newTiles = [...prev];
      const [draggedItem] = newTiles.splice(dragIdx, 1);

      // Adopt target group so it moves properly into that group
      const targetItem = prev[targetIdx];
      const updatedItem = {
        ...draggedItem,
        groupName: targetItem.groupName || draggedItem.groupName
      };

      newTiles.splice(targetIdx, 0, updatedItem);
      try {
        localStorage.setItem('vplay_live_tiles_items', JSON.stringify(newTiles));
      } catch {}
      return newTiles;
    });

    setDraggedTileId(null);
    setDragOverTileId(null);
  };

  const handleMoveTile = (tileId: string, direction: 'left' | 'right') => {
    setTiles((prev) => {
      const idx = prev.findIndex((t) => t.id === tileId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const newTiles = [...prev];
      const [item] = newTiles.splice(idx, 1);
      newTiles.splice(targetIdx, 0, item);
      try {
        localStorage.setItem('vplay_live_tiles_items', JSON.stringify(newTiles));
      } catch {}
      return newTiles;
    });
  };

  // Pin a channel
  const handlePinChannel = (channel: Channel) => {
    const newTile: LiveTileItem = {
      id: `tile-ch-${channel.id}-${Date.now()}`,
      title: channel.name,
      subtitle: typeof channel.currentProgram === 'string' ? channel.currentProgram : (channel.currentProgram?.title || channel.description || 'Kênh truyền hình HD'),
      category: 'channel',
      size: selectedPinSize,
      color: selectedPinColor,
      route: `/live-tv?channel=${channel.slug}`,
      groupName: 'Truyền hình & Đa phương tiện',
      isLive: true,
      data: {
        channelId: channel.id,
        channelSlug: channel.slug,
        logo: channel.logo,
        badge: channel.quality || 'HD'
      }
    };
    setTiles((prev) => [newTile, ...prev]);
    setIsPinModalOpen(false);
  };

  // Pin an app
  const handlePinApp = (appItem: { title: string; route: string; icon: string; desc: string }) => {
    const newTile: LiveTileItem = {
      id: `tile-app-${Date.now()}`,
      title: appItem.title,
      subtitle: appItem.desc,
      category: 'app',
      size: selectedPinSize,
      color: selectedPinColor,
      route: appItem.route,
      iconName: appItem.icon,
      groupName: 'Ứng dụng & Tiện ích',
      isLive: true
    };
    setTiles((prev) => [newTile, ...prev]);
    setIsPinModalOpen(false);
  };

  // Pin a file
  const handlePinFile = (fileItem: { name: string; type: 'word' | 'excel' | 'pdf' | 'note' | 'powerpoint'; size: string }) => {
    const newTile: LiveTileItem = {
      id: `tile-file-${Date.now()}`,
      title: fileItem.name,
      subtitle: `${fileItem.type.toUpperCase()} • ${fileItem.size}`,
      category: 'file',
      size: selectedPinSize,
      color: selectedPinColor,
      route: '/notes',
      groupName: 'Tài liệu & Tệp tin',
      data: {
        fileType: fileItem.type,
        fileSize: fileItem.size
      }
    };
    setTiles((prev) => [newTile, ...prev]);
    setIsPinModalOpen(false);
  };

  // Pin a photo
  const handlePinPhoto = (photoItem: { title: string; url: string }) => {
    const newTile: LiveTileItem = {
      id: `tile-photo-${Date.now()}`,
      title: photoItem.title,
      category: 'photo',
      size: selectedPinSize,
      color: selectedPinColor,
      route: '/photos',
      groupName: 'Bộ sưu tập & Ảnh',
      data: {
        imageUrl: photoItem.url
      }
    };
    setTiles((prev) => [newTile, ...prev]);
    setIsPinModalOpen(false);
  };

  // Get CSS class names for grid span based on tile size in horizontal column-flow grid
  const getTileGridClasses = (size: TileSize) => {
    switch (size) {
      case '1x1':
        return 'col-span-1 row-span-1 w-[76px] sm:w-[84px] h-[76px] sm:h-[84px]';
      case '2x1':
        return 'col-span-2 row-span-1 w-[162px] sm:w-[178px] h-[76px] sm:h-[84px]';
      case '2x2':
        return 'col-span-2 row-span-2 w-[162px] sm:w-[178px] h-[162px] sm:h-[178px]';
      case '4x4':
        return 'col-span-4 row-span-4 w-[334px] sm:w-[366px] h-[334px] sm:h-[366px]';
      case '5x5':
        return 'col-span-5 row-span-5 w-[420px] sm:w-[460px] h-[420px] sm:h-[460px]';
      default:
        return 'col-span-2 row-span-2 w-[162px] sm:w-[178px] h-[162px] sm:h-[178px]';
    }
  };

  // Render tile icon
  const renderTileIcon = (tile: LiveTileItem) => {
    const iconSize = tile.size === '1x1' ? 'w-6 h-6' : tile.size === '4x4' || tile.size === '5x5' ? 'w-16 h-16' : 'w-10 h-10';

    if (tile.data?.logo) {
      return (
        <img
          src={tile.data.logo}
          alt={tile.title}
          className={`${iconSize} object-contain filter drop-shadow-md`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    switch (tile.category) {
      case 'channel':
        return <Tv className={`${iconSize} text-white`} />;
      case 'weather':
        return <Sun className={`${iconSize} text-white`} />;
      case 'calendar':
        return <CalendarIcon className={`${iconSize} text-white`} />;
      case 'clock':
        return <Clock className={`${iconSize} text-white`} />;
      case 'news':
        return <Radio className={`${iconSize} text-white`} />;
      case 'finance':
        return <TrendingUp className={`${iconSize} text-white`} />;
      case 'photo':
        return <ImageIcon className={`${iconSize} text-white`} />;
      case 'file':
        if (tile.data?.fileType === 'excel') return <FileSpreadsheet className={`${iconSize} text-white`} />;
        if (tile.data?.fileType === 'pdf') return <FileCode className={`${iconSize} text-white`} />;
        return <FileText className={`${iconSize} text-white`} />;
      default:
        if (tile.iconName === 'store') return <ShoppingBag className={`${iconSize} text-white`} />;
        if (tile.iconName === 'edge') return <Compass className={`${iconSize} text-white`} />;
        if (tile.iconName === 'mail') return <Mail className={`${iconSize} text-white`} />;
        if (tile.iconName === 'camera') return <Camera className={`${iconSize} text-white`} />;
        if (tile.iconName === 'vlc') return <Volume2 className={`${iconSize} text-white`} />;
        if (tile.iconName === 'social') return <Users className={`${iconSize} text-white`} />;
        if (tile.iconName === 'craftmine') return <Gamepad2 className={`${iconSize} text-white`} />;
        return <Grid className={`${iconSize} text-white`} />;
    }
  };

  // Render tile live content based on size and category
  const renderTileLiveBody = (tile: LiveTileItem) => {
    // 1x1 size: Minimal icon + tiny label
    if (tile.size === '1x1') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none">
          {renderTileIcon(tile)}
          <span className="text-[10px] font-medium text-white truncate max-w-full mt-1 drop-shadow-xs">
            {tile.title}
          </span>
        </div>
      );
    }

    // Weather Live Tile
    if (tile.category === 'weather') {
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between text-white select-none">
          <div className="flex items-start justify-between">
            <Sun className="w-9 h-9 text-amber-300 drop-shadow-md animate-pulse" />
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-light">29°</span>
              <div className="text-[10px] text-white/80">Nắng đẹp • 31° / 24°</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold">{tile.subtitle || 'Hà Nội'}</div>
            <div className="text-[10px] text-white/85">Dự báo tuần mới mát mẻ</div>
          </div>
        </div>
      );
    }

    // Calendar Live Tile
    if (tile.category === 'calendar') {
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between text-white select-none">
          <div className="flex items-start justify-between">
            <div className="text-3xl sm:text-4xl font-extralight tracking-tight">
              {liveDate.dayNum < 10 ? `0${liveDate.dayNum}` : liveDate.dayNum}
            </div>
            <CalendarIcon className="w-6 h-6 text-white/80" />
          </div>
          <div>
            <div className="text-xs font-semibold">{liveDate.dayName}</div>
            <div className="text-[10px] text-white/85 truncate">19:00 Thời sự 19h VTV1 HD</div>
          </div>
        </div>
      );
    }

    // Clock Live Tile
    if (tile.category === 'clock') {
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between text-white select-none">
          <div className="flex items-center justify-between">
            <Clock className="w-6 h-6 text-white/80" />
            <span className="text-xs font-semibold px-2 py-0.5 bg-black/20 rounded-none uppercase tracking-wider">
              Báo thức: 06:30
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono tracking-wider font-semibold">
              {liveTime}
            </div>
            <div className="text-[10px] text-white/85">Việt Nam (UTC+7)</div>
          </div>
        </div>
      );
    }

    // Photos Live Tile (Cycles photos)
    if (tile.category === 'photo' && tile.isLive) {
      const currentImg = PHOTO_CAROUSEL_IMAGES[photoIndex];
      return (
        <div className="w-full h-full relative overflow-hidden select-none">
          <img
            src={currentImg}
            alt="Live Photo"
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-white drop-shadow-md truncate">
                {tile.title}
              </span>
              <span className="text-[9px] bg-black/40 px-1.5 py-0.5 text-white/90">
                {photoIndex + 1}/{PHOTO_CAROUSEL_IMAGES.length}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // News Live Tile
    if (tile.category === 'news') {
      const newsText = BREAKING_NEWS_SNIPPETS[newsIndex];
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between text-white select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-red-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
              <span>VnExpress</span>
            </div>
            <Radio className="w-4 h-4 text-white/70" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium line-clamp-2 leading-snug drop-shadow-xs transition-all duration-300">
              {newsText}
            </div>
            <div className="text-[10px] text-white/75 mt-1">Cập nhật tự động 5s</div>
          </div>
        </div>
      );
    }

    // TV Live Tile
    if (tile.category === 'channel' && tile.isLive) {
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between text-white relative select-none">
          {tile.data?.logo && (tile.size === '4x4' || tile.size === '5x5') ? (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={tile.data.logo}
                alt={tile.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </div>
          ) : null}

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-1.5 py-0.5">
                TRỰC TIẾP
              </span>
            </div>
            <Tv className="w-5 h-5 text-white/80" />
          </div>

          <div className="relative z-10">
            <div className="text-base sm:text-xl font-bold tracking-tight">
              {tile.title}
            </div>
            <div className="text-xs text-white/90 line-clamp-1 mt-0.5">
              {isTvFlipped ? 'Chương trình phát sóng HD' : (tile.subtitle || 'Thời sự 19h Toàn cảnh')}
            </div>
          </div>
        </div>
      );
    }

    // Default Tile Body
    return (
      <div className="w-full h-full p-3.5 flex flex-col justify-between text-white select-none">
        <div className="flex items-start justify-between">
          <div className="p-1">
            {renderTileIcon(tile)}
          </div>
          {tile.data?.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/25">
              {tile.data.badge}
            </span>
          )}
        </div>

        <div>
          <div className="text-xs sm:text-sm font-semibold truncate leading-tight drop-shadow-xs">
            {tile.title}
          </div>
          {tile.subtitle && (
            <div className="text-[10px] sm:text-xs text-white/80 line-clamp-1 mt-0.5">
              {tile.subtitle}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)] bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none flex flex-col font-sans transition-colors relative overflow-hidden">
      {/* Compact Top-Right Controls (Start & LIVE TILES PANORAMA header removed) */}
      <div className="absolute top-4 right-8 z-40 flex items-center gap-2">
        {/* Horizontal Pan Controls */}
        <div className="flex items-center bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/15 px-1 py-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => scrollHorizontal('left')}
            title="Cuộn sang trái"
            className="p-1 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono uppercase tracking-wider px-1 text-neutral-600 dark:text-neutral-300">
            Panorama
          </span>
          <button
            type="button"
            onClick={() => scrollHorizontal('right')}
            title="Cuộn sang phải"
            className="p-1 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsPinModalOpen(true)}
          className="px-3 py-1 text-xs font-semibold bg-[#0078d4] hover:bg-[#0067b8] text-white rounded-none flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ghim</span>
        </button>

        <button
          type="button"
          onClick={handleResetDefaults}
          title="Khôi phục Live Tiles mặc định"
          className="p-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/15 rounded-none border border-black/10 dark:border-white/15 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Live Tiles Canvas - Panoramic Horizontal Scrolling */}
      <div className="relative flex-1 min-h-0 flex flex-col group/canvas">
        {/* Floating Pan Navigation Buttons */}
        <button
          type="button"
          onClick={() => scrollHorizontal('left')}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-9 h-14 bg-black/40 hover:bg-black/75 text-white/70 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover/canvas:opacity-100 backdrop-blur-xs cursor-pointer shadow-xl border border-white/10"
          title="Cuộn sang trái"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => scrollHorizontal('right')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 w-9 h-14 bg-black/40 hover:bg-black/75 text-white/70 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover/canvas:opacity-100 backdrop-blur-xs cursor-pointer shadow-xl border border-white/10"
          title="Cuộn sang phải"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <main
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-8 sm:px-12 pt-8 pb-6 flex flex-row items-start gap-10 sm:gap-14 min-w-full select-none"
          style={{
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth'
          }}
        >
          {groups.map((groupName) => {
            const groupTiles = tiles.filter((t) => (t.groupName || 'Chung') === groupName);
            if (groupTiles.length === 0) return null;

            return (
              <section key={groupName} className="flex flex-col h-full shrink-0">
                {/* Group Title (classic Windows 8 section header) */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm sm:text-base font-normal tracking-wide text-neutral-800 dark:text-neutral-200 uppercase whitespace-nowrap">
                    {groupName}
                  </h2>
                  <div className="h-[1px] w-8 bg-black/20 dark:bg-white/20" />
                </div>

                {/* Tiles Grid for this group arranged horizontally in 5 rows */}
                <div
                  className="grid grid-rows-5 grid-flow-col auto-cols-[76px] sm:auto-cols-[84px] gap-2.5 h-[420px] sm:h-[460px]"
                  style={{ gridAutoFlow: 'column' }}
                >
                {groupTiles.map((tile) => {
                  const tileSeqIndex = tiles.findIndex((t) => t.id === tile.id);
                  const animDelay = `${Math.min(tileSeqIndex * 35, 1200)}ms`;

                  const openTileMenuAtPosition = (clientX: number, clientY: number) => {
                    const menuWidth = 224;
                    const menuHeight = 220;
                    let posX = clientX;
                    let posY = clientY;
                    if (posX + menuWidth > window.innerWidth) {
                      posX = Math.max(10, window.innerWidth - menuWidth - 10);
                    }
                    if (posY + menuHeight > window.innerHeight) {
                      posY = Math.max(10, window.innerHeight - menuHeight - 10);
                    }
                    setTileContextMenu({ tile, x: posX, y: posY });
                    setOpenTileSubmenu(null);
                  };

                  return (
                    <div
                      key={tile.id}
                      data-is-live-tile="true"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', tile.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedTileId(tile.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverTileId !== tile.id) {
                          setDragOverTileId(tile.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverTileId === tile.id) {
                          setDragOverTileId(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropTile(tile.id);
                      }}
                      onDragEnd={() => {
                        setDraggedTileId(null);
                        setDragOverTileId(null);
                      }}
                      style={{
                        animationDelay: animDelay,
                      }}
                      className={`relative group ${getTileGridClasses(tile.size)} select-none tile-slide-in-right cursor-grab active:cursor-grabbing transition-all duration-200 ${
                        draggedTileId === tile.id ? 'opacity-30 scale-95 ring-2 ring-white' : ''
                      } ${
                        dragOverTileId === tile.id ? 'ring-4 ring-white ring-offset-2 scale-[1.03] z-30' : ''
                      }`}
                    >
                      {/* The Solid Square Tile Card */}
                      <div
                        onClick={() => handleTileClick(tile)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openTileMenuAtPosition(e.clientX, e.clientY);
                        }}
                        style={{
                          backgroundColor: tile.color, // Pure solid color, NO gradient
                          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
                        }}
                        className="w-full h-full rounded-none overflow-hidden cursor-pointer relative transition-transform duration-150 active:scale-[0.98] hover:brightness-105"
                      >
                        {renderTileLiveBody(tile)}

                        {/* Top-right menu trigger on hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            openTileMenuAtPosition(rect.left, rect.bottom + 4);
                          }}
                          title="Tùy chỉnh ô Live Tile"
                          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* Pin New Item Modal (Ghim kênh, apps, files, photos) */}
      {isPinModalOpen && (
        <div
          onClick={() => setIsPinModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-[#202020] text-black dark:text-white rounded-none border border-black/20 dark:border-white/20 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Ghim nội dung vào Live Tiles Home</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Chọn kênh truyền hình, ứng dụng, tập tin hoặc ảnh để hiển thị dạng ô Live Tile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Size & Color options row */}
            <div className="px-4 py-3 bg-neutral-100 dark:bg-[#282828] border-b border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Kích cỡ:</span>
                <div className="flex items-center gap-1">
                  {TILE_SIZES.map((sz) => (
                    <button
                      key={sz.value}
                      type="button"
                      onClick={() => setSelectedPinSize(sz.value)}
                      className={`px-2 py-1 font-bold rounded-none border cursor-pointer ${
                        selectedPinSize === sz.value
                          ? 'bg-[#0078d4] text-white border-[#0078d4]'
                          : 'bg-white dark:bg-[#333] text-neutral-700 dark:text-neutral-200 border-black/10 dark:border-white/10'
                      }`}
                    >
                      {sz.value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Màu Solid:</span>
                <div className="flex items-center gap-1">
                  {SOLID_METRO_COLORS.slice(0, 8).map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedPinColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-none cursor-pointer ${
                        selectedPinColor === c.hex ? 'ring-2 ring-black dark:ring-white' : ''
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Pin Category Tabs */}
            <div className="flex border-b border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setPinTab('channels')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  pinTab === 'channels'
                    ? 'border-[#0078d4] text-[#0078d4]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Kênh truyền hình ({channels.length})
              </button>
              <button
                type="button"
                onClick={() => setPinTab('apps')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  pinTab === 'apps'
                    ? 'border-[#0078d4] text-[#0078d4]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Ứng dụng
              </button>
              <button
                type="button"
                onClick={() => setPinTab('files')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  pinTab === 'files'
                    ? 'border-[#0078d4] text-[#0078d4]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Tập tin (Files)
              </button>
              <button
                type="button"
                onClick={() => setPinTab('photos')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  pinTab === 'photos'
                    ? 'border-[#0078d4] text-[#0078d4]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Ảnh (Photos)
              </button>
            </div>

            {/* Search Input for items */}
            <div className="p-3 border-b border-black/10 dark:border-white/10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mục cần ghim..."
                  value={pinSearchQuery}
                  onChange={(e) => setPinSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-neutral-100 dark:bg-[#2b2b2b] border border-black/10 dark:border-white/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[48vh]">
              {/* Tab 1: Channels */}
              {pinTab === 'channels' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {channels
                    .filter((c) =>
                      c.name.toLowerCase().includes(pinSearchQuery.toLowerCase()) ||
                      c.category.toLowerCase().includes(pinSearchQuery.toLowerCase())
                    )
                    .map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => handlePinChannel(channel)}
                        className="p-2.5 bg-neutral-50 dark:bg-[#2a2a2a] hover:bg-[#0078d4]/10 dark:hover:bg-[#0078d4]/20 border border-black/5 dark:border-white/5 rounded-none flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {channel.logo ? (
                            <img src={channel.logo} alt={channel.name} className="w-7 h-7 object-contain" />
                          ) : (
                            <Tv className="w-5 h-5 text-[#0078d4]" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{channel.name}</div>
                            <div className="text-[10px] text-neutral-500 truncate">{channel.category}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#0078d4] shrink-0">+ Ghim</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Tab 2: Apps */}
              {pinTab === 'apps' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { title: 'Microsoft Store', route: '/store', icon: 'store', desc: 'Tải và quản lý ứng dụng' },
                    { title: 'Clock & Báo thức', route: '/clock', icon: 'clock', desc: 'Đồng hồ, báo thức và hẹn giờ' },
                    { title: 'Swift Bank', route: '/swift-bank', icon: 'bank', desc: 'Ngân hàng số Fluent' },
                    { title: 'Camera', route: '/camera', icon: 'camera', desc: 'Máy ảnh và chụp hình' },
                    { title: 'Edge Browser', route: '/edge', icon: 'edge', desc: 'Duyệt web an toàn' },
                    { title: 'VLC Media Player', route: '/vlc', icon: 'vlc', desc: 'Trình phát đa phương tiện' },
                    { title: 'Notes Office', route: '/notes', icon: 'notes', desc: 'Ghi chú và soạn thảo văn bản' },
                    { title: 'Photos Gallery', route: '/photos', icon: 'photos', desc: 'Xem ảnh và kỷ niệm' },
                    { title: 'Craftmine 3D', route: '/craftmine', icon: 'craftmine', desc: 'Khám phá khối hộp Sandbox' },
                    { title: 'Photopea Editor', route: '/photopea', icon: 'photopea', desc: 'Biên tập ảnh chuyên nghiệp' },
                    { title: 'Swift Social', route: '/swift-social', icon: 'social', desc: 'Bảng tin và câu chuyện' },
                    { title: 'Friends Community', route: '/friends', icon: 'friends', desc: '100 bạn bè trực tuyến' },
                    { title: 'Máy tính (Calculator)', route: '/calculator', icon: 'calc', desc: 'Tính toán toán học' },
                    { title: 'Task Manager', route: '/tasks', icon: 'taskmgr', desc: 'Quản lý tác vụ hệ thống' },
                    { title: 'Recall (Preview)', route: '/recall', icon: 'recall', desc: 'Lịch sử hoạt động thông minh' },
                    { title: 'Settings', route: '/settings', icon: 'settings', desc: 'Cài đặt hệ thống' },
                  ]
                    .filter((a) => a.title.toLowerCase().includes(pinSearchQuery.toLowerCase()))
                    .map((appItem) => (
                      <div
                        key={appItem.route}
                        onClick={() => handlePinApp(appItem)}
                        className="p-2.5 bg-neutral-50 dark:bg-[#2a2a2a] hover:bg-[#0078d4]/10 dark:hover:bg-[#0078d4]/20 border border-black/5 dark:border-white/5 rounded-none flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Grid className="w-5 h-5 text-[#0078d4]" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{appItem.title}</div>
                            <div className="text-[10px] text-neutral-500 truncate">{appItem.desc}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#0078d4] shrink-0">+ Ghim</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Tab 3: Files */}
              {pinTab === 'files' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'Ke_Hoach_Phat_Trien_2026.docx', type: 'word' as const, size: '2.1 MB' },
                    { name: 'Bao_Cao_Tai_Chinh_SwiftBank.xlsx', type: 'excel' as const, size: '890 KB' },
                    { name: 'Lich_Phat_Song_VTV_2026.pdf', type: 'pdf' as const, size: '3.4 MB' },
                    { name: 'Huong_Dan_Su_Dung_Fluent.pptx', type: 'powerpoint' as const, size: '5.6 MB' },
                    { name: 'Ghi_Chu_Cuoc_Hop_Tong_Hop.docx', type: 'word' as const, size: '450 KB' },
                    { name: 'Cong_Thuc_Mon_An_Cookbook.note' as any, type: 'note' as const, size: '120 KB' },
                  ]
                    .filter((f) => f.name.toLowerCase().includes(pinSearchQuery.toLowerCase()))
                    .map((fItem) => (
                      <div
                        key={fItem.name}
                        onClick={() => handlePinFile(fItem)}
                        className="p-2.5 bg-neutral-50 dark:bg-[#2a2a2a] hover:bg-[#0078d4]/10 dark:hover:bg-[#0078d4]/20 border border-black/5 dark:border-white/5 rounded-none flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {fItem.type === 'excel' ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                          ) : fItem.type === 'pdf' ? (
                            <FileCode className="w-5 h-5 text-red-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{fItem.name}</div>
                            <div className="text-[10px] text-neutral-500">{fItem.size}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#0078d4] shrink-0">+ Ghim</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Tab 4: Photos */}
              {pinTab === 'photos' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { title: 'Chào Buổi Sáng VTV1', url: '/banners/chao_buoi_sang_vtv1_2026.webp' },
                    { title: 'Thời sự 19h HD', url: '/banners/thoi_su_19h_hd.webp' },
                    { title: 'ASIAD 2026', url: '/banners/asiad_2026.jpg' },
                    { title: 'Phố Cổ Hà Nội', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80' },
                    { title: 'Cầu Rồng Đà Nẵng', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80' },
                    { title: 'Vịnh Hạ Long', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80' },
                  ]
                    .filter((p) => p.title.toLowerCase().includes(pinSearchQuery.toLowerCase()))
                    .map((photoItem) => (
                      <div
                        key={photoItem.url}
                        onClick={() => handlePinPhoto(photoItem)}
                        className="group relative h-28 border border-black/10 dark:border-white/10 rounded-none overflow-hidden cursor-pointer"
                      >
                        <img src={photoItem.url} alt={photoItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex flex-col justify-end p-2 transition-colors">
                          <span className="text-xs font-semibold text-white truncate drop-shadow-sm">{photoItem.title}</span>
                          <span className="text-[10px] text-amber-300 font-bold">+ Nhấn để ghim</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-neutral-50 dark:bg-[#252525] border-t border-black/10 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-neutral-300 dark:bg-[#383838] hover:bg-neutral-400 text-black dark:text-white rounded-none cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tile Right-Click Context Menu (Layout & Design styled exactly like Global Windows Context Menu) */}
      {tileContextMenu && (
        <div
          id="tile-custom-context-menu"
          className="fixed z-[99999] w-[224px] select-none rounded-none py-2 text-[#e5e5e5] bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] font-sans text-[13.5px] context-menu-slide-down"
          style={{
            top: tileContextMenu.y,
            left: tileContextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Open */}
          <button
            type="button"
            onClick={() => {
              handleTileClick(tileContextMenu.tile);
              setTileContextMenu(null);
              setOpenTileSubmenu(null);
            }}
            className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
          >
            <span>Open</span>
          </button>

          {/* 2. Unpin */}
          <button
            type="button"
            onClick={() => {
              handleUnpinTile(tileContextMenu.tile.id);
            }}
            className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
          >
            <span>Unpin</span>
          </button>

          {/* Separator */}
          <div className="border-t border-[#444444] my-2 mx-2.5" />

          {/* 3. Resize tile */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (tileSubmenuTimerRef.current) clearTimeout(tileSubmenuTimerRef.current);
              setOpenTileSubmenu('resize');
            }}
            onMouseLeave={() => {
              tileSubmenuTimerRef.current = setTimeout(() => {
                setOpenTileSubmenu(null);
              }, 200);
            }}
          >
            <button
              type="button"
              className={`metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 flex items-center justify-between rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 ${
                openTileSubmenu === 'resize'
                  ? 'bg-[#5d4b75] text-white'
                  : 'hover:bg-[#3d3d3d] hover:text-white'
              }`}
            >
              <span>Resize tile</span>
              <ChevronRight className="w-4 h-4 opacity-75" />
            </button>

            {openTileSubmenu === 'resize' && (
              <div
                onMouseEnter={() => {
                  if (tileSubmenuTimerRef.current) clearTimeout(tileSubmenuTimerRef.current);
                  setOpenTileSubmenu('resize');
                }}
                onMouseLeave={() => {
                  tileSubmenuTimerRef.current = setTimeout(() => {
                    setOpenTileSubmenu(null);
                  }, 200);
                }}
                className={`absolute top-0 z-[100000] w-[204px] rounded-none py-2 bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] context-menu-slide-down ${
                  tileContextMenu.x + 224 + 204 > window.innerWidth ? 'right-full -mr-[1px]' : 'left-full -ml-[1px]'
                }`}
              >
                {TILE_SIZES.map((sz) => {
                  const isSelected = tileContextMenu.tile.size === sz.value;
                  return (
                    <button
                      key={sz.value}
                      type="button"
                      onClick={() => {
                        handleResizeTile(tileContextMenu.tile.id, sz.value);
                      }}
                      className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between"
                    >
                      <span>{sz.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#a78bfa]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Customize color */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (tileSubmenuTimerRef.current) clearTimeout(tileSubmenuTimerRef.current);
              setOpenTileSubmenu('color');
            }}
            onMouseLeave={() => {
              tileSubmenuTimerRef.current = setTimeout(() => {
                setOpenTileSubmenu(null);
              }, 200);
            }}
          >
            <button
              type="button"
              className={`metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2.5 flex items-center justify-between rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 ${
                openTileSubmenu === 'color'
                  ? 'bg-[#5d4b75] text-white'
                  : 'hover:bg-[#3d3d3d] hover:text-white'
              }`}
            >
              <span>Customize color</span>
              <ChevronRight className="w-4 h-4 opacity-75" />
            </button>

            {openTileSubmenu === 'color' && (
              <div
                onMouseEnter={() => {
                  if (tileSubmenuTimerRef.current) clearTimeout(tileSubmenuTimerRef.current);
                  setOpenTileSubmenu('color');
                }}
                onMouseLeave={() => {
                  tileSubmenuTimerRef.current = setTimeout(() => {
                    setOpenTileSubmenu(null);
                  }, 200);
                }}
                className={`absolute top-0 z-[100000] w-[214px] rounded-none py-1.5 bg-[#2b2b2b] border border-[#4c4c4c] shadow-[0_12px_32px_rgba(0,0,0,0.7)] context-menu-slide-down max-h-[380px] overflow-y-auto ${
                  tileContextMenu.x + 224 + 214 > window.innerWidth ? 'right-full -mr-[1px]' : 'left-full -ml-[1px]'
                }`}
              >
                {SOLID_METRO_COLORS.map((c) => {
                  const isSelected = tileContextMenu.tile.color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        handleChangeColor(tileContextMenu.tile.id, c.hex);
                      }}
                      className="metro-context-menu-item w-full text-left pl-3.5 pr-3.5 py-2 hover:bg-[#3d3d3d] hover:text-white text-[#e5e5e5] rounded-none cursor-pointer transition-colors transform-none hover:scale-100 active:scale-100 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-none shrink-0 border border-white/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs truncate">{c.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
