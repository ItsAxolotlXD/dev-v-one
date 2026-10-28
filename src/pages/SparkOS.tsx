import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { AppTabIcon, STORE_ICON_URL } from '../components/FluentIcons';
import type { AppTabIconName } from '../components/FluentIcons';
import { FluentClockIcon, FluentSnippingToolIcon, FluentSearchIcon } from '../components/FluentIcons';
import { getStoreAppForRoute, type StoreApp } from '../data/storeApps';
import { useIsMobile } from '../hooks/useIsMobile';
import { hasSparkOSSetup, resetSparkOSSetup, sparkOSResetOobeEvent, SparkOSBootScreen, SparkOSBootSetup } from '../components/SparkOSBootSetup';
import { logRecallActivity } from '../services/recallService';
import {
  BatteryFull,
  Bell,
  Calculator,
  ChevronUp,
  Cloud,
  CloudSun,
  Copy,
  FileText,
  Menu,
  Minus,
  PanelsTopLeft,
  Plus,
  Power,
  Square,
  X,
  CalendarDays,
  Camera,
  Clock3,
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
  UserRound,
  Users,
  Wifi,
  Volume2,
} from 'lucide-react';

interface SparkOSProps {
  navigate: (path: string) => void;
  renderApp: (route: string, navigate: (route: string) => void) => ReactNode;
  installedApps: string[];
  emulated?: boolean;
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

const CHAT_ICON_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chat.ico-Q0q2Szz5bDf5JCkock3G2RByxusOKd.x-icon';

const apps: DesktopApp[] = [
  { name: 'Microsoft Edge', route: '/edge', icon: Globe, color: 'text-cyan-300', surface: 'bg-cyan-500/20' },
  { name: 'Core OS Emulator', route: '/core-os-emulator', icon: Monitor, color: 'text-sky-200', surface: 'bg-sky-500/20' },
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
  { name: 'PC Settings', route: '/pc-settings', icon: Settings, color: 'text-white', surface: 'bg-slate-400/20' },
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

type StartTile = {
  name: string;
  route: string;
  kind?: 'mail' | 'calendar' | 'weather';
};

const startTileGroups: Array<{ title: string; tiles: StartTile[] }> = [
  {
    title: 'Productivity',
    tiles: [
      { name: 'Microsoft Edge', route: '/edge' },
      { name: 'Mail', route: '/mail', kind: 'mail' },
      { name: 'Calendar', route: '/calendar', kind: 'calendar' },
      { name: 'Photos', route: '/photos' },
      { name: 'OneNote', route: '/notes' },
      { name: 'Files', route: '/file-explorer' },
    ],
  },
  {
    title: 'Explore',
    tiles: [
      { name: 'News', route: '/news' },
      { name: 'Microsoft Store', route: '/store' },
      { name: 'Movies & TV', route: '/live-tv' },
      { name: 'Weather', route: '/widgets', kind: 'weather' },
      { name: 'Friends', route: '/friends' },
      { name: 'Camera', route: '/camera' },
    ],
  },
  {
    title: 'Build',
    tiles: [
      { name: 'Calculator', route: '/calculator' },
      { name: 'Paint', route: '/ms-paint' },
      { name: 'Task Manager', route: '/task-manager' },
      { name: 'Snip & Sketch', route: '/snipping-tool' },
      { name: 'PC Settings', route: '/pc-settings' },
      { name: 'Clock', route: '/clock' },
    ],
  },
];

const sidebarIconNames: Record<string, AppTabIconName> = {
  '/edge': 'edge', '/mail': 'mail', '/calendar': 'calendar', '/notes': 'notes',
  '/photos': 'gallery', '/task-manager': 'taskManager', '/camera': 'camera',
  '/news': 'articles', '/file-explorer': 'fileExplorer', '/pc-settings': 'settings',
  '/calculator': 'calculator', '/paint': 'paint', '/ms-paint': 'paint',
  '/feedback-hub': 'feedback', '/live-tv': 'watch', '/friends': 'people', '/swift': 'social',
};

function renderDesktopIcon(route: string, className = 'size-6', lightSurface = false) {
  if (route === '/store') return <img src={STORE_ICON_URL} alt="" className={`${className} object-contain`} />;
  if (route === '/file-explorer') return <Folder aria-hidden="true" className={`${className} ${lightSurface ? 'fill-amber-400 text-amber-700' : 'fill-amber-300 text-amber-200'}`} />;
  if (route === '/pc-settings') return <Settings aria-hidden="true" className={`${className} ${lightSurface ? 'text-slate-700' : 'text-white'}`} />;
  if (route === '/core-os-emulator') return <Monitor aria-hidden="true" className={`${className} ${lightSurface ? 'text-sky-700' : 'text-sky-200'}`} />;
  if (route === '/clock') return <FluentClockIcon className={className} />;
  if (route === '/snipping-tool') return <FluentSnippingToolIcon className={className} />;
  const iconName = sidebarIconNames[route];
  return iconName ? <AppTabIcon name={iconName} className={className} /> : <Monitor aria-hidden="true" className={`${className} text-violet-300`} />;
}

function WindowsMark({ className = 'size-[18px]', monochrome = false }: { className?: string; monochrome?: boolean }) {
  const panes = monochrome
    ? ['bg-[#263b45]', 'bg-[#263b45]', 'bg-[#263b45]', 'bg-[#263b45]']
    : ['bg-[#59b9ff]', 'bg-[#2a9dff]', 'bg-[#2a9dff]', 'bg-[#1684e8]'];

  return (
    <span aria-hidden="true" className={`grid grid-cols-2 gap-[2px] ${className}`}>
      {panes.map((pane, index) => <span key={index} className={pane} />)}
    </span>
  );
}

export function SparkOS({ navigate, renderApp, installedApps, emulated = false }: SparkOSProps) {
  const isMobile = useIsMobile();
  const [bootFinished, setBootFinished] = useState(emulated);
  const [setupComplete, setSetupComplete] = useState(emulated);
  const [startOpen, setStartOpen] = useState(!emulated);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [pinnedRoutes, setPinnedRoutes] = useState(['/file-explorer', '/edge']);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activePanel, setActivePanel] = useState<'task-view' | 'widgets' | 'action-center' | 'notifications' | 'copilot' | null>(null);
  const [storePrompt, setStorePrompt] = useState<StoreApp | null>(null);
  const [desktopCount, setDesktopCount] = useState(1);
  const [activeDesktop, setActiveDesktop] = useState(1);
  const [quickSettings, setQuickSettings] = useState({ wifi: true, bluetooth: true, batterySaver: false, focusAssist: false });
  const searchRef = useRef<HTMLInputElement>(null);
  const desktopRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const splashTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (isMobile || emulated) return;
    const timer = window.setTimeout(() => {
      setSetupComplete(hasSparkOSSetup());
      setBootFinished(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [isMobile, emulated]);

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
      const desktopBounds = emulated ? desktopRef.current?.getBoundingClientRect() : undefined;
      const availableWidth = desktopBounds?.width ?? window.innerWidth;
      const availableHeight = desktopBounds?.height ?? window.innerHeight;
      setWindows((current) => current.map((appWindow) => appWindow.id === drag.id
        ? { ...appWindow, x: Math.max(0, Math.min(availableWidth - 300, drag.originX + event.clientX - drag.startX)), y: Math.max(0, Math.min(availableHeight - 100, drag.originY + event.clientY - drag.startY)) }
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
  }, [emulated]);

  const visibleApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const availableApps = emulated ? apps.filter((app) => app.route !== '/core-os-emulator') : apps;
    return availableApps
      .filter((app) => !normalizedQuery || app.name.toLowerCase().includes(normalizedQuery))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [query, emulated]);

  const groupedApps = useMemo(() => {
    const groups: Array<{ letter: string; apps: DesktopApp[] }> = [];
    visibleApps.forEach((app) => {
      const letter = app.name.charAt(0).toUpperCase();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup?.letter === letter) lastGroup.apps.push(app);
      else groups.push({ letter, apps: [app] });
    });
    return groups;
  }, [visibleApps]);

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
    const desktopBounds = emulated ? desktopRef.current?.getBoundingClientRect() : undefined;
    const availableWidth = desktopBounds?.width ?? window.innerWidth;
    const availableHeight = desktopBounds?.height ?? window.innerHeight;
    const isEmulatorWindow = route === '/core-os-emulator' && !emulated;
    const windowWidth = Math.min(emulated ? 700 : 860, availableWidth - 24);
    const windowHeight = Math.min(
      availableHeight * (emulated ? 0.8 : isEmulatorWindow ? 0.82 : 0.7),
      emulated ? 420 : isEmulatorWindow ? 610 : 560,
    );
    const id = `${route}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const offset = windows.length * 24;
    setWindows((current) => [...current, {
      id, name, route,
      x: Math.max(12, Math.min((availableWidth - windowWidth) / 2 + offset, availableWidth - windowWidth - 12)),
      y: Math.max(16, Math.min((availableHeight - windowHeight) / 2 + offset, availableHeight - 100)),
      minimized: false, maximized: false, loading: true, desktopId: activeDesktop,
    }]);
    setActiveWindowId(id);

    try {
      logRecallActivity({
        type: 'sparkos',
        appName: 'Core OS',
        title: `Core OS - ${name}`,
        subtitle: `Cửa sổ đa nhiệm Desktop: ${name}`,
        durationText: 'You spent < 1m on this activity recently',
        badgeText: `Core OS: ${name}`,
        thumbnail: '/sparkos-wallpaper.png',
        route: `/sparkos`,
        searchKeywords: `core os desktop window ${name}`.toLowerCase()
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
  const calendarWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(now);
  const calendarDay = new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(now);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-md">
        <section role="dialog" aria-modal="true" aria-labelledby="sparkos-mobile-title" aria-describedby="sparkos-mobile-description" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#17191f] p-6 text-center text-white shadow-2xl">
          <div aria-hidden="true" className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.06] text-sky-300">
            <Monitor className="size-7" />
          </div>
          <h1 id="sparkos-mobile-title" className="text-xl font-semibold tracking-tight">Get a Bộ PC, silly</h1>
          <p id="sparkos-mobile-description" className="mt-3 text-sm leading-6 text-slate-300">Core OS is only available on desktop devices.</p>
          <button type="button" onClick={() => navigate('/')} className="mt-6 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17191f]">Back to home</button>
        </section>
      </div>
    );
  }

  if (!bootFinished) return <SparkOSBootScreen />;
  if (!setupComplete) return <SparkOSBootSetup onComplete={() => setSetupComplete(true)} />;

  return (
    <main
      ref={desktopRef}
      aria-label={emulated ? 'Core OS Emulator desktop' : 'Core OS desktop'}
      onClick={() => { setStartOpen(false); setContextMenu(null); setActivePanel(null); }}
      onContextMenu={(event) => openContextMenu(event)}
      className={`relative isolate ${emulated ? 'h-full min-h-[280px]' : 'h-[100dvh] min-h-[420px]'} w-full overflow-hidden bg-[#086cc2] font-sans text-white`}
      style={{ backgroundImage: "url('/core-os-wallpaper.png')", backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-950/[0.03] via-transparent to-sky-950/[0.08]" />
      {!emulated && (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[58px] right-4 z-[1] hidden text-right text-[11px] leading-[1.35] text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,.85)] lg:block">
          <span className="block">Core OS Insider Preview</span>
          <span>Evaluation copy · Build 20158.rs_prerelease</span>
        </div>
      )}

      {!emulated && !startOpen && (
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
      )}

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
            className={`dark absolute z-10 flex min-h-[260px] min-w-[300px] flex-col overflow-hidden border border-white/10 bg-[#111318] text-slate-100 shadow-[0_24px_72px_rgba(0,0,0,.48)] ${appWindow.maximized ? 'inset-x-0 top-0 bottom-[46px] w-auto rounded-none' : emulated ? 'h-[min(80%,420px)] w-[min(700px,calc(100%-24px))] rounded-lg' : appWindow.route === '/core-os-emulator' ? 'h-[min(82dvh,610px)] w-[min(860px,calc(100vw-24px))] rounded-lg' : 'h-[min(70dvh,560px)] w-[min(860px,calc(100vw-24px))] rounded-lg'}`}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.72 }}
            className={`absolute bottom-[46px] left-0 z-20 flex ${emulated ? 'h-[min(86%,calc(100%-46px))] w-[min(780px,100%)]' : 'h-[min(86dvh,calc(100dvh-46px))] w-[min(780px,100vw)]'} overflow-hidden border-r border-t border-white/60 bg-[#c9e2ed]/95 text-[#142c38] shadow-[0_18px_58px_rgba(15,58,82,.28)] backdrop-blur-2xl`}
          >
            <aside aria-label="Start menu shortcuts" className="flex w-[50px] shrink-0 flex-col justify-between bg-[#a8cbd9]/50 px-1.5 py-2 text-[#203945] sm:w-[56px]">
              <div aria-hidden="true" className="flex size-9 items-center justify-center"><Menu className="size-[18px]" /></div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => launch('/pc-settings')} aria-label="User profile" title="User profile" className="flex size-9 items-center justify-center rounded-sm transition-colors hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"><UserRound aria-hidden="true" className="size-[18px]" /></button>
                <button type="button" onClick={() => launch('/file-explorer')} aria-label="Documents" title="Documents" className="flex size-9 items-center justify-center rounded-sm transition-colors hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"><FileText aria-hidden="true" className="size-[18px]" /></button>
                <button type="button" onClick={() => launch('/photos')} aria-label="Pictures" title="Pictures" className="flex size-9 items-center justify-center rounded-sm transition-colors hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"><Images aria-hidden="true" className="size-[18px]" /></button>
                <button type="button" onClick={() => launch('/pc-settings')} aria-label="Settings" title="Settings" className="flex size-9 items-center justify-center rounded-sm transition-colors hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"><Settings aria-hidden="true" className="size-[18px]" /></button>
                <button type="button" onClick={() => setStartOpen(false)} aria-label="Close Start menu" title="Power" className="flex size-9 items-center justify-center rounded-sm transition-colors hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"><Power aria-hidden="true" className="size-[18px]" /></button>
              </div>
            </aside>

            <section aria-label="All apps" className="min-h-0 w-[42%] min-w-[160px] max-w-[326px] shrink-0 overflow-y-auto border-r border-[#1b4558]/15 px-2 py-3">
              {groupedApps.length ? groupedApps.map((group) => (
                <section key={group.letter} className="mb-2 last:mb-0">
                  <h2 className="px-2 pb-1 text-[12px] font-medium text-[#496573]">{group.letter}</h2>
                  <div className="flex flex-col">
                    {group.apps.map(({ name, route }) => (
                      <button
                        key={route}
                        type="button"
                        onClick={() => launch(route)}
                        onContextMenu={(event) => openContextMenu(event, apps.find((app) => app.route === route))}
                        aria-label={`Open ${name}`}
                        className="group flex min-h-10 items-center gap-2.5 rounded-sm px-2 text-left text-[12px] text-[#152f3b] transition-colors hover:bg-white/55 focus-visible:bg-white/55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-700"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center">{renderDesktopIcon(route, 'size-5', true)}</span>
                        <span className="min-w-0 truncate">{name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )) : (
                <p className="px-2 py-4 text-[11px] text-[#496573]">No apps found. Try another search.</p>
              )}
            </section>

            <section aria-label="Pinned apps" className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3 pb-4 pt-4 sm:px-4 sm:pt-5">
              {startTileGroups.map((group) => (
                <section key={group.title} className="mb-4 last:mb-0">
                  <h2 className="mb-1.5 text-[13px] font-medium text-[#183644]">{group.title}</h2>
                  <div className="grid grid-cols-3 gap-1">
                    {group.tiles.map((tile) => (
                      <button
                        key={tile.route}
                        type="button"
                        onClick={() => {
                          if (tile.kind === 'weather') {
                            setStartOpen(false);
                            setQuery('');
                            setActivePanel('widgets');
                            return;
                          }
                          launch(tile.route);
                        }}
                        onContextMenu={(event) => {
                          if (tile.kind !== 'weather') openContextMenu(event, apps.find((app) => app.route === tile.route));
                        }}
                        aria-label={`Open ${tile.name}`}
                        className={`group relative flex h-[clamp(54px,13vw,118px)] w-[clamp(54px,13vw,118px)] flex-col overflow-hidden rounded-[2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${tile.kind === 'weather' ? 'bg-[#155a7f] text-white hover:bg-[#0d4d70]' : 'bg-white/45 text-[#17323f] hover:bg-white/80'}`}
                      >
                        {tile.kind === 'mail' ? (
                          <span className="flex h-full w-full flex-col justify-between p-2">
                            <span className="mt-1 text-center text-[10px] leading-tight sm:text-[11px]">See all your<br />mail in one place</span>
                            <span className="flex items-end justify-between gap-1">
                              <span className="truncate text-[11px] font-medium">{tile.name}</span>
                              {renderDesktopIcon(tile.route, 'size-5', true)}
                            </span>
                          </span>
                        ) : tile.kind === 'calendar' ? (
                          <span className="relative flex h-full w-full flex-col items-center justify-center">
                            <span className="text-[10px] tracking-wide">{calendarWeekday}</span>
                            <span className="text-[clamp(30px,3vw,44px)] font-light leading-none">{calendarDay}</span>
                            <span className="absolute bottom-2 left-2 right-2 truncate text-left text-[10px] font-medium">{tile.name}</span>
                          </span>
                        ) : tile.kind === 'weather' ? (
                          <span className="flex h-full flex-col justify-between p-2">
                            <span className="truncate text-left text-[10px] font-medium sm:text-[11px]">Mostly sunny</span>
                            <span className="flex items-center justify-between gap-1">
                              <span className="text-[clamp(20px,2.2vw,28px)] font-light">28°</span>
                              <CloudSun aria-hidden="true" className="size-5 shrink-0 text-amber-200" />
                            </span>
                            <span className="text-left text-[10px]">Hanoi</span>
                          </span>
                        ) : (
                          <>
                            <span className="flex min-h-0 flex-1 items-center justify-center pt-2">{renderDesktopIcon(tile.route, 'size-8', true)}</span>
                            <span className="w-full truncate px-2 pb-2 text-left text-[12px] font-medium">{tile.name}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </section>
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
                <footer className="border-t border-white/10 px-4 py-3 text-xs text-slate-500">Core OS · Desktop {activeDesktop}</footer>
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
                  <p id="sparkos-store-dialog-description" className="mt-2 text-sm leading-6 text-slate-300">Install this app from Microsoft Store before opening it in Core OS.</p>
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
        className="absolute inset-x-0 bottom-0 z-30 flex h-[46px] items-center justify-between border-t border-[#657f8d]/20 bg-[#c6dfeb]/95 px-1 text-[#1b303a] shadow-[0_-5px_18px_rgba(22,62,82,.18)] backdrop-blur-xl sm:px-2"
      >
        <div className="flex h-full min-w-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => { setStartOpen((open) => !open); setContextMenu(null); setActivePanel(null); setQuery(''); }}
            aria-label={startOpen ? 'Close Start menu' : 'Open Start menu'}
            aria-expanded={startOpen}
            className={`flex h-full w-[56px] shrink-0 items-center justify-center transition-colors hover:bg-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${startOpen ? 'bg-white/35' : ''}`}
          >
            <WindowsMark className="size-[18px]" monochrome />
          </button>
          <div className="flex h-[34px] w-[min(410px,30vw)] min-w-[128px] shrink items-center gap-2 border border-[#647987]/35 bg-white/90 px-2 shadow-sm transition-colors focus-within:border-sky-600 focus-within:bg-white">
            <FluentSearchIcon className="size-[17px] shrink-0 text-[#304b59]" />
            <input
              ref={searchRef}
              value={query}
              onFocus={() => { setStartOpen(true); setActivePanel(null); }}
              onChange={(event) => { setQuery(event.target.value); setStartOpen(true); setActivePanel(null); }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type here to search"
              aria-label="Search apps"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#172c37] outline-none placeholder:text-slate-500"
            />
            {query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear search" className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-900/10"><span aria-hidden="true">×</span></button>}
          </div>
          <button type="button" onClick={() => launch('/search', false, 'Search')} aria-label="Open Search assistant" title="Search assistant" className="hidden size-9 shrink-0 items-center justify-center transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 sm:flex">
            <span aria-hidden="true" className="size-[17px] rounded-full border-2 border-sky-600 shadow-[0_0_0_1px_rgba(255,255,255,.7)]" />
          </button>
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'task-view' ? null : 'task-view'); }} aria-label="Open Task View" aria-pressed={activePanel === 'task-view'} className={`flex size-9 shrink-0 items-center justify-center transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${activePanel === 'task-view' ? 'bg-white/35' : ''}`}>
            <PanelsTopLeft aria-hidden="true" className="size-[20px]" />
          </button>
          <div className="flex h-full items-center gap-0.5 border-l border-[#657f8d]/20 pl-0.5 sm:ml-1 sm:gap-1 sm:pl-1">
            {pinnedRoutes.map((route) => {
              const app = apps.find((item) => item.route === route) ?? recentApps.find((item) => item.route === route);
              if (!app) return null;
              return <button key={route} type="button" onClick={() => launch(route, false, app.name)} aria-label={`Open ${app.name}`} className="flex size-9 shrink-0 items-center justify-center transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 [&>img]:size-[23px] [&>svg]:size-[23px]">{renderDesktopIcon(route, 'size-[23px]', true)}</button>;
            })}
            {windows.filter((appWindow) => appWindow.desktopId === activeDesktop).map((appWindow) => (
              <button key={appWindow.id} type="button" onClick={() => { setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, minimized: !item.minimized } : item)); setActiveWindowId(appWindow.id); }} aria-label={`${appWindow.minimized ? 'Restore' : 'Minimize'} ${appWindow.name}`} className={`relative flex size-9 shrink-0 items-center justify-center transition-colors hover:bg-white/40 [&>img]:size-[23px] [&>svg]:size-[23px] ${activeWindowId === appWindow.id && !appWindow.minimized ? 'bg-white/35' : ''}`}>
                {renderDesktopIcon(appWindow.route, 'size-[23px]', true)}
                {!appWindow.minimized && <span aria-hidden="true" className="absolute bottom-0.5 h-0.5 w-3 rounded-full bg-sky-700" />}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex h-full shrink-0 items-center gap-0.5 text-[#203845] sm:gap-1">
          <button type="button" aria-label="Show hidden icons" title="Show hidden icons" className="hidden size-8 items-center justify-center transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 sm:flex"><ChevronUp aria-hidden="true" className="size-4" /></button>
          <span aria-hidden="true" className="hidden h-6 w-px bg-[#657f8d]/20 sm:block" />
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'action-center' ? null : 'action-center'); }} aria-label="Open Action Center" className="flex h-9 items-center gap-1 rounded-sm px-1.5 transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 sm:gap-1.5">
            <Cloud aria-hidden="true" className="hidden size-[15px] sm:block" />
            <Wifi aria-hidden="true" className="size-[14px]" />
            <Volume2 aria-hidden="true" className="hidden size-[14px] sm:block" />
            <BatteryFull aria-hidden="true" className="hidden size-[15px] sm:block" />
          </button>
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'notifications' ? null : 'notifications'); }} className="min-w-[60px] rounded-sm px-1.5 py-1 text-right text-[10px] leading-[14px] transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700" aria-label={`Open notification center. System time ${formattedTime}, ${formattedDate}`}>
            <span className="block">{formattedTime}</span>
            <span className="block text-[#405967]">{formattedDate}</span>
          </button>
          <button type="button" onClick={() => { setStartOpen(false); setActivePanel((panel) => panel === 'notifications' ? null : 'notifications'); }} aria-label="Open Notification Center" className="flex size-9 items-center justify-center transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"><Bell aria-hidden="true" className="size-[17px]" /></button>
        </div>
      </footer>
    </main>
  );
}
