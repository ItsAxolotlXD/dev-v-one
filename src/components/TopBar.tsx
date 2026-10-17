import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, History, X, Mic, MicOff, Search } from 'lucide-react';
import { 
  FluentHomeIcon, 
  FluentLiveTvIcon, 
  FluentNewsIcon, 
  FluentMicOutlineIcon,
  FluentMicOffOutlineIcon,
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
    case '/task-manager':
      return 'Task Manager';
    case '/friends':
      return 'Friends';
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
    : (settings.experimentalSearchExperience || 'right');
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
      { id: 'page-friends', title: 'Friends (Bạn bè)', keywords: 'friends bạn bè 100 người dùng cộng đồng nicknames', type: 'page', onSelect: () => navigate('/friends') },
      { id: 'page-notes', title: 'Notes', keywords: 'ghi chú soạn thảo notes office', type: 'page', onSelect: () => navigate('/notes') },
      { id: 'page-taskmanager', title: 'Task Manager', keywords: 'task manager quản lý tác vụ processes system performance', type: 'page', onSelect: () => navigate('/task-manager') },
      { id: 'page-widgets', title: 'Widgets', keywords: 'widgets tiện ích bảng tiện ích weather thời tiết lịch vnexpress tin tức', type: 'page', onSelect: () => navigate('/widgets') },
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
    } px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-30 select-none`}>
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
          </nav>
        )}
      </div>

      {/* 2. Center Search Box with Flyout matching Microsoft Fluent Design and reference image */}
      <div 
        ref={searchContainerRef}
        className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4 z-40 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[460px]"
      >
        <div className="relative w-full max-w-[460px] min-w-0 mx-auto">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div
              id="topbar-search-box"
              onClick={() => {
                setIsSearchFlyoutOpen(true);
              }}
              data-flyout-open={isSearchFlyoutOpen ? "true" : "false"}
              className={`fluent-search-box group relative w-full h-8.5 sm:h-9 ${
                settings.windowsAppSdkPreview
                  ? '!h-[38px] !min-h-[38px] !rounded-[9999px] !bg-[#1f1f1f] !border-0 !border-none !border-b-0 !shadow-none'
                  : settings.roundedSearchBox
                    ? 'rounded-full bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10'
                    : 'rounded-[8px] bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10'
              } flex items-center px-2.5 gap-1.5 transition-all cursor-text select-none ${
                settings.windowsAppSdkPreview
                  ? '!border-0 !border-none !ring-0 !outline-none'
                  : `focus-within:ring-1 focus-within:ring-[#0078d4]/30 dark:focus-within:ring-[#4cc2ff]/30 focus-within:border-b-2 focus-within:border-b-[#005fb8] dark:focus-within:border-b-[#4cc2ff] ${
                      isSearchFlyoutOpen && !settings.roundedSearchBox
                        ? 'border-b-2 border-b-[#005fb8] dark:border-b-[#4cc2ff]'
                        : ''
                    }`
              }`}
            >
              {/* Left Search Icon (if Move search to the left is active OR WebView SDK is enabled) */}
              {(searchExperience === 'left' || settings.windowsAppSdkPreview) && (
                <button
                  type="submit"
                  title="Search"
                  className="text-[#a7a7a7] hover:text-white p-1 transition-colors cursor-pointer flex items-center justify-center shrink-0 -ml-0.5 mr-0"
                >
                  {searchQuery.trim() ? (
                    <SpinningRing size={14} strokeWidth={3.5} color="#4cc2ff" />
                  ) : (
<Search className="size-[20px] shrink-0" strokeWidth={1.7} />
                  )}
                </button>
              )}

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
                placeholder={`Search ${getTabTitle(currentRoute)}`.replace(/\b\w/g, (c) => c.toUpperCase())}
                className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#a0a6b2] outline-none border-none py-1 pr-9 no-fluent-line"
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

                {searchExperience !== 'left' && !settings.windowsAppSdkPreview && searchExperience !== 'hidden' && (
                  <button
                    type="submit"
                    title="Search"
                    className="text-[#71717a] dark:text-neutral-200 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] p-1 transition-colors cursor-pointer flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {searchQuery.trim() ? (
<SpinningRing size={17} strokeWidth={3.5} color="#4cc2ff" />
                    ) : (
<Search className="size-[18px] shrink-0" strokeWidth={2.2} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

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
