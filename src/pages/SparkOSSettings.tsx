import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Accessibility,
  Bluetooth,
  Check,
  ChevronRight,
  Clock3,
  Gamepad2,
  HardDrive,
  Laptop,
  Palette,
  Settings2,
  ShieldCheck,
  UserRound,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { FluentSearchIcon } from '../components/FluentIcons';

const STORAGE_KEY = 'sparkos-pc-settings-v1';

type PcSettingsState = {
  appearance: 'dark' | 'light';
  accent: 'blue' | 'violet' | 'green';
  wifi: boolean;
  bluetooth: boolean;
  nightLight: boolean;
  notifications: boolean;
  gameMode: boolean;
  location: boolean;
  deviceName: string;
  scale: '100%' | '125%' | '150%';
  resolution: '1920 × 1080' | '1600 × 900' | '1280 × 720';
  timeZone: 'UTC−08:00' | 'UTC−05:00' | 'UTC+00:00' | 'UTC+07:00';
  airplaneMode: boolean;
  meteredConnection: boolean;
  gameCapture: boolean;
  animationEffects: boolean;
  autoTime: boolean;
  latestUpdates: boolean;
};

const defaultSettings: PcSettingsState = {
  appearance: 'dark',
  accent: 'blue',
  wifi: true,
  bluetooth: true,
  nightLight: false,
  notifications: true,
  gameMode: true,
  location: false,
  deviceName: 'CoreOS-PC',
  scale: '100%',
  resolution: '1920 × 1080',
  timeZone: 'UTC+07:00',
  airplaneMode: false,
  meteredConnection: false,
  gameCapture: false,
  animationEffects: true,
  autoTime: true,
  latestUpdates: false,
};

const categories: { id: string; label: string; subtitle: string; icon: LucideIcon }[] = [
  { id: 'system', label: 'System', subtitle: 'Display, sound, notifications, power', icon: Laptop },
  { id: 'bluetooth', label: 'Bluetooth & devices', subtitle: 'Mouse, keyboard, devices', icon: Bluetooth },
  { id: 'network', label: 'Network & internet', subtitle: 'Wi-Fi, airplane mode, VPN', icon: Wifi },
  { id: 'personalization', label: 'Personalization', subtitle: 'Background, colors, themes', icon: Palette },
  { id: 'apps', label: 'Apps', subtitle: 'Installed apps, defaults, features', icon: HardDrive },
  { id: 'accounts', label: 'Accounts', subtitle: 'Your account and sign-in options', icon: UserRound },
  { id: 'time', label: 'Time & language', subtitle: 'Language, region, date', icon: Clock3 },
  { id: 'gaming', label: 'Gaming', subtitle: 'Game mode and capture', icon: Gamepad2 },
  { id: 'accessibility', label: 'Accessibility', subtitle: 'Text size, visual effects', icon: Accessibility },
  { id: 'privacy', label: 'Privacy & security', subtitle: 'Location, permissions', icon: ShieldCheck },
  { id: 'update', label: 'Windows Update', subtitle: 'Update status and preferences', icon: Settings2 },
];

const accents: { id: PcSettingsState['accent']; label: string; color: string }[] = [
  { id: 'blue', label: 'Blue', color: '#60a5fa' },
  { id: 'violet', label: 'Violet', color: '#a78bfa' },
  { id: 'green', label: 'Green', color: '#4ade80' },
];

function readSettings(): PcSettingsState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved) as Partial<PcSettingsState>;
    return {
      ...defaultSettings,
      ...parsed,
      deviceName: parsed.deviceName === 'SparkOS-PC' ? defaultSettings.deviceName : parsed.deviceName ?? defaultSettings.deviceName,
    };
  } catch {
    return defaultSettings;
  }
}

function SettingRow({ title, children, light = false }: { title: string; children: ReactNode; light?: boolean }) {
  return (
    <div className={`flex min-h-[68px] items-center justify-between gap-4 py-3 ${light ? 'text-slate-900' : 'text-white/90'}`}>
      <div className="min-w-0">
        <p className={`text-[13px] font-normal ${light ? 'text-slate-900' : 'text-white/90'}`}>{title}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingToggle({ checked, label, onChange, accentColor }: { checked: boolean; label: string; onChange: (checked: boolean) => void; accentColor: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171b22] ${checked ? '' : 'bg-white/20'}`} style={checked ? { backgroundColor: accentColor } : undefined}>
      <span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SettingSelect({ value, label, options, onChange, light = false }: { value: string; label: string; options: string[]; onChange: (value: string) => void; light?: boolean }) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`max-w-36 rounded-lg border px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${light ? 'border-slate-300 bg-white text-slate-900' : 'border-white/10 bg-[#252a33] text-white'}`}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

export function SparkOSSettings() {
  const [settings, setSettings] = useState<PcSettingsState>(readSettings);
  const [activeId, setActiveId] = useState('system');
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Settings remain usable for this session if storage is unavailable.
    }
  }, [settings]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? categories.filter((category) => `${category.label} ${category.subtitle}`.toLowerCase().includes(normalizedQuery)) : categories;
  }, [query]);

  const activeCategory = categories.find((category) => category.id === activeId) ?? categories[0];
  const accentColor = accents.find((accent) => accent.id === settings.accent)?.color ?? accents[0].color;
  const update = <Key extends keyof PcSettingsState>(key: Key, value: PcSettingsState[Key]) => setSettings((current) => ({ ...current, [key]: value }));

  const applySearch = (value: string) => {
    setQuery(value);
    const normalizedQuery = value.trim().toLowerCase();
    if (!normalizedQuery) return;
    const match = categories.find((category) => `${category.label} ${category.subtitle}`.toLowerCase().includes(normalizedQuery));
    if (match) setActiveId(match.id);
  };

  const renderControls = () => {
    switch (activeId) {
      case 'system':
        return <>
          <SettingRow title="Display resolution" light={settings.appearance === 'light'}><SettingSelect label="Display resolution" value={settings.resolution} options={['1920 × 1080', '1600 × 900', '1280 × 720']} light={settings.appearance === 'light'} onChange={(value) => update('resolution', value as PcSettingsState['resolution'])} /></SettingRow>
          <SettingRow title="Scale" light={settings.appearance === 'light'}><SettingSelect label="Display scale" value={settings.scale} options={['100%', '125%', '150%']} light={settings.appearance === 'light'} onChange={(value) => update('scale', value as PcSettingsState['scale'])} /></SettingRow>
          <SettingRow title="Night light" light={settings.appearance === 'light'}><SettingToggle label="Night light" checked={settings.nightLight} onChange={(value) => update('nightLight', value)} accentColor={accentColor} /></SettingRow>
          <SettingRow title="Notifications" light={settings.appearance === 'light'}><SettingToggle label="Notifications" checked={settings.notifications} onChange={(value) => update('notifications', value)} accentColor={accentColor} /></SettingRow>
        </>;
      case 'bluetooth':
        return <>
          <SettingRow title="Bluetooth" light={settings.appearance === 'light'}><SettingToggle label="Bluetooth" checked={settings.bluetooth} onChange={(value) => update('bluetooth', value)} accentColor={accentColor} /></SettingRow>
          <SettingRow title="Device name" light={settings.appearance === 'light'}><input aria-label="Device name" value={settings.deviceName} onChange={(event) => update('deviceName', event.target.value.slice(0, 28))} className={`w-36 rounded-lg border px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${settings.appearance === 'light' ? 'border-slate-300 bg-white text-slate-900' : 'border-white/10 bg-[#252a33] text-white'}`} /></SettingRow>
          <div className={`mt-4 rounded-xl border p-4 ${settings.appearance === 'light' ? 'border-slate-200 bg-white' : 'border-white/[0.07] bg-white/[0.025]'}`}><p className={`text-xs font-medium ${settings.appearance === 'light' ? 'text-slate-800' : 'text-white/85'}`}>Pair a new device</p></div>
        </>;
      case 'network':
        return <>
          <SettingRow title="Wi-Fi" light={settings.appearance === 'light'}><SettingToggle label="Wi-Fi" checked={settings.wifi} onChange={(value) => update('wifi', value)} accentColor={accentColor} /></SettingRow>
          <SettingRow title="Airplane mode" light={settings.appearance === 'light'}><SettingToggle label="Airplane mode" checked={settings.airplaneMode} onChange={(value) => update('airplaneMode', value)} accentColor={accentColor} /></SettingRow>
          <SettingRow title="Metered connection" light={settings.appearance === 'light'}><SettingToggle label="Metered connection" checked={settings.meteredConnection} onChange={(value) => update('meteredConnection', value)} accentColor={accentColor} /></SettingRow>
        </>;
      case 'personalization':
        return <>
          <div className={`border-b py-4 ${settings.appearance === 'light' ? 'border-slate-200' : 'border-white/[0.07]'}`}><p className={`text-[13px] font-medium ${settings.appearance === 'light' ? 'text-slate-900' : 'text-white/90'}`}>Choose your mode</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" aria-pressed={settings.appearance === 'dark'} onClick={() => update('appearance', 'dark')} className={`rounded-xl border p-3 text-left transition-colors ${settings.appearance === 'dark' ? 'border-sky-400/70 bg-sky-400/10' : 'border-white/10 bg-white/[0.025]'}`}><span className="mb-2 block h-10 rounded-md border border-white/10 bg-[#1c2028]" /><span className={`text-xs ${settings.appearance === 'light' ? 'text-slate-700' : 'text-white/90'}`}>Dark</span></button><button type="button" aria-pressed={settings.appearance === 'light'} onClick={() => update('appearance', 'light')} className={`rounded-xl border p-3 text-left transition-colors ${settings.appearance === 'light' ? 'border-sky-400/70 bg-sky-400/10' : 'border-white/10 bg-white/[0.025]'}`}><span className="mb-2 block h-10 rounded-md border border-slate-200 bg-slate-100" /><span className={`text-xs ${settings.appearance === 'light' ? 'text-slate-700' : 'text-white/90'}`}>Light</span></button></div></div>
          <div className="py-4"><p className={`text-[13px] font-medium ${settings.appearance === 'light' ? 'text-slate-900' : 'text-white/90'}`}>Accent color</p><div className="mt-3 flex gap-3">{accents.map((accent) => <button key={accent.id} type="button" aria-label={`${accent.label} accent`} aria-pressed={settings.accent === accent.id} onClick={() => update('accent', accent.id)} className={`flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-[#171b22] focus-visible:outline-none focus-visible:ring-2 ${settings.accent === accent.id ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: accent.color }}>{settings.accent === accent.id && <Check aria-hidden="true" className="size-4 text-slate-950" />}</button>)}</div></div>
        </>;
      case 'gaming':
        return <>
          <SettingRow title="Game Mode" light={settings.appearance === 'light'}><SettingToggle label="Game Mode" checked={settings.gameMode} onChange={(value) => update('gameMode', value)} accentColor={accentColor} /></SettingRow>
          <SettingRow title="Game captures" light={settings.appearance === 'light'}><SettingToggle label="Game captures" checked={settings.gameCapture} onChange={(value) => update('gameCapture', value)} accentColor={accentColor} /></SettingRow>
        </>;
      case 'privacy':
        return <>
          <SettingRow title="Location services" light={settings.appearance === 'light'}><SettingToggle label="Location services" checked={settings.location} onChange={(value) => update('location', value)} accentColor={accentColor} /></SettingRow>
        </>;
      case 'apps':
        return <div className="flex flex-col gap-3">{['Microsoft Edge', 'Mail', 'Calendar', 'Photos'].map((app) => <div key={app} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${settings.appearance === 'light' ? 'border-slate-200 bg-white' : 'border-white/[0.07] bg-white/[0.025]'}`}><div className="flex items-center gap-3"><span className={`flex size-8 items-center justify-center rounded-lg ${settings.appearance === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-white/[0.06]'}`}><HardDrive aria-hidden="true" className="size-4" /></span><span className={`text-xs ${settings.appearance === 'light' ? 'text-slate-800' : 'text-white/85'}`}>{app}</span></div><ChevronRight aria-hidden="true" className="size-4 text-slate-500" /></div>)}</div>;
      case 'accounts':
        return <>
          <SettingRow title="Your profile" light={settings.appearance === 'light'}><span className={`rounded-full px-3 py-2 text-xs ${settings.appearance === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-white/[0.07] text-white/80'}`}>Alex</span></SettingRow>
          <SettingRow title="Account type" light={settings.appearance === 'light'}><span className={`rounded-full px-3 py-2 text-xs ${settings.appearance === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-white/[0.07] text-white/80'}`}>Local</span></SettingRow>
        </>;
      case 'time':
        return <>
          <SettingRow title="Time zone" light={settings.appearance === 'light'}><SettingSelect label="Time zone" value={settings.timeZone} options={['UTC−08:00', 'UTC−05:00', 'UTC+00:00', 'UTC+07:00']} light={settings.appearance === 'light'} onChange={(value) => update('timeZone', value as PcSettingsState['timeZone'])} /></SettingRow>
          <SettingRow title="Set time automatically" light={settings.appearance === 'light'}><SettingToggle label="Set time automatically" checked={settings.autoTime} onChange={(value) => update('autoTime', value)} accentColor={accentColor} /></SettingRow>
        </>;
      case 'accessibility':
        return <>
          <SettingRow title="Text size" light={settings.appearance === 'light'}><SettingSelect label="Text size" value={settings.scale} options={['100%', '125%', '150%']} light={settings.appearance === 'light'} onChange={(value) => update('scale', value as PcSettingsState['scale'])} /></SettingRow>
          <SettingRow title="Animation effects" light={settings.appearance === 'light'}><SettingToggle label="Animation effects" checked={settings.animationEffects} onChange={(value) => update('animationEffects', value)} accentColor={accentColor} /></SettingRow>
        </>;
      case 'update':
        return <>
          <div className={`mb-4 rounded-xl border p-4 ${settings.appearance === 'light' ? 'border-slate-200 bg-white' : 'border-white/[0.07] bg-white/[0.025]'}`}><div className={`flex items-center gap-2 text-xs font-medium ${settings.appearance === 'light' ? 'text-slate-900' : 'text-white/90'}`}><Check aria-hidden="true" className="size-4" style={{ color: accentColor }} />You&apos;re up to date</div></div>
          <SettingRow title="Get the latest updates as soon as they&apos;re available" light={settings.appearance === 'light'}><SettingToggle label="Get the latest updates" checked={settings.latestUpdates} onChange={(value) => update('latestUpdates', value)} accentColor={accentColor} /></SettingRow>
        </>;
      default:
        return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-xs leading-5 text-slate-400">Manage {activeCategory.label.toLowerCase()} preferences for Core OS on this device.</div>;
    }
  };

  const contentClass = settings.appearance === 'light' ? 'bg-[#f3f5f8] text-slate-900' : 'bg-[#171b22] text-white';
  const cardClass = settings.appearance === 'light' ? 'border-slate-200 bg-white' : 'border-white/[0.08] bg-[#1d222b]';

  return (
    <div aria-label="PC Settings" className={`flex h-full min-h-[320px] w-full overflow-hidden ${contentClass}`} style={{ colorScheme: settings.appearance }}>
      <aside aria-label="Settings categories" className={`flex w-[min(39%,220px)] shrink-0 flex-col border-r p-3 sm:w-[220px] sm:p-4 ${settings.appearance === 'light' ? 'border-slate-200 bg-[#edf0f4]' : 'border-white/[0.07] bg-[#14171d]'}`}>
        <div className="mb-4 flex items-center gap-2 px-1"><Settings2 aria-hidden="true" className="size-5 shrink-0" style={{ color: accentColor }} /><span className="truncate text-sm font-semibold">PC Settings</span></div>
        <label className="relative mb-4 flex h-8.5 items-center rounded-none windows-search-box px-3"><input aria-label="Find a setting" placeholder="Find a setting" value={query} onChange={(event) => applySearch(event.target.value)} className="w-full bg-transparent text-xs outline-none pr-6" /><FluentSearchIcon className="size-3.5 shrink-0 pointer-events-none absolute right-2.5" /></label>
        <nav aria-label="Settings pages" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return <button key={category.id} type="button" aria-current={activeId === category.id ? 'page' : undefined} onClick={() => setActiveId(category.id)} className={`flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:gap-3 sm:px-3 sm:text-xs ${activeId === category.id ? settings.appearance === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/[0.09] text-white' : settings.appearance === 'light' ? 'text-slate-600 hover:bg-white/70' : 'text-slate-300 hover:bg-white/[0.05]'}`}><Icon aria-hidden="true" className="size-4 shrink-0" style={activeId === category.id ? { color: accentColor } : undefined} /><span className="min-w-0 truncate">{category.label}</span></button>;
          })}
          {filteredCategories.length === 0 && <p className="px-2 py-3 text-xs text-slate-400">No settings found.</p>}
        </nav>
        <div className={`mt-3 flex items-center gap-2 border-t pt-3 ${settings.appearance === 'light' ? 'border-slate-200' : 'border-white/[0.07]'}`}><span className="flex size-7 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-semibold text-sky-200">A</span><span className="truncate text-xs">Alex</span></div>
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Settings</p><h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">{activeCategory.label}</h1></div></div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border p-3.5 ${cardClass}`}><p className="text-[10px] text-slate-400">Device name</p><p className="mt-1 truncate text-sm font-medium">{settings.deviceName || 'CoreOS-PC'}</p></div>
          <div className={`rounded-xl border p-3.5 ${cardClass}`}><p className="text-[10px] text-slate-400">Status</p><p className="mt-1 text-sm font-medium">Everything is running smoothly</p></div>
        </div>
        <div className={`rounded-xl border px-4 sm:px-5 ${cardClass}`}>
          {renderControls()}
        </div>
      </section>
    </div>
  );
}
