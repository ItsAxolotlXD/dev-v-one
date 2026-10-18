import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Download, LoaderCircle, Search, Sparkles, Star, Store, X } from 'lucide-react';
import { AppTabIcon, FluentCraftmineIcon, FluentPhotopeaIcon } from '../components/FluentIcons';
import { STORE_APPS, type StoreApp } from '../data/storeApps';

interface MicrosoftStoreProps {
  installedApps: string[];
  onInstall: (appId: string) => void;
  onUninstall: (appId: string) => void;
  navigate: (path: string) => void;
}

const categories = ['All', 'Productivity', 'Social', 'Entertainment', 'Creativity', 'Utilities'] as const;
type Category = typeof categories[number];

const WindowsMark = ({ className = 'size-6' }: { className?: string }) => (
  <span className={`grid grid-cols-2 gap-[2px] ${className}`} aria-hidden="true">
    <span className="bg-[#f35325]" /><span className="bg-[#81bc06]" />
    <span className="bg-[#05a6f0]" /><span className="bg-[#ffba08]" />
  </span>
);

function AppArtwork({ app, className = 'size-14' }: { app: StoreApp; className?: string }) {
  const iconClassName = `${className} shrink-0 rounded-[14px] bg-white/[0.06] p-2.5`;
  if (app.icon === 'craftmine') {
    return <span className={`flex items-center justify-center ${iconClassName}`}><FluentCraftmineIcon className="size-full text-white" /></span>;
  }
  if (app.icon === 'photopea') {
    return <span className={`flex items-center justify-center ${iconClassName}`}><FluentPhotopeaIcon className="size-full text-white" /></span>;
  }
  return <span className={`flex items-center justify-center ${iconClassName}`}><AppTabIcon name={app.icon} className="size-full object-contain" alt={`${app.name} icon`} /></span>;
}

const AppCard: React.FC<{ app: StoreApp; installed: boolean; installing: boolean; blocked: boolean; secondsRemaining: number; onInstall: () => void; onOpen: () => void }> = ({ app, installed, installing, blocked, secondsRemaining, onInstall, onOpen }) => {
  return (
    <article className="group flex min-h-[230px] flex-col rounded-2xl border border-white/[0.08] bg-[#1b1b1d] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#222224]">
      <button type="button" onClick={onOpen} className="flex items-start gap-3 text-left">
        <AppArtwork app={app} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-white">{app.name}</span>
          <span className="mt-1 block truncate text-xs text-white/55">{app.publisher}</span>
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/60">{app.rating} <Star className="size-3 fill-current text-[#f6bf43]" /></span>
        </span>
      </button>
      <p className="mt-4 line-clamp-2 min-h-10 text-[13px] leading-5 text-white/65">{app.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-[11px] text-white/45">{app.category}</span>
        <button type="button" onClick={installed ? onOpen : onInstall} disabled={!installed && blocked} aria-busy={installing} className="inline-flex h-9 min-w-[110px] items-center justify-center gap-2 rounded-lg bg-[#0878d1] px-3 text-xs font-semibold text-white transition hover:bg-[#1688e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63c8ff] disabled:cursor-wait disabled:opacity-80">
          {installed ? <><Check className="size-3.5" /> Open</> : installing ? <><LoaderCircle className="size-3.5 animate-spin" /> {secondsRemaining}s</> : <><Download className="size-3.5" /> Install</>}
        </button>
      </div>
    </article>
  );
};

function InstallAppDialog({ app, open, installing, secondsRemaining, onInstall, onClose }: { app: StoreApp; open: boolean; installing: boolean; secondsRemaining: number; onInstall: () => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!installing) onClose();
      }}
      className="fixed left-1/2 top-1/2 m-0 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1b1b1d] p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      aria-labelledby="install-first-title"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <AppArtwork app={app} className="size-14 rounded-xl" />
          <div className="min-w-0 pt-1">
            <h2 id="install-first-title" className="text-xl font-semibold tracking-tight">Install your app first</h2>
            <p className="mt-2 text-sm leading-5 text-white/65">Install {app.name} before opening it. It will be ready on this device once installation finishes.</p>
          </div>
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={installing} className="h-10 rounded-lg border border-white/20 px-4 text-sm text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">Not now</button>
          <button type="button" onClick={onInstall} disabled={installing} aria-busy={installing} className="inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#1688e5] px-4 text-sm font-semibold text-white transition hover:bg-[#2998f1] disabled:cursor-wait disabled:opacity-90">
            {installing ? <><LoaderCircle className="size-4 animate-spin" /> Installing {secondsRemaining}s</> : <><Download className="size-4" /> Install app</>}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export const MicrosoftStore: React.FC<MicrosoftStoreProps> = ({ installedApps, onInstall, onUninstall, navigate }) => {
  const requestedId = new URLSearchParams(window.location.search).get('app');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(requestedId);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'Home' | 'Apps' | 'Games'>('Home');
  const [notice, setNotice] = useState('');
  const [installingAppId, setInstallingAppId] = useState<string | null>(null);
  const [installSecondsRemaining, setInstallSecondsRemaining] = useState(20);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(Boolean(requestedId && !installedApps.includes(requestedId)));
  const installTimeoutRef = useRef<number | null>(null);
  const installIntervalRef = useRef<number | null>(null);
  const selectedApp = STORE_APPS.find((app) => app.id === selectedAppId);
  const matchingApps = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return STORE_APPS.filter((app) => {
      const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
      const matchesSection = activeSection === 'Home' || (activeSection === 'Games' ? app.category === 'Entertainment' : app.category !== 'Entertainment');
      const matchesQuery = !query || `${app.name} ${app.publisher} ${app.category} ${app.description}`.toLocaleLowerCase().includes(query);
      return matchesCategory && matchesSection && matchesQuery;
    });
  }, [activeCategory, activeSection, search]);
  const featuredApp = STORE_APPS.find((app) => app.id === 'craftmine')!;

  useEffect(() => () => {
    if (installTimeoutRef.current !== null) window.clearTimeout(installTimeoutRef.current);
    if (installIntervalRef.current !== null) window.clearInterval(installIntervalRef.current);
  }, []);

  const install = (app: StoreApp) => {
    if (installingAppId) return;
    setInstallingAppId(app.id);
    setInstallSecondsRemaining(20);
    const completesAt = Date.now() + 20_000;
    installIntervalRef.current = window.setInterval(() => {
      setInstallSecondsRemaining(Math.max(0, Math.ceil((completesAt - Date.now()) / 1000)));
    }, 250);
    installTimeoutRef.current = window.setTimeout(() => {
      if (installIntervalRef.current !== null) window.clearInterval(installIntervalRef.current);
      installIntervalRef.current = null;
      installTimeoutRef.current = null;
      onInstall(app.id);
      setInstallingAppId(null);
      setInstallSecondsRemaining(20);
      setIsInstallDialogOpen(false);
      setNotice(`${app.name} is ready to use.`);
      window.setTimeout(() => setNotice(''), 2600);
    }, 20_000);
  };

  const closeInstallDialog = () => {
    if (installingAppId) return;
    setIsInstallDialogOpen(false);
    if (new URLSearchParams(window.location.search).has('app')) {
      window.history.replaceState(null, '', '/store');
    }
  };

  const launch = (app: StoreApp) => {
    if (installedApps.includes(app.id)) navigate(app.route);
    else {
      setSelectedAppId(app.id);
      setIsInstallDialogOpen(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#101012] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#101012]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8 lg:px-10">
          <button type="button" onClick={() => { setSelectedAppId(null); setActiveSection('Home'); }} className="flex items-center gap-3 text-left" aria-label="Store home">
            <WindowsMark className="size-6" />
            <span className="text-lg font-medium tracking-tight">Store</span>
          </button>
          <nav aria-label="Store sections" className="order-3 flex w-full items-center gap-6 sm:order-none sm:w-auto">
            {(['Home', 'Apps', 'Games'] as const).map((section) => (
              <button key={section} type="button" onClick={() => { setActiveSection(section); setSelectedAppId(null); }} className={`relative py-1 text-sm transition ${activeSection === section ? 'text-white' : 'text-white/55 hover:text-white'}`}>
                {section}{activeSection === section && <span className="absolute inset-x-0 -bottom-2 h-0.5 rounded-full bg-[#53c7ff]" />}
              </button>
            ))}
          </nav>
          <label className="ml-auto flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-white/15 bg-[#1b1b1e] px-3.5 focus-within:border-[#53c7ff] sm:max-w-[340px]">
            <Search className="size-4 shrink-0 text-white/55" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setSelectedAppId(null); }} placeholder="Search apps, games, and more" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" aria-label="Search Store" />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X className="size-4 text-white/50" /></button>}
          </label>
          <button type="button" onClick={() => { setActiveCategory('All'); setActiveSection('Apps'); setSelectedAppId(null); }} className="hidden items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs text-white/80 transition hover:bg-white/10 sm:flex"><Download className="size-3.5" /> Library <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{installedApps.length}</span></button>
        </div>
      </header>

      {selectedApp && <InstallAppDialog app={selectedApp} open={isInstallDialogOpen} installing={installingAppId === selectedApp.id} secondsRemaining={installSecondsRemaining} onInstall={() => install(selectedApp)} onClose={closeInstallDialog} />}

      <main className="mx-auto max-w-[1500px] px-5 pb-16 pt-7 sm:px-8 lg:px-10">
        {selectedApp ? (
          <section className="animate-in fade-in duration-200">
            <button type="button" onClick={() => setSelectedAppId(null)} className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ChevronRight className="size-4 rotate-180" /> Back to Store</button>
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b5eaa] via-[#084a88] to-[#10283d] p-6 sm:p-10 lg:p-12">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
                <AppArtwork app={selectedApp} className="size-20 rounded-[20px] p-4" />
                <div className="max-w-3xl flex-1">
                  <p className="text-sm font-medium text-white/65">{selectedApp.publisher}</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{selectedApp.name}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75"><span className="inline-flex items-center gap-1">{selectedApp.rating} <Star className="size-3.5 fill-current text-[#f6bf43]" /></span><span>{selectedApp.category}</span><span>{selectedApp.size}</span><span>Works on this device</span></div>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">{selectedApp.description}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    {installedApps.includes(selectedApp.id) ? (
                      <button type="button" onClick={() => navigate(selectedApp.route)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#66d2ff] px-8 text-sm font-semibold text-[#062235] transition hover:bg-[#8cddff]"><ArrowRight className="size-4" /> Open</button>
                    ) : (
                      <button type="button" onClick={() => install(selectedApp)} disabled={Boolean(installingAppId)} aria-busy={installingAppId === selectedApp.id} className="inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-lg bg-[#66d2ff] px-6 text-sm font-semibold text-[#062235] transition hover:bg-[#8cddff] disabled:cursor-wait disabled:opacity-90">{installingAppId === selectedApp.id ? <><LoaderCircle className="size-4 animate-spin" /> Installing {installSecondsRemaining}s</> : <><Download className="size-4" /> Install</>}</button>
                    )}
                    {installedApps.includes(selectedApp.id) && <button type="button" onClick={() => { onUninstall(selectedApp.id); setNotice(`${selectedApp.name} was uninstalled.`); }} className="h-11 rounded-lg border border-white/25 px-5 text-sm text-white/85 transition hover:bg-white/10">Uninstall</button>}
                  </div>
                  {notice && <p role="status" className="mt-4 text-sm text-white">{notice}</p>}
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <section className="rounded-2xl border border-white/10 bg-[#1b1b1d] p-6"><h2 className="text-lg font-semibold">About this app</h2><p className="mt-3 text-sm leading-6 text-white/65">{selectedApp.description} Install it to add it to your Windows experience. Your installed apps are saved on this device.</p></section>
              <section className="rounded-2xl border border-white/10 bg-[#1b1b1d] p-6"><h2 className="text-lg font-semibold">Discover more</h2><div className="mt-4 flex flex-col gap-4">{STORE_APPS.filter((app) => app.id !== selectedApp.id).slice(0, 3).map((app) => <button key={app.id} type="button" onClick={() => setSelectedAppId(app.id)} className="flex items-center gap-3 text-left"><AppArtwork app={app} className="size-11 rounded-xl p-2.5" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{app.name}</span><span className="text-xs text-white/50">{app.category}</span></span><ChevronRight className="size-4 text-white/40" /></button>)}</div></section>
            </div>
          </section>
        ) : (
          <>
            {activeSection === 'Home' && !search && (
              <section className="relative mb-10 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b62ad] via-[#073d72] to-[#171d32] p-6 sm:p-10 lg:p-12">
                <div className="pointer-events-none absolute -right-10 -top-20 size-72 rounded-full bg-[#38a9ff]/20 blur-3xl" />
                <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="max-w-xl">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80"><Sparkles className="size-3.5" /> Featured collection</p>
                    <p className="mt-5 text-sm font-medium text-white/70">Made for your next adventure</p>
                    <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Find your next<br className="hidden sm:block" /> favorite app.</h1>
                    <p className="mt-4 max-w-lg text-sm leading-6 text-white/70 sm:text-base">A little inspiration for your day. Discover tools, creativity, and entertainment picked for you.</p>
                    <button type="button" onClick={() => { setActiveSection('Games'); setSelectedAppId(featuredApp.id); }} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#65d1ff] px-5 text-sm font-semibold text-[#08243a] transition hover:bg-[#96e1ff]">Explore Craftmine <ArrowRight className="size-4" /></button>
                  </div>
                  <button type="button" onClick={() => setSelectedAppId(featuredApp.id)} className="group relative flex min-h-[210px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#509e4a] via-[#254c56] to-[#182a46] p-8 text-left sm:min-h-[280px]">
                    <span className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(135deg, transparent 24%, rgba(255,255,255,.16) 25%, transparent 26%), linear-gradient(45deg, transparent 24%, rgba(255,255,255,.12) 25%, transparent 26%)', backgroundSize: '48px 48px' }} />
                    <span className="relative flex flex-col items-center gap-4 text-center transition group-hover:scale-105"><AppArtwork app={featuredApp} className="size-24 rounded-[24px] p-5" /><span className="text-2xl font-semibold">Craftmine</span><span className="text-sm text-white/70">Build something extraordinary</span></span>
                  </button>
                </div>
              </section>
            )}

            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61caff]">{activeSection === 'Home' ? 'Made for you' : activeSection}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{search ? 'Search results' : activeSection === 'Home' ? 'Essential apps' : `Explore ${activeSection.toLowerCase()}`}</h2></div>
                {activeSection === 'Home' && <button type="button" onClick={() => setActiveSection('Apps')} className="inline-flex items-center gap-1 text-sm text-[#75cfff] transition hover:text-white">See all <ChevronRight className="size-4" /></button>}
              </div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
                {categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${activeCategory === category ? 'border-[#65d1ff] bg-[#65d1ff] text-[#08243a]' : 'border-white/15 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white'}`}>{category}</button>)}
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {matchingApps.map((app) => <AppCard key={app.id} app={app} installed={installedApps.includes(app.id)} installing={installingAppId === app.id} blocked={Boolean(installingAppId)} secondsRemaining={installSecondsRemaining} onInstall={() => install(app)} onOpen={() => launch(app)} />)}
              </div>
              {matchingApps.length === 0 && <div className="mt-5 rounded-2xl border border-white/10 bg-[#1b1b1d] px-6 py-12 text-center"><Search className="mx-auto size-7 text-white/35" /><h3 className="mt-3 text-lg font-medium">No apps found</h3><p className="mt-1 text-sm text-white/55">Try another name or category.</p></div>}
            </section>

            <section className="mt-12 rounded-2xl border border-white/10 bg-[#1b1b1d] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Your library</p><h2 className="mt-1 text-xl font-semibold">Installed apps</h2></div><button type="button" onClick={() => setActiveSection('Apps')} className="text-sm text-[#75cfff] hover:text-white">Browse store</button></div>
              {installedApps.length ? <div className="mt-5 flex gap-3 overflow-x-auto pb-1">{STORE_APPS.filter((app) => installedApps.includes(app.id)).map((app) => <button key={app.id} type="button" onClick={() => navigate(app.route)} className="flex min-w-[190px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.08]"><AppArtwork app={app} className="size-11 rounded-xl p-2.5" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{app.name}</span><span className="text-xs text-white/50">Installed</span></span><Check className="size-4 text-[#71d39a]" /></button>)}</div> : <p className="mt-4 text-sm text-white/55">Apps you install will appear here.</p>}
            </section>
            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-white/35"><Store className="size-3.5" /> A curated collection for your Windows desktop</p>
          </>
        )}
      </main>
    </div>
  );
};
