import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  BookMarked,
  BookOpen,
  CalendarDays,
  Camera,
  Calculator,
  Clock3,
  DownloadCloud,
  FileText,
  Film,
  FlaskConical,
  Folder,
  FolderOpen,
  Gamepad2,
  Globe,
  History,
  Home,
  Images,
  Info,
  Landmark,
  Layers,
  LayoutGrid,
  Mail,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  Monitor,
  Newspaper,
  Paintbrush,
  PanelsTopLeft,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  Sliders,
  Sparkles,
  Store,
  Tv,
  UploadCloud,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { CHANNELS_DATA } from '../data/channels';
import { Channel, NewsArticle } from '../types';
import { DiscordWelcomeModal } from './DiscordWelcomeModal';
import { UnderConstructionModal } from './UnderConstructionModal';
import { parseM3UPlaylist, downloadPlaylistFile } from '../utils/m3uParser';
import { getStoreAppForRoute } from '../data/storeApps';

const SIDEBAR_APP_ICONS = {
  home: Home,
  articles: Newspaper,
  widgets: LayoutGrid,
  notes: FileText,
  fileExplorer: FolderOpen,
  paint: Paintbrush,
  bank: Landmark,
  social: MessageSquare,
  people: Users,
  edge: Globe,
  camera: Camera,
  gallery: Images,
  watch: Tv,
  inkCanvas: Pencil,
  calculator: Calculator,
  taskManager: Activity,
  feedback: MessageSquarePlus,
  settings: Settings,
};

type SidebarAppIconName = keyof typeof SIDEBAR_APP_ICONS;

function SidebarAppIcon({ name, className }: { name: SidebarAppIconName; className?: string }) {
  const Icon = SIDEBAR_APP_ICONS[name];
  console.log('[v0] Sidebar app icon render', name, typeof Icon);
  return (
    <Icon
      aria-hidden="true"
      className={className}
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  );
}

const LOGO_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7bX9C6ZMjpXAbn0eXLI2Wk6ZhwUwk0.png';


interface MorphingIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentRoute: string;
  dependencyKey?: string;
  isWebViewSdk?: boolean;
}

const MorphingVerticalIndicator: React.FC<MorphingIndicatorProps> = ({
  containerRef,
  currentRoute,
  dependencyKey,
  isWebViewSdk,
}) => {
  const [bounds, setBounds] = useState<{
    top: number;
    left: number;
    height: number;
    visible: boolean;
  }>({ top: 0, left: 10, height: 38, visible: false });

  useEffect(() => {
    let isCancelled = false;
    let observer: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let rafId: number | null = null;
    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;
    let timer3: NodeJS.Timeout | null = null;

    const measure = () => {
      if (isCancelled) return;
      const container = containerRef.current;
      if (!container) return;

      const activeEl = container.querySelector('[data-nav-active="true"]') as HTMLElement | null;
      if (!activeEl) {
        setBounds((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const top = Math.round(activeRect.top - containerRect.top + container.scrollTop);
      const left = Math.round(activeRect.left - containerRect.left);
      const height = Math.round(activeRect.height);

      if (height > 0) {
        setBounds({ top, left, height, visible: true });
      }
    };

    measure();
    rafId = requestAnimationFrame(measure);
    timer1 = setTimeout(measure, 40);
    timer2 = setTimeout(measure, 120);
    timer3 = setTimeout(measure, 300);

    const container = containerRef.current;
    if (container) {
      observer = new ResizeObserver(() => measure());
      observer.observe(container);

      mutationObserver = new MutationObserver(() => measure());
      mutationObserver.observe(container, {
        attributes: true,
        attributeFilter: ['data-nav-active'],
        subtree: true,
      });

      container.addEventListener('scroll', measure, { passive: true });
    }

    return () => {
      isCancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (container) container.removeEventListener('scroll', measure);
    };
  }, [currentRoute, dependencyKey, containerRef]);

  if (!bounds.visible) return null;

  const INDICATOR_HEIGHT = 24;
  const centeredTop = bounds.top + Math.round((bounds.height - INDICATOR_HEIGHT) / 2);

  // WebView SDK: Selected sidebar tab retains the vertical blue pill, but with NO motion animation across tabs
  if (isWebViewSdk) {
    return (
      <div
        className="sidebar-static-indicator absolute w-[2px] h-[24px] bg-[#005fb8] dark:bg-[#0078d4] z-30 pointer-events-none rounded-none shadow-none"
        style={{
          top: centeredTop,
          left: bounds.left,
          opacity: bounds.visible ? 1 : 0,
          transition: 'none',
          animation: 'none',
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute w-[2px] h-[24px] bg-[#005fb8] dark:bg-[#0078d4] z-30 pointer-events-none rounded-none shadow-none"
      initial={false}
      animate={{
        top: centeredTop,
        left: bounds.left,
        opacity: bounds.visible ? 1 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 35,
        mass: 0.5,
      }}
    />
  );
};

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string, state?: any) => void;
  installedApps: string[];
  onOpenSearch: () => void;
  selectedChannel?: Channel | null;
  onSelectChannel?: (channel: Channel) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  mobileDragOffset?: number | null;
  channels?: Channel[];
  currentChannel?: Channel;
  onOpenHelp?: () => void;
  onOpenDiscord?: () => void;
  onOpenSummarize?: (article: NewsArticle) => void;
  onOpenTextToSpeech?: (article: NewsArticle) => void;
  onOpenFindWords?: () => void;
  onOpenAddStream?: () => void;
  onImportChannels?: (channels: Channel[]) => void;
  onOpenNotifications?: () => void;
  fontSize?: number;
  onChangeFontSize?: (size: number) => void;
  onOpenUpdate?: () => void;
  onOpenOfficeTool?: (tool: string) => void;
  isSplashFinished?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  installedApps,
  onOpenSearch,
  onSelectChannel,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  mobileDragOffset = null,
  channels = [],
  currentChannel,
  onOpenHelp = () => {},
  onOpenDiscord = () => {},
  onOpenSummarize = (_article: NewsArticle) => {},
  onOpenTextToSpeech = (_article: NewsArticle) => {},
  onOpenFindWords = () => {},
  onOpenAddStream = () => {},
  onImportChannels = (_channels: Channel[]) => {},
  onOpenNotifications = () => {},
  fontSize = 16,
  onChangeFontSize = (_size: number) => {},
  onOpenUpdate = () => {},
  onOpenOfficeTool = (_tool: string) => {},
  isSplashFinished = false
}) => {
  const { settings } = useSettings();
  const { favoriteChannelIds } = useFavorites();
  console.log('[v0] Sidebar render start', currentRoute, settings.sidebarSmartLayout);

  const getDownloadIndicator = (route: string, collapsed = isCollapsed) => {
    const app = getStoreAppForRoute(route);
    if (!app || installedApps.includes(app.id)) return null;
    return (
      <DownloadCloud
        className={`pointer-events-none absolute ${collapsed ? 'bottom-1 right-1 size-3' : 'right-2 top-1/2 size-3.5 -translate-y-1/2'} rounded-full bg-white p-[1px] text-[#0078d4] dark:bg-[#242424] dark:text-[#4cc2ff]`}
        aria-hidden="true"
      />
    );
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  const handleSidebarPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const item = (e.target as HTMLElement).closest('.sidebar-nav-item') as HTMLElement | null;
    if (item) {
      const rect = item.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      item.style.setProperty('--sidebar-reveal-x', `${x}px`);
      item.style.setProperty('--sidebar-reveal-y', `${y}px`);
      item.style.setProperty('--sidebar-reveal-surface-opacity', '1');
      item.style.setProperty('--reveal-opacity', '1');
    }
  };

  const handleSidebarPointerLeave = () => {
    const activeItems = document.querySelectorAll<HTMLElement>('.sidebar-nav-item[style*="--sidebar-reveal"]');
    activeItems.forEach((el) => {
      el.style.setProperty('--sidebar-reveal-surface-opacity', '0');
      el.style.setProperty('--reveal-opacity', '0');
    });
  };

  // Real-time Fluent Reveal Effect cursor coordinate tracking (pure surface glow, no borders)
  useEffect(() => {
    let currentItem: HTMLElement | null = null;
    let rafId: number | null = null;
    let lastEvent: PointerEvent | null = null;

    const updateReveal = () => {
      rafId = null;
      if (!lastEvent) return;
      const e = lastEvent;

      const item = (e.target as HTMLElement)?.closest('.sidebar-nav-item') as HTMLElement | null;
      if (item) {
        if (currentItem && currentItem !== item) {
          currentItem.style.setProperty('--sidebar-reveal-surface-opacity', '0');
          currentItem.style.setProperty('--reveal-opacity', '0');
        }
        currentItem = item;
        const rect = item.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        item.style.setProperty('--sidebar-reveal-x', `${x}px`);
        item.style.setProperty('--sidebar-reveal-y', `${y}px`);
        item.style.setProperty('--sidebar-reveal-surface-opacity', '1');
        item.style.setProperty('--reveal-opacity', '1');
      } else if (currentItem) {
        currentItem.style.setProperty('--sidebar-reveal-surface-opacity', '0');
        currentItem.style.setProperty('--reveal-opacity', '0');
        currentItem = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      lastEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(updateReveal);
      }
    };

    const onPointerLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      if (currentItem) {
        currentItem.style.setProperty('--sidebar-reveal-surface-opacity', '0');
        currentItem.style.setProperty('--reveal-opacity', '0');
        currentItem = null;
      }
      const activeItems = document.querySelectorAll<HTMLElement>('.sidebar-nav-item[style*="--sidebar-reveal"]');
      activeItems.forEach((el) => {
        el.style.setProperty('--sidebar-reveal-surface-opacity', '0');
        el.style.setProperty('--reveal-opacity', '0');
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const collapsedNavRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLiveTvExpanded, setIsLiveTvExpanded] = useState(false);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isToolsFlyoutOpen, setIsToolsFlyoutOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const toggleToolsFlyout = () => {
    setIsToolsFlyoutOpen((prev) => !prev);
  };

  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isSidebarSearchFlyoutOpen, setIsSidebarSearchFlyoutOpen] = useState(false);
  const sidebarSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSidebarSearchFlyoutOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (sidebarSearchRef.current && !sidebarSearchRef.current.contains(target as Node)) {
        setIsSidebarSearchFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarSearchFlyoutOpen]);

  const handleSidebarSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = sidebarSearchQuery.trim();
    if (trimmed) {
      setIsSidebarSearchFlyoutOpen(false);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      onOpenSearch();
    }
  };

  const sidebarQuickApps = useMemo(() => {
    return [
      { label: 'Watch (Live TV)', route: '/live-tv', desc: 'Xem truyền hình trực tiếp' },
      { label: 'Articles', route: '/news', desc: 'Bản tin & bài viết mới nhất' },
      { label: 'Widgets', route: '/widgets', desc: 'Bảng tiện ích thời tiết & tin tức' },
      { label: 'Tiles', route: '/tiles', desc: 'Màn hình Live Tiles start' },
      { label: 'Copilot', route: '/copilot', desc: 'Trợ lý AI Copilot tìm kiếm' },
      { label: 'Notes', route: '/notes', desc: 'Soạn thảo ghi chú văn phòng' },
      { label: 'Store', route: '/store', desc: 'Kho ứng dụng Microsoft Store' },
      { label: 'Clock', route: '/clock', desc: 'Đồng hồ, hẹn giờ, báo thức' },
      { label: 'Lịch phát sóng', route: '/schedule', desc: 'Lịch phát sóng EPG truyền hình' },
      { label: 'Settings', route: '/settings', desc: 'Cài đặt hệ thống & giao diện' },
    ];
  }, []);

  const filteredSidebarQuickApps = useMemo(() => {
    const q = sidebarSearchQuery.trim().toLowerCase();
    if (!q) return sidebarQuickApps.slice(0, 5);
    return sidebarQuickApps.filter(
      (a) => a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
    );
  }, [sidebarQuickApps, sidebarSearchQuery]);

  // Close flyouts when clicking outside
  useEffect(() => {
    if (!isToolsFlyoutOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (isToolsFlyoutOpen && target && !target.closest('.tools-flyout-container')) {
        setIsToolsFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToolsFlyoutOpen]);

  // Touch swipe to close mobile drawer with real-time finger-following
  const drawerTouchStartX = useRef<number | null>(null);
  const drawerTouchStartY = useRef<number | null>(null);
  const [drawerCloseOffset, setDrawerCloseOffset] = useState<number | null>(null);

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      drawerTouchStartX.current = e.touches[0].clientX;
      drawerTouchStartY.current = e.touches[0].clientY;
      setDrawerCloseOffset(null);
    }
  };

  const handleDrawerTouchMove = (e: React.TouchEvent) => {
    if (drawerTouchStartX.current === null) return;
    const deltaX = e.touches[0].clientX - drawerTouchStartX.current;
    if (deltaX < 0) {
      // Swiping left to close
      setDrawerCloseOffset(deltaX);
    }
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (drawerTouchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - drawerTouchStartX.current;
    const drawerWidth = Math.min(285, typeof window !== 'undefined' ? window.innerWidth * 0.85 : 285);

    if (deltaX < -drawerWidth * 0.3 || deltaX < -60) {
      onCloseMobile?.();
    }
    drawerTouchStartX.current = null;
    drawerTouchStartY.current = null;
    setDrawerCloseOffset(null);
  };

  const favoriteChannels = useMemo(() => {
    return CHANNELS_DATA.filter((ch) => favoriteChannelIds.includes(ch.id));
  }, [favoriteChannelIds]);

  const shouldAnimateSidebar = !settings.reduceAllMotion && settings.animateSidebar;
  const effectiveCollapsed = settings.autoHideSidebar ? !isHovered : isCollapsed;

  const [activeTooltip, setActiveTooltip] = useState<{ label: string; y: number; x: number } | null>(null);

  const handleTooltipEnter = (e: React.MouseEvent<HTMLElement>, label: string, force = false) => {
    if (!effectiveCollapsed && !force) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.round(rect.top + rect.height / 2);
    const isRight = settings.sidebarPosition === 'right';
    const x = Math.round(isRight ? rect.left - 8 : rect.right + 8);
    setActiveTooltip({ label, y, x });
  };

  const handleTooltipLeave = () => {
    setActiveTooltip(null);
  };

  useEffect(() => {
    setActiveTooltip(null);
  }, [effectiveCollapsed]);

  const handleNavClick = (route: string, state?: any) => {
    navigate(route, state);
    if (onCloseMobile) onCloseMobile();
  };

  // Handler for Export M3U8
  const handleExportM3U8 = () => {
    try {
      downloadPlaylistFile(channels.length > 0 ? channels : CHANNELS_DATA, 'vplay_playlist.m3u8');
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for Import M3U File
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      try {
        const parsed = parseM3UPlaylist(content);
        if (parsed.length === 0) return;
        const fullChannels: Channel[] = parsed.map((p, idx) => ({
          id: p.id || `m3u-file-${Date.now()}-${idx}`,
          name: p.name || `Channel ${idx + 1}`,
          shortName: p.name || `Channel ${idx + 1}`,
          slug: p.slug || `m3u-file-ch-${idx + 1}`,
          logo: p.logo || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
          category: p.category || 'Special',
          quality: p.quality || 'HD',
          streamUrl: p.streamUrl || '',
          isLive: true,
          description: p.description || 'Channel loaded from M3U file.',
          currentProgram: p.currentProgram || {
            title: p.name || 'Live Broadcast',
            startTime: '00:00',
            endTime: '24:00',
            progress: 50,
            description: 'Live broadcast.'
          }
        }));
        onImportChannels(fullChannels);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Navigation Items matching the Windows 10 Settings Style (Settings moved to bottom footer)
  const navItems = useMemo(() => {
    const list = [
      {
        id: 'live-tv',
        label: 'Watch',
        secondary: 'Watch',
        route: '/live-tv',
        icon: Tv,
        hasSubmenu: true,
      },
      {
        id: 'news',
        label: 'Articles',
        secondary: 'Articles',
        route: '/news',
        icon: Newspaper,
      },
      {
        id: 'widgets',
        label: 'Widgets',
        secondary: 'Widgets',
        route: '/widgets',
        icon: LayoutGrid,
      },
      {
        id: 'tiles',
        label: 'Tiles',
        secondary: 'Live Tiles',
        route: '/tiles',
        icon: PanelsTopLeft,
      },
      {
        id: 'mail',
        label: 'Mail',
        secondary: 'Outlook Mail',
        route: '/mail',
        icon: Mail,
      },
      {
        id: 'calendar',
        label: 'Calendar',
        secondary: 'Lịch & sự kiện',
        route: '/calendar',
        icon: CalendarDays,
      },
      {
        id: 'edge',
        label: 'Microsoft Edge',
        secondary: 'Edge',
        route: '/edge',
        icon: Globe,
      },
      {
        id: 'file-explorer',
        label: 'File Explorer',
        secondary: 'Files',
        route: '/file-explorer',
        icon: FolderOpen,
      },
      {
        id: 'photos',
        label: 'Gallery',
        secondary: 'Gallery',
        route: '/photos',
        icon: Images,
      },
      {
        id: 'camera',
        label: 'Camera',
        secondary: 'Camera',
        route: '/camera',
        icon: Camera,
      },
  {
  id: 'ms-paint',
  label: 'Paint',
  secondary: 'Paint',
  route: '/ms-paint',
  icon: Paintbrush,
  },
  {
    id: 'ink-canvas',
    label: 'Ink Canvas',
    secondary: 'Infinite canvas',
    route: '/ink-space',
    icon: Pencil,
  },
      {
        id: 'swift-bank',
        label: 'Swift Bank',
        secondary: 'Ngân hàng số',
        route: '/swift-bank',
        icon: Landmark,
      },
      {
        id: 'clock',
        label: 'Clock',
        secondary: 'Đồng hồ & Báo thức',
        route: '/clock',
        icon: Clock3,
      },
      {
        id: 'vlc',
        label: 'VLC Media Player',
        secondary: 'Trình phát đa phương tiện',
        route: '/vlc',
        icon: Film,
      },
      {
        id: 'schedule',
        label: 'Lịch phát sóng',
        secondary: 'Lịch phát sóng TV EPG',
        route: '/schedule',
        icon: CalendarDays,
      },
      {
        id: 'cookbook',
        label: 'Cookbook',
        secondary: 'Ẩm thực & Món ngon',
        route: '/cookbook',
        icon: BookOpen,
      },
      {
        id: 'swift',
        label: 'Swift',
        secondary: 'Mạng x�� hội đa năng',
        route: '/swift',
        icon: MessageSquare,
      },
      {
        id: 'friends',
        label: 'People',
        secondary: '100 Bạn bè Sparkle (Dev)',
        route: '/friends',
        icon: Users,
      },
      {
        id: 'logos-fandom',
        label: 'Logos Fandom',
        secondary: 'Bách khoa toàn thư thương hiệu & logo',
        route: '/logos-fandom',
        icon: BookMarked,
      },

    ];

    if (settings.developerMode) {
      list.push({
        id: 'test',
        label: 'Insider Flags (Lab)',
        secondary: 'Developer Mode',
        route: '/test',
        icon: FlaskConical,
      });
    }

    return list;
  }, [settings.developerMode]);

  const isCurrentActive = (route: string) => {
    if ((route === '/' || route === '/xaml-home') && (currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home')) return true;
    if (route === '/copilot' && (currentRoute === '/copilot' || currentRoute.startsWith('/copilot'))) return true;
    if (route === '/news' && (currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/'))) return true;
    if (route === '/updates' && (currentRoute === '/updates' || currentRoute.startsWith('/updates'))) return true;
    if (route === '/live-tv' && (currentRoute === '/live-tv' || currentRoute.startsWith('/live-tv'))) return true;
    if (route === '/notes' && (currentRoute === '/notes' || currentRoute === '/write' || currentRoute === '/present' || currentRoute === '/table')) return true;
    if (route === '/task-manager' && (currentRoute === '/task-manager' || currentRoute.startsWith('/task-manager'))) return true;
    if (route === '/widgets' && (currentRoute === '/widgets' || currentRoute.startsWith('/widgets'))) return true;
    if ((route === '/tiles' || route === '/live-tiles' || route === '/livetiles') && (currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles')) return true;
    if ((route === '/file-explorer' || route === '/files') && (currentRoute === '/files' || currentRoute === '/file-explorer' || currentRoute.startsWith('/file-explorer'))) return true;
    if ((route === '/ms-paint' || route === '/paint') && (currentRoute === '/paint' || currentRoute === '/ms-paint' || currentRoute.startsWith('/ms-paint'))) return true;
    if (route === '/photos' && (currentRoute === '/photos' || currentRoute.startsWith('/photos'))) return true;
    if (route === '/craftmine' && currentRoute === '/craftmine') return true;
    if ((route === '/photopea' || route === '/photoshop') && (currentRoute === '/photopea' || currentRoute.startsWith('/photopea') || currentRoute === '/photoshop')) return true;
    if ((route === '/vlc' || route === '/media-player') && (currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player')) return true;
    if ((route === '/schedule' || route === '/epg') && (currentRoute === '/schedule' || currentRoute.startsWith('/schedule') || currentRoute === '/epg' || currentRoute === '/lich-phat-song')) return true;
    if ((route === '/cookbook' || route === '/recipes') && (currentRoute === '/cookbook' || currentRoute.startsWith('/cookbook') || currentRoute === '/recipes')) return true;
    if ((route === '/swift' || route === '/swift-social') && (currentRoute === '/swift' || currentRoute.startsWith('/swift') || currentRoute === '/swift-social')) return true;
    if ((route === '/friends' || route === '/ban-be') && (currentRoute === '/friends' || currentRoute.startsWith('/friends') || currentRoute === '/ban-be')) return true;
    if ((route === '/logos-fandom' || route === '/logos-wiki' || route === '/fandom') && (currentRoute === '/logos-fandom' || currentRoute.startsWith('/logos-fandom') || currentRoute === '/logos-wiki' || currentRoute === '/fandom')) return true;
    if ((route === '/minecraft-wiki' || route === '/mc-wiki' || route === '/wiki') && (currentRoute === '/minecraft-wiki' || currentRoute.startsWith('/minecraft-wiki') || currentRoute === '/mc-wiki' || currentRoute === '/wiki')) return true;
    if ((route === '/feedback' || route === '/feedback-hub') && (currentRoute === '/feedback' || currentRoute === '/feedback-hub' || currentRoute.startsWith('/feedback'))) return true;
    if (route === '/settings' && (currentRoute === '/settings' || currentRoute.startsWith('/settings'))) return true;
    if (route === '/about' && (currentRoute === '/about' || currentRoute.startsWith('/about'))) return true;
    if (route !== '/' && currentRoute.startsWith(route)) return true;
    return false;
  };

  const smartFolders = useMemo(() => {
    return [
      {
        id: 'productivity',
        name: 'Productivity',
        items: [
          {
            id: 'edge',
            label: 'Edge',
            route: '/edge',
            renderIcon: () => <SidebarAppIcon name="edge" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/edge' || r === '/browser' || r.startsWith('/edge'),
            hasDownloadIndicator: true,
          },
          {
            id: 'mail',
            label: 'Mail',
            route: '/mail',
            renderIcon: () => <Mail className="size-5 shrink-0" aria-hidden="true" />,
            isActive: (r: string) => r === '/mail',
            hasDownloadIndicator: true,
          },
          {
            id: 'calendar',
            label: 'Calendar',
            route: '/calendar',
            renderIcon: () => <CalendarDays className="size-5 shrink-0" aria-hidden="true" />,
            isActive: (r: string) => r === '/calendar',
            hasDownloadIndicator: true,
          },
          {
            id: 'file-explorer',
            label: 'File Explorer',
            route: '/file-explorer',
            renderIcon: () => <SidebarAppIcon name="fileExplorer" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/file-explorer' || r === '/files' || r.startsWith('/file-explorer'),
          },
          {
            id: 'notes',
            label: 'Notes',
            route: '/notes',
            renderIcon: () => <SidebarAppIcon name="notes" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/notes' || r === '/write' || r === '/present' || r === '/table',
            hasDownloadIndicator: true,
          },
          {
            id: 'calculator',
            label: 'Calculator',
            route: '/calculator',
            renderIcon: () => <SidebarAppIcon name="calculator" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/calculator' || r === '/calc',
            hasDownloadIndicator: true,
          },
          {
            id: 'clock',
            label: 'Clock',
            route: '/clock',
            renderIcon: () => <Clock3 className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/clock' || r.startsWith('/clock') || r === '/alarm' || r === '/timer' || r === '/stopwatch',
            hasDownloadIndicator: true,
          },
        ],
      },
      {
        id: 'entertainment',
        name: 'Entertainment',
        items: [
          {
            id: 'store',
            label: 'Store',
            route: '/store',
            renderIcon: () => <Store className="size-5 shrink-0" aria-hidden="true" />,
            isActive: (r: string) => r === '/store',
          },
          {
            id: 'watch',
            label: 'Watch',
            route: '/live-tv',
            renderIcon: () => <SidebarAppIcon name="watch" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/live-tv' || r.startsWith('/live-tv'),
            hasDownloadIndicator: true,
          },
          {
            id: 'photos',
            label: 'Gallery',
            route: '/photos',
            renderIcon: () => <SidebarAppIcon name="gallery" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/photos' || r === '/gallery' || r.startsWith('/photos') || r.startsWith('/gallery'),
            hasDownloadIndicator: true,
          },
          {
            id: 'camera',
            label: 'Camera',
            route: '/camera',
            renderIcon: () => <SidebarAppIcon name="camera" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/camera' || r.startsWith('/camera'),
            hasDownloadIndicator: true,
          },
          {
            id: 'ms-paint',
            label: 'Paint',
            route: '/ms-paint',
            renderIcon: () => <SidebarAppIcon name="paint" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/ms-paint' || r === '/paint' || r.startsWith('/ms-paint'),
            hasDownloadIndicator: true,
          },
          {
            id: 'ink-canvas',
            label: 'Ink Canvas',
            route: '/ink-space',
            renderIcon: () => <SidebarAppIcon name="inkCanvas" className="w-5 h-5 shrink-0" />,
            isActive: (r: string) => r === '/ink-space' || r === '/inkspace' || r === '/ink-canvas' || r === '/inkcanvas',
            hasDownloadIndicator: true,
          },
          {
            id: 'vlc',
            label: 'VLC',
            route: '/vlc',
            renderIcon: () => <Film className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/vlc' || r.startsWith('/vlc') || r === '/media-player',
            hasDownloadIndicator: true,
          },
          {
            id: 'cookbook',
            label: 'Cookbook',
            route: '/cookbook',
            renderIcon: () => <BookOpen className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/cookbook' || r.startsWith('/cookbook') || r === '/recipes',
            hasDownloadIndicator: true,
          },
        ],
      },
      {
        id: 'social',
        name: 'Social',
        items: [
          {
            id: 'swift-social',
            label: 'Spark Social',
            route: '/swift',
            renderIcon: () => <SidebarAppIcon name="social" className="w-5 h-5 shrink-0" />,
            isActive: (r: string) => r === '/swift' || r.startsWith('/swift') || r === '/swift-social',
            hasDownloadIndicator: true,
          },
          {
            id: 'swift-bank',
            label: 'Spark Bank',
            route: '/swift-bank',
            renderIcon: () => <SidebarAppIcon name="bank" className="w-5 h-5 shrink-0" />,
            isActive: (r: string) => r === '/swift-bank' || r.startsWith('/swift-bank') || r === '/bank',
            hasDownloadIndicator: true,
          },
          {
            id: 'logos-fandom',
            label: 'Fandom',
            route: '/logos-fandom',
            renderIcon: () => <BookMarked className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/logos-fandom' || r === '/logos-wiki' || r === '/fandom',
            hasDownloadIndicator: true,
          },
          {
            id: 'friends',
            label: 'People',
            route: '/friends',
            renderIcon: () => <SidebarAppIcon name="people" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/friends' || r.startsWith('/friends'),
            hasDownloadIndicator: true,
          },
        ],
      },
      {
        id: 'system',
        name: 'System',
        items: [
          {
            id: 'task-manager',
            label: 'Task Manager',
            route: '/task-manager',
            renderIcon: () => <SidebarAppIcon name="taskManager" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/task-manager' || r.startsWith('/task-manager'),
          },
          {
            id: 'feedback-hub',
            label: 'Feedback Hub',
            route: '/feedback-hub',
            renderIcon: () => <SidebarAppIcon name="feedback" className="w-5 h-5 shrink-0 text-black dark:text-white" />,
            isActive: (r: string) => r === '/feedback-hub' || r === '/feedback',
          },
          {
            id: 'xaml-controls',
            label: 'XAML Controls',
            route: '/xaml-controls',
            renderIcon: () => <PanelsTopLeft className="size-5 shrink-0" aria-hidden="true" />,
            isActive: (r: string) => r === '/xaml-controls' || r.startsWith('/xaml-controls'),
          },
          ...(settings.developerMode
            ? [
                {
                  id: 'test',
                  label: 'Insider Flags',
                  route: '/test',
                  renderIcon: () => <FlaskConical className="w-5 h-5 shrink-0 text-black dark:text-white" />,
                  isActive: (r: string) => r === '/test',
                },
              ]
            : []),
        ],
      },
    ];
  }, [settings.developerMode]);

  // Render Flyout Menu matching user screenshot
  const renderToolsFlyout = (isCollapsedMode = false) => {
    return (
      <motion.div
        initial={settings.windowsAppSdkPreview ? false : { opacity: 0, scale: 0.96, y: isCollapsedMode ? 0 : 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={settings.windowsAppSdkPreview ? undefined : { opacity: 0, scale: 0.96, y: isCollapsedMode ? 0 : 4 }}
        transition={settings.windowsAppSdkPreview ? { duration: 0 } : { duration: 0.14, ease: 'easeOut' }}
        className={`context-menu tools-flyout-container absolute z-50 w-[230px] ${
          settings.windowsAppSdkPreview
            ? '!bg-[#2b2b2b] text-[#f3f3f3] !border-0 !border-none !backdrop-blur-none shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
            : 'bg-white dark:bg-[#1b1f24] border border-black/10 dark:border-[#3e3e3e] shadow-2xl'
        } rounded-[6px] p-1.5 space-y-0.5 text-[#111827] dark:text-white select-none ${
          isCollapsedMode ? 'left-[52px] bottom-14' : 'left-3 right-3 sm:left-[265px] sm:right-auto bottom-12'
        }`}
        style={settings.windowsAppSdkPreview ? {
          backgroundColor: '#2b2b2b',
          border: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        } : {
          boxShadow: '0 16px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. About with chevron right > */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenHelp();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#111827] dark:text-white stroke-[1.75]" />
            <span>About</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
        </button>

        {/* 2. Send feedback */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenDiscord();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquarePlus className="w-4 h-4 text-[#111827] dark:text-white stroke-[1.75]" />
            <span>Send feedback</span>
          </div>
        </button>

        {/* 3. Notification settings */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenNotifications();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-[#111827] dark:text-white stroke-[1.75]" />
            <span>Notification settings</span>
          </div>
        </button>

        <div className="my-1 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />

        {/* 4. Add stream */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenAddStream();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-4 h-4 text-black dark:text-white stroke-[1.75]" />
            <span>Add stream</span>
          </div>
        </button>

        {/* 5. Import playlist */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            fileInputRef.current?.click();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-4 h-4 text-neutral-500 dark:text-neutral-300 stroke-[1.75]" />
            <span>Import playlist</span>
          </div>
        </button>

        {/* 6. Export playlist */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            handleExportM3U8();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <DownloadCloud className="w-4 h-4 text-neutral-500 dark:text-neutral-300 stroke-[1.75]" />
            <span>Export playlist</span>
          </div>
        </button>

        {/* Notes Tool Section */}
        <div className="my-1 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />
        <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
          Ứng dụng
        </div>

        {/* Notes */}
        <button
          type="button"
          id="tool-notes"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            handleNavClick('/notes');
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <SidebarAppIcon name="notes" className="w-4 h-4 text-[#111827] dark:text-white shrink-0" />
            <span>Notes</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium">Ghi chú</span>
        </button>

        {/* File Explorer */}
        <button
          type="button"
          id="tool-file-explorer"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            handleNavClick('/file-explorer');
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <SidebarAppIcon name="fileExplorer" className="w-4 h-4 text-[#111827] dark:text-white shrink-0" />
            <span>File Explorer</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium">Tệp tin</span>
        </button>

        {/* MS Paint */}
        <button
          type="button"
          id="tool-ms-paint"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            handleNavClick('/ms-paint');
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
        >
          <div className="flex items-center gap-2.5">
            <SidebarAppIcon name="paint" className="w-4 h-4 text-[#111827] dark:text-white shrink-0" />
            <span>MS Paint</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium">Vẽ tranh</span>
        </button>

        {/* Article contextual tools */}
        {(currentRoute === '/news' || currentRoute.startsWith('/article')) && (
          <>
            <div className="my-1 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />
            <button
              type="button"
              onClick={() => {
                setIsToolsFlyoutOpen(false);
                onOpenFindWords();
              }}
              className="w-full h-[36px] px-3 rounded-[4px] flex items-center gap-2.5 text-[13px] text-[#111827] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-default text-left"
            >
              <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-300 shrink-0" />
              <span>Find words</span>
            </button>
          </>
        )}
      </motion.div>
    );
  };

  // Smart Sidebar Navigation (Expanded & Mobile Drawer)
  const renderSmartSidebarNav = (isMobile: boolean) => {
    console.log('[v0] Sidebar smart nav render', isMobile);
    return (
      <>
  {/* 1. Home */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-xaml-home' : 'sidebar-nav-xaml-home'}
            data-nav-active={(currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home') ? 'true' : undefined}
            onClick={() => handleNavClick('/')}
            title="Home"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              (currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home')
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <SidebarAppIcon name="home" className="w-5 h-5 shrink-0 text-black dark:text-white" />
            <span className="truncate text-[13.5px]">Home</span>
          </button>
        </div>

        {/* 2. Explore */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-explore' : 'sidebar-nav-explore'}
            data-nav-active={currentRoute === '/search' ? 'true' : undefined}
            onClick={() => handleNavClick('/search')}
            title="Explore"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              currentRoute === '/search'
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <Search aria-hidden="true" className="w-5 h-5 shrink-0" />
            <span className="truncate text-[13.5px]">Explore</span>
          </button>
        </div>

        {/* 3. Articles */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-articles' : 'sidebar-nav-articles'}
            data-nav-active={(currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/')) ? 'true' : undefined}
            onClick={() => handleNavClick('/news')}
            title="Articles"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              (currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/'))
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <SidebarAppIcon name="articles" className="w-5 h-5 shrink-0" />
            <span className="truncate text-[13.5px]">Articles</span>
          </button>
        </div>

        {/* 3. Widgets */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-widgets' : 'sidebar-nav-widgets'}
            data-nav-active={(currentRoute === '/widgets' || currentRoute.startsWith('/widgets')) ? 'true' : undefined}
            onClick={() => handleNavClick('/widgets')}
            title="Widgets"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              (currentRoute === '/widgets' || currentRoute.startsWith('/widgets'))
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <SidebarAppIcon name="widgets" className="w-5 h-5 shrink-0 text-black dark:text-white" />
            <span className="truncate text-[13.5px]">Widgets</span>
          </button>
        </div>

        {/* 3b. Tiles */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-tiles' : 'sidebar-nav-tiles'}
            data-nav-active={(currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles') ? 'true' : undefined}
            onClick={() => handleNavClick('/tiles')}
            title="Tiles"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              (currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles')
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <PanelsTopLeft className="w-5 h-5 shrink-0 text-black dark:text-white" />
            <span className="truncate text-[13.5px]">Tiles</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-1.5 mx-1 h-[1px] bg-black/10 dark:bg-white/10 shrink-0" />

        {/* 4. Copilot */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-copilot' : 'sidebar-nav-copilot'}
            data-nav-active={(currentRoute === '/copilot' || currentRoute.startsWith('/copilot')) ? 'true' : undefined}
            onClick={() => handleNavClick('/copilot')}
            title="Copilot"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              (currentRoute === '/copilot' || currentRoute.startsWith('/copilot'))
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles aria-hidden="true" className="w-5 h-5 shrink-0" />
            <span className="truncate text-[13.5px]">Copilot</span>
          </button>
        </div>

        {/* 5. Recall */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-recall' : 'sidebar-nav-recall'}
            data-nav-active={(currentRoute === '/recall' || currentRoute.startsWith('/recall')) ? 'true' : undefined}
            onClick={() => handleNavClick('/recall')}
            title="Recall"
            aria-label="Recall"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              (currentRoute === '/recall' || currentRoute.startsWith('/recall'))
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <History className="w-5 h-5 shrink-0" />
            <span className="truncate text-[13.5px]">Recall</span>
          </button>
        </div>

        {/* 6. SparkOS */}
        <div className="shrink-0">
          <button
            type="button"
            id={isMobile ? 'mobile-nav-sparkos' : 'sidebar-nav-sparkos'}
            data-nav-active={currentRoute === '/sparkos' ? 'true' : undefined}
            onClick={() => handleNavClick('/sparkos')}
            title="SparkOS"
            aria-label="SparkOS"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              currentRoute === '/sparkos'
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <Monitor aria-hidden="true" className="size-5 shrink-0 text-black dark:text-white" />
            <span className="truncate text-[13.5px]">SparkOS</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-1.5 mx-1 h-[1px] bg-black/10 dark:bg-white/10 shrink-0" />

        {/* Folders (collapsed by default) */}
        {smartFolders.map((folder) => {
          const isOpen = !!openFolders[folder.id];
          const hasActiveChild = folder.items.some((it) => it.isActive(currentRoute));

          return (
            <div key={folder.id} className="w-full shrink-0 flex flex-col">
              <button
                type="button"
                id={isMobile ? `mobile-nav-folder-${folder.id}` : `sidebar-nav-folder-${folder.id}`}
                onClick={() => toggleFolder(folder.id)}
                title={folder.name}
                className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                  isOpen || hasActiveChild
                    ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                    : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <Folder aria-hidden="true" className="w-5 h-5 shrink-0" />
                  <span className="truncate text-[13.5px]">{folder.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-neutral-500 dark:text-neutral-400">
                  {!isOpen && hasActiveChild && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff]" />
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="pl-3.5 flex flex-col gap-0.5 py-0.5 border-l border-black/10 dark:border-white/10 ml-5 my-0.5">
                  {folder.items.map((item) => {
                    const active = item.isActive(currentRoute);
                    return (
                      <button
                        key={item.route}
                        type="button"
                        id={isMobile ? `mobile-nav-${item.id}` : `sidebar-nav-${item.id}`}
                        data-nav-active={active ? 'true' : undefined}
                        onClick={() => handleNavClick(item.route)}
                        title={item.label}
                        className={`sidebar-nav-item w-full h-[36px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                          active
                            ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                            : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          {item.renderIcon(false)}
                          <span className="truncate text-[13px]">{item.label}</span>
                        </div>
                        {item.hasDownloadIndicator && getDownloadIndicator(item.route, false)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  // Smart Sidebar Navigation (Collapsed Rail)
  const renderSmartCollapsedNav = () => {
    console.log('[v0] Sidebar collapsed nav render');
    return (
      <>
        {/* Home Icon */}
        <button
          type="button"
          id="sidebar-collapsed-xaml-home"
          data-nav-active={(currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home') ? 'true' : undefined}
          onClick={() => handleNavClick('/')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'Home')}
          onMouseLeave={handleTooltipLeave}
          aria-label="Home"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            (currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home')
              ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
          }`}
        >
          <SidebarAppIcon name="home" className="w-5 h-5 text-black dark:text-white" />
        </button>

        {/* Articles Icon */}
        <button
          type="button"
          id="sidebar-collapsed-articles"
          data-nav-active={(currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/')) ? 'true' : undefined}
          onClick={() => handleNavClick('/news')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'Articles')}
          onMouseLeave={handleTooltipLeave}
          aria-label="Articles"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            (currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/'))
              ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
          }`}
        >
          <SidebarAppIcon name="articles" className="w-5 h-5" />
        </button>

        {/* Widgets Icon */}
        <button
          type="button"
          id="sidebar-collapsed-widgets"
          data-nav-active={(currentRoute === '/widgets' || currentRoute.startsWith('/widgets')) ? 'true' : undefined}
          onClick={() => handleNavClick('/widgets')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'Widgets')}
          onMouseLeave={handleTooltipLeave}
          aria-label="Widgets"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            (currentRoute === '/widgets' || currentRoute.startsWith('/widgets'))
              ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
          }`}
        >
          <SidebarAppIcon name="widgets" className="w-5 h-5 text-black dark:text-white" />
        </button>

        {/* Tiles Icon */}
        <button
          type="button"
          id="sidebar-collapsed-tiles"
          data-nav-active={(currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles') ? 'true' : undefined}
          onClick={() => handleNavClick('/tiles')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'Tiles')}
          onMouseLeave={handleTooltipLeave}
          aria-label="Tiles"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            (currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles')
              ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
          }`}
        >
          <PanelsTopLeft className="w-5 h-5 text-black dark:text-white" />
        </button>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-black/10 dark:bg-white/10 my-1 shrink-0" />

        {/* Copilot Icon */}
        <button
          type="button"
          id="sidebar-collapsed-copilot"
          data-nav-active={(currentRoute === '/copilot' || currentRoute.startsWith('/copilot')) ? 'true' : undefined}
          onClick={() => handleNavClick('/copilot')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'Copilot')}
          onMouseLeave={handleTooltipLeave}
          aria-label="Copilot"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            (currentRoute === '/copilot' || currentRoute.startsWith('/copilot'))
              ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles aria-hidden="true" className="w-5 h-5" />
        </button>

        {/* Recall Icon */}
        <button
          type="button"
          id="sidebar-collapsed-recall"
          data-nav-active={(currentRoute === '/recall' || currentRoute.startsWith('/recall')) ? 'true' : undefined}
          onClick={() => handleNavClick('/recall')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'Recall')}
          onMouseLeave={handleTooltipLeave}
          aria-label="Recall"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            (currentRoute === '/recall' || currentRoute.startsWith('/recall'))
              ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'hover:bg-black/5 dark:hover:bg-white/[0.05]'
          }`}
        >
          <History className="w-5 h-5" />
        </button>

        {/* SparkOS Icon */}
        <button
          type="button"
          id="sidebar-collapsed-sparkos"
          data-nav-active={currentRoute === '/sparkos' ? 'true' : undefined}
          onClick={() => handleNavClick('/sparkos')}
          onMouseEnter={(e) => handleTooltipEnter(e, 'SparkOS')}
          onMouseLeave={handleTooltipLeave}
          aria-label="SparkOS"
          className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
            currentRoute === '/sparkos'
              ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.05]'
              : 'hover:bg-black/5 dark:hover:bg-white/[0.05]'
          }`}
        >
          <Monitor aria-hidden="true" className="size-5 text-black dark:text-white" />
        </button>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-black/10 dark:bg-white/10 my-1 shrink-0" />

        {/* Folders in collapsed rail */}
        {smartFolders.map((folder) => {
          const isOpen = !!openFolders[folder.id];
          const hasActiveChild = folder.items.some((it) => it.isActive(currentRoute));

          return (
            <div key={folder.id} className="w-full flex flex-col items-center shrink-0">
              <button
                type="button"
                id={`sidebar-collapsed-folder-${folder.id}`}
                onClick={() => toggleFolder(folder.id)}
                onMouseEnter={(e) => handleTooltipEnter(e, folder.name)}
                onMouseLeave={handleTooltipLeave}
                aria-label={folder.name}
                className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                  isOpen || hasActiveChild
                    ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                    : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                }`}
              >
                <Folder aria-hidden="true" className="w-5 h-5" />
                {!isOpen && hasActiveChild && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff]" />
                )}
              </button>

              {isOpen && (
                <div className="w-full flex flex-col items-center py-1 space-y-1 bg-black/[0.03] dark:bg-white/[0.03] rounded-[6px] my-0.5">
                  {folder.items.map((item) => {
                    const active = item.isActive(currentRoute);
                    return (
                      <button
                        key={item.route}
                        type="button"
                        id={`sidebar-collapsed-${item.id}`}
                        data-nav-active={active ? 'true' : undefined}
                        onClick={() => handleNavClick(item.route)}
                        onMouseEnter={(e) => handleTooltipEnter(e, item.label)}
                        onMouseLeave={handleTooltipLeave}
                        aria-label={item.label}
                        className={`sidebar-nav-item w-full h-[36px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                          active
                            ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                            : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {item.renderIcon(true)}
                        {item.hasDownloadIndicator && getDownloadIndicator(item.route, true)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };



  // Render Full Windows 10 Settings Style Sidebar Content
  const renderSidebarBody = (isMobile: boolean = false) => {
    console.log('[v0] Sidebar body render', isMobile, settings.searchOnSidebar, settings.sidebarSmartLayout);
    const containerRef = isMobile ? mobileNavRef : desktopNavRef;

    return (
      <div className="flex flex-col h-full select-none text-[13.5px] font-sans">
        {/* Hidden M3U file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".m3u,.m3u8,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Top Header: Left Arrow (Back) + Hamburger Toggle + Vplay Logo placed right beside it */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-start gap-1 shrink-0">
          {/* Back button with left arrow */}
          <button
            type="button"
            id={isMobile ? 'btn-mobile-sidebar-back' : 'btn-desktop-sidebar-back'}
            onClick={handleGoBack}
            onMouseEnter={(e) => handleTooltipEnter(e, 'Quay lại', true)}
            onMouseLeave={handleTooltipLeave}
            aria-label="Quay lại"
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-[6px] flex items-center justify-center text-black dark:text-white hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 cursor-default transition-colors shrink-0"
          >
            <ArrowLeft className="w-4.5 h-4.5 stroke-[1.75] text-black dark:text-white" />
          </button>

          {/* Hamburger Menu Icon */}
          <button
            type="button"
            id={isMobile ? 'btn-mobile-sidebar-toggle' : 'btn-desktop-sidebar-toggle'}
            onClick={isMobile ? onCloseMobile : onToggleCollapse}
            onMouseEnter={(e) => handleTooltipEnter(e, isMobile ? 'Đóng menu' : 'Thu gọn menu', true)}
            onMouseLeave={handleTooltipLeave}
            aria-label={isMobile ? 'Close menu' : 'Collapse menu'}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-[6px] flex items-center justify-center text-black dark:text-white hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 cursor-default transition-colors shrink-0"
          >
            {isMobile ? <X className="w-4.5 h-4.5 stroke-[1.75] text-black dark:text-white" /> : <Menu className="w-4.5 h-4.5 stroke-[1.75] text-black dark:text-white" />}
          </button>

          {/* Logo placed right next to hamburger menu icon */}
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className="cursor-default flex items-center p-0 border-0 bg-transparent hover:opacity-85 active:scale-95 transition-opacity"
            title="Home"
          >
            <img 
              src={LOGO_SRC}
              alt="Microsoft Edge Dev"
              referrerPolicy="no-referrer"
              className="h-6 w-auto object-contain drop-shadow-sm"
            />
          </button>
        </div>

        {/* Search on sidebar - placed between title bar and Home tab */}
        {settings.searchOnSidebar && (
          <div className="px-3 pb-2 pt-0.5 shrink-0 w-full relative z-30" ref={sidebarSearchRef}>
            <form onSubmit={handleSidebarSearchSubmit} className="w-full">
              <div
                id="sidebar-search-box"
                onClick={() => setIsSidebarSearchFlyoutOpen(true)}
                className="fluent-search-box windows-search-box group relative w-full h-8 rounded-none flex items-center px-2.5 gap-1.5 transition-all cursor-text select-none bg-black/40 border border-white/20 backdrop-blur-md"
              >
                <input
                  type="text"
                  value={sidebarSearchQuery}
                  onChange={(e) => {
                    setSidebarSearchQuery(e.target.value);
                    setIsSidebarSearchFlyoutOpen(true);
                  }}
                  onFocus={() => setIsSidebarSearchFlyoutOpen(true)}
                  placeholder="Search"
                  className="w-full bg-transparent text-[12px] text-white placeholder-white/70 outline-none border-none py-1 pl-0.5 pr-12"
                />
                <div className="absolute right-1.5 flex items-center gap-1 z-10">
                  {sidebarSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarSearchQuery('');
                        setIsSidebarSearchFlyoutOpen(false);
                      }}
                      title="Clear search"
                      className="text-white/70 hover:text-white p-0.5 transition-colors cursor-pointer rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    title="Search"
                    className="p-1 text-white hover:text-[#4cc2ff] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Sidebar Search Flyout */}
            <AnimatePresence>
              {isSidebarSearchFlyoutOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-3 right-3 top-full mt-1 z-50 rounded-[8px] bg-[#1e2025]/98 backdrop-blur-2xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5)] p-1.5 select-none text-white max-h-[320px] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10.5px] font-semibold text-white/50 px-2 py-1 uppercase tracking-wider">
                    Quick suggestions
                  </div>
                  {filteredSidebarQuickApps.map((item) => (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => {
                        setIsSidebarSearchFlyoutOpen(false);
                        navigate(item.route);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-left hover:bg-white/10 transition-colors text-xs text-white"
                    >
                      <span className="font-medium text-white">{item.label}</span>
                      <span className="text-[11px] text-white/50 truncate max-w-[120px]">{item.desc}</span>
                    </button>
                  ))}
                  {sidebarSearchQuery.trim() && (
                    <button
                      type="button"
                      onClick={handleSidebarSearchSubmit}
                      className="w-full mt-1 pt-1 border-t border-white/10 flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-left hover:bg-white/10 transition-colors text-xs text-[#4cc2ff] font-medium"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="truncate">Search for "{sidebarSearchQuery.trim()}"</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Unified Navigation List inside common scroll container */}
        <div 
          ref={containerRef}
          key="sidebar-nav-expanded"
          className={`sidebar-items-slide-up sidebar-app-scroller flex-1 overflow-y-auto pb-4 ${
            settings.windowsAppSdkPreview ? 'space-y-[2px]' : 'space-y-1'
          } px-0 font-normal relative`}
        >
          {/* Morphing Vertical Blue Accent Bar */}
          <MorphingVerticalIndicator
            containerRef={containerRef}
            currentRoute={currentRoute}
            dependencyKey={`${navItems.length}-${isLiveTvExpanded}-${currentRoute}-${settings.sidebarSmartLayout}-${JSON.stringify(openFolders)}`}
            isWebViewSdk={settings.windowsAppSdkPreview}
          />

          {settings.sidebarSmartLayout ? (
            renderSmartSidebarNav(isMobile)
          ) : (
            <>
              {/* XAML Home */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-xaml-home' : 'sidebar-nav-xaml-home'}
              data-nav-active={(currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home') ? 'true' : undefined}
              onClick={() => handleNavClick('/')}
              title="XAML Home"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <SidebarAppIcon name="home" className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">XAML Home</span>
            </button>
          </div>

          {/* 3. Articles */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-articles' : 'sidebar-nav-articles'}
              data-nav-active={(currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/')) ? 'true' : undefined}
              onClick={() => handleNavClick('/news')}
              title="Articles"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <SidebarAppIcon name="articles" className="w-5 h-5 shrink-0" />
              <span className="truncate text-[13.5px]">Articles</span>
            </button>
          </div>



          {/* 4. Widgets */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-widgets' : 'sidebar-nav-widgets'}
              data-nav-active={(currentRoute === '/widgets' || currentRoute.startsWith('/widgets')) ? 'true' : undefined}
              onClick={() => handleNavClick('/widgets')}
              title="Widgets"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/widgets' || currentRoute.startsWith('/widgets'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <SidebarAppIcon name="widgets" className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">Widgets</span>
            </button>
          </div>

          {/* Tiles */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-tiles' : 'sidebar-nav-tiles'}
              data-nav-active={(currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles') ? 'true' : undefined}
              onClick={() => handleNavClick('/tiles')}
              title="Tiles"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <PanelsTopLeft className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">Tiles</span>
            </button>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-microsoft-store' : 'sidebar-nav-microsoft-store'}
              data-nav-active={currentRoute === '/store' ? 'true' : undefined}
              onClick={() => handleNavClick('/store')}
              title="Store"
              aria-label="Store"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${currentRoute === '/store' ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]' : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'}`}
            >
              <Store aria-hidden="true" className="size-5 shrink-0" />
              <span className="truncate text-[13.5px]">Store</span>
            </button>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-sparkos' : 'sidebar-nav-sparkos'}
              data-nav-active={currentRoute === '/sparkos' ? 'true' : undefined}
              onClick={() => handleNavClick('/sparkos')}
              title="SparkOS"
              aria-label="SparkOS"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${currentRoute === '/sparkos' ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]' : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'}`}
            >
              <Monitor aria-hidden="true" className="size-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">SparkOS</span>
            </button>
          </div>

          {/* Recall (preview) */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-recall' : 'sidebar-nav-recall'}
              data-nav-active={(currentRoute === '/recall' || currentRoute.startsWith('/recall')) ? 'true' : undefined}
              onClick={() => handleNavClick('/recall')}
              title="Recall (preview)"
              aria-label="Recall"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/recall' || currentRoute.startsWith('/recall'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <History className="w-5 h-5 shrink-0" />
              <span className="truncate text-[13.5px]">Recall</span>
            </button>
          </div>



          {/* Divider & Category Heading: Social (Bên trên category Apps) */}
          <div className="my-2 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />
          <div className="px-1.5 pt-0.5 pb-1 shrink-0">
            <h2 className="text-black dark:text-[#a1a1aa] text-[11px] font-semibold tracking-wider uppercase select-none">
              Social
            </h2>
          </div>

          {/* 1. Swift Bank */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-swift-bank' : 'sidebar-nav-swift-bank'}
              data-nav-active={(currentRoute === '/swift-bank' || currentRoute.startsWith('/swift-bank') || currentRoute === '/bank') ? 'true' : undefined}
              onClick={() => handleNavClick('/swift-bank')}
              title="Swift Bank - Ngân hàng số bảo mật"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/swift-bank' || currentRoute.startsWith('/swift-bank') || currentRoute === '/bank')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <SidebarAppIcon name="bank" className="w-5 h-5 shrink-0" />
              <span className="truncate text-[13.5px]">Swift Bank</span>
              {getDownloadIndicator('/swift-bank')}
            </button>
          </div>

          {/* 2. Swift Social */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-swift-social' : 'sidebar-nav-swift-social'}
              data-nav-active={(currentRoute === '/swift' || currentRoute.startsWith('/swift') || currentRoute === '/swift-social') ? 'true' : undefined}
              onClick={() => handleNavClick('/swift')}
              title="Swift - Mạng xã hội đa năng"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/swift' || currentRoute.startsWith('/swift') || currentRoute === '/swift-social')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <SidebarAppIcon name="social" className="w-5 h-5 shrink-0" />
              <span className="truncate text-[13.5px]">Swift Social</span>
              {getDownloadIndicator('/swift')}
            </button>
          </div>

          {/* 3. Friends */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-friends' : 'sidebar-nav-friends'}
              data-nav-active={(currentRoute === '/friends' || currentRoute.startsWith('/friends')) ? 'true' : undefined}
              onClick={() => handleNavClick('/friends')}
              title="People - Danh sách 100 người dùng Sparkle (Dev)"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/friends' || currentRoute.startsWith('/friends'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <SidebarAppIcon name="people" className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">People</span>
              {getDownloadIndicator('/friends')}
            </button>
          </div>

          {/* 4. Logos Fandom */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-logos-fandom' : 'sidebar-nav-logos-fandom'}
              data-nav-active={(currentRoute === '/logos-fandom' || currentRoute === '/logos-wiki' || currentRoute === '/fandom') ? 'true' : undefined}
              onClick={() => handleNavClick('/logos-fandom')}
              title="Logos Fandom - Bách khoa toàn thư nhận diện thương hiệu"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/logos-fandom' || currentRoute === '/logos-wiki' || currentRoute === '/fandom')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <BookMarked className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">Logos Fandom</span>
              {getDownloadIndicator('/logos-fandom')}
            </button>
          </div>



          {/* Divider & Category Heading: Apps */}
          <div className="my-2 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />
          <div className="px-1.5 pt-0.5 pb-1 shrink-0">
            <h2 className="text-black dark:text-[#a1a1aa] text-[11px] font-semibold tracking-wider uppercase select-none">
              Apps
            </h2>
          </div>

          {/* Mail & Calendar in Apps section */}
          <div className="shrink-0 flex flex-col gap-0.5">
            {[
              { route: '/mail', label: 'Mail', icon: <Mail className="size-5" aria-hidden="true" /> },
              { route: '/calendar', label: 'Calendar', icon: <CalendarDays className="size-5" aria-hidden="true" /> },
            ].map((item) => {
              const active = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  id={isMobile ? `mobile-nav-${item.label.toLowerCase()}` : `sidebar-nav-${item.label.toLowerCase()}`}
                  data-nav-active={active ? 'true' : undefined}
                  onClick={() => handleNavClick(item.route)}
                  title={item.label}
                  className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${active ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]' : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'}`}
                >
                  {item.icon}
                  <span className="truncate text-[13.5px]">{item.label}</span>
                  {getDownloadIndicator(item.route)}
                </button>
              );
            })}
          </div>

          {/* 1. Copilot */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-copilot' : 'sidebar-nav-copilot'}
              data-nav-active={(currentRoute === '/copilot' || currentRoute.startsWith('/copilot')) ? 'true' : undefined}
              onClick={() => handleNavClick('/copilot')}
              title="Copilot"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/copilot' || currentRoute.startsWith('/copilot'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles aria-hidden="true" className="w-5 h-5 shrink-0" />
              <span className="truncate text-[13.5px]">Copilot</span>
            </button>
          </div>

          {/* 2. Microsoft Edge */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-edge' : 'sidebar-nav-edge'}
              data-nav-active={(currentRoute === '/edge' || currentRoute === '/browser' || currentRoute.startsWith('/edge')) ? 'true' : undefined}
              onClick={() => handleNavClick('/edge')}
              title="Microsoft Edge"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/edge' || currentRoute === '/browser' || currentRoute.startsWith('/edge'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="edge" className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">Microsoft Edge</span>
            </div>
            {getDownloadIndicator('/edge', isCollapsed)}
            </button>
          </div>

          {/* 3. File Explorer */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-file-explorer' : 'sidebar-nav-file-explorer'}
              data-nav-active={(currentRoute === '/file-explorer' || currentRoute === '/files' || currentRoute.startsWith('/file-explorer')) ? 'true' : undefined}
              onClick={() => handleNavClick('/file-explorer')}
              title="File Explorer"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/file-explorer' || currentRoute === '/files' || currentRoute.startsWith('/file-explorer'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="fileExplorer" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">File Explorer</span>
              </div>
            </button>
          </div>

          {/* 4. Watch */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-live-tv' : 'sidebar-nav-live-tv'}
              data-nav-active={(currentRoute === '/live-tv' || currentRoute.startsWith('/live-tv')) ? 'true' : undefined}
              onClick={() => handleNavClick('/live-tv')}
              title="Watch"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/live-tv' || currentRoute.startsWith('/live-tv'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="watch" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Watch</span>
              </div>
              {getDownloadIndicator('/live-tv', isCollapsed)}

              {/* Submenu toggle */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiveTvExpanded(!isLiveTvExpanded);
                }}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-[4px] cursor-pointer"
              >
                {isLiveTvExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                )}
              </div>
            </button>

            {/* Live TV Channels Quick Submenu */}
            {isLiveTvExpanded && (
              <div className="ml-4 pl-2.5 space-y-0.5 py-1">
                {channels.slice(0, 8).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      handleNavClick(`/live-tv?channel=${ch.slug}`);
                      if (onSelectChannel) onSelectChannel(ch);
                    }}
                    className="w-full h-[30px] flex items-center justify-between px-2.5 rounded-[4px] text-xs text-black dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  >
                    <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                    <span className="px-1.5 py-0.2 text-[9px] bg-[#0078d4] dark:bg-[#4cc2ff] text-white rounded-[2px] font-bold">
                      Play
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNavClick('/live-tv')}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-black dark:text-white hover:underline font-normal cursor-pointer rounded-[4px]"
                >
                  + View all channels
                </button>
              </div>
            )}
          </div>

          {/* 5. Notes */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-notes' : 'sidebar-nav-notes'}
              data-nav-active={(currentRoute === '/notes' || currentRoute === '/write' || currentRoute === '/present' || currentRoute === '/table') ? 'true' : undefined}
              onClick={() => handleNavClick('/notes')}
              title="Notes"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/notes' || currentRoute === '/write' || currentRoute === '/present' || currentRoute === '/table')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="notes" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Notes</span>
              </div>
              {getDownloadIndicator('/notes', isCollapsed)}
            </button>
          </div>

          {/* 6. Gallery (formerly Photos) */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-photos' : 'sidebar-nav-photos'}
              data-nav-active={(currentRoute === '/photos' || currentRoute === '/gallery' || currentRoute.startsWith('/photos') || currentRoute.startsWith('/gallery')) ? 'true' : undefined}
              onClick={() => handleNavClick('/photos')}
              title="Gallery"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/photos' || currentRoute === '/gallery' || currentRoute.startsWith('/photos') || currentRoute.startsWith('/gallery'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="gallery" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Gallery</span>
              </div>
              {getDownloadIndicator('/gallery', isCollapsed)}
            </button>
          </div>

          {/* 7. Camera */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-camera' : 'sidebar-nav-camera'}
              data-nav-active={(currentRoute === '/camera' || currentRoute.startsWith('/camera')) ? 'true' : undefined}
              onClick={() => handleNavClick('/camera')}
              title="Camera"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/camera' || currentRoute.startsWith('/camera'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="camera" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Camera</span>
              </div>
              {getDownloadIndicator('/camera', isCollapsed)}
            </button>
          </div>

          {/* 8. Paint */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-ms-paint' : 'sidebar-nav-ms-paint'}
              data-nav-active={(currentRoute === '/ms-paint' || currentRoute === '/paint' || currentRoute.startsWith('/ms-paint')) ? 'true' : undefined}
              onClick={() => handleNavClick('/ms-paint')}
              title="Paint"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/ms-paint' || currentRoute === '/paint' || currentRoute.startsWith('/ms-paint'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="paint" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Paint</span>
              </div>
              {getDownloadIndicator('/paint', isCollapsed)}
  </button>
  </div>

  {/* 9. Ink Canvas */}
  <div className="w-full">
    <button
      type="button"
      id={isMobile ? 'mobile-nav-ink-canvas' : 'sidebar-nav-ink-canvas'}
      data-nav-active={(currentRoute === '/ink-space' || currentRoute === '/inkspace' || currentRoute === '/ink-canvas' || currentRoute === '/inkcanvas') ? 'true' : undefined}
      onClick={() => handleNavClick('/ink-space')}
      title="Ink Canvas - Infinite canvas"
      className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
        (currentRoute === '/ink-space' || currentRoute === '/inkspace' || currentRoute === '/ink-canvas' || currentRoute === '/inkcanvas')
          ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
          : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3.5 truncate"><SidebarAppIcon name="inkCanvas" className="w-5 h-5" /><span className="truncate text-[13.5px]">Ink Canvas</span></div>
      {getDownloadIndicator('/ink-space', isCollapsed)}
    </button>
  </div>
  
  {/* 10. Calculator */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-calculator' : 'sidebar-nav-calculator'}
              data-nav-active={(currentRoute === '/calculator' || currentRoute === '/calc') ? 'true' : undefined}
              onClick={() => handleNavClick('/calculator')}
              title="Calculator - Máy tính Fluent"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/calculator' || currentRoute === '/calc')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="calculator" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Calculator</span>
              </div>
              {getDownloadIndicator('/calculator', isCollapsed)}
            </button>
          </div>

          {/* 11. Clock */}
          <div className="w-full shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-clock' : 'sidebar-nav-clock'}
              data-nav-active={(currentRoute === '/clock' || currentRoute.startsWith('/clock') || currentRoute === '/alarm' || currentRoute === '/timer' || currentRoute === '/stopwatch') ? 'true' : undefined}
              onClick={() => handleNavClick('/clock')}
              title="Clock - Đặt báo thức & Bấm giờ"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/clock' || currentRoute.startsWith('/clock') || currentRoute === '/alarm' || currentRoute === '/timer' || currentRoute === '/stopwatch')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <Clock3 className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Clock</span>
              </div>
              {getDownloadIndicator('/clock', isCollapsed)}
            </button>
          </div>

          {/* 12. VLC Media Player */}
          <div className="w-full shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-vlc' : 'sidebar-nav-vlc'}
              data-nav-active={(currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player') ? 'true' : undefined}
              onClick={() => handleNavClick('/vlc')}
              title="VLC Media Player"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <Film className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">VLC Media Player</span>
              </div>
              {getDownloadIndicator('/vlc', isCollapsed)}
            </button>
          </div>

          {/* 13. Cookbook */}
          <div className="w-full shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-cookbook' : 'sidebar-nav-cookbook'}
              data-nav-active={(currentRoute === '/cookbook' || currentRoute.startsWith('/cookbook')) ? 'true' : undefined}
              onClick={() => handleNavClick('/cookbook')}
              title="Cookbook - Ẩm thực"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/cookbook' || currentRoute.startsWith('/cookbook'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <BookOpen className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Cookbook</span>
              </div>
              {getDownloadIndicator('/cookbook', isCollapsed)}
            </button>
          </div>



          {/* Divider & Category Heading: System */}
          <div className="my-2 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />
          <div className="px-1.5 pt-0.5 pb-1 shrink-0">
            <h2 className="text-black dark:text-[#a1a1aa] text-[11px] font-semibold tracking-wider uppercase select-none">
              System
            </h2>
          </div>

          {/* Task Manager */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-taskmanager' : 'sidebar-nav-taskmanager'}
              data-nav-active={(currentRoute === '/task-manager' || currentRoute.startsWith('/task-manager')) ? 'true' : undefined}
              onClick={() => handleNavClick('/task-manager')}
              title="Task Manager"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/task-manager' || currentRoute.startsWith('/task-manager'))
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="taskManager" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Task Manager</span>
              </div>
            </button>
          </div>

          {/* Feedback Hub */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-feedback-hub' : 'sidebar-nav-feedback-hub'}
              data-nav-active={(currentRoute === '/feedback-hub' || currentRoute === '/feedback') ? 'true' : undefined}
              onClick={() => handleNavClick('/feedback-hub')}
              title="Feedback Hub - Trung tâm phản hồi"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/feedback-hub' || currentRoute === '/feedback')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <SidebarAppIcon name="feedback" className="w-5 h-5 shrink-0 text-black dark:text-white" />
                <span className="truncate text-[13.5px]">Feedback Hub</span>
              </div>
            </button>
          </div>

          {/* Divider & Category Heading: LAC's project */}
          <div className="my-2 mx-1 h-[1px] bg-black/10 dark:bg-white/10" />
          <div className="px-1.5 pt-0.5 pb-1 shrink-0">
            <h2 className="text-black dark:text-[#a1a1aa] text-[11px] font-semibold tracking-wider uppercase select-none">
              LAC's project
            </h2>
          </div>

          {/* 6. Craftmine */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-craftmine' : 'sidebar-nav-craftmine'}
              data-nav-active={currentRoute === '/craftmine' ? 'true' : undefined}
              onClick={() => handleNavClick('/craftmine')}
              title="Craftmine"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                currentRoute === '/craftmine'
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">Craftmine</span>
              {getDownloadIndicator('/craftmine', isCollapsed)}
            </button>
          </div>

          {/* Photopea (Photo Editor Web App) */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-photopea' : 'sidebar-nav-photopea'}
              data-nav-active={(currentRoute === '/photopea' || currentRoute === '/photoshop') ? 'true' : undefined}
              onClick={() => handleNavClick('/photopea')}
              title="Photopea - Trình chỉnh sửa ảnh PSD & Vector"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                (currentRoute === '/photopea' || currentRoute === '/photoshop')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers className="w-5 h-5 shrink-0 text-black dark:text-white" />
              <span className="truncate text-[13.5px]">Photopea</span>
              {getDownloadIndicator('/photopea', isCollapsed)}
            </button>
          </div>

          {/* 7. Discord */}
          <div className="w-full">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-discord' : 'sidebar-nav-discord'}
              onClick={() => {
                if (isMobile) onCloseMobile?.();
                window.open('https://discord.gg/wcdjaDDayK', '_blank', 'noopener,noreferrer');
              }}
              title="Discord"
              className="sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-3 text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white cursor-default text-left rounded-none transition-colors"
            >
              <svg className="w-5 h-5 fill-current shrink-0 text-black dark:text-white" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="truncate text-[13.5px]">Discord</span>
            </button>
          </div>
            </>
          )}
        </div>

        {/* Bottom Section: Sign In (placed directly above Settings) & Settings */}
        <div className="px-0 py-2 shrink-0 mt-auto space-y-1 relative signin-flyout-container">
          {/* Sign In item placed directly ABOVE Settings tab */}

          {/* XAML Controls - only in legacy mode (in smart layout it is in System folder) */}
          {!settings.sidebarSmartLayout && (
            <button
              type="button"
              id={isMobile ? 'mobile-nav-xaml-controls' : 'sidebar-nav-xaml-controls'}
              data-nav-active={isCurrentActive('/xaml-controls') ? 'true' : undefined}
              onClick={() => handleNavClick('/xaml-controls')}
              title="XAML Controls"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
                isCurrentActive('/xaml-controls')
                  ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
              }`}
            >
              <PanelsTopLeft aria-hidden="true" className="size-5 shrink-0" />
              <span className="truncate text-[13.5px]">XAML Controls</span>
            </button>
          )}

          {/* Divider above Settings in smart layout */}
          {settings.sidebarSmartLayout && (
            <div className="my-1 mx-1 h-[1px] bg-black/10 dark:bg-white/10 shrink-0" />
          )}

          {/* Bottom Settings Tab Item */}
          <button
            type="button"
            id={isMobile ? 'mobile-nav-settings' : 'sidebar-nav-settings'}
            data-nav-active={isCurrentActive('/settings') ? 'true' : undefined}
            onClick={() => handleNavClick('/settings')}
            title="Settings"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-4 cursor-default relative text-left rounded-none transition-colors ${
              isCurrentActive('/settings')
                ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}
          >
            <SidebarAppIcon name="settings" className="w-5 h-5 shrink-0 settings-spin-icon text-black dark:text-white" />
            <span className="truncate text-[13.5px]">Settings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      {settings.dockToSidebar && (
        <motion.aside
          id="waves-desktop-sidebar"
          data-collapsed={effectiveCollapsed ? 'true' : undefined}
          initial={false}
          animate={{ width: effectiveCollapsed ? 48 : 260 }}
          transition={shouldAnimateSidebar ? { duration: 0.2, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
          onPointerMove={handleSidebarPointerMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setActiveTooltip(null);
            handleSidebarPointerLeave();
          }}
          className={`hidden md:flex flex-col h-screen bg-[#250F1A] border-r border-[#3d182b] text-[#111827] dark:text-white select-none shrink-0 fixed top-0 z-40 overflow-visible shadow-none ${
            settings.sidebarPosition === 'right' ? 'right-0' : 'left-0'
          } ${effectiveCollapsed ? 'w-[48px]' : 'w-[260px]'}`}
          style={{
            backgroundColor: '#250F1A',
            backgroundImage: 'none',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            boxShadow: 'none',
          }}
        >
          {!effectiveCollapsed ? (
            renderSidebarBody(false)
          ) : (
            /* Collapsed Windows 10/11 Sidebar Icon Bar */
            <div 
              key="sidebar-nav-collapsed"
              className="flex flex-col h-full select-none items-center py-2 relative overflow-hidden w-full"
            >
              {/* Pinned Top Navigation Controls */}
              <div className="shrink-0 flex flex-col items-center space-y-1 pb-1 w-full">
                {/* Back Button with Left Arrow */}
                <button 
                  id="btn-sidebar-collapsed-back"
                  type="button"
                  onClick={handleGoBack} 
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Quay lại')}
                  onMouseLeave={handleTooltipLeave}
                  className="w-9 h-9 shrink-0 rounded-[6px] flex items-center justify-center text-black dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white cursor-default transition-colors"
                  aria-label="Quay lại"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[1.75] text-black dark:text-white" />
                </button>

                {/* Hamburger Button to Expand */}
                <button 
                  id="btn-sidebar-expand-toggle"
                  type="button"
                  onClick={onToggleCollapse} 
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Mở rộng menu')}
                  onMouseLeave={handleTooltipLeave}
                  className="w-9 h-9 shrink-0 rounded-[6px] flex items-center justify-center text-black dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white cursor-default transition-colors"
                  aria-label="Expand menu"
                >
                  <Menu className="w-5 h-5 stroke-[1.75] text-black dark:text-white" />
                </button>

                {/* Search Button in Collapsed Mode */}
                {settings.searchOnSidebar && (
                  <button 
                    id="btn-sidebar-collapsed-search"
                    type="button"
                    onClick={() => {
                      if (onToggleCollapse) onToggleCollapse();
                      else onOpenSearch();
                    }} 
                    onMouseEnter={(e) => handleTooltipEnter(e, 'Search')}
                    onMouseLeave={handleTooltipLeave}
                    className="w-9 h-9 shrink-0 rounded-[6px] flex items-center justify-center text-black dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white cursor-default transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 text-black dark:text-white" />
                  </button>
                )}
              </div>

              {/* Scrollable Middle Navigation Items List (Items maintain uniform spacing, do not cram, fully scrollable) */}
              <div 
                ref={collapsedNavRef}
                onScroll={handleTooltipLeave}
                className={`sidebar-items-slide-up sidebar-app-scroller flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col items-center py-1 ${
                  settings.windowsAppSdkPreview ? 'space-y-[2px]' : 'space-y-1'
                } relative`}
              >
                <MorphingVerticalIndicator
                  containerRef={collapsedNavRef}
                  currentRoute={currentRoute}
                  dependencyKey={`${navItems.length}-${currentRoute}-${settings.sidebarSmartLayout}-${JSON.stringify(openFolders)}`}
                  isWebViewSdk={settings.windowsAppSdkPreview}
                />

                {settings.sidebarSmartLayout ? (
                  renderSmartCollapsedNav()
                ) : (
                  <>
                    {/* XAML Home Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-xaml-home"
                  data-nav-active={(currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home') ? 'true' : undefined}
                  onClick={() => handleNavClick('/')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'XAML Home')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="XAML Home"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/' || currentRoute === '/home' || currentRoute === '/xaml-home')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="home" className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* 2. Articles Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-articles"
                  data-nav-active={(currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/news')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Articles')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Articles"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/news' || currentRoute.startsWith('/article') || currentRoute.startsWith('/news/'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="articles" className="w-5 h-5" />
                </button>

                {/* 4. Widgets Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-widgets"
                  data-nav-active={(currentRoute === '/widgets' || currentRoute.startsWith('/widgets')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/widgets')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Widgets')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Widgets"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/widgets' || currentRoute.startsWith('/widgets'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="widgets" className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* Microsoft Store Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-microsoft-store"
                  data-nav-active={currentRoute === '/store' ? 'true' : undefined}
                  onClick={() => handleNavClick('/store')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Store')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Store"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${currentRoute === '/store' ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.05]' : 'hover:bg-black/5 dark:hover:bg-white/[0.05]'}`}
                >
                  <Store aria-hidden="true" className="size-5" />
                </button>

                {/* SparkOS Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-sparkos"
                  data-nav-active={currentRoute === '/sparkos' ? 'true' : undefined}
                  onClick={() => handleNavClick('/sparkos')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'SparkOS')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="SparkOS"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${currentRoute === '/sparkos' ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.05]' : 'hover:bg-black/5 dark:hover:bg-white/[0.05]'}`}
                >
                  <Monitor aria-hidden="true" className="size-5 text-black dark:text-white" />
                </button>

                {/* Recall Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-recall"
                  data-nav-active={(currentRoute === '/recall' || currentRoute.startsWith('/recall')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/recall')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Recall (preview)')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Recall"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/recall' || currentRoute.startsWith('/recall'))
                      ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <History className="w-5 h-5" />
                </button>

                {/* Divider: Social */}
                <div className="w-6 h-[1px] bg-black/10 dark:bg-white/10 my-1 shrink-0" />

                {/* Swift Bank Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-swift-bank"
                  data-nav-active={(currentRoute === '/swift-bank' || currentRoute.startsWith('/swift-bank') || currentRoute === '/bank') ? 'true' : undefined}
                  onClick={() => handleNavClick('/swift-bank')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Swift Bank - Ngân hàng số')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Swift Bank"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/swift-bank' || currentRoute.startsWith('/swift-bank') || currentRoute === '/bank')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="bank" className="w-5 h-5" />
                  {getDownloadIndicator('/swift-bank', true)}
                </button>

                {/* Swift Social Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-swift-social"
                  data-nav-active={(currentRoute === '/swift' || currentRoute.startsWith('/swift') || currentRoute === '/swift-social') ? 'true' : undefined}
                  onClick={() => handleNavClick('/swift')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Swift Social')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Swift Social"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/swift' || currentRoute.startsWith('/swift') || currentRoute === '/swift-social')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="social" className="w-5 h-5" />
                  {getDownloadIndicator('/swift', true)}
                </button>

                {/* Friends Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-friends"
                  data-nav-active={(currentRoute === '/friends' || currentRoute.startsWith('/friends')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/friends')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'People - 100 Người dùng')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="People"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/friends' || currentRoute.startsWith('/friends'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="people" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/friends', true)}
                </button>

                {/* Logos Fandom Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-logos-fandom"
                  data-nav-active={(currentRoute === '/logos-fandom' || currentRoute === '/logos-wiki' || currentRoute === '/fandom') ? 'true' : undefined}
                  onClick={() => handleNavClick('/logos-fandom')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Logos Fandom')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Logos Fandom"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/logos-fandom' || currentRoute === '/logos-wiki' || currentRoute === '/fandom')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <BookMarked className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/logos-fandom', true)}
                </button>

                {/* Divider: Apps */}
                <div className="w-6 h-[1px] bg-black/10 dark:bg-white/10 my-1 shrink-0" />

                {/* Mail & Calendar Icons in Apps */}
                {[
                  { route: '/mail', label: 'Mail', icon: <Mail className="size-5" aria-hidden="true" /> },
                  { route: '/calendar', label: 'Calendar', icon: <CalendarDays className="size-5" aria-hidden="true" /> },
                ].map((item) => (
                  <button
                    key={item.route}
                    type="button"
                    id={`sidebar-collapsed-${item.label.toLowerCase()}`}
                    data-nav-active={currentRoute === item.route ? 'true' : undefined}
                    onClick={() => handleNavClick(item.route)}
                    onMouseEnter={(e) => handleTooltipEnter(e, item.label)}
                    onMouseLeave={handleTooltipLeave}
                    aria-label={item.label}
                    className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${currentRoute === item.route ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.05]' : 'hover:bg-black/5 dark:hover:bg-white/[0.05]'}`}
                  >
                    {item.icon}
                  </button>
                ))}

                {/* Copilot Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-copilot"
                  data-nav-active={(currentRoute === '/copilot' || currentRoute.startsWith('/copilot')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/copilot')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Copilot')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Copilot"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/copilot' || currentRoute.startsWith('/copilot'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Sparkles aria-hidden="true" className="w-5 h-5" />
                </button>

                {/* Microsoft Edge Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-edge"
                  data-nav-active={(currentRoute === '/edge' || currentRoute === '/browser' || currentRoute.startsWith('/edge')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/edge')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Microsoft Edge')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Microsoft Edge"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/edge' || currentRoute === '/browser' || currentRoute.startsWith('/edge'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="edge" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/edge', true)}
                </button>

                {/* File Explorer Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-file-explorer"
                  data-nav-active={(currentRoute === '/file-explorer' || currentRoute === '/files' || currentRoute.startsWith('/file-explorer')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/file-explorer')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'File Explorer')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="File Explorer"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/file-explorer' || currentRoute === '/files' || currentRoute.startsWith('/file-explorer'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="fileExplorer" className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* Watch Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-watch"
                  data-nav-active={(currentRoute === '/live-tv' || currentRoute.startsWith('/live-tv')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/live-tv')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Watch')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Watch"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/live-tv' || currentRoute.startsWith('/live-tv'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="watch" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/live-tv', true)}
                </button>

                {/* Notes Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-notes"
                  data-nav-active={(currentRoute === '/notes' || currentRoute === '/write' || currentRoute === '/present' || currentRoute === '/table') ? 'true' : undefined}
                  onClick={() => handleNavClick('/notes')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Notes')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Notes"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/notes' || currentRoute === '/write' || currentRoute === '/present' || currentRoute === '/table')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="notes" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/notes', true)}
                </button>

                {/* Gallery Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-photos"
                  data-nav-active={(currentRoute === '/photos' || currentRoute === '/gallery' || currentRoute.startsWith('/photos') || currentRoute.startsWith('/gallery')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/photos')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Gallery')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Gallery"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/photos' || currentRoute === '/gallery' || currentRoute.startsWith('/photos') || currentRoute.startsWith('/gallery'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="gallery" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/gallery', true)}
                </button>

                {/* Camera Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-camera"
                  data-nav-active={(currentRoute === '/camera' || currentRoute.startsWith('/camera')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/camera')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Camera')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Camera"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/camera' || currentRoute.startsWith('/camera'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="camera" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/camera', true)}
                </button>

                {/* Paint Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-ms-paint"
                  data-nav-active={(currentRoute === '/ms-paint' || currentRoute === '/paint' || currentRoute.startsWith('/ms-paint')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/ms-paint')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Paint')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Paint"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/ms-paint' || currentRoute === '/paint' || currentRoute.startsWith('/ms-paint'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="paint" className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/paint', true)}
                </button>

                {/* Clock Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-clock"
                  data-nav-active={(currentRoute === '/clock' || currentRoute.startsWith('/clock') || currentRoute === '/alarm' || currentRoute === '/timer' || currentRoute === '/stopwatch') ? 'true' : undefined}
                  onClick={() => handleNavClick('/clock')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Clock')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Clock"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/clock' || currentRoute.startsWith('/clock') || currentRoute === '/alarm' || currentRoute === '/timer' || currentRoute === '/stopwatch')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Clock3 className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* VLC Media Player Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-vlc"
                  data-nav-active={(currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player') ? 'true' : undefined}
                  onClick={() => handleNavClick('/vlc')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'VLC Media Player')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="VLC Media Player"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Film className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* Schedule Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-schedule"
                  data-nav-active={(currentRoute === '/schedule' || currentRoute.startsWith('/schedule') || currentRoute === '/epg') ? 'true' : undefined}
                  onClick={() => handleNavClick('/schedule')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Lịch phát sóng')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Lịch phát sóng"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/schedule' || currentRoute.startsWith('/schedule') || currentRoute === '/epg')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <CalendarDays className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* Cookbook Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-cookbook"
                  data-nav-active={(currentRoute === '/cookbook' || currentRoute.startsWith('/cookbook')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/cookbook')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Cookbook - Ẩm thực')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Cookbook"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/cookbook' || currentRoute.startsWith('/cookbook'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* Divider: System */}
                <div className="w-6 h-[1px] bg-black/10 dark:bg-white/10 my-1 shrink-0" />

                {/* Task Manager Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-taskmanager"
                  data-nav-active={(currentRoute === '/task-manager' || currentRoute.startsWith('/task-manager')) ? 'true' : undefined}
                  onClick={() => handleNavClick('/task-manager')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Task Manager')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Task Manager"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/task-manager' || currentRoute.startsWith('/task-manager'))
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <SidebarAppIcon name="taskManager" className="w-5 h-5 text-black dark:text-white" />
                </button>

                {/* Divider: LAC's project */}
                <div className="w-6 h-[1px] bg-black/10 dark:bg-white/10 my-1 shrink-0" />

                {/* Craftmine Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-craftmine"
                  data-nav-active={currentRoute === '/craftmine' ? 'true' : undefined}
                  onClick={() => handleNavClick('/craftmine')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Craftmine')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Craftmine"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    currentRoute === '/craftmine'
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Gamepad2 className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/craftmine', true)}
                </button>

                {/* Photopea Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-photopea"
                  data-nav-active={(currentRoute === '/photopea' || currentRoute === '/photoshop') ? 'true' : undefined}
                  onClick={() => handleNavClick('/photopea')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Photopea')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Photopea"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    (currentRoute === '/photopea' || currentRoute === '/photoshop')
                      ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-5 h-5 text-black dark:text-white" />
                  {getDownloadIndicator('/photopea', true)}
                </button>

                {/* Discord Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-discord"
                  onClick={() => window.open('https://discord.gg/wcdjaDDayK', '_blank', 'noopener,noreferrer')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Discord')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Discord"
                  className="sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white"
                >
                  <svg className="w-5 h-5 fill-current text-black dark:text-white" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </button>

                {/* Insider Flags if developerMode is on */}
                {settings.developerMode && (
                  <button
                    type="button"
                    id="sidebar-collapsed-test"
                    data-nav-active={currentRoute === '/test' ? 'true' : undefined}
                    onClick={() => handleNavClick('/test')}
                    onMouseEnter={(e) => handleTooltipEnter(e, 'Insider Flags (Lab)')}
                    onMouseLeave={handleTooltipLeave}
                    aria-label="Insider Flags (Lab)"
                    className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                      currentRoute === '/test'
                        ? 'bg-transparent text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                        : 'text-black dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <FlaskConical className="w-5 h-5 text-black dark:text-white" />
                  </button>
                )}
                  </>
                )}
              </div>

              {/* Bottom Pinned Controls: XAML Controls & Settings */}
              <div className="shrink-0 pt-1.5 pb-1 mt-auto flex flex-col items-center space-y-1 w-full border-t border-black/5 dark:border-white/5">
                {/* XAML Controls Icon only in legacy mode (in smart layout it is in System folder) */}
                {!settings.sidebarSmartLayout && (
                  <button
                    type="button"
                    id="sidebar-collapsed-xaml-controls"
                    data-nav-active={isCurrentActive('/xaml-controls') ? 'true' : undefined}
                    onClick={() => handleNavClick('/xaml-controls')}
                    onMouseEnter={(e) => handleTooltipEnter(e, 'XAML Controls')}
                    onMouseLeave={handleTooltipLeave}
                    aria-label="XAML Controls"
                    className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                      isCurrentActive('/xaml-controls')
                        ? 'bg-transparent text-[#111827] dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                        : 'text-[#4b5563] dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-[#111827] dark:hover:text-white'
                    }`}
                  >
                    <PanelsTopLeft aria-hidden="true" className="size-5" />
                  </button>
                )}

                {/* Bottom Settings Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-settings"
                  data-nav-active={isCurrentActive('/settings') ? 'true' : undefined}
                  onClick={() => handleNavClick('/settings')}
                  onMouseEnter={(e) => handleTooltipEnter(e, 'Settings')}
                  onMouseLeave={handleTooltipLeave}
                  aria-label="Settings"
                  className={`sidebar-nav-item w-full h-[38px] shrink-0 rounded-none flex items-center justify-center relative transition-colors cursor-default ${
                    isCurrentActive('/settings')
                      ? 'bg-transparent text-[#111827] dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/[0.05]'
                      : 'text-[#4b5563] dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-[#111827] dark:hover:text-white'
                  }`}
                >
                  {isCurrentActive('/settings') && (
                    <span
                      aria-hidden="true"
                      className="sidebar-static-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[24px] bg-[#005fb8] dark:bg-[#0078d4] rounded-none z-30 pointer-events-none"
                      style={{ transition: 'none', animation: 'none' }}
                    />
                  )}
                  <SidebarAppIcon name="settings" className="w-5 h-5 settings-spin-icon text-[#111827] dark:text-white" />
                </button>
              </div>
            </div>
          )}
        </motion.aside>
      )}

      {/* 2. Mobile Drawer Navigation with Real-Time Finger Following */}
      <AnimatePresence>
        {(isMobileOpen || mobileDragOffset !== null) && (
          <div 
            className="fixed inset-0 z-50 md:hidden flex"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop with real-time finger tracking & smooth release */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: mobileDragOffset !== null 
                  ? Math.min(1, Math.max(0, mobileDragOffset / (typeof window !== 'undefined' ? Math.min(285, window.innerWidth * 0.85) : 285)))
                  : drawerCloseOffset !== null 
                    ? Math.max(0, ((typeof window !== 'undefined' ? Math.min(285, window.innerWidth * 0.85) : 285) + drawerCloseOffset) / (typeof window !== 'undefined' ? Math.min(285, window.innerWidth * 0.85) : 285))
                    : 1 
              }}
              exit={{ opacity: 0 }}
              transition={(mobileDragOffset !== null || drawerCloseOffset !== null) ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 cursor-pointer"
              aria-hidden="true"
            />

            {/* Slide-out Sidebar Drawer following finger in real-time */}
            <motion.div 
              id="waves-mobile-sidebar"
              onPointerMove={handleSidebarPointerMove}
              onPointerLeave={handleSidebarPointerLeave}
              initial={mobileDragOffset !== null ? false : { x: '-100%', opacity: 0.8 }}
              animate={{ 
                x: mobileDragOffset !== null 
                  ? mobileDragOffset - Math.min(285, typeof window !== 'undefined' ? window.innerWidth * 0.85 : 285)
                  : drawerCloseOffset !== null 
                    ? Math.min(0, drawerCloseOffset)
                    : 0,
                opacity: 1 
              }}
              exit={{ x: '-100%', opacity: 0.8 }}
              transition={(mobileDragOffset !== null || drawerCloseOffset !== null) ? { duration: 0 } : { 
                duration: 0.22, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              onTouchStart={handleDrawerTouchStart}
              onTouchMove={handleDrawerTouchMove}
              onTouchEnd={handleDrawerTouchEnd}
              className={`relative w-[285px] max-w-[85vw] h-full bg-[#250F1A] border-r border-[#3d182b] text-[#111827] dark:text-white shadow-none flex flex-col z-10`}
              style={{
                backgroundColor: '#250F1A',
                backgroundImage: 'none',
                boxShadow: 'none',
              }}
            >
              {renderSidebarBody(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discord Welcome Modal */}
      <DiscordWelcomeModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />

      {/* Sidebar Tooltip (No animation, solid dark gray background, gray border, no blur, no opacity, square corners) */}
      {activeTooltip && (
        <div
          key="sidebar-solid-tooltip"
          style={{
            top: activeTooltip.y,
            ...(settings.sidebarPosition === 'right'
              ? { right: `${Math.max(0, window.innerWidth - activeTooltip.x)}px` }
              : { left: `${activeTooltip.x}px` }),
            transition: 'none',
            animation: 'none',
          }}
          className="fixed z-50 -translate-y-1/2 rounded-none bg-[#242424] border border-[#444444] text-white text-[12px] font-normal px-2.5 py-1 pointer-events-none select-none shadow-md tracking-wide whitespace-nowrap"
        >
          {activeTooltip.label}
        </div>
      )}
    </>
  );
};
