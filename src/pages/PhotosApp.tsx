import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Heart, 
  Search, 
  Upload, 
  Trash2, 
  Download, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Info, 
  Calendar, 
  Check, 
  CheckSquare,
  Square,
  Sparkles,
  Rows,
  Maximize2
} from 'lucide-react';
import { FluentPhotosIcon, FluentPhotosColorIcon, FluentSearchIcon } from '../components/FluentIcons';

export interface MediaItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  duration?: string; // e.g. "03:45" for videos
  size: string; // e.g. "2.4 MB"
  resolution: string; // e.g. "3840 × 2160"
  aspectRatio: number; // width / height, e.g. 1.78 for 16:9, 1.33 for 4:3, 0.75 for portrait
  date: string; // e.g. "12/10/2026"
  section: string; // e.g. "Hôm nay • 12 tháng 10, 2026"
  album?: string;
  isFavorite?: boolean;
  tags?: string[];
}

const DEFAULT_MEDIA: MediaItem[] = [
  // Today's Media
  {
    id: 'm-1',
    title: 'Bản tin Thời sự 19h VTV1 HD Trực tiếp',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/banners/thoi_su_19h_hd.webp',
    duration: '03:45',
    size: '86.4 MB',
    resolution: '1920 × 1080 (Full HD)',
    aspectRatio: 1.78,
    date: '12/10/2026',
    section: 'Hôm nay • 12 tháng 10, 2026',
    album: 'Thời sự & Tin tức',
    isFavorite: true,
    tags: ['VTV1', 'Thời sự', 'Trực tiếp', '19h']
  },
  {
    id: 'm-2',
    title: 'Chào Buổi Sáng VTV1 - Phim trường 2026',
    type: 'photo',
    url: '/banners/chao_buoi_sang_vtv1_2026.webp',
    thumbnailUrl: '/banners/chao_buoi_sang_vtv1_2026.webp',
    size: '3.8 MB',
    resolution: '2560 × 1440 (2K)',
    aspectRatio: 1.5,
    date: '12/10/2026',
    section: 'Hôm nay • 12 tháng 10, 2026',
    album: 'Studio Sparkle (Dev)',
    isFavorite: true,
    tags: ['VTV1', 'Studio', 'Chào buổi sáng']
  },
  {
    id: 'm-3',
    title: 'Chân dung Phố Cổ Hà Nội Mùa Thu',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    size: '4.6 MB',
    resolution: '3000 × 4000 (Portrait)',
    aspectRatio: 0.75,
    date: '12/10/2026',
    section: 'Hôm nay • 12 tháng 10, 2026',
    album: 'Cảnh sắc Việt Nam',
    isFavorite: false,
    tags: ['Hà Nội', 'Chân dung', 'Mùa thu']
  },
  {
    id: 'm-4',
    title: 'Sparkle (Dev) Nebula Fluent Material Stage',
    type: 'photo',
    url: '/banners/vplay_background.webp',
    thumbnailUrl: '/banners/vplay_background.webp',
    size: '4.2 MB',
    resolution: '3840 × 2160 (4K)',
    aspectRatio: 1.85,
    date: '12/10/2026',
    section: 'Hôm nay • 12 tháng 10, 2026',
    album: 'Hình nền Fluent',
    isFavorite: false,
    tags: ['Fluent', 'Mica', 'Nebula', 'Wallpaper']
  },

  // This Week's Media
  {
    id: 'm-5',
    title: 'Đại hội Thể thao Châu Á ASIAD 2026',
    type: 'photo',
    url: '/banners/asiad_2026.jpg',
    thumbnailUrl: '/banners/asiad_2026.jpg',
    size: '5.1 MB',
    resolution: '3840 × 2160 (4K UHD)',
    aspectRatio: 1.78,
    date: '10/10/2026',
    section: 'Tuần này • Tháng 10, 2026',
    album: 'Thể thao đỉnh cao',
    isFavorite: true,
    tags: ['Thể thao', 'ASIAD 2026', 'Olympic']
  },
  {
    id: 'm-6',
    title: 'Highlight Khoảnh khắc Thể thao Sparkle (Dev)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    duration: '02:18',
    size: '54.2 MB',
    resolution: '1920 × 1080',
    aspectRatio: 1.6,
    date: '08/10/2026',
    section: 'Tuần này • Tháng 10, 2026',
    album: 'Thể thao đỉnh cao',
    isFavorite: false,
    tags: ['Thể thao', 'Highlight', 'Bóng đá']
  },
  {
    id: 'm-7',
    title: 'Kiến trúc Cột cờ Hà Nội Nắng sớm',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
    size: '3.9 MB',
    resolution: '3024 × 4032',
    aspectRatio: 0.75,
    date: '07/10/2026',
    section: 'Tuần này • Tháng 10, 2026',
    album: 'Cảnh sắc Việt Nam',
    isFavorite: true,
    tags: ['Hà Nội', 'Kiến trúc', 'Lịch sử']
  },
  {
    id: 'm-8',
    title: 'Điểm tin Vietnam Today Toàn cảnh',
    type: 'photo',
    url: '/banners/vietnam_today.jpg',
    thumbnailUrl: '/banners/vietnam_today.jpg',
    size: '2.9 MB',
    resolution: '1920 × 1080',
    aspectRatio: 1.78,
    date: '06/10/2026',
    section: 'Tuần này • Tháng 10, 2026',
    album: 'Thời sự & Tin tức',
    isFavorite: false,
    tags: ['Vietnam Today', 'VTV4', 'Đối ngoại']
  },

  // Landscapes & Sceneries
  {
    id: 'm-9',
    title: 'Cầu Rồng Đà Nẵng lung linh ánh sáng',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    size: '4.7 MB',
    resolution: '3840 × 2160',
    aspectRatio: 1.78,
    date: '03/10/2026',
    section: 'Tháng 10, 2026 • Cảnh sắc Việt Nam',
    album: 'Cảnh sắc Việt Nam',
    isFavorite: false,
    tags: ['Đà Nẵng', 'Cầu Rồng', 'Đêm']
  },
  {
    id: 'm-10',
    title: 'Cảnh sắc Vịnh Hạ Long Di sản 4K Clip',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    duration: '05:32',
    size: '142.0 MB',
    resolution: '3840 × 2160 (4K)',
    aspectRatio: 1.65,
    date: '01/10/2026',
    section: 'Tháng 10, 2026 • Cảnh sắc Việt Nam',
    album: 'Cảnh sắc Việt Nam',
    isFavorite: true,
    tags: ['Hạ Long', 'Di sản', '4K Clip']
  },
  {
    id: 'm-11',
    title: 'Ruộng bậc thang Mù Cang Chải Mùa lúa chín',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    size: '5.2 MB',
    resolution: '3840 × 2160',
    aspectRatio: 2.1,
    date: '30/09/2026',
    section: 'Tháng 10, 2026 • Cảnh sắc Việt Nam',
    album: 'Cảnh sắc Việt Nam',
    isFavorite: true,
    tags: ['Mù Cang Chải', 'Tây Bắc', 'Lúa chín']
  },

  // Wallpapers & Fluent Arts
  {
    id: 'm-12',
    title: 'Microsoft Fluent 3D Abstract Glass Shapes',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    size: '5.8 MB',
    resolution: '3840 × 2160',
    aspectRatio: 1.0,
    date: '28/09/2026',
    section: 'Tháng 9, 2026 • Kho ảnh lưu trữ',
    album: 'Hình nền Fluent',
    isFavorite: true,
    tags: ['Fluent', 'Glass', '3D', 'Abstract']
  },
  {
    id: 'm-13',
    title: 'Windows Mica Dark Texture Minimalist',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    size: '3.2 MB',
    resolution: '2560 × 1440',
    aspectRatio: 1.78,
    date: '25/09/2026',
    section: 'Tháng 9, 2026 • Kho ảnh lưu trữ',
    album: 'Hình nền Fluent',
    isFavorite: false,
    tags: ['Mica', 'Minimalist', 'Dark']
  },
  {
    id: 'm-14',
    title: 'Tia sáng Bình minh trên Đỉnh Fansipan',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    size: '6.1 MB',
    resolution: '3000 × 4000',
    aspectRatio: 0.75,
    date: '20/09/2026',
    section: 'Tháng 9, 2026 • Kho ảnh lưu trữ',
    album: 'Cảnh sắc Việt Nam',
    isFavorite: true,
    tags: ['Fansipan', 'Sapa', 'Bình minh']
  }
];

interface PhotosAppProps {
  navigate?: (route: string) => void;
}

export const PhotosApp: React.FC<PhotosAppProps> = ({ navigate }) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('vone_photos_media');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure every item has an aspectRatio
        return parsed.map((m: MediaItem) => ({
          ...m,
          aspectRatio: m.aspectRatio || (m.resolution?.includes('3000 × 4000') || m.resolution?.includes('3024 × 4032') ? 0.75 : 1.78)
        }));
      }
    } catch {}
    return DEFAULT_MEDIA;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vone_photos_media', JSON.stringify(mediaList));
    } catch {}
  }, [mediaList]);

  // Tab navigation: 'all' | 'memories' | 'albums' | 'favorites' | 'videos'
  const [currentTab, setCurrentTab] = useState<'all' | 'memories' | 'albums' | 'favorites' | 'videos'>('all');
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Row Height / Density for the Justified Gallery: compact (160px), medium (215px), large (280px)
  const [galleryDensity, setGalleryDensity] = useState<'compact' | 'medium' | 'large'>('medium');

  // Multi-select mode
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Fullscreen Viewer State
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showInfoSidebar, setShowInfoSidebar] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Row height in pixels for justified layout
  const rowHeight = useMemo(() => {
    switch (galleryDensity) {
      case 'compact': return 160;
      case 'large': return 280;
      case 'medium':
      default:
        return 215;
    }
  }, [galleryDensity]);

  // Unique Albums List
  const albums = useMemo(() => {
    const set = new Set<string>();
    mediaList.forEach(m => {
      if (m.album) set.add(m.album);
    });
    return Array.from(set);
  }, [mediaList]);

  // Filtered Media List
  const filteredMedia = useMemo(() => {
    return mediaList.filter(item => {
      // Tab filter
      if (currentTab === 'favorites' && !item.isFavorite) return false;
      if (currentTab === 'videos' && item.type !== 'video') return false;
      if (currentTab === 'albums' && selectedAlbum && item.album !== selectedAlbum) return false;
      if (currentTab === 'memories' && !item.isFavorite && item.type !== 'video') return false;

      // Type filter
      if (filterType !== 'all' && item.type !== filterType) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(q));
        const matchesAlbum = item.album?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTags && !matchesAlbum) return false;
      }

      return true;
    });
  }, [mediaList, currentTab, filterType, selectedAlbum, searchQuery]);

  // Group by timeline section
  const groupedSections = useMemo(() => {
    const groups: Record<string, MediaItem[]> = {};
    filteredMedia.forEach(item => {
      const sec = item.section || 'Khác';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(item);
    });
    return groups;
  }, [filteredMedia]);

  // Upload handler for photos & videos
  const handleUploadMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isVideo && !isImage) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

        // Detect or approximate aspect ratio
        let detectedRatio = 1.6;
        if (isImage) {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            if (img.width && img.height) {
              detectedRatio = Math.round((img.width / img.height) * 100) / 100;
            }
          };
        }

        const newItem: MediaItem = {
          id: `media-${Date.now()}-${Math.random()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: isVideo ? 'video' : 'photo',
          url,
          thumbnailUrl: isVideo ? undefined : url,
          duration: isVideo ? '01:30' : undefined,
          size: sizeMb,
          resolution: isVideo ? '1920 × 1080 (HD)' : '3000 × 2000',
          aspectRatio: detectedRatio,
          date: new Date().toLocaleDateString('vi-VN'),
          section: 'Hôm nay • 12 tháng 10, 2026',
          album: 'Tệp tải lên',
          isFavorite: false,
          tags: ['Tải lên', isVideo ? 'Video' : 'Ảnh']
        };

        setMediaList(prev => [newItem, ...prev]);
        showToast(`Đã thêm ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMediaList(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.isFavorite;
        showToast(next ? 'Đã thêm vào mục Yêu thích' : 'Đã bỏ yêu thích');
        return { ...m, isFavorite: next };
      }
      return m;
    }));
  };

  // Toggle select item
  const handleToggleSelectItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all in a section
  const handleToggleSelectSection = (items: MediaItem[]) => {
    const allSelected = items.every(it => selectedItemIds.has(it.id));
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      items.forEach(it => {
        if (allSelected) {
          next.delete(it.id);
        } else {
          next.add(it.id);
        }
      });
      return next;
    });
    if (!isSelectMode) setIsSelectMode(true);
  };

  // Batch actions
  const handleBatchDelete = () => {
    if (selectedItemIds.size === 0) return;
    if (confirm(`Bạn có chắc muốn xoá ${selectedItemIds.size} mục đã chọn?`)) {
      setMediaList(prev => prev.filter(m => !selectedItemIds.has(m.id)));
      showToast(`Đã xoá ${selectedItemIds.size} mục`);
      setSelectedItemIds(new Set());
      setIsSelectMode(false);
    }
  };

  const handleBatchFavorite = () => {
    if (selectedItemIds.size === 0) return;
    setMediaList(prev => prev.map(m => selectedItemIds.has(m.id) ? { ...m, isFavorite: true } : m));
    showToast(`Đã yêu thích ${selectedItemIds.size} mục`);
  };

  // Delete single media
  const handleDeleteMedia = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xoá phương tiện này?')) {
      setMediaList(prev => prev.filter(m => m.id !== id));
      if (viewingMedia?.id === id) {
        setViewingMedia(null);
      }
      showToast('Đã xoá phương tiện');
    }
  };

  // Listen for Control Bar events (Gallery + to import, delete, etc.)
  useEffect(() => {
    const handleControlBar = (e: CustomEvent) => {
      const action = e.detail?.action;
      if (action === 'gallery-import') {
        fileInputRef.current?.click();
      } else if (action === 'gallery-delete') {
        if (viewingMedia) {
          handleDeleteMedia(viewingMedia.id);
        } else if (selectedItemIds.size > 0) {
          handleBatchDelete();
        } else {
          setIsSelectMode(prev => {
            const next = !prev;
            showToast(next ? 'Chế độ chọn ảnh để xoá/quản lý' : 'Đã thoát chế độ chọn');
            return next;
          });
        }
      } else if (action === 'gallery-favorites') {
        setCurrentTab(prev => prev === 'favorites' ? 'all' : 'favorites');
        showToast(currentTab === 'favorites' ? 'Tất cả ảnh & video' : 'Mục yêu thích');
      } else if (action === 'gallery-density') {
        setGalleryDensity(prev => {
          const next = prev === 'compact' ? 'medium' : prev === 'medium' ? 'large' : 'compact';
          showToast(`Chế độ hiển thị: ${next === 'compact' ? 'Nhỏ gọn' : next === 'large' ? 'Kích thước lớn' : 'Tiêu chuẩn'}`);
          return next;
        });
      } else if (action === 'gallery-search') {
        const searchInput = document.querySelector('input[placeholder*="Tìm"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          showToast('Tìm kiếm ảnh & album');
        }
      }
    };

    window.addEventListener('vone:controlbar-action', handleControlBar as EventListener);
    return () => window.removeEventListener('vone:controlbar-action', handleControlBar as EventListener);
  }, [viewingMedia, selectedItemIds, currentTab, galleryDensity]);

  // Download media
  const handleDownload = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `${item.title}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Đang tải xuống "${item.title}"`);
  };

  // Lightbox Navigation
  const currentIndex = viewingMedia ? filteredMedia.findIndex(m => m.id === viewingMedia.id) : -1;
  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredMedia.length - 1) {
      setViewingMedia(filteredMedia[currentIndex + 1]);
      setRotationAngle(0);
      setZoomScale(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setViewingMedia(filteredMedia[currentIndex - 1]);
      setRotationAngle(0);
      setZoomScale(1);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!viewingMedia) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'Escape') setViewingMedia(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingMedia, currentIndex, filteredMedia]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-[#14171c] text-[#f3f4f6] select-none font-sans relative">
      {/* 1. Sleek Photos Command Header */}
      <header className="h-14 px-3 sm:px-6 border-b border-white/10 bg-[#1a1e24]/90 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
        {/* Left: App Title & Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2.5 pr-3 border-r border-white/10 shrink-0">
            <FluentPhotosColorIcon className="w-6 h-6 shadow-sm shrink-0" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white hidden md:inline">
              Gallery
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { setCurrentTab('all'); setSelectedAlbum(null); }}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'all'
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Tất cả ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => { setCurrentTab('memories'); setSelectedAlbum(null); }}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'memories'
                  ? 'bg-white/15 text-[#4cc2ff] font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#4cc2ff]" />
              <span>Kỷ niệm</span>
            </button>
            <button
              type="button"
              onClick={() => { setCurrentTab('videos'); setSelectedAlbum(null); }}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'videos'
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('albums')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'albums'
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Album ({albums.length})
            </button>
            <button
              type="button"
              onClick={() => { setCurrentTab('favorites'); setSelectedAlbum(null); }}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'favorites'
                  ? 'bg-white/15 text-rose-400 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Yêu thích</span>
            </button>
          </div>
        </div>

        {/* Right: Search, Select Mode, Grid Density & Upload */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search */}
          <div className="w-32 sm:w-52 h-8 px-2.5 rounded-[8px] bg-white/5 border border-white/10 flex items-center gap-2 focus-within:border-[#4cc2ff]/50 focus-within:bg-white/10 transition-colors">
            <FluentSearchIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Ảnh, Video..."
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Select Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsSelectMode(prev => !prev);
              if (isSelectMode) setSelectedItemIds(new Set());
            }}
            className={`h-8 px-2.5 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isSelectMode
                ? 'bg-[#0078d4] text-white border-[#0078d4]'
                : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Chế độ chọn nhiều tệp"
          >
            {isSelectMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Chọn</span>
          </button>

          {/* Density Controls (Compact, Medium, Large row heights) */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-[6px] p-0.5">
            <button
              type="button"
              onClick={() => setGalleryDensity('compact')}
              className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                galleryDensity === 'compact' ? 'bg-white/20 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Mật độ dày (Chiều cao hàng 160px)"
            >
              Nhỏ
            </button>
            <button
              type="button"
              onClick={() => setGalleryDensity('medium')}
              className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                galleryDensity === 'medium' ? 'bg-white/20 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Mật độ tiêu chuẩn (Chiều cao hàng 215px)"
            >
              Vừa
            </button>
            <button
              type="button"
              onClick={() => setGalleryDensity('large')}
              className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                galleryDensity === 'large' ? 'bg-white/20 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Mật độ lớn (Chiều cao hàng 280px)"
            >
              Lớn
            </button>
          </div>

          {/* Upload Button */}
          <label className="h-8 px-3 rounded-[6px] bg-[#0078d4] hover:bg-[#006cc0] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải lên</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleUploadMedia}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* 2. Floating Batch Action Bar (When in Select Mode & Items Selected) */}
      {isSelectMode && selectedItemIds.size > 0 && (
        <div className="sticky top-14 z-30 px-4 py-2.5 bg-[#0078d4]/90 backdrop-blur-xl text-white flex items-center justify-between shadow-lg border-b border-white/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">Đã chọn {selectedItemIds.size} mục</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchFavorite}
              className="px-2.5 py-1 rounded-[5px] bg-white/20 hover:bg-white/30 text-white text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Yêu thích</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-2.5 py-1 rounded-[5px] bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xoá</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedItemIds(new Set())}
              className="px-2.5 py-1 rounded-[5px] bg-black/20 hover:bg-black/30 text-white text-xs font-medium cursor-pointer transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Media Gallery Content - Justified Layout */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-7">
        {/* Album Selector Chips when in Albums view */}
        {currentTab === 'albums' && (
          <div className="space-y-2.5 pb-2 border-b border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Chọn Album để lọc:
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedAlbum === null ? 'bg-[#0078d4] text-white shadow-xs' : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
              >
                Tất cả Albums ({albums.length})
              </button>
              {albums.map((albumName) => (
                <button
                  key={albumName}
                  type="button"
                  onClick={() => setSelectedAlbum(albumName)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedAlbum === albumName ? 'bg-[#0078d4] text-white shadow-xs' : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  📁 {albumName}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredMedia.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400 gap-2">
            <FluentPhotosIcon className="w-12 h-12 text-neutral-600 stroke-[1]" />
            <p className="text-xs text-neutral-400">Không tìm thấy ảnh hoặc video nào</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 px-3 py-1.5 rounded-[6px] bg-[#0078d4] text-white text-xs font-medium cursor-pointer"
            >
              Tải lên phương tiện mới
            </button>
          </div>
        ) : (
          (Object.entries(groupedSections) as [string, MediaItem[]][]).map(([sectionTitle, items]) => (
            <section key={sectionTitle} className="space-y-2.5">
              {/* Timeline Section Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4cc2ff]" />
                    <span>{sectionTitle}</span>
                  </h2>
                  <span className="text-xs text-neutral-400 font-medium">({items.length} mục)</span>
                </div>

                {/* Section Quick Select button */}
                <button
                  type="button"
                  onClick={() => handleToggleSelectSection(items)}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-white/5"
                >
                  {items.every(it => selectedItemIds.has(it.id)) ? 'Bỏ chọn phần này' : 'Chọn phần này'}
                </button>
              </div>

              {/* Justified Media Gallery Container */}
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  const ratio = item.aspectRatio || 1.6;
                  const flexBasisPx = Math.round(ratio * rowHeight);

                  return (
                    <div
                      key={item.id}
                      style={{
                        flexGrow: ratio,
                        flexBasis: `${flexBasisPx}px`,
                        height: `${rowHeight}px`,
                        maxHeight: `${Math.round(rowHeight * 1.25)}px`
                      }}
                      onClick={() => {
                        if (isSelectMode) {
                          handleToggleSelectItem(item.id);
                        } else {
                          setViewingMedia(item);
                          setRotationAngle(0);
                          setZoomScale(1);
                        }
                      }}
                      className={`group relative rounded-[8px] overflow-hidden bg-[#1e232a] border transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? 'border-[#0078d4] ring-2 ring-[#0078d4]'
                          : 'border-white/10 hover:border-white/30 hover:shadow-lg'
                      }`}
                    >
                      {/* Media Image / Video Preview */}
                      {item.type === 'photo' ? (
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full relative">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          ) : (
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                          )}
                          {/* Video Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 ml-0.5 fill-white text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 1. Top-Left: Authentic Colorful Photos App Icon Badge */}
                      <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-[5px] bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md pointer-events-none">
                        <FluentPhotosColorIcon className="w-4 h-4" />
                      </div>

                      {/* 2. Video Camera Badge overlay for Video Items */}
                      {item.type === 'video' && (
                        <div className="absolute top-2 left-9 z-10 px-2 py-0.5 rounded-[5px] bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white text-[10px] font-semibold tracking-tight shadow-md">
                          <VideoIcon className="w-3 h-3 text-rose-400" />
                          {item.duration && <span>{item.duration}</span>}
                        </div>
                      )}

                      {/* 3. Top-Right: Selection Checkmark Circle & Favorite Heart */}
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                        {/* Favorite button (visible on hover or when already favorited) */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          className={`w-6 h-6 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                            item.isFavorite
                              ? 'bg-rose-500 text-white shadow-sm opacity-100'
                              : 'bg-black/45 text-white/80 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100'
                          }`}
                          title={item.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        {/* Multi-select checkmark circle */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectItem(item.id, e)}
                          className={`w-6 h-6 rounded-full border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0078d4] border-[#0078d4] text-white shadow-sm opacity-100'
                              : isSelectMode
                              ? 'bg-black/50 border-white/40 text-transparent opacity-100 hover:border-white'
                              : 'bg-black/45 border-white/30 text-transparent opacity-0 group-hover:opacity-100 hover:border-white'
                          }`}
                          title="Chọn mục này"
                        >
                          <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[2.5]' : ''}`} />
                        </button>
                      </div>

                      {/* 4. Bottom-Right: Date Tag */}
                      <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-[5px] bg-black/65 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] text-white/95 font-medium shadow-sm tracking-tight pointer-events-none">
                        {item.date}
                      </div>

                      {/* 5. Hover Gradient Bottom Info (Title & resolution) */}
                      <div className="absolute inset-x-0 bottom-0 pt-6 pb-2 px-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="text-xs font-semibold text-white truncate drop-shadow-sm pr-16" title={item.title}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-white/70">
                          <span>{item.resolution}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Justified Flexbox Filler to prevent the last row from unnaturally stretching across screen */}
                <div className="flex-grow-[1000] h-0 min-w-0 pointer-events-none" />
              </div>
            </section>
          ))
        )}
      </main>

      {/* 4. Sleek Fullscreen Lightbox / Media Viewer Modal */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col select-none">
          {/* Top Viewer Control Bar */}
          <div className="h-14 px-4 sm:px-6 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <FluentPhotosColorIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-mono font-semibold uppercase">
                  {viewingMedia.type === 'video' ? 'Video' : 'Photo'}
                </span>
              </div>
              <h3 className="text-sm font-bold truncate text-white/90" title={viewingMedia.title}>
                {viewingMedia.title}
              </h3>
            </div>

            {/* Viewer Controls: Rotate, Zoom, Favorite, Download, Info, Close */}
            <div className="flex items-center gap-1.5">
              {viewingMedia.type === 'photo' && (
                <>
                  <button
                    type="button"
                    onClick={() => setRotationAngle(r => (r + 90) % 360)}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title="Xoay 90 độ"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(z => Math.max(z - 0.25, 0.5))}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(z => Math.min(z + 0.25, 3))}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleToggleFavorite(viewingMedia.id)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
                  viewingMedia.isFavorite ? 'text-rose-500' : 'text-white'
                }`}
                title="Yêu thích"
              >
                <Heart className={`w-4 h-4 ${viewingMedia.isFavorite ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => handleDownload(viewingMedia)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                title="Tải xuống phương tiện"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowInfoSidebar(prev => !prev)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  showInfoSidebar ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70'
                }`}
                title="Thông tin chi tiết (Info)"
              >
                <Info className="w-4 h-4" />
              </button>

              <div className="h-5 w-[1px] bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setViewingMedia(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage + Info Sidebar */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Nav Button */}
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xl"
                title="Ảnh trước (Arrow Left)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Media Presentation Display */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {viewingMedia.type === 'photo' ? (
                <div
                  className="transition-transform duration-200 flex items-center justify-center"
                  style={{
                    transform: `rotate(${rotationAngle}deg) scale(${zoomScale})`
                  }}
                >
                  <img
                    src={viewingMedia.url}
                    alt={viewingMedia.title}
                    className="max-h-[75vh] max-w-[85vw] object-contain rounded-[8px] shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-full max-w-4xl max-h-[75vh] flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    src={viewingMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full max-h-[70vh] rounded-[10px] shadow-2xl bg-black"
                  />
                </div>
              )}
            </div>

            {/* Right Nav Button */}
            {currentIndex < filteredMedia.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xl"
                title="Ảnh tiếp theo (Arrow Right)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Toggleable Right Info Sidebar */}
            {showInfoSidebar && (
              <aside className="w-72 sm:w-80 border-l border-white/10 bg-black/80 backdrop-blur-2xl p-4 text-white text-xs space-y-4 overflow-y-auto shrink-0">
                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#4cc2ff]" />
                  <span>Chi tiết tệp phương tiện</span>
                </h4>

                <div className="space-y-3 text-neutral-300">
                  <div>
                    <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Tên tệp</span>
                    <span className="font-medium text-white break-all">{viewingMedia.title}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Loại tệp</span>
                    <span className="font-medium text-white capitalize">{viewingMedia.type === 'video' ? 'Video kỹ thuật số' : 'Hình ảnh'}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Độ phân giải</span>
                    <span className="font-mono text-white">{viewingMedia.resolution}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Kích thước tệp</span>
                    <span className="font-mono text-white">{viewingMedia.size}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Ngày ghi nhận</span>
                    <span className="font-medium text-white">{viewingMedia.date}</span>
                  </div>

                  {viewingMedia.album && (
                    <div>
                      <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Album</span>
                      <span className="font-medium text-[#4cc2ff]">{viewingMedia.album}</span>
                    </div>
                  )}

                  {viewingMedia.tags && viewingMedia.tags.length > 0 && (
                    <div>
                      <span className="text-[11px] text-neutral-500 block uppercase font-semibold mb-1">Thẻ tag</span>
                      <div className="flex flex-wrap gap-1">
                        {viewingMedia.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-neutral-200">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(viewingMedia)}
                    className="w-full py-2 rounded-[6px] bg-[#0078d4] hover:bg-[#006cc0] text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về máy tính</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(viewingMedia.id)}
                    className="w-full py-1.5 rounded-[6px] border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xoá phương tiện này</span>
                  </button>
                </div>
              </aside>
            )}
          </div>

          {/* Bottom Filmstrip Thumbnail Carousel */}
          <div className="h-16 px-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {filteredMedia.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setViewingMedia(m);
                  setRotationAngle(0);
                  setZoomScale(1);
                }}
                className={`h-11 rounded-[5px] overflow-hidden border transition-all shrink-0 cursor-pointer ${
                  m.id === viewingMedia.id
                    ? 'border-[#0078d4] ring-2 ring-[#0078d4] opacity-100 scale-105'
                    : 'border-white/20 opacity-60 hover:opacity-90'
                }`}
                style={{
                  width: `${Math.round(44 * (m.aspectRatio || 1.5))}px`
                }}
              >
                <img
                  src={m.thumbnailUrl || m.url}
                  alt={m.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 px-3.5 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-bounce border border-white/10">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
