import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { AppTabIcon, STORE_ICON_URL } from '../components/FluentIcons';
import type { AppTabIconName } from '../components/FluentIcons';
import { FluentClockIcon, FluentSnippingToolIcon } from '../components/FluentIcons';
import { getStoreAppForRoute, type StoreApp } from '../data/storeApps';
import { useIsMobile } from '../hooks/useIsMobile';
import { hasSparkOSSetup, resetSparkOSSetup, sparkOSResetOobeEvent, SparkOSBootScreen, SparkOSBootSetup } from '../components/SparkOSBootSetup';
import { logRecallActivity } from '../services/recallService';
import {
  BatteryFull,
  Bell,
  Calculator,
  Copy,
  Minus,
  PanelsTopLeft,
  Plus,
  Square,
  X,
  CalendarDays,
  Camera,
  Clock3,
  CloudSun,
  Folder,
  Globe,
  Images,
  Mail,
  MessageSquare,
  Monitor,
  Newspaper,
  Paintbrush,
  Scissors,
  Settings,
  ShoppingBag,
  StickyNote,
  Tv,
  Users,
  Wifi,
  Volume2,
} from 'lucide-react';

interface SparkOSProps {
  navigate: (path: string) => void;
  renderApp: (route: string, navigate: (route: string) => void) => ReactNode;
  installedApps: string[];
}

interface AppWindow {
  id: string;
  name: string;
  route: string;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
  loading: boolean;
  desktopId: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  app?: DesktopApp;
  windowId?: string;
}

interface DesktopApp {
  name: string;
  route: string;
  icon: LucideIcon;
  color: string;
  surface: string;
}

const START_ICON_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Start.ico-7zTzhc9DVkKTo2YHGkctgAPJnKFnDF.x-icon';
const SEARCH_ICON_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Experimental%20Search.ico-RVeoJYyfrrdcdc6VQRwnLzE33aehRZ.x-icon';
const CHAT_ICON_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chat.ico-Q0q2Szz5bDf5JCkock3G2RByxusOKd.x-icon';

const apps: DesktopApp[] = [
  { name: 'Microsoft Edge', route: '/edge', icon: Globe, color: 'text-cyan-300', surface: 'bg-cyan-500/20' },
  { name: 'Mail', route: '/mail', icon: Mail, color: 'text-sky-300', surface: 'bg-sky-500/20' },
  { name: 'Calendar', route: '/calendar', icon: CalendarDays, color: 'text-blue-300', surface: 'bg-blue-500/20' },
  { name: 'OneNote', route: '/notes', icon: StickyNote, color: 'text-fuchsia-300', surface: 'bg-fuchsia-500/20' },
  { name: 'Photos', route: '/photos', icon: Images, color: 'text-sky-200', surface: 'bg-blue-400/20' },
  { name: 'Task Manager', route: '/task-manager', icon: Monitor, color: 'text-blue-300', surface: 'bg-blue-500/20' },
  { name: 'Camera', route: '/camera', icon: Camera, color: 'text-slate-200', surface: 'bg-slate-400/20' },
  { name: 'Microsoft Store', route: '/store', icon: ShoppingBag, color: 'text-emerald-200', surface: 'bg-emerald-500/20' },
  { name: 'News', route: '/news', icon: Newspaper, color: 'text-rose-200', surface: 'bg-rose-500/20' },
  { name: 'Files', route: '/file-explorer', icon: Folder, color: 'text-amber-200', surface: 'bg-amber-400/20' },
  { name: 'Snip & Sketch', route: '/snipping-tool', icon: Scissors, color: 'text-orange-200', surface: 'bg-orange-500/20' },
  { name: 'PC Settings', route: '/pc-settings', icon: Settings, color: 'text-slate-200', surface: 'bg-slate-400/20' },
  { name: 'Calculator', route: '/calculator', icon: Calculator, color: 'text-cyan-200', surface: 'bg-cyan-500/20' },
  { name: 'Clock', route: '/clock', icon: Clock3, color: 'text-violet-200', surface: 'bg-violet-500/20' },
  { name: 'Paint', route: '/ms-paint', icon: Paintbrush, color: 'text-rose-200', surface: 'bg-rose-500/20' },
  { name: 'Feedback Hub', route: '/feedback-hub', icon: MessageSquare, color: 'text-violet-200', surface: 'bg-violet-500/20' },
  { name: 'Watch', route: '/live-tv', icon: Tv, color: 'text-sky-200', surface: 'bg-sky-500/20' },
  { name: 'Friends', route: '/friends', icon: Users, color: 'text-pink-200', surface: 'bg-pink-500/20' },
  { name: 'Swift Social', route: '/swift', icon: MessageSquare, color: 'text-emerald-200', surface: 'bg-emerald-500/20' },
];

const recentApps = [
  { name: 'Copilot', note: 'Recently added', route: '/copilot', icon: Monitor, color: 'text-violet-300' },
  { name: 'Photos', note: 'Recently added', route: '/photos', icon: Images, color: 'text-sky-300' },
  { name: 'Swift Social', note: 'Recently added', route: '/swift', icon: Wifi, color: 'text-emerald-300' },
];

const sidebarIconNames: Record<string, AppTabIconName> = {
  '/edge': 'edge', '/mail': 'mail', '/calendar': 'calendar', '/notes': 'notes',
  '/photos': 'gallery', '/task-manager': 'taskManager', '/camera': 'camera',
  '/news': 'articles', '/file-explorer': 'fileExplorer', '/pc-settings': 'settings',
  '/calculator': 'calculator', '/paint': 'paint', '/ms-paint': 'paint',
  '/feedback-hub': 'feedback', '/live-tv': 'watch', '/friends': 'people', '/swift': 'social',
};

function renderDesktopIcon(route: string, className = 'size-6') {
  if (route === '/store') return <img src={STORE_ICON_URL} alt="" className={`${className} object-contain`} />;
  if (route === '/clock') return <FluentClockIcon className={className} />;
  if (route === '/snipping-tool') return <FluentSnippingToolIcon className={className} />;
  const iconName = sidebarIconNames[route];
  return iconName ? <AppTabIcon name={iconName} className={className} /> : <Monitor aria-hidden="true" className={`${className} text-violet-300`} />;
}

function WindowsMark({ className = 'size-[18px]' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`grid grid-cols-2 gap-[2px] ${className}`}>
      <span className="bg-[#59b9ff]" />
      <span className="bg-[#2a9dff]" />
      <span className="bg-[#2a9dff]" />
      <span className="bg-[#1684e8]" />
    </span>
  );
}

export function SparkOS({ navigate, renderApp, installedApps }: SparkOSProps) {
  const isMobile = useIsMobile();
  const [bootFinished, setBootFinished] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [startOpen, setStartOpen] = useState(true);
  const [showAllApps, setShowAllApps] = useState(false);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [pinnedRoutes, setPinnedRoutes] = useState(['/edge', '/file-explorer', '/mail', '/pc-settings']);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activePanel, setActivePanel] = useState<'task-view' | 'widgets' | 'action-center' | 'notifications' | 'copilot' | null>(null);
  const [storePrompt, setStorePrompt] = useState<StoreApp | null>(null);
  const [desktopCount, setDesktopCount] = useState(1);
  const [activeDesktop, setActiveDesktop] = useState(1);
  const [quickSettings, setQuickSettings] = useState({ wifi: true, bluetooth: true, batterySaver: false, focusAssist: false });
  const searchRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const splashTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (isMobile) return;
    const timer = window.setTimeout(() => {
      setSetupComplete(hasSparkOSSetup());
      setBootFinished(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [isMobile]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOobeReset = () => {
      resetSparkOSSetup();
      setWindows([]);
      setActiveWindowId(null);
      setActivePanel(null);
      setStartOpen(false);
      setSetupComplete(false);
    };
    window.addEventListener(sparkOSResetOobeEvent, handleOobeReset);
    return () => window.removeEventListener(sparkOSResetOobeEvent, handleOobeReset);
  }, []);

  useEffect(() => () => {
    splashTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    splashTimersRef.current.clear();
  }, []);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setStartOpen(false);
        setContextMenu(null);
        setActivePanel(null);
        setStorePrompt(null);
      }
    };
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      setWindows((current) => current.map((appWindow) => appWindow.id === drag.id
        ? { ...appWindow, x: Math.max(0, Math.min(window.innerWidth - 300, drag.originX + event.clientX - drag.startX)), y: Math.max(0, Math.min(window.innerHeight - 100, drag.originY + event.clientY - drag.startY)) }
        : appWindow));
    };
    const handlePointerUp = () => { dragRef.current = null; };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const visibleApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? apps.filter((app) => app.name.toLowerCase().includes(normalizedQuery))
      : apps;
    return showAllApps || normalizedQuery ? filtered : filtered.slice(0, 15);
  }, [query, showAllApps]);

  const launch = (route: string, newWindow = false, forcedName?: string) => {
    const storeApp = getStoreAppForRoute(route);
    if (storeApp && !installedApps.includes(storeApp.id)) {
      setStorePrompt(storeApp);
      setStartOpen(false);
      setContextMenu(null);
      setActivePanel(null);
      return;
    }

    const app = apps.find((item) => item.route === route);
    const recent = recentApps.find((item) => item.route === route);
    const name = forcedName ?? app?.name ?? recent?.name ?? route;
    const existing = !newWindow && windows.find((item) => item.route === route);
    setStartOpen(false);
    setContextMenu(null);
    setActivePanel(null);
    setQuery('');
    if (existing) {
      setActiveWindowId(existing.id);
      setWindows((current) => current.map((item) => item.id === existing.id ? { ...item, minimized: false } : item));
      return;
    }
    const id = `${route}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const offset = windows.length * 24;
    setWindows((current) => [...current, {
      id, name, route,
      x: Math.max(12, Math.min((window.innerWidth - 720) / 2 + offset, window.innerWidth - 320)),
      y: Math.max(16, Math.min((window.innerHeight - 480) / 2 + offset, window.innerHeight - 120)),
      minimized: false, maximized: false, loading: true, desktopId: activeDesktop,
    }]);
    setActiveWindowId(id);

    try {
      logRecallActivity({
        type: 'sparkos',
        appName: 'SparkOS',
        title: `SparkOS - ${name}`,
        subtitle: `Cửa sổ đa nhiệm Desktop: ${name}`,
        durationText: 'You spent < 1m on this activity recently',
        badgeText: `SparkOS: ${name}`,
        thumbnail: '/sparkos-wallpaper.png',
        route: `/sparkos`,
        searchKeywords: `sparkos desktop window ${name}`.toLowerCase()
      });
    } catch {}

    const splashTimer = window.setTimeout(() => {
      setWindows((current) => current.map((appWindow) => appWindow.id === id ? { ...appWindow, loading: false } : appWindow));
      splashTimersRef.current.delete(id);
    }, 5000);
    splashTimersRef.current.set(id, splashTimer);
  };

  const closeWindow = (id: string) => {
    const splashTimer = splashTimersRef.current.get(id);
    if (splashTimer !== undefined) {
      window.clearTimeout(splashTimer);
      splashTimersRef.current.delete(id);
    }
    setWindows((current) => {
      const remaining = current.filter((item) => item.id !== id);
      setActiveWindowId(remaining.at(-1)?.id ?? null);
      return remaining;
    });
    setContextMenu(null);
  };

  const openContextMenu = (event: MouseEvent, app?: DesktopApp, windowId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    setStartOpen(false);
    setContextMenu({
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - 204)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - 174)),
      app,
      windowId,
    });
  };

  const beginWindowDrag = (event: PointerEvent<HTMLDivElement>, appWindow: AppWindow) => {
    if ((event.target as HTMLElement).closest('button')) return;
    setActiveWindowId(appWindow.id);
    if (appWindow.maximized) return;
    dragRef.current = { id: appWindow.id, startX: event.clientX, startY: event.clientY, originX: appWindow.x, originY: appWindow.y };
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return;
    const firstMatch = visibleApps[0];
    if (firstMatch) launch(firstMatch.route);
  };

  const formattedTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(now);
  const formattedDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }).format(now);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-md">
        <section role="dialog" aria-modal="true" aria-labelledby="sparkos-mobile-title" aria-describedby="sparkos-mobile-description" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#17191f] p-6 text-center text-white shadow-2xl">
          <div aria-hidden="true" className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.06] text-sky-300">
            <Monitor className="size-7" />
          </div>
          <h1 id="sparkos-mobile-title" className="text-xl font-semibold tracking-tight">Get a Bộ PC, silly</h1>
          <p id="sparkos-mobile-description" className="mt-3 text-sm leading-6 text-slate-300">SparkOS only available for those who use computers 🤓👆</p>
          <button type="button" onClick={() => navigate('/')} className="mt-6 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17191f]">Back to home</button>
        </section>
      </div>
    );
  }

  if (!bootFinished) return <SparkOSBootScreen />;
  if (!setupComplete) return <SparkOSBootSetup onComplete={() => setSetupComplete(true)} />;

  return (
    <main
      aria-label="SparkOS desktop"
      onClick={() => { setStartOpen(false); setContextMenu(null); setActivePanel(null); }}
      onContextMenu={(event) => openContextMenu(event)}
      className="relative isolate h-[100dvh] min-h-[420px] w-full overflow-hidden bg-[#17232b] font-sans text-white"
      style={{ backgroundImage: "linear-gradient(180deg,rgba(8,12,18,.08),rgba(4,12,16,.18)),url('/sparkos-wallpaper.png')", backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

      <div className="absolute left-4 top-4 flex flex-col items-start gap-5 sm:left-7 sm:top-7">
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); navigate('/'); }}
          className="group flex w-[76px] flex-col items-center gap-2 rounded-md p-2 text-center text-[11px] text-white drop-shadow-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Return to vOne"
        >
          <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/15 shadow-lg backdrop-blur-sm"><WindowsMark /></span>
          <span>vOne</span>
        </button>
      </div>

      <AnimatePresence>
        {windows.filter((appWindow) => !appWindow.minimized && appWindow.desktopId === activeDesktop).map((appWindow) => (
          <motion.section
            key={appWindow.id}
            aria-label={`${appWindow.name} window`}
            onPointerDown={() => setActiveWindowId(appWindow.id)}
            onContextMenu={(event) => openContextMenu(event, undefined, appWindow.id)}
            initial={{ scale: 0.84, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.84, y: 18 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className={`dark absolute z-10 flex min-h-[260px] min-w-[300px] flex-col overflow-hidden border border-white/10 bg-[#111318] text-slate-100 shadow-[0_24px_72px_rgba(0,0,0,.48)] ${appWindow.maximized ? 'inset-x-0 top-0 bottom-[46px] w-auto rounded-none' : 'h-[min(70dvh,560px)] w-[min(860px,calc(100vw-24px))] rounded-lg'}`}
            style={appWindow.maximized ? { zIndex: appWindow.id === activeWindowId ? 20 : 10 } : { left: appWindow.x, top: appWindow.y, zIndex: appWindow.id === activeWindowId ? 20 : 10 }}
          >
            <div
              className="flex h-10 shrink-0 touch-none items-center justify-between border-b border-white/10 bg-[#1a1c21] px-3"
              onPointerDown={(event) => beginWindowDrag(event, appWindow)}
              onDoubleClick={() => setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, maximized: !item.maximized } : item))}
              onContextMenu={(event) => openContextMenu(event, undefined, appWindow.id)}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center">{renderDesktopIcon(appWindow.route, 'size-5')}</span>
                <span className="truncate text-xs font-medium text-slate-200">{appWindow.name}</span>
              </div>
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, minimized: true } : item))} aria-label={`Minimize ${appWindow.name}`} className="rounded p-2 text-slate-300 transition-colors hover:bg-white/10"><Minus aria-hidden="true" className="size-4" /></button>
                <button type="button" onClick={() => setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, maximized: !item.maximized } : item))} aria-label={`${appWindow.maximized ? 'Restore down' : 'Maximize'} ${appWindow.name}`} className="rounded p-2 text-slate-300 transition-colors hover:bg-white/10">{appWindow.maximized ? <Copy aria-hidden="true" className="size-4" /> : <Square aria-hidden="true" className="size-4" />}</button>
                <button type="button" onClick={() => closeWindow(appWindow.id)} aria-label={`Close ${appWindow.name}`} className="rounded p-2 text-slate-600 hover:bg-red-500 hover:text-white"><X aria-hidden="true" className="size-4" /></button>
              </div>
            </div>
            <div className="dark min-h-0 flex-1 overflow-auto bg-[#101216] text-slate-100" style={{ colorScheme: 'dark' }} onClick={(event) => event.stopPropagation()}>
              {appWindow.loading ? (
                <div role="status" aria-label={`Opening ${appWindow.name}`} className="flex h-full min-h-[260px] flex-col items-center justify-center gap-5 bg-[#101216] text-slate-100">
                  <span className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl">{renderDesktopIcon(appWindow.route, 'size-9')}</span>
                  <span className="text-sm font-medium text-white/85">Starting {appWindow.name}</span>
                  <span className="h-1 w-40 overflow-hidden rounded-full bg-white/10"><motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} className="block h-full rounded-full bg-sky-300" /></span>
                </div>
              ) : renderApp(appWindow.route, (route) => {
                const requestedStoreApp = getStoreAppForRoute(route);
                if (requestedStoreApp && !installedApps.includes(requestedStoreApp.id)) {
                  setStorePrompt(requestedStoreApp);
                  return;
                }
                const targetRoute = route.split('?')[0];
                const targetApp = apps.find((item) => item.route === targetRoute);
                setWindows((current) => current.map((item) => item.id === appWindow.id
                  ? { ...item, route, name: targetApp?.name ?? item.name }
                  : item));
              })}
            </div>
          </motion.section>
        ))}
      </AnimatePresence>

      <AnimatePresence>
      {startOpen && (
        <motion.section
          aria-label="Start menu"
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => openContextMenu(event)}
          initial={{ opacity: 0, y: 38, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 38, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 23, mass: 0.72 }}
          className="absolute left-1/2 top-1/2 z-20 flex h-[min(82dvh,610px)] w-[min(710px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[#111c22]/75 shadow-[0_28px_90px_rgba(0,0,0,.5)] backdrop-blur-2xl"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2 pt-[clamp(12px,4dvh,32px)] sm:px-9">
            <div className="flex h-[clamp(40px,5.5dvh,44px)] shrink-0 items-center gap-3 border border-white/10 bg-white/[0.09] px-3.5 shadow-inner focus-within:border-sky-300/70 focus-within:bg-white/[0.13]">
              <img src={SEARCH_ICON_SRC} alt="" className="size-[18px] shrink-0 object-contain" />
              <input
                ref={searchRef}
                onFocus={() => launch('/search', false, 'Search')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search the web or your devices"
                aria-label="Search apps"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-300/80"
              />
              {query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear search" className="rounded p-1 text-slate-300 hover:bg-white/10"><span aria-hidden="true">×</span></button>}
            </div>

            <div className="mb-1 mt-[clamp(12px,3.5dvh,28px)] flex items-center justify-between">
              <h1 className="text-[13px] font-semibold tracking-wide text-slate-100">My apps and websites</h1>
              <button
                type="button"
                onClick={() => setShowAllApps((current) => !current)}
                className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] font-medium text-slate-100 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {showAllApps ? 'Show fewer' : 'Show all'}
              </button>
            </div>

            {visibleApps.length ? (
              <div className="grid grid-cols-4 gap-x-1 gap-y-1 sm:grid-cols-5 sm:gap-x-3 sm:gap-y-2">
                {visibleApps.map(({ name, route }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => launch(route)}
                    onContextMenu={(event) => openContextMenu(event, apps.find((app) => app.route === route))}
                    className="group flex min-h-[clamp(56px,7dvh,78px)] flex-col items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-center transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                    aria-label={`Open ${name}`}
                  >
                    <span className="flex size-[clamp(36px,6dvh,48px)] items-center justify-center transition-transform group-hover:scale-110">
                      {renderDesktopIcon(route, 'size-[30px]')}
                    </span>
                    <span className="max-w-full truncate text-[10px] leading-tight text-slate-100 sm:text-[11px]">{name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-300">No apps found. Try another search.</p>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 bg-black/[0.12] px-5 pb-4 pt-3 sm:px-9 sm:pb-5 sm:pt-4">
            <h2 className="mb-2 text-[12px] font-semibold text-slate-100">Recent</h2>
            <p className="mb-3 hidden text-[11px] text-slate-300 sm:block">Pick up where you left off, or open something new.</p>
            <div className="grid grid-cols-3 gap-1 sm:gap-3">
              {recentApps.map(({ name, note, route }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => launch(route, false, name)}
                  onContextMenu={(event) => openContextMenu(event, { name, route, icon: Monitor, color: 'text-violet-300', surface: 'bg-violet-500/20' })}
                  className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:gap-3 sm:px-2"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center">{renderDesktopIcon(route, 'size-6')}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] text-slate-100 sm:text-[11px]">{name}</span>
                    <span className="hidden truncate text-[10px] text-slate-300 sm:block">{note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {activePanel === 'task-view' && (
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sparkos-task-view-title"
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-x-0 top-0 bottom-[46px] z-40 flex flex-col bg-[#0b1016]/90 px-5 py-6 backdrop-blur-2xl sm:px-10 sm:py-9"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
              <header className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <h2 id="sparkos-task-view-title" className="text-2xl font-semibold tracking-tight">Task view</h2>
                  <p className="mt-1 text-sm text-slate-400">Switch between open windows and desktops.</p>
                </div>
                <button type="button" onClick={() => setActivePanel(null)} aria-label="Close Task View" className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X className="size-5" /></button>
              </header>
              <div className="mb-8 flex flex-wrap items-center gap-3">
                {Array.from({ length: desktopCount }, (_, index) => index + 1).map((desktopId) => (
                  <button key={desktopId} type="button" onClick={() => setActiveDesktop(desktopId)} aria-pressed={activeDesktop === desktopId} className={`min-w-36 rounded-xl border px-4 py-3 text-left transition-colors ${activeDesktop === desktopId ? 'border-sky-300/70 bg-sky-400/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/10'}`}>
                    <span className="block text-sm font-medium">Desktop {desktopId}</span>
                    <span className="mt-1 block text-xs text-slate-400">{windows.filter((appWindow) => appWindow.desktopId === desktopId).length} open windows</span>
                  </button>
                ))}
                <button type="button" onClick={() => { const nextDesktop = desktopCount + 1; setDesktopCount(nextDesktop); setActiveDesktop(nextDesktop); }} className="flex min-h-[60px] items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 text-sm text-slate-300 transition-colors hover:border-sky-300/60 hover:bg-white/[0.05]"><Plus aria-hidden="true" className="size-4" />New desktop</button>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Windows on Desktop {activeDesktop}</h3>
                <span className="text-xs text-slate-500">Select a window to bring it forward</span>
              </div>
              {windows.some((appWindow) => appWindow.desktopId === activeDesktop) ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {windows.filter((appWindow) => appWindow.desktopId === activeDesktop).map((appWindow) => (
                    <article key={appWindow.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#171d25] shadow-xl">
                      <button type="button" onClick={() => { setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, minimized: false } : item)); setActiveWindowId(appWindow.id); setActivePanel(null); }} className="flex min-h-36 w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.05] to-transparent p-5 text-center hover:bg-white/[0.08]">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-white/10">{renderDesktopIcon(appWindow.route, 'size-7')}</span>
                        <span className="max-w-full truncate text-sm font-medium">{appWindow.name}</span>
                      </button>
                      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                        <span className="text-xs text-slate-400">{appWindow.minimized ? 'Minimized' : 'Open'}</span>
                        <button type="button" onClick={() => closeWindow(appWindow.id)} aria-label={`Close ${appWindow.name}`} className="rounded-md p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-200"><X className="size-4" /></button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-400">No open windows on this desktop.</div>
              )}
            </div>
          </motion.section>
        )}
        {activePanel && activePanel !== 'task-view' && (
          <motion.aside
            key={activePanel}
            aria-label={activePanel === 'widgets' ? 'Widgets' : activePanel === 'copilot' ? 'Copilot' : activePanel === 'action-center' ? 'Action Center' : 'Notification Center'}
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.98, x: activePanel === 'widgets' ? -24 : 18, opacity: 0, transformOrigin: activePanel === 'widgets' ? 'left bottom' : 'right bottom' }}
            animate={{ scale: 1, x: 0, opacity: 1 }}
            exit={{ scale: 0.98, x: activePanel === 'widgets' ? -24 : 18, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={['absolute bottom-[54px] z-40 flex max-h-[calc(100dvh-70px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111820]/95 text-slate-100 shadow-[0_24px_72px_rgba(0,0,0,.55)] backdrop-blur-2xl', activePanel === 'widgets' ? 'left-3 w-[min(480px,calc(100vw-24px))]' : `right-3 ${activePanel === 'copilot' ? 'w-[min(420px,calc(100vw-24px))]' : 'w-[min(360px,calc(100vw-24px))]'}`].join(' ')}
          >
            {(activePanel === 'widgets' || activePanel === 'copilot') ? (
              <>
                <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {activePanel === 'widgets' ? <PanelsTopLeft aria-hidden="true" className="size-5 text-sky-300" /> : <img src={CHAT_ICON_SRC} alt="" className="size-5 object-contain" />}
                    <h2 className="text-sm font-semibold">{activePanel === 'widgets' ? 'Widgets' : 'Copilot'}</h2>
                  </div>
                  <button type="button" onClick={() => setActivePanel(null)} aria-label={`Close ${activePanel === 'widgets' ? 'Widgets' : 'Copilot'}`} className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {renderApp(activePanel === 'widgets' ? '/widgets' : '/copilot', (route) => { setActivePanel(null); launch(route); })}
                </div>
              </>
            ) : (
              <>
                <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4">
                  <div>
                    <h2 className="text-base font-semibold">{activePanel === 'action-center' ? 'Quick settings' : 'Notification center'}</h2>
                    <p className="mt-1 text-xs text-slate-400">{formattedTime} · {formattedDate}</p>
                  </div>
                  <button type="button" onClick={() => setActivePanel(null)} aria-label="Close panel" className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
                </header>
                <div className="flex shrink-0 gap-1 border-b border-white/10 p-2">
                  <button type="button" onClick={() => setActivePanel('action-center')} aria-pressed={activePanel === 'action-center'} className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${activePanel === 'action-center' ? 'bg-sky-400/15 text-sky-200' : 'text-slate-400 hover:bg-white/[0.06]'}`}>Quick settings</button>
                  <button type="button" onClick={() => setActivePanel('notifications')} aria-pressed={activePanel === 'notifications'} className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${activePanel === 'notifications' ? 'bg-sky-400/15 text-sky-200' : 'text-slate-400 hover:bg-white/[0.06]'}`}>Notifications</button>
                </div>
                {activePanel === 'action-center' ? (
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {([
                      ['wifi', 'Wi-Fi', Wifi],
                      ['bluetooth', 'Bluetooth', Wifi],
                      ['batterySaver', 'Battery saver', BatteryFull],
                      ['focusAssist', 'Focus assist', Bell],
                    ] as const).map(([key, label, Icon]) => (
                      <button key={key} type="button" aria-pressed={quickSettings[key]} onClick={() => setQuickSettings((current) => ({ ...current, [key]: !current[key] }))} className={`flex min-h-[74px] flex-col items-start justify-between rounded-xl border p-3 text-left transition-colors ${quickSettings[key] ? 'border-sky-300/30 bg-sky-400/15 text-sky-100' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'}`}>
                        <Icon aria-hidden="true" className="size-4" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-white/[0.06] text-slate-400"><Bell aria-hidden="true" className="size-5" /></span>
                    <div>
                      <h3 className="text-sm font-medium">You&apos;re all caught up</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">New notifications will show up here.</p>
                    </div>
                  </div>
                )}
                <footer className="border-t border-white/10 px-4 py-3 text-xs text-slate-500">SparkOS · Desktop {activeDesktop}</footer>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            role="menu"
            aria-label="Desktop context menu"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-[60] w-[196px] overflow-hidden rounded-md border border-white/15 bg-[#1c252d]/95 p-1.5 text-[12px] text-slate-100 shadow-2xl backdrop-blur-xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.app ? (
              <>
                <button role="menuitem" type="button" onClick={() => launch(contextMenu.app!.route, false, contextMenu.app!.name)} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Open {contextMenu.app.name}</button>
                <button role="menuitem" type="button" onClick={() => launch(contextMenu.app!.route, true, contextMenu.app!.name)} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Open in new window</button>
                <div className="my-1 border-t border-white/10" />
                <button role="menuitem" type="button" onClick={() => { setPinnedRoutes((current) => current.includes(contextMenu.app!.route) ? current : [...current, contextMenu.app!.route]); setContextMenu(null); }} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Pin to taskbar</button>
              </>
            ) : contextMenu.windowId ? (
              <>
                <button role="menuitem" type="button" onClick={() => { setWindows((current) => current.map((item) => item.id === contextMenu.windowId ? { ...item, minimized: true } : item)); setContextMenu(null); }} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Minimize window</button>
                <button role="menuitem" type="button" onClick={() => closeWindow(contextMenu.windowId!)} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Close window</button>
              </>
            ) : (
              <>
                <button role="menuitem" type="button" onClick={() => setContextMenu(null)} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Refresh desktop</button>
                <button role="menuitem" type="button" onClick={() => { setStartOpen(true); setContextMenu(null); }} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Open Start menu</button>
                <button role="menuitem" type="button" onClick={() => launch('/settings')} className="w-full rounded px-2.5 py-2 text-left hover:bg-white/10">Personalize</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {storePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStorePrompt(null)} className="absolute inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]">
            <motion.section role="dialog" aria-modal="true" aria-labelledby="sparkos-store-dialog-title" aria-describedby="sparkos-store-dialog-description" onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171c23] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,.65)] sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">{renderDesktopIcon(storePrompt.route, 'size-7')}</span>
                <div className="min-w-0 flex-1">
                  <h2 id="sparkos-store-dialog-title" className="text-lg font-semibold">{storePrompt.name} isn&apos;t installed</h2>
                  <p id="sparkos-store-dialog-description" className="mt-2 text-sm leading-6 text-slate-300">Install this app from Microsoft Store before opening it in SparkOS.</p>
                  <p className="mt-3 text-xs text-slate-400">{storePrompt.publisher} · {storePrompt.size}</p>
                </div>
                <button type="button" onClick={() => setStorePrompt(null)} aria-label="Close install dialog" className="-mr-1 -mt-1 rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><X aria-hidden="true" className="size-4" /></button>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setStorePrompt(null)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10">Not now</button>
                <button type="button" onClick={() => { setStorePrompt(null); launch('/store', false, 'Microsoft Store'); }} className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300"><ShoppingBag aria-hidden="true" className="size-4" />Open Microsoft Store</button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <footer
        aria-label="System taskbar"
        onContextMenu={(event) => openContextMenu(event)}
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 z-30 flex h-[46px] items-center justify-center border-t border-white/10 bg-[#101517]/70 px-2 shadow-[0_-8px_28px_rgba(0,0,0,.22)] backdrop-blur-2xl"
      >
        <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'widgets' ? null : 'widgets'); }} aria-label="Open Widgets: 28 degrees and sunny in Hanoi" aria-pressed={activePanel === 'widgets'} className={`absolute left-2 flex h-9 items-center gap-1.5 rounded-md px-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:left-4 ${activePanel === 'widgets' ? 'bg-white/10' : ''}`}>
          <CloudSun aria-hidden="true" className="size-[19px] shrink-0 text-amber-200" />
          <span className="text-[12px] font-medium leading-none">28°</span>
          <span className="hidden text-[10px] leading-tight text-slate-300 sm:block">Hanoi<br />Sunny</span>
        </button>
        <div className="flex h-full items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => { setStartOpen((open) => !open); setContextMenu(null); setActivePanel(null); setQuery(''); }}
            aria-label={startOpen ? 'Close Start menu' : 'Open Start menu'}
            aria-expanded={startOpen}
            className={`flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${startOpen ? 'bg-white/[0.08]' : ''}`}
          >
            <img src={START_ICON_SRC} alt="" className="size-[23px] object-contain" />
          </button>
          <button
            type="button"
            onClick={() => launch('/search', false, 'Search')}
            aria-label="Search apps"
            className="flex size-10 items-center justify-center rounded-md text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <img src={SEARCH_ICON_SRC} alt="" className="size-[23px] object-contain" />
          </button>
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'task-view' ? null : 'task-view'); }} aria-label="Open Task View" aria-pressed={activePanel === 'task-view'} className={`flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${activePanel === 'task-view' ? 'bg-white/10' : ''}`}>
            <PanelsTopLeft aria-hidden="true" className="size-[21px]" />
          </button>
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'copilot' ? null : 'copilot'); }} aria-label="Open Copilot sidebar" aria-pressed={activePanel === 'copilot'} className={`flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${activePanel === 'copilot' ? 'bg-white/10' : ''}`}>
            <img src={CHAT_ICON_SRC} alt="" className="size-[23px] object-contain" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          {pinnedRoutes.map((route) => {
            const app = apps.find((item) => item.route === route) ?? recentApps.find((item) => item.route === route);
            if (!app) return null;
            return <button key={route} type="button" onClick={() => launch(route, false, app.name)} aria-label={`Open ${app.name}`} className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 [&>img]:size-[23px] [&>svg]:size-[23px]">{renderDesktopIcon(route, 'size-[23px]')}</button>;
          })}
          {windows.filter((appWindow) => appWindow.desktopId === activeDesktop).map((appWindow) => (
            <button key={appWindow.id} type="button" onClick={() => { setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, minimized: !item.minimized } : item)); setActiveWindowId(appWindow.id); }} aria-label={`${appWindow.minimized ? 'Restore' : 'Minimize'} ${appWindow.name}`} className={`relative flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 [&>img]:size-[23px] [&>svg]:size-[23px] ${activeWindowId === appWindow.id && !appWindow.minimized ? 'bg-white/10' : ''}`}>
              {renderDesktopIcon(appWindow.route, 'size-[23px]')}
              {!appWindow.minimized && <span aria-hidden="true" className="absolute bottom-0.5 h-0.5 w-3 rounded-full bg-sky-300" />}
            </button>
          ))}
        </div>

        <div className="absolute right-2 flex h-full items-center gap-1.5 text-slate-100 sm:right-4 sm:gap-2.5">
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'action-center' ? null : 'action-center'); }} aria-label="Open Action Center" className="flex h-9 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            <Wifi aria-hidden="true" className="size-[15px]" />
            <Volume2 aria-hidden="true" className="hidden size-[15px] sm:block" />
            <BatteryFull aria-hidden="true" className="hidden size-[16px] sm:block" />
          </button>
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'notifications' ? null : 'notifications'); }} className="min-w-[48px] rounded px-1 py-1 text-right text-[10px] leading-[14px] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" aria-label={`Open notification center. System time ${formattedTime}, ${formattedDate}`}>
            <span className="block">{formattedTime}</span>
            <span className="block text-slate-300">{formattedDate}</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
