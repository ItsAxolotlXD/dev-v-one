import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BatteryFull,
  Calculator,
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
  { name: 'Paint', route: '/paint', icon: Paintbrush, color: 'text-rose-200', surface: 'bg-rose-500/20' },
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

export function SparkOS({ navigate }: SparkOSProps) {
  const [startOpen, setStartOpen] = useState(true);
  const [showAllApps, setShowAllApps] = useState(false);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setStartOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const visibleApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? apps.filter((app) => app.name.toLowerCase().includes(normalizedQuery))
      : apps;
    return showAllApps || normalizedQuery ? filtered : filtered.slice(0, 15);
  }, [query, showAllApps]);

  const launch = (route: string) => navigate(route);

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return;
    const firstMatch = visibleApps[0];
    if (firstMatch) launch(firstMatch.route);
  };

  const formattedTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(now);
  const formattedDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }).format(now);

  return (
    <main
      aria-label="SparkOS desktop"
      onClick={() => setStartOpen(false)}
      className="relative isolate h-[100dvh] min-h-[420px] w-full overflow-hidden bg-[#17232b] font-sans text-white"
      style={{ backgroundImage: "linear-gradient(180deg,rgba(8,12,18,.08),rgba(4,12,16,.18)),url('/sparkos-wallpaper.png')", backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

      <div className="absolute left-4 top-4 flex flex-col items-start gap-5 sm:left-7 sm:top-7">
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); launch('/'); }}
          className="group flex w-[76px] flex-col items-center gap-2 rounded-md p-2 text-center text-[11px] text-white drop-shadow-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Return to vOne"
        >
          <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/15 shadow-lg backdrop-blur-sm"><WindowsMark /></span>
          <span>vOne</span>
        </button>
      </div>

      {startOpen && (
        <section
          aria-label="Start menu"
          onClick={(event) => event.stopPropagation()}
          className="absolute left-1/2 top-1/2 z-20 flex h-[min(82dvh,610px)] w-[min(710px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[#111c22]/75 shadow-[0_28px_90px_rgba(0,0,0,.5)] backdrop-blur-2xl"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2 pt-[clamp(12px,4dvh,32px)] sm:px-9">
            <div className="flex h-[clamp(40px,5.5dvh,44px)] shrink-0 items-center gap-3 border border-white/10 bg-white/[0.09] px-3.5 shadow-inner focus-within:border-sky-300/70 focus-within:bg-white/[0.13]">
              <Search aria-hidden="true" className="size-[17px] shrink-0 text-slate-300" />
              <input
                ref={searchRef}
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
                {visibleApps.map(({ name, route, icon: Icon, color, surface }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => launch(route)}
                    className="group flex min-h-[clamp(48px,7dvh,72px)] flex-col items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-center transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                    aria-label={`Open ${name}`}
                  >
                    <span className={`flex size-[clamp(28px,5dvh,40px)] items-center justify-center rounded-[9px] border border-white/10 ${surface} shadow-md transition-transform group-hover:scale-105`}>
                      <Icon aria-hidden="true" className={`size-[23px] ${color}`} strokeWidth={1.8} />
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
              {recentApps.map(({ name, note, route, icon: Icon, color }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => launch(route)}
                  className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:gap-3 sm:px-2"
                >
                  <Icon aria-hidden="true" className={`size-6 shrink-0 ${color}`} strokeWidth={1.8} />
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] text-slate-100 sm:text-[11px]">{name}</span>
                    <span className="hidden truncate text-[10px] text-slate-300 sm:block">{note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer
        aria-label="System taskbar"
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 z-30 flex h-[46px] items-center justify-center border-t border-white/10 bg-[#101517]/70 px-2 shadow-[0_-8px_28px_rgba(0,0,0,.22)] backdrop-blur-2xl"
      >
        <div className="flex h-full items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => { setStartOpen((open) => !open); setQuery(''); }}
            aria-label={startOpen ? 'Close Start menu' : 'Open Start menu'}
            aria-expanded={startOpen}
            className={`flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${startOpen ? 'bg-white/[0.08]' : ''}`}
          >
            <WindowsMark />
          </button>
          <button
            type="button"
            onClick={() => { setStartOpen(true); window.setTimeout(() => searchRef.current?.focus(), 0); }}
            aria-label="Search apps"
            className="flex size-10 items-center justify-center rounded-md text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <Search className="size-[19px]" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          <button type="button" onClick={() => launch('/edge')} aria-label="Open Microsoft Edge" className="flex size-10 items-center justify-center rounded-md text-cyan-300 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Search className="size-[22px]" /></button>
          <button type="button" onClick={() => launch('/file-explorer')} aria-label="Open File Explorer" className="flex size-10 items-center justify-center rounded-md text-amber-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Folder className="size-[22px]" /></button>
          <button type="button" onClick={() => launch('/mail')} aria-label="Open Mail" className="flex size-10 items-center justify-center rounded-md text-sky-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Mail className="size-[22px]" /></button>
        </div>

        <div className="absolute right-2 flex h-full items-center gap-1.5 text-slate-100 sm:right-4 sm:gap-2.5">
          <Wifi aria-label="Network connected" className="hidden size-[15px] sm:block" />
          <Volume2 aria-label="Volume" className="hidden size-[15px] sm:block" />
          <BatteryFull aria-label="Battery" className="hidden size-[16px] sm:block" />
          <button type="button" onClick={() => launch('/')} className="min-w-[48px] rounded px-1 py-1 text-right text-[10px] leading-[14px] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" aria-label={`System time ${formattedTime}, ${formattedDate}`}>
            <span className="block">{formattedTime}</span>
            <span className="block text-slate-300">{formattedDate}</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
