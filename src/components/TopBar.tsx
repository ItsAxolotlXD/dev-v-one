import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, History, X, Mic, MicOff, Search, Sparkles, MapPin, Check } from 'lucide-react';
import { 
  FluentHomeIcon, 
  FluentLiveTvIcon, 
  FluentNewsIcon, 
  FluentWidgetsIcon,
  FluentTilesIcon,
  FluentMicOutlineIcon,
  FluentMicOffOutlineIcon,
  FluentSearchIcon,
  FLUENT_ICON_URLS 
} from './FluentIcons';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { useIsMobile } from '../hooks/useIsMobile';
import { Channel, NewsArticle } from '../types';
import { NEWS_DATA } from '../data/news';
import { CopilotChatFlyout } from './CopilotChatFlyout';
import { SpinningRing } from './SpinningRing';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/d/d4/V-one-dev.png/revision/latest?cb=20261012151735';
const SEARCH_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/3/3c/Tools_menu.png/revision/latest?cb=20260905055712';
const EXPERIMENTAL_SEARCH_ICON_URL = 'https://static.wikia.nocookie.net/ep-deo/images/c/cf/Xperimental_Search.png/revision/latest?cb=20261022082041';
const HOME_ICON_SRC = FLUENT_ICON_URLS.home;
const TV_ICON_SRC = FLUENT_ICON_URLS.liveTv;
const NEWS_ICON_SRC = FLUENT_ICON_URLS.news;
const SETTINGS_ICON_SRC = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';

const DEFAULT_HISTORY_ITEMS = [
  'minecraft preview for windows',
  'mail and calendar',
  'calculator',
  'microsoft maps',
  'notepad',
  'watch live tv',
  'vtv1 hd thoi su 19h'
];

export interface InsightLocation {
  name: string;
  lat: number;
  lon: number;
  country?: string;
}

export const DEFAULT_INSIGHT_LOCATION: InsightLocation = {
  name: 'Hà Nội',
  lat: 21.0285,
  lon: 105.8542,
  country: 'Việt Nam',
};

export const POPULAR_LOCATIONS: InsightLocation[] = [
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542, country: 'Việt Nam' },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297, country: 'Việt Nam' },
  { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022, country: 'Việt Nam' },
  { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881, country: 'Việt Nam' },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469, country: 'Việt Nam' },
  { name: 'Nha Trang', lat: 12.2388, lon: 109.1967, country: 'Việt Nam' },
  { name: 'Huế', lat: 16.4637, lon: 107.5909, country: 'Việt Nam' },
  { name: 'Đà Lạt', lat: 11.9404, lon: 108.4583, country: 'Việt Nam' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Nhật Bản' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'Hàn Quốc' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'Anh' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'Pháp' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'Hoa Kỳ' },
];

export const getWeatherConditionDesc = (code: number): string => {
  if (code === 0) return 'Trời quang';
  if (code === 1 || code === 2) return 'Ít mây';
  if (code === 3) return 'Nhiều mây';
  if (code === 45 || code === 48) return 'Sương mù';
  if (code >= 51 && code <= 55) return 'Mưa phùn';
  if (code >= 61 && code <= 65) return 'Có mưa';
  if (code >= 71 && code <= 77) return 'Tuyết rơi';
  if (code >= 80 && code <= 82) return 'Mưa rào';
  if (code >= 95 && code <= 99) return 'Dông sét';
  return 'Thời tiết tốt';
};

export const getTabTitle = (route: string): string => {
  const path = route.toLowerCase().split('?')[0].replace(/\/$/, '') || '/';
  switch (path) {
    case '/':
    case '/home':
      return 'Home';
    case '/settings':
      return 'Settings';
    case '/live-tv':
      return 'Live TV';
    case '/channels':
      return 'Channels';
    case '/favorites':
      return 'Favorites';
    case '/news':
      return 'News';
    case '/schedule':
      return 'Schedule';
    case '/notes':
      return 'Notes';
    case '/widgets':
      return 'Widgets';
    case '/tiles':
    case '/live-tiles':
    case '/livetiles':
      return 'Tiles';
    case '/task-manager':
      return 'Task Manager';
    case '/friends':
      return 'People';
    case '/clock':
      return 'Clock';
    case '/photos':
      return 'Photos';
    case '/camera':
      return 'Camera';
    case '/browser':
    case '/edge':
      return 'Browser';
    case '/swift-bank':
    case '/bank':
    case '/swiftbank':
      return 'Swift Bank';
    case '/swift-social':
    case '/swift':
      return 'Swift Social';
    case '/cookbook':
      return 'Cookbook';
    case '/vlc':
    case '/media-player':
      return 'VLC';
    case '/photopea':
      return 'Photopea';
    case '/craftmine':
      return 'Craftmine';
    case '/copilot':
      return 'Copilot';
    case '/file-explorer':
    case '/files':
      return 'File Explorer';
    case '/paint':
    case '/ms-paint':
      return 'Paint';
    case '/ink-space':
    case '/inkspace':
    case '/ink-canvas':
    case '/inkcanvas':
      return 'Ink Canvas';
    case '/mail':
      return 'Mail';
    case '/calendar':
      return 'Calendar';
    case '/calculator':
    case '/calc':
      return 'Calculator';
    case '/snipping-tool':
    case '/snip':
    case '/snipping':
      return 'Snipping Tool';
    case '/feedback-hub':
    case '/feedback':
      return 'Feedback Hub';
    case '/updates':
      return 'Updates';
    case '/recall':
      return 'Recall';
    case '/about':
      return 'About';
    case '/search':
      return 'Search';
    default: {
      if (path.startsWith('/article')) return 'Article';
      const clean = path.replace(/^\//, '').replace(/[-_/]/g, ' ');
      return clean.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Home';
    }
  }
};

const getSearchPlaceholder = (path: string) => {
  if (path === '/search') return 'Find and search';
  if (path === '/' || path === '/home') return 'Search Home';
  if (path === '/recall' || path.startsWith('/recall')) return 'Search your history';
  if (path === '/news' || path.startsWith('/article') || path.startsWith('/news/')) return 'Search news articles';
  if (path === '/updates' || path.startsWith('/updates/')) return 'Find new updates';
  if (path === '/widgets' || path.startsWith('/widgets/')) return 'Type here to search';
  if (path === '/mail') return 'Search your inbox';
  if (path === '/calendar') return 'Search date and events';
  if (path === '/friends' || path === '/ban-be') return 'Search for people';
  if (path === '/copilot' || path.startsWith('/copilot/')) return 'Ask me anything';
  if (path === '/edge' || path === '/browser') return 'Type here to search';
  if (['/craftmine', '/bank', '/swift-bank', '/swiftbank', '/snipping-tool', '/snip', '/snipping', '/camera', '/swift-social', '/swift', '/logos-fandom', '/logos-wiki', '/fandom', '/minecraft-wiki', '/mc-wiki', '/wiki', '/file-explorer', '/files'].includes(path)) return 'Search';
  if (path === '/live-tv' || path.startsWith('/live-tv/') || path === '/channels') return 'Search for channels';
  if (path === '/notes' || ['/write', '/present', '/table'].includes(path)) return 'Search for notes or stickies';
  if (path === '/photos' || path.startsWith('/photos/')) return 'Search for photos';
  if (['/ink-space', '/inkspace', '/ink-canvas', '/inkcanvas'].includes(path)) return 'Search canvases';
  if (path === '/calculator' || path === '/calc') return 'Search calculations';
  if (path === '/task-manager' || path.startsWith('/task-manager/')) return 'Find tasks, services or PID';
  if (path === '/feedback-hub' || path === '/feedback') return 'Find suggestions or reports';
  if (path === '/photopea' || path.startsWith('/photopea/')) return 'Find actions and tools';
  if (path === '/settings' || path.startsWith('/settings/')) return 'Search for options';
  return `Search ${getTabTitle(path)}`;
};

interface SearchAspectItem {
  id: string;
  title: string;
  type: 'history' | 'page' | 'channel' | 'news' | 'setting' | 'tool';
  logo?: string;
  keywords?: string;
  onSelect: () => void;
}

interface TopBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
  settingsSearchQuery?: string;
  onSettingsSearchChange?: (query: string) => void;
  onOpenMobileMenu?: () => void;
  currentChannel?: Channel;
  channels?: Channel[];
  onSelectChannel?: (channel: Channel) => void;
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
  showUnsavedTooltip?: boolean;
  onDismissUnsavedTooltip?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
  settingsSearchQuery,
  onSettingsSearchChange,
  onOpenMobileMenu,
  currentChannel,
  channels = [],
  onSelectChannel,
  onOpenHelp = () => {},
  onOpenDiscord = () => {},
  onOpenSummarize = (_art?: NewsArticle) => {},
  onOpenTextToSpeech = (_art?: NewsArticle) => {},
  onOpenFindWords = () => {},
  onOpenAddStream = () => {},
  onImportChannels = () => {},
  fontSize = 16,
  onChangeFontSize = () => {},
  showUnsavedTooltip = false,
  onDismissUnsavedTooltip = () => {}
}) => {
  const { settings, hasChanges, applyDraftSettings } = useSettings();
  // WebView SDK follows the native layout: search stays on the left by default.
  const searchExperience = settings.windowsAppSdkPreview
    ? 'left'
    : (settings.experimentalSearchExperience || 'left');
  const isMobile = useIsMobile();
  const [logoError, setLogoError] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = currentRoute === '/settings' && settingsSearchQuery !== undefined
    ? settingsSearchQuery
    : localSearchQuery;
  const setSearchQuery = (query: string) => {
    setLocalSearchQuery(query);
    if (currentRoute === '/settings') onSettingsSearchChange?.(query);
  };
  const [isSearchFlyoutOpen, setIsSearchFlyoutOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Treatment 5: Real-time Search Highlights of today
  const [highlights, setHighlights] = useState<string[]>([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchHighlights = async () => {
      try {
        const res = await fetch('/api/vnexpress-news');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles) && data.articles.length > 0) {
            const titles = data.articles
              .slice(0, 10)
              .map((a: any) => a.title?.trim())
              .filter(Boolean);
            if (isMounted && titles.length > 0) {
              setHighlights(titles);
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch real-time search highlights:', e);
      }
    };

    fetchHighlights();
    const interval = setInterval(fetchHighlights, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Rotate highlight event text every 7 seconds
  useEffect(() => {
    if (highlights.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHighlightIndex((prev) => (prev + 1) % highlights.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [highlights.length]);

  // Treatment 6: Search Insights (Live Weather & Location Picker)
  const [insightLocation, setInsightLocation] = useState<InsightLocation>(() => {
    try {
      const saved = localStorage.getItem('waves_search_insight_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_INSIGHT_LOCATION;
  });

  const [insightWeather, setInsightWeather] = useState<{
    temperature: number;
    weathercode: number;
  } | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [customLocationResults, setCustomLocationResults] = useState<InsightLocation[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationPickerRef = useRef<HTMLDivElement>(null);

  // Close location picker when clicking outside
  useEffect(() => {
    if (!isLocationPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (locationPickerRef.current && !locationPickerRef.current.contains(e.target as Node)) {
        setIsLocationPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationPickerOpen]);

  // Fetch live weather with real-time updates every 60s
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        setIsWeatherLoading(true);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${insightLocation.lat}&longitude=${insightLocation.lon}&current_weather=true`
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        if (isMounted && data.current_weather) {
          setInsightWeather({
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
          });
        }
      } catch (e) {
        console.warn('Insight weather fetch error:', e);
      } finally {
        if (isMounted) setIsWeatherLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [insightLocation.lat, insightLocation.lon]);

  // Search custom city for location picker
  useEffect(() => {
    if (!locationSearchQuery.trim()) {
      setCustomLocationResults([]);
      setIsSearchingLocation(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            locationSearchQuery.trim()
          )}&count=6&language=vi`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && Array.isArray(data.results)) {
            setCustomLocationResults(
              data.results.map((r: any) => ({
                name: r.name,
                lat: r.latitude,
                lon: r.longitude,
                country: r.country || r.admin1 || '',
              }))
            );
          } else {
            setCustomLocationResults([]);
          }
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  const handleSelectLocation = (loc: InsightLocation) => {
    setInsightLocation(loc);
    try {
      localStorage.setItem('waves_search_insight_location', JSON.stringify(loc));
    } catch (e) {}
    setIsLocationPickerOpen(false);
    setLocationSearchQuery('');
  };

  const getSearchInsightsPlaceholder = () => {
    if (insightWeather !== null) {
      return `${insightLocation.name}: ${Math.round(insightWeather.temperature)}°C • ${getWeatherConditionDesc(insightWeather.weathercode)}`;
    }
    if (isWeatherLoading) {
      return `${insightLocation.name}: Đang cập nhật thời tiết...`;
    }
    return `${insightLocation.name}: 28°C • Search insights`;
  };

  // Speech Recognition for Copilot Voice Input
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          setIsSearchFlyoutOpen(true);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [navigate]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recognitionRef.current) {
      setIsSearchFlyoutOpen(true);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  // Search History from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vone_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HISTORY_ITEMS;
  });

  const saveToHistory = (query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed)].slice(0, 15);
      try {
        localStorage.setItem('vone_search_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Close flyout on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFlyoutOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isTopBarMode = settings.navigationMode === 'topbar';

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleApplySettings = () => {
    applyDraftSettings();
    onDismissUnsavedTooltip();
  };

  // Pre-configured App Aspects (Pages, Settings, Tools) with exact original naming
  const appAspects = useMemo(() => {
    const aspects: SearchAspectItem[] = [
      // Pages
      { id: 'page-home', title: 'Home', keywords: 'trang chủ home overview', type: 'page', onSelect: () => navigate('/') },
      { id: 'page-watch', title: 'Watch', keywords: 'live tv xem truyền hình trực tuyến watch', type: 'page', onSelect: () => navigate('/live-tv') },
      { id: 'page-news', title: 'Articles', keywords: 'tin tức bài viết news articles', type: 'page', onSelect: () => navigate('/news') },
      { id: 'page-channels', title: 'Channels', keywords: 'danh sách kênh channels channel directory', type: 'page', onSelect: () => navigate('/channels') },
      { id: 'page-favs', title: 'Favorites', keywords: 'kênh yêu thích favorites favs', type: 'page', onSelect: () => navigate('/favorites') },
      { id: 'page-updates', title: 'Updates', keywords: 'cập nhật phiên bản updates changelog', type: 'page', onSelect: () => navigate('/updates') },
      { id: 'page-craftmine', title: 'Craftmine', keywords: 'minecraft preview web game', type: 'page', onSelect: () => navigate('/craftmine') },
      { id: 'page-photopea', title: 'Photopea', keywords: 'photopea photoshop chỉnh sửa ảnh đồ họa psd photo editor web app', type: 'page', onSelect: () => navigate('/photopea') },
      { id: 'page-msn', title: 'MSN Feed', keywords: 'msn feed tin tức báo chí thời tiết giải trí web msn.com', type: 'page', onSelect: () => navigate('/msn') },
      { id: 'page-vlc', title: 'VLC Media Player', keywords: 'vlc media player video audio stream movie phát nhạc video âm thanh', type: 'page', onSelect: () => navigate('/vlc') },
      { id: 'page-schedule', title: 'Lịch phát sóng', keywords: 'lịch phát sóng schedule epg tv guide truyền hình vtv htv', type: 'page', onSelect: () => navigate('/schedule') },
      { id: 'page-cookbook', title: 'Cookbook', keywords: 'cookbook công thức nấu ăn ẩm thực món ngon recipes', type: 'page', onSelect: () => navigate('/cookbook') },
      { id: 'page-swift', title: 'Swift Social', keywords: 'swift mạng xã hội social threads twitter facebook instagram discord feed chat', type: 'page', onSelect: () => navigate('/swift') },
      { id: 'page-friends', title: 'People (Bạn bè)', keywords: 'friends people bạn bè 100 người dùng cộng đồng nicknames', type: 'page', onSelect: () => navigate('/friends') },
      { id: 'page-notes', title: 'Notes', keywords: 'ghi chú soạn thảo notes office', type: 'page', onSelect: () => navigate('/notes') },
      { id: 'page-taskmanager', title: 'Task Manager', keywords: 'task manager quản lý tác vụ processes system performance', type: 'page', onSelect: () => navigate('/task-manager') },
      { id: 'page-widgets', title: 'Widgets', keywords: 'widgets tiện ích bảng tiện ích weather thời tiết lịch vnexpress tin tức', type: 'page', onSelect: () => navigate('/widgets') },
      { id: 'page-tiles', title: 'Tiles', keywords: 'tiles live tiles màn hình start metro ô ghim', type: 'page', onSelect: () => navigate('/tiles') },
      { id: 'page-mail', title: 'Mail', keywords: 'mail email hộp thư điện tử outlook fluent mail', type: 'page', onSelect: () => navigate('/mail') },
      { id: 'page-calendar', title: 'Calendar', keywords: 'calendar lịch lịch vạn niên sự kiện fluent calendar', type: 'page', onSelect: () => navigate('/calendar') },
      { id: 'page-ink-canvas', title: 'Ink Canvas', keywords: 'ink canvas vẽ infinite canvas bảng vẽ bút vẽ ink space', type: 'page', onSelect: () => navigate('/ink-space') },
      { id: 'page-settings', title: 'Settings', keywords: 'cài đặt hệ thống settings preferences', type: 'page', onSelect: () => navigate('/settings') },
      { id: 'page-about', title: 'About', keywords: 'giới thiệu about sparkle sparkle dev', type: 'page', onSelect: () => navigate('/about') },

      // Settings Shortcuts
      { id: 'set-sideview', title: 'Side View', keywords: 'settings side view thanh bên', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-darkmode', title: 'Dark / Light Mode', keywords: 'settings dark light mode giao diện tối sáng', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-spatialglass', title: 'Spatial Glass & Blur', keywords: 'settings spatial glass acrylic blur kính mờ', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-fontscale', title: 'Text Scaling & Typography', keywords: 'settings text scaling font size zoom cỡ chữ', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-keyboard', title: 'Native Virtual Keyboard', keywords: 'settings native virtual keyboard bàn phím ảo', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-aspect', title: 'Stream Aspect Ratio', keywords: 'settings stream aspect ratio tỉ lệ khung hình 16:9 4:3', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-autohide', title: 'Auto-hide Side View', keywords: 'settings auto hide sidebar collapse tự động ẩn thanh bên', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-motion', title: 'Motion & Movements', keywords: 'settings motion movements animation reduce chuyển động hiệu ứng', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-search', title: 'Customize Search Categories', keywords: 'settings search spotlight categories tìm kiếm tv news channels', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-keybinds', title: 'Custom Keybinds & Shortcuts', keywords: 'settings keybinds shortcuts keyboard phím tắt', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-navigation', title: 'Navigation Bar', keywords: 'settings navigation bar side view topbar floaty thanh điều hướng', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-opacity', title: 'Transparency & Opacity', keywords: 'settings transparency opacity độ trong suốt', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-experimental', title: 'Experimental Features', keywords: 'settings experimental dev preview beta thử nghiệm', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-reset', title: 'Reset Settings', keywords: 'settings reset restore defaults khôi phục mặc định', type: 'setting', onSelect: () => navigate('/settings') },

      // Tools
      { id: 'tool-sticky', title: 'Sticky Note', keywords: 'tools sticky note ghi chú dán', type: 'tool', onSelect: () => navigate('/notes') },
      { id: 'tool-tts', title: 'Text-to-Speech Player', keywords: 'tools text-to-speech tts đọc bài viết', type: 'tool', onSelect: () => onOpenTextToSpeech(NEWS_DATA[0]) },
      { id: 'tool-findwords', title: 'Find Words', keywords: 'tools find words tìm từ trong trang', type: 'tool', onSelect: () => onOpenFindWords() },
      { id: 'tool-addstream', title: 'Add Custom Stream', keywords: 'tools add custom stream thêm luồng phát', type: 'tool', onSelect: () => onOpenAddStream() },
      { id: 'tool-discord', title: 'Discord Community', keywords: 'community discord sparkle dev', type: 'tool', onSelect: () => window.open('https://discord.gg/wcdjaDDayK', '_blank') }
    ];

    // Channels
    channels.forEach((ch) => {
      aspects.push({
        id: `channel-${ch.id}`,
        title: ch.name,
        keywords: `${ch.category} ${ch.shortName || ''} ${ch.slug}`,
        type: 'channel',
        logo: ch.logo,
        onSelect: () => {
          if (onSelectChannel) onSelectChannel(ch);
          navigate(`/live-tv?channel=${ch.slug}`);
        }
      });
    });

    // News
    NEWS_DATA.forEach((art) => {
      aspects.push({
        id: `article-${art.id}`,
        title: art.title,
        keywords: `${art.category} ${art.excerpt || ''}`,
        type: 'news',
        onSelect: () => navigate(`/article/${art.id}`)
      });
    });

    return aspects;
  }, [channels, navigate, onSelectChannel, onOpenTextToSpeech, onOpenFindWords, onOpenAddStream]);

  // Filtered search results for flyout
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Empty input: render recent search history (matches user screenshot)
      return searchHistory.map((hist, idx) => ({
        id: `history-${idx}`,
        title: hist,
        type: 'history' as const,
        onSelect: () => {
          setSearchQuery(hist);
          saveToHistory(hist);
          // If query matches a known page/aspect
          const match = appAspects.find((a) => a.title.toLowerCase().includes(hist.toLowerCase()));
          if (match) {
            match.onSelect();
          } else {
            navigate(`/channels?search=${encodeURIComponent(hist)}`);
          }
          setIsSearchFlyoutOpen(false);
        }
      }));
    }

    // When query is typed: match every aspect of the app
    const matches: SearchAspectItem[] = [];

    // History matches
    searchHistory.forEach((hist, idx) => {
      if (hist.toLowerCase().includes(q)) {
        matches.push({
          id: `hist-match-${idx}`,
          title: hist,
          type: 'history',
          onSelect: () => {
            setSearchQuery(hist);
            saveToHistory(hist);
            navigate(`/channels?search=${encodeURIComponent(hist)}`);
            setIsSearchFlyoutOpen(false);
          }
        });
      }
    });

    // App aspects matches
    appAspects.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || (item.keywords && item.keywords.toLowerCase().includes(q))) {
        matches.push(item);
      }
    });

    // Return ALL matches
    return matches;
  }, [searchQuery, searchHistory, appAspects, navigate]);

  const handleSelectSearchResult = (item: SearchAspectItem) => {
    saveToHistory(item.title);
    item.onSelect();
    setIsSearchFlyoutOpen(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      saveToHistory(query);
      if (query.startsWith('/find') || query.startsWith('/search')) {
        // Action command /find hoặc /search: tìm kiếm với copilot
        setIsSearchFlyoutOpen(true);
      } else {
        setIsSearchFlyoutOpen(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    } else {
      setIsSearchFlyoutOpen(false);
      onOpenSearch();
    }
  };

  return (
    <header className={`topbar-header w-full h-14 relative ${
      settings.windowsAppSdkPreview ? '!bg-[#141414] !border-0 !border-b-0' : 'bg-[#f3f3f3] dark:bg-[#1b1f24]'
    } pl-3 sm:pl-4 pr-1.5 sm:pr-2 flex items-center justify-between gap-2 sticky top-0 z-30 select-none`}>
      {/* 1. Left Section */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
        {settings.navigationMode !== 'floaty' && (
          <motion.button
            id="btn-mobile-menu-toggle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenMobileMenu}
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 transition-transform text-black dark:text-white" />
          </motion.button>
        )}

        {isTopBarMode && (
          <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Main Navigation">
            {/* Home */}
            <button
              id="btn-topbar-nav-home"
              type="button"
              onClick={() => navigate('/')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/' || currentRoute === '/home'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Home"
            >
              <FluentHomeIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Home</span>

              {(currentRoute === '/' || currentRoute === '/home') && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Watch */}
            <button
              id="btn-topbar-nav-tv"
              type="button"
              onClick={() => navigate('/live-tv')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/live-tv'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Watch"
            >
              <FluentLiveTvIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Watch</span>

              {currentRoute === '/live-tv' && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Articles */}
            <button
              id="btn-topbar-nav-news"
              type="button"
              onClick={() => navigate('/news')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/news' || currentRoute.startsWith('/article')
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Articles"
            >
              <FluentNewsIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Articles</span>

              {(currentRoute === '/news' || currentRoute.startsWith('/article')) && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Widgets */}
            <button
              id="btn-topbar-nav-widgets"
              type="button"
              onClick={() => navigate('/widgets')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/widgets' || currentRoute.startsWith('/widgets')
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Widgets"
            >
              <FluentWidgetsIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Widgets</span>

              {(currentRoute === '/widgets' || currentRoute.startsWith('/widgets')) && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Tiles */}
            <button
              id="btn-topbar-nav-tiles"
              type="button"
              onClick={() => navigate('/tiles')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Tiles"
            >
              <FluentTilesIcon className="w-4 h-4 shrink-0 text-[#0078d4] dark:text-[#4cc2ff]" />
              <span>Tiles</span>

              {(currentRoute === '/tiles' || currentRoute === '/live-tiles' || currentRoute === '/livetiles') && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>
          </nav>
        )}
      </div>

      {/* 2. Right-Aligned Search Box with Flyout - positioned close to right margin */}
      <div 
        ref={searchContainerRef}
        className="flex items-center justify-end min-w-0 pl-1 pr-0 z-40 ml-auto mr-0 transition-[max-width,width] duration-300 ease-out"
      >
        <div className={`relative w-[210px] sm:w-[250px] md:w-[290px] min-w-0 transition-[max-width,width] duration-300 ease-out ${
          (settings.searchVisualExperimental || 'treatment-1') === 'treatment-5'
            ? 'w-auto max-w-full flex justify-end'
            : ''
        } ${
          (settings.searchVisualExperimental || 'treatment-1') === 'treatment-2'
            ? 'flex justify-end'
            : (settings.searchVisualExperimental || 'treatment-1') === 'treatment-3'
            ? 'flex justify-center'
            : (settings.searchVisualExperimental || 'treatment-1') === 'treatment-4'
            ? 'flex justify-end'
            : ''
        }`}>
          {(settings.searchVisualExperimental || 'treatment-1') === 'treatment-2' ? (
            /* Treatment 2: Search button corner - search icon at the right corner of the search bar area */
            <button
              id="topbar-search-button-corner"
              type="button"
              onClick={() => setIsSearchFlyoutOpen((prev) => !prev)}
              className={`w-9 h-9 flex items-center justify-center rounded-[6px] transition-all cursor-pointer ${
                isSearchFlyoutOpen
                  ? 'bg-black/10 dark:bg-white/15 ring-2 ring-[#0078d4] dark:ring-[#4cc2ff]'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15'
              }`}
              title="Search"
              aria-label="Search"
            >
              <img
                src={EXPERIMENTAL_SEARCH_ICON_URL}
                alt="Search"
                referrerPolicy="no-referrer"
                className="w-5 h-5 object-contain select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-search-icon')) {
                    const fallback = document.createElement('span');
                    fallback.className = 'fallback-search-icon text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center';
                    fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
                    parent.appendChild(fallback);
                  }
                }}
              />
            </button>
          ) : (settings.searchVisualExperimental || 'treatment-1') === 'treatment-3' ? (
            /* Treatment 3: Search button center - search icon in the center of the search bar area */
            <button
              id="topbar-search-button-center"
              type="button"
              onClick={() => setIsSearchFlyoutOpen((prev) => !prev)}
              className={`w-9 h-9 flex items-center justify-center rounded-[6px] transition-all cursor-pointer ${
                isSearchFlyoutOpen
                  ? 'bg-black/10 dark:bg-white/15 ring-2 ring-[#0078d4] dark:ring-[#4cc2ff]'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15'
              }`}
              title="Search"
              aria-label="Search"
            >
              <img
                src={EXPERIMENTAL_SEARCH_ICON_URL}
                alt="Search"
                referrerPolicy="no-referrer"
                className="w-5 h-5 object-contain select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-search-icon')) {
                    const fallback = document.createElement('span');
                    fallback.className = 'fallback-search-icon text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center';
                    fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
                    parent.appendChild(fallback);
                  }
                }}
              />
            </button>
          ) : (settings.searchVisualExperimental || 'treatment-1') === 'treatment-4' ? (
            /* Treatment 4: Search pill - shorter, pill-shaped button, borderless, turns blue gradient when clicked */
            <button
              id="topbar-search-pill"
              type="button"
              onClick={() => setIsSearchFlyoutOpen((prev) => !prev)}
              className={`group relative h-8.5 sm:h-9 px-4 rounded-full flex items-center gap-2 transition-all duration-200 cursor-pointer select-none font-medium text-xs sm:text-[13px] border-0 border-none !border-none ${
                isSearchFlyoutOpen
                  ? 'bg-gradient-to-r from-[#005fb8] via-[#0078d4] to-[#4cc2ff] text-white shadow-[0_2px_14px_rgba(0,120,212,0.45)] scale-[1.02]'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,.14)] text-[#d1d5db]'
              }`}
              title="Search"
              aria-label="Search"
            >
              <Search className={`w-4 h-4 shrink-0 transition-colors ${
                isSearchFlyoutOpen ? 'text-white' : 'text-[#71717a] dark:text-[#a0a6b2] group-hover:text-black dark:group-hover:text-white'
              }`} />
              <span className="truncate max-w-[120px] sm:max-w-[150px]">
                {searchQuery.trim() || 'Search'}
              </span>
            </button>
          ) : (settings.searchVisualExperimental || 'treatment-1') === 'treatment-5' ? (
            /* Treatment 5: Search highlights - borderless pill, today's real-time event placeholder, adaptive width according to text length */
            <button
              id="topbar-search-highlights"
              type="button"
              onClick={() => setIsSearchFlyoutOpen((prev) => !prev)}
              className={`group relative h-8.5 sm:h-9 w-auto max-w-full px-3.5 sm:px-4.5 rounded-full flex items-center gap-2 transition-[background-color,box-shadow,transform,width,max-width,padding] duration-300 ease-out cursor-pointer select-none font-medium text-xs sm:text-[13px] border-0 border-none !border-none ${
                isSearchFlyoutOpen
                  ? 'bg-gradient-to-r from-[#005fb8] via-[#0078d4] to-[#4cc2ff] text-white shadow-[0_2px_14px_rgba(0,120,212,0.45)] scale-[1.02]'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,.14)] text-[#d1d5db]'
              }`}
              title={highlights[currentHighlightIndex] || 'Search highlights - Sự kiện hôm nay'}
              aria-label="Search highlights"
            >
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <Search className={`w-4 h-4 shrink-0 transition-colors ${
                  isSearchFlyoutOpen ? 'text-white' : 'text-[#71717a] dark:text-[#a0a6b2] group-hover:text-black dark:group-hover:text-white'
                }`} />
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentHighlightIndex}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.25 }}
                  className="truncate whitespace-nowrap max-w-[220px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[560px] text-left text-xs sm:text-[13px]"
                >
                  {searchQuery.trim() || highlights[currentHighlightIndex] || 'Sự kiện hôm nay: Tin tức thời sự 24h'}
                </motion.span>
              </AnimatePresence>
            </button>
          ) : (settings.searchVisualExperimental || 'treatment-1') === 'treatment-6' ? (
            /* Treatment 6: Search insights - Real-time temperature placeholder with map icon to change location */
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div
                id="topbar-search-box"
                onClick={() => {
                  setIsSearchFlyoutOpen(true);
                }}
                data-flyout-open={isSearchFlyoutOpen ? "true" : "false"}
                className="fluent-search-box windows-search-box group relative w-full h-8.5 sm:h-9 rounded-none flex items-center px-2.5 gap-1.5 transition-all cursor-text select-none"
              >
                {/* Input with real-time temperature placeholder */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFlyoutOpen(true);
                  }}
                  onClick={() => {
                    setIsSearchFlyoutOpen(true);
                  }}
                  onFocus={() => {
                    setIsSearchFlyoutOpen(true);
                  }}
                  placeholder={getSearchInsightsPlaceholder()}
                  title={getSearchInsightsPlaceholder()}
                  className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#0078d4] dark:placeholder-[#4cc2ff] font-medium outline-none border-none py-1 pl-1 pr-24 no-fluent-line"
                />

                {/* Right Action Icons: Map Icon to change location, Clear button & Search Icon */}
                <div className="absolute right-2 flex items-center gap-1 z-10">
                  {/* Map Pin icon button on search box */}
                  <button
                    id="topbar-search-map-location-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLocationPickerOpen((prev) => !prev);
                    }}
                    title={`Vị trí: ${insightLocation.name} (Bấm để thay đổi location)`}
                    aria-label="Thay đổi vị trí"
                    className={`p-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center justify-center ${
                      isLocationPickerOpen
                        ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]'
                        : 'text-[#0078d4] dark:text-[#4cc2ff] hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                  </button>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFlyoutOpen(false);
                      }}
                      title="Clear search"
                      className="text-[#71717a] dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white p-1 transition-colors cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="submit"
                    title="Search"
                    className="p-1 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {searchQuery.trim() ? (
                      <SpinningRing size={16} strokeWidth={3.5} color="#4cc2ff" />
                    ) : (
                      <FluentSearchIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Location Picker Popover */}
              <AnimatePresence>
                {isLocationPickerOpen && (
                  <motion.div
                    ref={locationPickerRef}
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-[310px] max-w-[92vw] rounded-[10px] bg-white/98 dark:bg-[#202328]/98 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.35)] p-3 z-50 select-none text-[#111827] dark:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10 dark:border-white/10">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-[#111827] dark:text-white">
                        <MapPin className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
                        <span>Thay đổi vị trí (Location)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLocationPickerOpen(false)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Search custom city */}
                    <div className="relative mb-2.5">
                      <input
                        type="text"
                        value={locationSearchQuery}
                        onChange={(e) => setLocationSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm thành phố..."
                        className="w-full h-8 pl-3 pr-8 text-xs rounded-[6px] bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[#111827] dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4] dark:focus:ring-[#4cc2ff]"
                      />
                      <FluentSearchIcon className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Current location weather preview */}
                    <div className="mb-2 p-2 rounded-[6px] bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-[#0078d4] dark:text-[#4cc2ff] truncate">
                          {insightLocation.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">• Hiện tại</span>
                      </div>
                      <span className="font-bold text-[#0078d4] dark:text-[#4cc2ff] shrink-0">
                        {insightWeather ? `${Math.round(insightWeather.temperature)}°C • ${getWeatherConditionDesc(insightWeather.weathercode)}` : (isWeatherLoading ? 'Đang cập nhật...' : '...')}
                      </span>
                    </div>

                    {/* Popular / Searched Locations */}
                    <div className="max-h-[190px] overflow-y-auto space-y-0.5 pr-1 text-xs">
                      {isSearchingLocation ? (
                        <div className="py-4 text-center text-xs text-neutral-400">Đang tìm thành phố...</div>
                      ) : locationSearchQuery.trim() && customLocationResults.length > 0 ? (
                        customLocationResults.map((loc, idx) => (
                          <button
                            key={`${loc.name}-${loc.lat}-${idx}`}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                              insightLocation.name === loc.name ? 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-medium' : ''
                            }`}
                          >
                            <div className="truncate">
                              <span className="font-medium">{loc.name}</span>
                              {loc.country && <span className="text-[11px] text-neutral-400 ml-1.5">({loc.country})</span>}
                            </div>
                            {insightLocation.name === loc.name && <Check className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff] shrink-0" />}
                          </button>
                        ))
                      ) : (
                        POPULAR_LOCATIONS.map((loc) => {
                          const isSelected = insightLocation.name === loc.name;
                          return (
                            <button
                              key={loc.name}
                              type="button"
                              onClick={() => handleSelectLocation(loc)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                                isSelected ? 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-medium' : ''
                              }`}
                            >
                              <div className="truncate">
                                <span className="font-medium">{loc.name}</span>
                                <span className="text-[11px] text-neutral-400 ml-1.5">({loc.country})</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          ) : (
            /* Treatment 1: Search box (default) */
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div
                id="topbar-search-box"
                onClick={() => {
                  setIsSearchFlyoutOpen(true);
                }}
                data-flyout-open={isSearchFlyoutOpen ? "true" : "false"}
                className="fluent-search-box windows-search-box group relative w-full h-8.5 sm:h-9 rounded-none flex items-center px-2.5 gap-1.5 transition-all cursor-text select-none"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFlyoutOpen(true);
                  }}
                  onClick={() => {
                    setIsSearchFlyoutOpen(true);
                  }}
                  onFocus={() => {
                    setIsSearchFlyoutOpen(true);
                  }}
                  placeholder={getSearchPlaceholder(currentRoute)}
                  className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#a0a6b2] outline-none border-none py-1 pl-1 pr-16 no-fluent-line"
                />

                {/* Right Action Icons: Clear button and Right Search Icon */}
                <div className="absolute right-2 flex items-center gap-1 z-10">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFlyoutOpen(false);
                      }}
                      title="Clear search"
                      className="text-[#71717a] dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white p-1 transition-colors cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    title="Search"
                    className="p-1 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {searchQuery.trim() ? (
                      <SpinningRing size={16} strokeWidth={3.5} color="#4cc2ff" />
                    ) : (
                      <FluentSearchIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Integrated AI Copilot Chat & Search Flyout */}
          {isSearchFlyoutOpen && (
            <CopilotChatFlyout
              isOpen={isSearchFlyoutOpen}
              onClose={() => setIsSearchFlyoutOpen(false)}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              appAspects={appAspects}
              navigate={navigate}
            />
          )}
        </div>
      </div>

      {/* 3. Right Action Icons: Settings Gear */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
        {/* TopBar Mode: Settings Gear Icon */}
        {isTopBarMode && (
          <button
            id="btn-top-settings-gear"
            onClick={handleSettingsClick}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              currentRoute === '/settings'
                ? 'bg-black/10 dark:bg-white/15'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Settings"
          >
            <img 
              src={SETTINGS_ICON_SRC}
              alt="Settings"
              referrerPolicy="no-referrer"
              className={`w-5 h-5 object-contain shrink-0 brightness-0 dark:brightness-0 dark:invert transition-opacity duration-200 ${
                currentRoute === '/settings' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            />
          </button>
        )}

        {/* In Settings tab: Fluent Save Button */}
        {currentRoute === '/settings' ? (
          <div className="relative flex items-center justify-center ml-1">
            <button
              id="btn-top-settings-apply-checkbox"
              type="button"
              onClick={handleApplySettings}
              className={`px-4 py-1.5 rounded-[4px] font-semibold text-white dark:text-black bg-[#4cc2ff] hover:bg-[#6bd0ff] active:bg-[#3bb2ef] transition-colors text-xs sm:text-[13px] cursor-default flex items-center justify-center shrink-0 border-b-2 border-black/25 shadow-xs select-none ${
                hasChanges 
                  ? 'ring-2 ring-[#4cc2ff]/50' 
                  : ''
              } ${showUnsavedTooltip ? 'animate-shake' : ''}`}
              title={
                hasChanges
                  ? "Unsaved changes. Click to save!"
                  : "All settings saved"
              }
              aria-label={hasChanges ? "Save settings" : "Settings saved"}
            >
              <span className="font-semibold">Save</span>
            </button>

            {/* Unsaved Settings Warning Tooltip */}
            <AnimatePresence>
              {showUnsavedTooltip && (
                <motion.div
                  id="settings-unsaved-tooltip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 z-50 flex flex-col items-end pointer-events-auto"
                >
                  <div className="px-3 py-1.5 rounded-[4px] bg-[#2c2c2c] border border-[#3e3e3e] text-white shadow-xl flex items-center gap-2 whitespace-nowrap text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#4cc2ff] shrink-0" />
                    <span>Please save changes before leaving</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </header>
  );
};
