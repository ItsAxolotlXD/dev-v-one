import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { AppTabIcon, STORE_ICON_URL } from '../components/FluentIcons';
import type { AppTabIconName } from '../components/FluentIcons';
import { FluentClockIcon, FluentSnippingToolIcon } from '../components/FluentIcons';
import { useIsMobile } from '../hooks/useIsMobile';
import { hasSparkOSSetup, SparkOSBootScreen, SparkOSBootSetup } from '../components/SparkOSBootSetup';
import {
  BatteryFull,
  Calculator,
  Maximize2,
  Minimize2,
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
  Search,
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
  renderApp: (route: string, navigate: (path: string) => void) => ReactNode;
}

interface AppWindow {
  id: string;
  name: string;
  route: string;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
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
  { name: 'Settings', route: '/settings', icon: Settings, color: 'text-slate-200', surface: 'bg-slate-400/20' },
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
  '/news': 'articles', '/file-explorer': 'fileExplorer', '/settings': 'settings',
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

export function SparkOS({ navigate, renderApp }: SparkOSProps) {
  const isMobile = useIsMobile();
  const [bootFinished, setBootFinished] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [startOpen, setStartOpen] = useState(true);
  const [showAllApps, setShowAllApps] = useState(false);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [pinnedRoutes, setPinnedRoutes] = useState(['/edge', '/file-explorer', '/mail']);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);

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
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setStartOpen(false);
        setContextMenu(null);
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
    const app = apps.find((item) => item.route === route);
    const recent = recentApps.find((item) => item.route === route);
    const name = forcedName ?? app?.name ?? recent?.name ?? route;
    const existing = !newWindow && windows.find((item) => item.route === route);
    setStartOpen(false);
    setContextMenu(null);
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
      minimized: false, maximized: false,
    }]);
    setActiveWindowId(id);
  };

  const closeWindow = (id: string) => {
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
      onClick={() => { setStartOpen(false); setContextMenu(null); }}
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
        {windows.filter((appWindow) => !appWindow.minimized).map((appWindow) => (
          <motion.section
            key={appWindow.id}
            aria-label={`${appWindow.name} window`}
            onPointerDown={() => setActiveWindowId(appWindow.id)}
            onContextMenu={(event) => openContextMenu(event, undefined, appWindow.id)}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`dark absolute z-10 flex min-h-[260px] min-w-[300px] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111318] text-slate-100 shadow-[0_24px_72px_rgba(0,0,0,.48)] ${appWindow.maximized ? 'inset-x-2 top-2 bottom-[54px] w-auto' : 'h-[min(70dvh,560px)] w-[min(860px,calc(100vw-24px))]'}`}
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
                <button type="button" onClick={() => setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, minimized: true } : item))} aria-label={`Minimize ${appWindow.name}`} className="rounded p-2 text-slate-300 transition-colors hover:bg-white/10"><Minimize2 aria-hidden="true" className="size-4" /></button>
                <button type="button" onClick={() => setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, maximized: !item.maximized } : item))} aria-label={`${appWindow.maximized ? 'Restore' : 'Maximize'} ${appWindow.name}`} className="rounded p-2 text-slate-300 transition-colors hover:bg-white/10"><Maximize2 aria-hidden="true" className="size-4" /></button>
                <button type="button" onClick={() => closeWindow(appWindow.id)} aria-label={`Close ${appWindow.name}`} className="rounded p-2 text-slate-600 hover:bg-red-500 hover:text-white"><X aria-hidden="true" className="size-4" /></button>
              </div>
            </div>
            <div className="dark min-h-0 flex-1 overflow-auto bg-[#101216] text-slate-100" style={{ colorScheme: 'dark' }} onClick={(event) => event.stopPropagation()}>
              {renderApp(appWindow.route, (route) => {
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
              <Search aria-hidden="true" className="size-[17px] shrink-0 text-slate-300" />
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

      <footer
        aria-label="System taskbar"
        onContextMenu={(event) => openContextMenu(event)}
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 z-30 flex h-[46px] items-center justify-center border-t border-white/10 bg-[#101517]/70 px-2 shadow-[0_-8px_28px_rgba(0,0,0,.22)] backdrop-blur-2xl"
      >
        <div className="flex h-full items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => { setStartOpen((open) => !open); setContextMenu(null); setQuery(''); }}
            aria-label={startOpen ? 'Close Start menu' : 'Open Start menu'}
            aria-expanded={startOpen}
            className={`flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${startOpen ? 'bg-white/[0.08]' : ''}`}
          >
            <WindowsMark className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => { setStartOpen(true); setContextMenu(null); window.setTimeout(() => searchRef.current?.focus(), 0); }}
            aria-label="Search apps"
            className="flex size-10 items-center justify-center rounded-md text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <Search className="size-[19px]" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          {pinnedRoutes.map((route) => {
            const app = apps.find((item) => item.route === route) ?? recentApps.find((item) => item.route === route);
            if (!app) return null;
            return <button key={route} type="button" onClick={() => launch(route, false, app.name)} aria-label={`Open ${app.name}`} className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 [&>img]:size-[23px] [&>svg]:size-[23px]">{renderDesktopIcon(route, 'size-[23px]')}</button>;
          })}
          {windows.map((appWindow) => (
            <button key={appWindow.id} type="button" onClick={() => { setWindows((current) => current.map((item) => item.id === appWindow.id ? { ...item, minimized: !item.minimized } : item)); setActiveWindowId(appWindow.id); }} aria-label={`${appWindow.minimized ? 'Restore' : 'Minimize'} ${appWindow.name}`} className={`relative flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 [&>img]:size-[23px] [&>svg]:size-[23px] ${activeWindowId === appWindow.id && !appWindow.minimized ? 'bg-white/10' : ''}`}>
              {renderDesktopIcon(appWindow.route, 'size-[23px]')}
              {!appWindow.minimized && <span aria-hidden="true" className="absolute bottom-0.5 h-0.5 w-3 rounded-full bg-sky-300" />}
            </button>
          ))}
        </div>

        <div className="absolute right-2 flex h-full items-center gap-1.5 text-slate-100 sm:right-4 sm:gap-2.5">
          <Wifi aria-label="Network connected" className="hidden size-[15px] sm:block" />
          <Volume2 aria-label="Volume" className="hidden size-[15px] sm:block" />
          <BatteryFull aria-label="Battery" className="hidden size-[16px] sm:block" />
          <button type="button" onClick={() => navigate('/')} className="min-w-[48px] rounded px-1 py-1 text-right text-[10px] leading-[14px] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" aria-label={`System time ${formattedTime}, ${formattedDate}`}>
            <span className="block">{formattedTime}</span>
            <span className="block text-slate-300">{formattedDate}</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
