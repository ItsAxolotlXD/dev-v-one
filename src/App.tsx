import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { SpotlightModal } from './components/SpotlightModal';
import { CustomStreamModal } from './components/CustomStreamModal';
import { WelcomeModal } from './components/WelcomeModal';
import { UnderConstructionModal } from './components/UnderConstructionModal';
import { UnsavedSettingsModal } from './components/UnsavedSettingsModal';
import { HelpModal } from './components/HelpModal';
import { NewsSummaryModal } from './components/NewsSummaryModal';
import { FindWordsBar } from './components/FindWordsBar';
import { AddStreamModal } from './components/AddStreamModal';
import { TextToSpeechPlayer } from './components/TextToSpeechPlayer';
import { SplashScreen } from './components/SplashScreen';
import { NativeKeyboard } from './components/NativeKeyboard';
import { NativeKeyboardProvider } from './context/NativeKeyboardContext';
import { NotesProvider } from './context/NotesContext';
import { StickyNoteWidget } from './components/StickyNoteWidget';
import { TabLoadingScreen } from './components/TabLoadingScreen';
import { GlobalContextMenu } from './components/GlobalContextMenu';
import { Home } from './pages/Home';
import { LiveTV } from './pages/LiveTV';
import { TestChannels } from './pages/TestChannels';
import { News } from './pages/News';
import { Article } from './pages/Article';
import { Channels } from './pages/Channels';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';
import { ImmersiveSearch } from './pages/ImmersiveSearch';
import { NotesApp } from './pages/NotesApp';
import { Craftmine } from './pages/Craftmine';
import { Updates } from './pages/Updates';
import { TaskManager } from './pages/TaskManager';
import { Widgets } from './pages/Widgets';
import { CopilotPage } from './pages/CopilotPage';
import { FileExplorer } from './pages/FileExplorer';
import { MSPaint } from './pages/MSPaint';
import { InkSpace } from './pages/InkSpace';
import { PhotosApp } from './pages/PhotosApp';
import { EdgeBrowser } from './pages/EdgeBrowser';
import { CameraApp } from './pages/CameraApp';
import { SwiftBank } from './pages/SwiftBank';
import { ClockApp } from './pages/ClockApp';
import { VlcPlayer } from './pages/VlcPlayer';
import { Photopea } from './pages/Photopea';
import { ScheduleApp } from './pages/ScheduleApp';
import { Cookbook } from './pages/Cookbook';
import { SwiftSocial } from './pages/SwiftSocial';
import { FriendsApp } from './pages/FriendsApp';
import { LogosFandom } from './pages/LogosFandom';
import { MinecraftWiki } from './pages/MinecraftWiki';
import { Calculator } from './pages/Calculator';
import { SnippingTool } from './pages/SnippingTool';
import { FeedbackHub } from './pages/FeedbackHub';
import { MicrosoftStore } from './pages/MicrosoftStore';
import { SparkOS } from './pages/SparkOS';
import { getStoreAppForRoute } from './data/storeApps';
import { ProductivityTab } from './pages/ProductivityTabs';
import { SpinningRing } from './components/SpinningRing';
import { CHANNELS_DATA } from './data/channels';
import { NEWS_DATA } from './data/news';
import { Channel, NewsArticle } from './types';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSystemTasks } from './context/SystemTasksContext';

export default function App() {
  const { isSystemCrashed, crashPhase, crashReason, restartSystem } = useSystemTasks();
  const { settings, draftSettings, hasChanges, applyDraftSettings, discardDraftSettings } = useSettings();

  // Tooltip & navigation block for unsaved settings
  const [showUnsavedTooltip, setShowUnsavedTooltip] = useState(false);
  const unsavedTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerUnsavedTooltip = useCallback(() => {
    setShowUnsavedTooltip(true);
    if (unsavedTooltipTimerRef.current) clearTimeout(unsavedTooltipTimerRef.current);
    unsavedTooltipTimerRef.current = setTimeout(() => {
      setShowUnsavedTooltip(false);
    }, 4500);
  }, []);

  // When changes are saved or cleared, hide tooltip
  useEffect(() => {
    if (!hasChanges) {
      setShowUnsavedTooltip(false);
    }
  }, [hasChanges]);

  useEffect(() => {
    return () => {
      if (unsavedTooltipTimerRef.current) clearTimeout(unsavedTooltipTimerRef.current);
    };
  }, []);

  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('microsoft_store_installed_apps') || '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });

  // Navigation Route State (supports browser pathname or internal state)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const initialPath = window.location.pathname === '/' ? '/' : window.location.pathname;
    const requestedApp = getStoreAppForRoute(initialPath);
    return requestedApp && !installedApps.includes(requestedApp.id) ? '/store' : initialPath;
  });

  useEffect(() => {
    const requestedApp = getStoreAppForRoute(window.location.pathname);
    if (requestedApp && !installedApps.includes(requestedApp.id)) {
      window.history.replaceState(null, '', `/store?app=${requestedApp.id}`);
    }
  }, []);
  const [routeState, setRouteState] = useState<any>(null);
  const previousRouteRef = useRef<string>('/');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [tabLoadCount, setTabLoadCount] = useState(0);
  const tabLoadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTabLoading(true);
    tabLoadingTimerRef.current = setTimeout(() => {
      setIsTabLoading(false);
      setTabLoadCount((c) => c + 1);
    }, 400);

    return () => {
      if (tabLoadingTimerRef.current) clearTimeout(tabLoadingTimerRef.current);
    };
  }, []);



  // Tab-specific search state for Floating Search Bar
  const [tabSearchQueries, setTabSearchQueries] = useState<Record<string, string>>({});
  const currentTabSearchQuery = tabSearchQueries[currentRoute] || '';
  const handleTabSearchChange = (query: string) => {
    setTabSearchQueries((prev) => ({
      ...prev,
      [currentRoute]: query
    }));
  };

  // Channels State (base channels + imported channels from localStorage)
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('waves_custom_channels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...CHANNELS_DATA, ...parsed];
      } catch {
        return CHANNELS_DATA;
      }
    }
    return CHANNELS_DATA;
  });

  // Current Active Channel for Live TV Player
  const [currentChannel, setCurrentChannel] = useState<Channel>(() => {
    // Check if URL has ?channel=slug
    const urlParams = new URLSearchParams(window.location.search);
    const channelSlug = urlParams.get('channel');
    if (channelSlug) {
      const matched = CHANNELS_DATA.find((c) => c.slug === channelSlug);
      if (matched) return matched;
    }
    try {
      const savedRecentId = localStorage.getItem('vplay_recent_channel_id');
      if (savedRecentId) {
        const found = CHANNELS_DATA.find((c) => c.id === savedRecentId);
        if (found) return found;
      }
    } catch {}
    return CHANNELS_DATA[0];
  });

  // Track recent channel in localStorage
  useEffect(() => {
    if (currentChannel?.id) {
      try {
        localStorage.setItem('vplay_recent_channel_id', currentChannel.id);
      } catch {}
    }
  }, [currentChannel]);

  // Modals state
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isUnderConstructionOpen, setIsUnderConstructionOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isCustomStreamModalOpen, setIsCustomStreamModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNewsSummaryOpen, setIsNewsSummaryOpen] = useState(false);
  const [summarizeArticle, setSummarizeArticle] = useState<NewsArticle>(NEWS_DATA[0]);
  const [isTtsOpen, setIsTtsOpen] = useState(false);
  const [ttsArticle, setTtsArticle] = useState<NewsArticle>(NEWS_DATA[0]);
  const [isFindWordsOpen, setIsFindWordsOpen] = useState(false);
  const [isAddStreamOpen, setIsAddStreamOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleOpenOfficeTool = (tool: string) => {
    if (tool === 'notes' || tool === 'write' || tool === 'present' || tool === 'table') {
      navigate('/notes');
    } else {
      navigate(`/${tool}`);
    }
  };
  const [articleFontSize, setArticleFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vplay_font_size');
      return saved ? parseInt(saved, 10) : 16;
    } catch {
      return 16;
    }
  });

  const handleFontSizeChange = (size: number) => {
    setArticleFontSize(size);
    try {
      localStorage.setItem('vplay_font_size', String(size));
    } catch {}
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('waves_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('waves_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Edge swipe gesture: vuốt từ cạnh trái sang để mở sidebar
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTrackingEdgeSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Swipe originates from within 45px of the left screen edge
      if (touch.clientX <= 45) {
        startX = touch.clientX;
        startY = touch.clientY;
        isTrackingEdgeSwipe = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTrackingEdgeSwipe) return;
      isTrackingEdgeSwipe = false;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Swiped right with at least 40px, predominantly horizontal
      if (deltaX > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
        setIsMobileSidebarOpen(true);
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          try {
            localStorage.setItem('waves_sidebar_collapsed', 'false');
          } catch {}
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarCollapsed]);

  // Determine effective sidebar width for page adaptation
  const isEffectiveCollapsed = settings.autoHideSidebar || isSidebarCollapsed;

  const [isUnsavedSettingsModalOpen, setIsUnsavedSettingsModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ path: string; state?: any } | null>(null);

  // Perform actual navigation
  const executeNavigation = useCallback((path: string, state?: any) => {
    const requestedApp = getStoreAppForRoute(path);
    const targetPath = requestedApp && !installedApps.includes(requestedApp.id)
      ? `/store?app=${requestedApp.id}`
      : path;
    const targetRoute = targetPath.includes('?') ? targetPath.split('?')[0] : targetPath;
    const isDifferentTab = targetRoute !== currentRoute;

    if (currentRoute !== '/search') {
      previousRouteRef.current = currentRoute;
    }

    setRouteState(requestedApp && !installedApps.includes(requestedApp.id) ? { storeAppId: requestedApp.id } : state);
    
    // Parse query params if any
    if (targetPath.includes('?')) {
      const [parsedBaseRoute, query] = targetPath.split('?');
      const params = new URLSearchParams(query);
      const chSlug = params.get('channel');
      if (chSlug) {
        const matched = channels.find((c) => c.slug === chSlug);
        if (matched) setCurrentChannel(matched);
      }
      window.history.pushState(null, '', targetPath);
      setCurrentRoute(parsedBaseRoute);
    } else {
      window.history.pushState(null, '', targetPath);
      setCurrentRoute(targetRoute);
    }

    // Instant scroll to top on navigation (bỏ slide up)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // 1-second splash screen on entering a new tab
    if (isDifferentTab) {
      if (tabLoadingTimerRef.current) clearTimeout(tabLoadingTimerRef.current);
      setIsTabLoading(true);
      tabLoadingTimerRef.current = setTimeout(() => {
        setIsTabLoading(false);
        setTabLoadCount((c) => c + 1);
      }, 1000);
    }
  }, [channels, currentRoute, installedApps]);

  const installStoreApp = (appId: string) => {
    setInstalledApps((current) => {
      if (current.includes(appId)) return current;
      const next = [...current, appId];
      try {
        localStorage.setItem('microsoft_store_installed_apps', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const uninstallStoreApp = (appId: string) => {
    setInstalledApps((current) => {
      const next = current.filter((id) => id !== appId);
      try {
        localStorage.setItem('microsoft_store_installed_apps', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Navigation handler
  const navigate = useCallback((path: string, state?: any) => {
    // If currently on settings and there are unsaved changes, prompt before leaving
    if (currentRoute === '/settings' && hasChanges) {
      const isStillSettings = path === '/settings' || path.startsWith('/settings?') || path.startsWith('/settings#');
      if (!isStillSettings) {
        setPendingNavigation({ path, state });
        setIsUnsavedSettingsModalOpen(true);
        return;
      }
    }

    executeNavigation(path, state);
  }, [currentRoute, hasChanges, executeNavigation]);

  const handleSaveAndNavigate = () => {
    applyDraftSettings();
    setIsUnsavedSettingsModalOpen(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation.path, pendingNavigation.state);
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndNavigate = () => {
    discardDraftSettings();
    setIsUnsavedSettingsModalOpen(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation.path, pendingNavigation.state);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigate = () => {
    setIsUnsavedSettingsModalOpen(false);
    setPendingNavigation(null);
  };

  // Open search handler (respects navigation mode and immersive search experiment)
  const handleOpenSearch = useCallback(() => {
    if (settings.navigationMode === 'floaty') {
      window.dispatchEvent(new CustomEvent('vplay:open-floaty-search'));
    } else if (settings.immersiveSearch) {
      if (currentRoute !== '/search') {
        previousRouteRef.current = currentRoute;
      }
      navigate('/search');
    } else {
      setIsSpotlightOpen(true);
    }
  }, [settings.navigationMode, settings.immersiveSearch, currentRoute]);

  // Global search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalSearchKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, [handleOpenSearch]);

  // Global Customizable Keybinds (Alt+1: Home, Alt+2: Search, Alt+3: Tools menu, Alt+4: Settings, Alt+5: Recent Channel)
  useKeyboardShortcuts({
    onHome: useCallback(() => {
      navigate('/');
    }, [navigate]),
    onSearch: useCallback(() => {
      handleOpenSearch();
    }, [handleOpenSearch]),
    onTools: useCallback(() => {
      window.dispatchEvent(new CustomEvent('vone:toggle-tools'));
      window.dispatchEvent(new CustomEvent('vplay:toggle-tools'));
    }, []),
    onSettings: useCallback(() => {
      navigate('/settings');
    }, [navigate]),
    onRecentChannel: useCallback(() => {
      let targetChannel = currentChannel;
      try {
        const savedId = localStorage.getItem('vplay_recent_channel_id');
        if (savedId) {
          const found = channels.find((c) => c.id === savedId);
          if (found) targetChannel = found;
        }
      } catch {}
      if (targetChannel) {
        setCurrentChannel(targetChannel);
        navigate(`/live-tv?channel=${targetChannel.slug}`);
      }
    }, [currentChannel, channels, navigate])
  });

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (currentRoute === '/settings' && hasChanges) {
        window.history.pushState(null, '', '/settings');
        setPendingNavigation({ path: window.location.pathname });
        setIsUnsavedSettingsModalOpen(true);
        return;
      }
      const path = window.location.pathname;
      const requestedApp = getStoreAppForRoute(path);
      if (requestedApp && !installedApps.includes(requestedApp.id)) {
        window.history.replaceState(null, '', `/store?app=${requestedApp.id}`);
        setCurrentRoute('/store');
        setRouteState(null);
        return;
      }
      const isTabSwitch = path !== currentRoute;
      const params = new URLSearchParams(window.location.search);
      const chSlug = params.get('channel');
      if (chSlug) {
        const matched = channels.find((c) => c.slug === chSlug);
        if (matched) setCurrentChannel(matched);
      }
      setCurrentRoute(path);

      if (isTabSwitch) {
        if (tabLoadingTimerRef.current) clearTimeout(tabLoadingTimerRef.current);
        setIsTabLoading(true);
        tabLoadingTimerRef.current = setTimeout(() => {
          setIsTabLoading(false);
          setTabLoadCount((c) => c + 1);
        }, 1000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [channels, currentRoute, hasChanges, triggerUnsavedTooltip, installedApps]);

  // Handle page reload / unload when settings are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentRoute === '/settings' && hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentRoute, hasChanges]);

  // Handle playing a custom single channel
  const handlePlayCustomChannel = (newChannel: Channel) => {
    setChannels((prev) => {
      const exists = prev.some((c) => c.id === newChannel.id);
      if (exists) return prev;
      const updated = [newChannel, ...prev];
      return updated;
    });
    setCurrentChannel(newChannel);
    navigate(`/live-tv?channel=${newChannel.slug}`);
  };

  // Handle importing a list of M3U channels
  const handleImportPlaylist = (importedList: Channel[]) => {
    setChannels((prev) => {
      const updated = [...importedList, ...prev];
      try {
        localStorage.setItem('waves_custom_channels', JSON.stringify(importedList));
      } catch {}
      return updated;
    });
    if (importedList.length > 0) {
      setCurrentChannel(importedList[0]);
      navigate(`/live-tv?channel=${importedList[0].slug}`);
    }
  };

  const isSparkOSRoute = currentRoute === '/sparkos';

  // Render Page Content based on currentRoute
  const renderContentForRoute = (route: string, appNavigate: (path: string) => void = navigate) => {
    const navigate = appNavigate;
    // Route matching for news detail: /news/:slug
    if (route.startsWith('/news/')) {
      const slug = route.replace('/news/', '');
      return <Article slug={slug} navigate={navigate} fontSize={articleFontSize} />;
    }

    switch (route) {
      case '/sparkos':
        return <SparkOS navigate={navigate} renderApp={(appRoute, windowNavigate) => renderContentForRoute(appRoute, windowNavigate)} />;

      case '/':
      case '/home':
        return (
          <Home
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            onOpenSpotlight={() => setIsSpotlightOpen(true)}
          />
        );

      case '/live-tv':
        return (
          <LiveTV
            currentChannel={currentChannel}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            navigate={navigate}
          />
        );

      case '/test':
        return (
          <TestChannels
            currentChannel={currentChannel}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/mail':
        return <ProductivityTab kind="mail" navigate={navigate} />;

      case '/calendar':
        return <ProductivityTab kind="calendar" navigate={navigate} />;

      case '/news':
        return (
          <News
            navigate={navigate}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/channels':
        return (
          <Channels
            channels={channels}
            onSelectChannel={setCurrentChannel}
            navigate={navigate}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/favorites':
        return (
          <Favorites
            channels={channels}
            onSelectChannel={setCurrentChannel}
            navigate={navigate}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/about':
        return (
          <Home
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/settings':
        return (
          <Settings
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            onOpenUpdate={() => setIsUpdating(true)}
            onOpenOfficeTool={handleOpenOfficeTool}
          />
        );

      case '/search':
        return (
          <ImmersiveSearch
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            onClose={() => {
              const target = previousRouteRef.current && previousRouteRef.current !== '/search' ? previousRouteRef.current : '/';
              navigate(target);
            }}
          />
        );

      case '/notes':
      case '/write':
      case '/present':
      case '/table':
        return <NotesApp navigate={navigate} />;

      case '/craftmine':
        return <Craftmine />;

      case '/photopea':
      case '/photoshop':
        return <Photopea />;

      case '/logos-fandom':
      case '/logos-wiki':
      case '/fandom':
        return <LogosFandom />;

      case '/minecraft-wiki':
      case '/mc-wiki':
      case '/wiki':
        return <MinecraftWiki />;

      case '/vlc':
      case '/vlc-player':
      case '/media-player':
        return <VlcPlayer />;

      case '/schedule':
      case '/tv-guide':
      case '/epg':
      case '/lich-phat-song':
        return <ScheduleApp navigate={navigate} />;

      case '/cookbook':
      case '/recipes':
      case '/nau-an':
        return <Cookbook />;

      case '/swift':
      case '/swift-social':
      case '/social':
        return <SwiftSocial />;

      case '/friends':
      case '/ban-be':
        return <FriendsApp navigate={navigate} />;

      case '/task-manager':
        return <TaskManager navigate={navigate} />;

      case '/widgets':
        return <Widgets navigate={navigate} />;

      case '/files':
      case '/file-explorer':
        return <FileExplorer navigate={navigate} />;

      case '/paint':
      case '/ms-paint':
        return <MSPaint navigate={navigate} />;

      case '/ink-space':
      case '/inkspace':
      case '/ink-canvas':
      case '/inkcanvas':
        return <InkSpace navigate={navigate} />;

      case '/swift-bank':
      case '/bank':
      case '/swiftbank':
        return <SwiftBank navigate={navigate} />;

      case '/clock':
      case '/alarm':
      case '/timer':
      case '/stopwatch':
      case '/world-clock':
        return <ClockApp navigate={navigate} />;

      case '/photos':
      case '/gallery':
        return <PhotosApp navigate={navigate} />;

      case '/edge':
      case '/browser':
        return <EdgeBrowser navigate={navigate} />;

      case '/camera':
        return <CameraApp navigate={navigate} />;

      case '/copilot':
        return <CopilotPage navigate={navigate} />;

      case '/calculator':
      case '/calc':
        return <Calculator navigate={navigate} />;

      case '/snipping-tool':
      case '/snip':
      case '/snipping':
        return <SnippingTool navigate={navigate} />;

      case '/feedback-hub':
      case '/feedback':
        return <FeedbackHub navigate={navigate} />;

      case '/store':
        return (
          <MicrosoftStore
            installedApps={installedApps}
            onInstall={installStoreApp}
            onUninstall={uninstallStoreApp}
            navigate={navigate}
          />
        );

      case '/updates':
        return <Updates navigate={navigate} onOpenUpdate={() => setIsUpdating(true)} />;

      default:
        return (
          <Home
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            channels={channels}
          />
        );
    }
  };

  const renderContent = () => renderContentForRoute(currentRoute, navigate);

  const isOfficeRoute = currentRoute === '/notes' || currentRoute === '/write';
  const isFullBleedRoute =
    isSparkOSRoute ||
    currentRoute === '/store' ||
    isOfficeRoute ||
    currentRoute === '/mail' ||
    currentRoute.startsWith('/mail') ||
    currentRoute === '/calendar' ||
    currentRoute.startsWith('/calendar') ||
    currentRoute === '/ink-space' ||
    currentRoute === '/inkspace' ||
    currentRoute === '/ink-canvas' ||
    currentRoute === '/inkcanvas';

  // 1. Splash screen for 5 seconds before app crash
  if (crashPhase === 'splash') {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#0c0d0e] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="flex flex-col items-center text-center max-w-md space-y-6 animate-in fade-in duration-300">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TPopUU7m6WTCETjfIVB68A850AyvGg.png"
            alt="Microsoft Edge Dev"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
          />
          <div className="flex flex-col items-center space-y-3">
            <SpinningRing size={36} strokeWidth={3.5} color="#4cc2ff" />
            <h2 className="text-lg sm:text-xl font-medium tracking-wide text-neutral-100">
              Something went wrong - App couldn't load
            </h2>
            <p className="text-xs text-neutral-400">
              Vui lòng đợi trong giây lát... Hệ thống đang phát hiện lỗi tiến trình.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. App Crash Screen (BSOD) after splash screen
  if (isSystemCrashed || crashPhase === 'crashed') {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#0078d7] text-white flex flex-col justify-between p-8 sm:p-16 md:p-24 font-sans select-none">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          <div className="text-7xl sm:text-9xl font-light">:(</div>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl font-semibold leading-snug">
              Your Sparkle (Dev) ran into a problem and needs to restart.
            </h1>
            <p className="text-sm sm:text-base opacity-90 leading-relaxed">
              Tiến trình hệ thống cốt lõi đã bị chấm dứt trong Task Manager khiến ứng dụng bị crash. Chúng tôi đã thu thập thông tin sự cố để bảo vệ tính toàn vẹn hệ thống.
            </p>
          </div>

          <div className="flex items-start gap-5 pt-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-2 rounded-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-black flex items-center justify-center text-[9px] text-white text-center font-mono font-bold leading-tight">
                SPARKLE<br />CRASH
              </div>
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <p className="opacity-90">Để biết thêm thông tin về sự cố này và cách khắc phục khả dụng, hãy truy cập trang hỗ trợ Sparkle (Dev).</p>
              <div className="pt-2 font-mono text-xs sm:text-sm">
                <div>Stop code: <strong className="text-amber-200">CRITICAL_PROCESS_DIED</strong></div>
                <div>What failed: <strong className="text-amber-200">{crashReason || 'Sparkle Experience Host'}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={restartSystem}
            className="px-6 py-2.5 rounded-[6px] bg-white text-[#0078d7] hover:bg-neutral-100 font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            Khởi động lại Sparkle (Dev)
          </button>
        </div>
      </div>
    );
  }

  return (
    <NativeKeyboardProvider>
      <NotesProvider>
        <div
        data-immersive-sidebar={settings.immersiveSidebar}
      data-sidebar-position={settings.sidebarPosition}
      className={`min-h-screen ${settings.superDarkMode ? 'bg-black' : 'bg-[#f9f9f9] dark:bg-[#1b1f24]'} text-[#111827] dark:text-[#E0E0E6] flex font-sans selection:bg-[#4cc2ff] selection:text-black relative ${isSparkOSRoute ? '!h-[100dvh] !min-h-0 !overflow-hidden !bg-black' : ''}`}
    >
      {/* 5-second device cursor busy overlay before splash screen */}
      {crashPhase === 'cursor-busy' && (
        <div 
          className="fixed inset-0 z-[999999] bg-transparent cursor-wait select-none pointer-events-auto"
          style={{ cursor: 'wait' }}
          aria-hidden="true" 
        />
      )}

      {/* Fixed atmospheric cosmic background matching custom nebula gradient */}
      <div 
        id="fixed-app-background-solid" 
        className={`fixed inset-0 pointer-events-none -z-50 ${settings.superDarkMode ? '!bg-black' : ''}`} 
        aria-hidden="true" 
      />

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      {!isSparkOSRoute && (settings.navigationMode === 'sidebar' || isMobileSidebarOpen) && (
        <Sidebar
          currentRoute={currentRoute}
          navigate={navigate}
          installedApps={installedApps}
          onOpenSearch={handleOpenSearch}
          onSelectChannel={setCurrentChannel}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          channels={channels}
          currentChannel={currentChannel}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          onOpenSummarize={(art) => {
            setSummarizeArticle(art);
            setIsNewsSummaryOpen(true);
          }}
          onOpenTextToSpeech={(art) => {
            setTtsArticle(art);
            setIsTtsOpen(true);
          }}
          onOpenFindWords={() => setIsFindWordsOpen(true)}
          onOpenAddStream={() => setIsAddStreamOpen(true)}
          onImportChannels={handleImportPlaylist}
          onOpenNotifications={() => setIsUnderConstructionOpen(true)}
          fontSize={articleFontSize}
          onChangeFontSize={handleFontSizeChange}
          onOpenUpdate={() => setIsUpdating(true)}
          onOpenOfficeTool={handleOpenOfficeTool}
          isSplashFinished={isSplashFinished}
        />
      )}

      {/* Main App Container */}
      <div className={`main-app-container flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-300 ease-in-out ${
        settings.windowsAppSdkPreview ? 'bg-[#141414]' : 'bg-[#f3f3f3] dark:bg-[#1b1f24]'
      } ${isSparkOSRoute ? '!h-full !min-h-0 !p-0 !bg-black !transition-none' : ''} ${
        settings.navigationMode === 'topbar'
          ? 'md:pl-0 md:pr-0 pb-10'
          : !settings.dockToSidebar || settings.navigationMode !== 'sidebar'
            ? 'md:pl-0 md:pr-0 pb-20'
            : settings.sidebarPosition === 'right'
              ? isEffectiveCollapsed
                ? 'md:pr-[48px]'
                : 'md:pr-[260px]'
              : isEffectiveCollapsed
                ? 'md:pl-[48px]'
                : 'md:pl-[260px]'
      }`}>
        {/* TopBar Header */}
        {!isSparkOSRoute && !isOfficeRoute && currentRoute !== '/store' && (
          <TopBar
            currentRoute={currentRoute}
            navigate={navigate}
            onOpenSearch={handleOpenSearch}
            settingsSearchQuery={currentTabSearchQuery}
            onSettingsSearchChange={handleTabSearchChange}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            currentChannel={currentChannel}
            channels={channels}
            onSelectChannel={setCurrentChannel}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenDiscord={() => setIsWelcomeModalOpen(true)}
            onOpenSummarize={(art) => {
              setSummarizeArticle(art);
              setIsNewsSummaryOpen(true);
            }}
            onOpenTextToSpeech={(art) => {
              setTtsArticle(art);
              setIsTtsOpen(true);
            }}
            onOpenFindWords={() => {
              setIsFindWordsOpen(true);
            }}
            onOpenAddStream={() => setIsAddStreamOpen(true)}
            onImportChannels={handleImportPlaylist}
            onOpenNotifications={() => setIsUnderConstructionOpen(true)}
            fontSize={articleFontSize}
            onChangeFontSize={handleFontSizeChange}
            showUnsavedTooltip={showUnsavedTooltip}
            onDismissUnsavedTooltip={() => setShowUnsavedTooltip(false)}
          />
        )}

        {/* Dynamic Page Content with smooth slide-up transition - Bo cong 10px góc trên trái */}
        <main className={`main-tab-page flex-1 w-full mx-auto rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-none overflow-hidden ${
          settings.windowsAppSdkPreview
            ? '!bg-[#141414] text-white'
            : (isTabLoading
              ? 'bg-[#f3f4f6] dark:bg-[#202024] p-0 max-w-none pt-0 text-neutral-800 dark:text-neutral-100'
              : (currentRoute === '/' || currentRoute === '/home' || isFullBleedRoute || currentRoute === '/craftmine' || currentRoute === '/photopea' || currentRoute === '/logos-fandom' || currentRoute === '/logos-wiki' || currentRoute === '/minecraft-wiki' || currentRoute === '/mc-wiki' || currentRoute === '/vlc' || currentRoute.startsWith('/vlc') || currentRoute === '/media-player' || currentRoute === '/schedule' || currentRoute.startsWith('/schedule') || currentRoute === '/cookbook' || currentRoute === '/swift' || currentRoute === '/friends' || currentRoute === '/edge' || currentRoute === '/browser' || currentRoute === '/camera' || currentRoute === '/photos' || currentRoute === '/gallery' || currentRoute === '/paint' || currentRoute === '/ms-paint' || currentRoute === '/file-explorer' || currentRoute === '/files' || currentRoute === '/copilot' || currentRoute === '/direct-cut' || currentRoute === '/video-editor' || currentRoute === '/edit' || currentRoute === '/swift-bank' || currentRoute === '/bank' || currentRoute === '/swiftbank' || currentRoute === '/clock' || currentRoute === '/alarm' || currentRoute === '/timer' || currentRoute === '/stopwatch' || currentRoute === '/world-clock' || currentRoute === '/calculator' || currentRoute === '/calc' || currentRoute === '/snipping-tool' || currentRoute === '/snip' || currentRoute === '/snipping' || currentRoute === '/feedback-hub' || currentRoute === '/feedback'
                ? 'p-0 max-w-none pt-0 bg-[#f9f9f9] dark:bg-[#282c31]' 
                : 'px-4 sm:px-6 md:px-8 py-5 max-w-7xl bg-[#f9f9f9] dark:bg-[#282c31]'))
        } ${
          settings.navigationMode === 'floaty' && !isFullBleedRoute
            ? 'pb-28 sm:pb-32'
            : ''
        } ${isSparkOSRoute ? '!h-full !min-h-0 !p-0 !max-w-none !bg-black' : ''}`}>
          {/* Dynamic Page Content: No slide-up animation when switching pages */}
          {isTabLoading && !isSparkOSRoute ? (
            <div key={`tab-loading-${currentRoute}`} className={`w-full h-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] ${
              settings.windowsAppSdkPreview ? 'bg-[#141414]' : 'bg-[#f3f4f6] dark:bg-[#202024]'
            }`}>
              <TabLoadingScreen route={currentRoute} />
            </div>
          ) : (
            <div
              key={`tab-loaded-${currentRoute}-${tabLoadCount}-${routeState?.storeAppId ?? ''}`}
              className="w-full h-full rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-none overflow-hidden"
            >
              {renderContent()}
            </div>
          )}
        </main>

      </div>

      {/* Floaty bar navigation (Tab View) */}
      {!isSparkOSRoute && settings.navigationMode === 'floaty' && (
        <BottomDock
          currentRoute={currentRoute}
          navigate={navigate}
          currentChannel={currentChannel}
          channels={channels}
          onOpenSearch={handleOpenSearch}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          onOpenSummarize={(art) => {
            setSummarizeArticle(art);
            setIsNewsSummaryOpen(true);
          }}
          onOpenTextToSpeech={(art) => {
            setTtsArticle(art);
            setIsTtsOpen(true);
          }}
          onOpenFindWords={() => {
            setIsFindWordsOpen(true);
          }}
          onOpenAddStream={() => setIsAddStreamOpen(true)}
          onImportChannels={handleImportPlaylist}
          fontSize={articleFontSize}
          onChangeFontSize={handleFontSizeChange}
          searchQuery={currentTabSearchQuery}
          onSearchChange={handleTabSearchChange}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onOpenOfficeTool={handleOpenOfficeTool}
        />
      )}

      {/* Global Modals */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        navigate={navigate}
        onSelectChannel={setCurrentChannel}
      />

      {/* Unsaved Settings Confirmation Modal */}
      <UnsavedSettingsModal
        isOpen={isUnsavedSettingsModalOpen}
        onSave={handleSaveAndNavigate}
        onDiscard={handleDiscardAndNavigate}
        onCancel={handleCancelNavigate}
      />

      <CustomStreamModal
        isOpen={isCustomStreamModalOpen}
        onClose={() => setIsCustomStreamModalOpen(false)}
        onPlayCustomChannel={handlePlayCustomChannel}
        onImportPlaylist={handleImportPlaylist}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* News Summary Modal */}
      <NewsSummaryModal
        isOpen={isNewsSummaryOpen}
        onClose={() => setIsNewsSummaryOpen(false)}
        article={summarizeArticle}
      />

      {/* Text to Speech Floating Player */}
      <TextToSpeechPlayer
        isOpen={isTtsOpen}
        onClose={() => setIsTtsOpen(false)}
        article={ttsArticle}
      />

      {/* In-Article / News Word Finder */}
      <FindWordsBar
        isOpen={isFindWordsOpen}
        onClose={() => setIsFindWordsOpen(false)}
      />

      {/* Quick Add Stream Modal Dialog (Tên luồng, Địa chỉ luồng) */}
      <AddStreamModal
        isOpen={isAddStreamOpen}
        onClose={() => setIsAddStreamOpen(false)}
        onAddStream={handlePlayCustomChannel}
      />

      {/* Startup / Refresh Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Notifications / Under Construction Modal */}
      <UnderConstructionModal
        isOpen={isUnderConstructionOpen}
        onClose={() => setIsUnderConstructionOpen(false)}
      />

      {/* Floating Movable Sticky Note Widget */}
      <StickyNoteWidget onNavigateNotes={() => navigate('/notes')} />

      {/* App Native Virtual Keyboard for Touch Devices */}
      <NativeKeyboard />

      {/* Startup Splash Screen (3 seconds) */}
      <SplashScreen duration={3000} onFinish={() => setIsSplashFinished(true)} />

      {/* Update Sparkle (Dev) Splash Screen */}
      {isUpdating && (
        <SplashScreen
          duration={2500}
          subtitle="Sparkle (Dev) needs an update - Working on it"
          onFinish={() => setIsUpdating(false)}
        />
      )}

      {/* Global WebView SDK Context Menu */}
      <GlobalContextMenu
        navigate={navigate}
        onOpenSearch={handleOpenSearch}
        onOpenTools={() => {
          if (currentRoute === '/live-tv') {
            setIsCustomStreamModalOpen(true);
          } else {
            setIsHelpModalOpen(true);
          }
        }}
      />
    </div>
      </NotesProvider>
    </NativeKeyboardProvider>
  );
}
