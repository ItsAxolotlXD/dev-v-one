import React, { useState, useEffect, useMemo } from 'react';
import {
  getRecallSnapshots,
  RecallSnapshot,
  deleteRecallSnapshot,
  clearRecallHistory,
  logRecallActivity
} from '../services/recallService';
import {
  AppTabIcon,
  FluentSearchIcon,
  FluentTimelineIcon,
  FluentFeedbackHubIcon,
  STORE_ICON_URL,
  APP_TAB_ICON_URLS
} from '../components/FluentIcons';
import {
  Mic,
  Home as HomeIcon,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  X,
  Play
} from 'lucide-react';

interface RecallAppProps {
  navigate: (path: string, state?: any) => void;
}

export const RecallApp: React.FC<RecallAppProps> = ({ navigate }) => {
  const [snapshots, setSnapshots] = useState<RecallSnapshot[]>(() => getRecallSnapshots());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRailTab, setActiveRailTab] = useState<'home' | 'timeline'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number>(0);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Reload snapshots whenever storage changes or custom event fires
  useEffect(() => {
    const refresh = () => setSnapshots(getRecallSnapshots());
    window.addEventListener('vone:recall-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('vone:recall-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  // Formatted date (e.g., "July 3" or localized)
  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }, []);

  // Filtered snapshots by search query & category
  const filteredSnapshots = useMemo(() => {
    let list = snapshots;
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.type === selectedCategory);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((s) => {
      return (
        s.title.toLowerCase().includes(q) ||
        s.appName.toLowerCase().includes(q) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
        (s.searchKeywords && s.searchKeywords.toLowerCase().includes(q)) ||
        (s.badgeText && s.badgeText.toLowerCase().includes(q))
      );
    });
  }, [snapshots, searchQuery, selectedCategory]);

  // Key snapshot items for the featured grid layout
  const heroSnapshot = filteredSnapshots[0] || snapshots[0];
  const subSnap1 = filteredSnapshots[1] || snapshots[1];
  const subSnap2 = filteredSnapshots[2] || snapshots[2];
  const rightTopSnap = filteredSnapshots.find((s) => s.type === 'paint' || s.id === 'snap-paint') || filteredSnapshots[3] || snapshots[1];
  const rightBottomSnap1 = filteredSnapshots.find((s) => s.id === 'snap-store' || s.type === 'tab') || filteredSnapshots[4] || snapshots[0];
  const rightBottomSnap2 = filteredSnapshots.find((s) => s.id === 'snap-outlook' || s.appName === 'Outlook') || filteredSnapshots[5] || snapshots[2];

  // Speech recognition toggle for search
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleOpenSnapshot = (snap: RecallSnapshot) => {
    navigate(snap.route);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteRecallSnapshot(id);
    setSnapshots(getRecallSnapshots());
  };

  const handleClear = () => {
    clearRecallHistory();
    setSnapshots([]);
    setIsConfirmClearOpen(false);
  };

  const handleSeedDemo = () => {
    logRecallActivity({
      type: 'tab',
      appName: 'Microsoft Store',
      title: 'Microsoft Store Preview',
      subtitle: 'Browse featured apps, games and media tools',
      durationText: 'You spent < 1m on this activity recently',
      badgeText: 'Microsoft Store',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      route: '/store'
    });
    setSnapshots(getRecallSnapshots());
  };

  return (
    <div className="min-h-full flex flex-col bg-[#f3f3f3] dark:bg-[#1a1a1a] text-[#111827] dark:text-[#f3f3f3] select-none font-sans transition-colors relative overflow-hidden">
      {/* Soft Ambient Light Glow in top-right corner (Mica/Recall effect) */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[550px] h-[550px] rounded-full blur-[110px] opacity-60 dark:opacity-25 bg-gradient-to-bl from-amber-200 via-emerald-100 to-transparent dark:from-amber-400 dark:via-emerald-400 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Top Window Header Bar */}
      <header className="h-[42px] px-4 shrink-0 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#202020]/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <AppTabIcon name="recall" className="w-4 h-4" />
          <span className="text-[12.5px] font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
            Recall <span className="text-[10.5px] font-normal text-neutral-500 dark:text-neutral-400">(preview)</span>
          </span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 dark:bg-blue-400/15 text-[#0078d4] dark:text-[#4cc2ff] font-medium border border-blue-500/20">
            Active Logger
          </span>
        </div>

        {/* Windows 11 window controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSeedDemo}
            title="Tạo hoạt động mẫu"
            className="px-2 py-1 text-[11px] rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Add sample</span>
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmClearOpen(true)}
            title="Xóa lịch sử Recall"
            className="px-2 py-1 text-[11px] rounded-[4px] hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />
          <div className="flex items-center">
            <span className="w-9 h-7 flex items-center justify-center text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rounded">―</span>
            <span className="w-9 h-7 flex items-center justify-center text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rounded">□</span>
            <span
              onClick={() => navigate('/')}
              className="w-9 h-7 flex items-center justify-center text-xs text-neutral-500 hover:bg-red-500 hover:text-white cursor-pointer rounded"
            >
              ✕
            </span>
          </div>
        </div>
      </header>

      {/* Main Container with Left Rail + Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Rail (Exact Windows Recall layout) */}
        <aside className="w-[68px] shrink-0 border-r border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#1f1f1f]/40 backdrop-blur-md flex flex-col items-center py-4 justify-between z-10">
          {/* Top Rail Buttons */}
          <div className="flex flex-col items-center gap-3 w-full px-2">
            {/* Home Button */}
            <button
              type="button"
              onClick={() => setActiveRailTab('home')}
              title="Home"
              className={`w-12 h-12 rounded-[8px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeRailTab === 'home'
                  ? 'bg-black/5 dark:bg-white/15 text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <HomeIcon className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Timeline Button */}
            <button
              type="button"
              onClick={() => setActiveRailTab('timeline')}
              title="Timeline"
              className={`w-12 h-12 rounded-[8px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeRailTab === 'timeline'
                  ? 'bg-black/5 dark:bg-white/15 text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <FluentTimelineIcon className="w-5 h-5" />
              <span className="text-[9.5px] font-medium leading-none">Timeline</span>
            </button>
          </div>

          {/* Bottom Rail Buttons: Feedback & Settings */}
          <div className="flex flex-col items-center gap-3 w-full px-2">
            <button
              type="button"
              onClick={() => navigate('/feedback')}
              title="Feedback"
              className="w-12 h-12 rounded-[8px] flex flex-col items-center justify-center gap-0.5 text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            >
              <FluentFeedbackHubIcon className="w-5 h-5" />
              <span className="text-[9.5px] font-medium leading-none">Feedback</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              title="Settings"
              className="w-12 h-12 rounded-[8px] flex flex-col items-center justify-center gap-0.5 text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            >
              <AppTabIcon name="settings" className="w-5 h-5" />
              <span className="text-[9.5px] font-medium leading-none">Settings</span>
            </button>
          </div>
        </aside>

        {/* Center Main Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 lg:p-10 flex flex-col max-w-7xl mx-auto w-full">
          {/* Greeting Section */}
          <div className="text-center pt-2 pb-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {greeting}
            </h1>
            <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 mt-1 font-normal">
              {formattedDate}
            </p>
          </div>

          {/* Centered Search Bar (Windows Recall capsule shape) */}
          <div className="max-w-2xl w-full mx-auto mb-8 relative">
            <div className="relative flex items-center bg-white dark:bg-[#252525] rounded-full border border-black/10 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#0078d4]/50 focus-within:border-[#0078d4]">
              <FluentSearchIcon className="w-4 h-4 shrink-0 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your history"
                className="w-full bg-transparent border-none outline-hidden text-[14px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full transition-colors mr-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Voice search"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Category Quick Filter Chips */}
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap text-xs">
              {[
                { id: 'all', label: 'All History' },
                { id: 'livetv', label: 'Live TV' },
                { id: 'paint', label: 'Paint & Ink' },
                { id: 'notes', label: 'Notes' },
                { id: 'sparkos', label: 'Core OS' },
                { id: 'tab', label: 'Apps & Store' },
                { id: 'article', label: 'Articles' },
                { id: 'search', label: 'Searches' },
                { id: 'gallery', label: 'Photos' },
                { id: 'settings', label: 'Settings' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11.5px] transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#0078d4] text-white font-medium shadow-xs'
                      : 'bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW MODE 1: HOME (Exact match to image_8f4cb8c1.png) */}
          {activeRailTab === 'home' && (
            <div className="space-y-6">
              {/* Primary 2-Column Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                {/* LEFT HERO CARD: Recent snapshots / Pick up where you left off */}
                {heroSnapshot && (
                  <div
                    onClick={() => handleOpenSnapshot(heroSnapshot)}
                    className="group bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md rounded-[16px] border border-black/5 dark:border-white/10 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                            Recent snapshots
                          </h2>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Pick up where you left off
                          </p>
                        </div>
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {heroSnapshot.relativeTime}
                        </span>
                      </div>

                      {/* Main Big Snapshot Frame with Colorful Border */}
                      <div className="mt-4 relative rounded-[12px] p-[2.5px] bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 to-sky-500 shadow-sm overflow-hidden group-hover:scale-[1.01] transition-transform">
                        <div className="relative w-full h-[220px] rounded-[10px] overflow-hidden bg-neutral-900 flex items-center justify-center">
                          <img
                            src={heroSnapshot.thumbnail}
                            alt={heroSnapshot.title}
                            className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-opacity"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/sparkos-wallpaper.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* Hover Play / Resume Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* App Badge Pill (Bottom-left) */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10">
                            {heroSnapshot.appIcon ? (
                              <img src={heroSnapshot.appIcon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-[#0078d4]" />
                            )}
                            <span className="truncate max-w-[180px]">{heroSnapshot.badgeText || heroSnapshot.appName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: 2 Mini Sub-Snapshots (Pa... and O...) */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                      {subSnap1 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSnapshot(subSnap1);
                          }}
                          className="relative group/sub rounded-[10px] p-[2px] bg-gradient-to-r from-amber-400 to-orange-500 hover:scale-[1.02] transition-transform cursor-pointer"
                        >
                          <div className="relative w-full h-[76px] rounded-[8px] overflow-hidden bg-neutral-900">
                            <img
                              src={subSnap1.thumbnail}
                              alt={subSnap1.title}
                              className="w-full h-full object-cover opacity-90 group-hover/sub:opacity-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/banners/thoi_su_19h_hd.webp';
                              }}
                            />
                            {/* Pill Badge */}
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-medium text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 shadow-xs">
                              {subSnap1.appIcon ? (
                                <img src={subSnap1.appIcon} alt="" className="w-3 h-3 object-contain shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              )}
                              <span className="truncate max-w-[70px]">{subSnap1.badgeText.slice(0, 5)}...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {subSnap2 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSnapshot(subSnap2);
                          }}
                          className="relative group/sub rounded-[10px] p-[2px] bg-gradient-to-r from-sky-400 to-indigo-500 hover:scale-[1.02] transition-transform cursor-pointer"
                        >
                          <div className="relative w-full h-[76px] rounded-[8px] overflow-hidden bg-neutral-900">
                            <img
                              src={subSnap2.thumbnail}
                              alt={subSnap2.title}
                              className="w-full h-full object-cover opacity-90 group-hover/sub:opacity-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/banners/asiad_2026.jpg';
                              }}
                            />
                            {/* Pill Badge */}
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-medium text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 shadow-xs">
                              {subSnap2.appIcon ? (
                                <img src={subSnap2.appIcon} alt="" className="w-3 h-3 object-contain shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              )}
                              <span className="truncate max-w-[70px]">{subSnap2.badgeText.slice(0, 4)}...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* RIGHT COLUMN: Top Wide Card (Paint) + 2 Bottom Cards (Microsoft Store & Outlook) */}
                <div className="flex flex-col gap-4">
                  {/* Top Right Card: Paint */}
                  {rightTopSnap && (
                    <div
                      onClick={() => handleOpenSnapshot(rightTopSnap)}
                      className="group bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md rounded-[16px] border border-black/5 dark:border-white/10 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                              {rightTopSnap.appName}
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {rightTopSnap.durationText}
                            </p>
                          </div>
                          {rightTopSnap.appIcon && (
                            <img
                              src={rightTopSnap.appIcon}
                              alt=""
                              className="w-5 h-5 object-contain shrink-0"
                            />
                          )}
                        </div>

                        {/* Snapshot Preview Frame with Gradient Border */}
                        <div className="mt-4 relative rounded-[12px] p-[2px] bg-gradient-to-r from-amber-400 via-rose-500 to-sky-400 group-hover:scale-[1.01] transition-transform">
                          <div className="relative w-full h-[120px] rounded-[10px] overflow-hidden bg-neutral-900">
                            <img
                              src={rightTopSnap.thumbnail}
                              alt={rightTopSnap.title}
                              className="w-full h-full object-cover opacity-95 group-hover:opacity-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/banners/vplay_background.webp';
                              }}
                            />
                            {/* Pill Badge */}
                            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-sky-500" />
                              <span className="truncate max-w-[160px]">{rightTopSnap.title}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Right Row: 2 Split Cards (Microsoft Store & Outlook) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Microsoft Store Card */}
                    {rightBottomSnap1 && (
                      <div
                        onClick={() => handleOpenSnapshot(rightBottomSnap1)}
                        className="group bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md rounded-[16px] border border-black/5 dark:border-white/10 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white">
                                {rightBottomSnap1.appName}
                              </h3>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-[140px]">
                                {rightBottomSnap1.durationText}
                              </p>
                            </div>
                            <img
                              src={rightBottomSnap1.appIcon || STORE_ICON_URL}
                              alt=""
                              className="w-4 h-4 object-contain shrink-0"
                            />
                          </div>

                          {/* Gradient frame */}
                          <div className="mt-3 relative rounded-[10px] p-[2px] bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 group-hover:scale-[1.01] transition-transform">
                            <div className="relative w-full h-[85px] rounded-[8px] overflow-hidden bg-neutral-900">
                              <img
                                src={rightBottomSnap1.thumbnail}
                                alt={rightBottomSnap1.title}
                                className="w-full h-full object-cover opacity-95 group-hover:opacity-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/banners/vplay_background.webp';
                                }}
                              />
                              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="truncate max-w-[110px]">{rightBottomSnap1.badgeText}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Outlook / Mail Card */}
                    {rightBottomSnap2 && (
                      <div
                        onClick={() => handleOpenSnapshot(rightBottomSnap2)}
                        className="group bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md rounded-[16px] border border-black/5 dark:border-white/10 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white">
                                {rightBottomSnap2.appName}
                              </h3>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-[140px]">
                                {rightBottomSnap2.durationText}
                              </p>
                            </div>
                            <img
                              src={rightBottomSnap2.appIcon || APP_TAB_ICON_URLS.mail}
                              alt=""
                              className="w-4 h-4 object-contain shrink-0"
                            />
                          </div>

                          {/* Gradient frame */}
                          <div className="mt-3 relative rounded-[10px] p-[2px] bg-gradient-to-r from-red-500 via-purple-500 to-sky-500 group-hover:scale-[1.01] transition-transform">
                            <div className="relative w-full h-[85px] rounded-[8px] overflow-hidden bg-neutral-900">
                              <img
                                src={rightBottomSnap2.thumbnail}
                                alt={rightBottomSnap2.title}
                                className="w-full h-full object-cover opacity-95 group-hover:opacity-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/banners/thoi_su_19h.webp';
                                }}
                              />
                              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                <span className="truncate max-w-[110px]">{rightBottomSnap2.badgeText}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Activity Timeline Feed (All logged activities) */}
              <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0078d4]" />
                      Activity History ({filteredSnapshots.length})
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Everything captured automatically across tabs, live TV, notes, canvas & searches
                    </p>
                  </div>
                </div>

                {filteredSnapshots.length === 0 ? (
                  <div className="text-center py-12 bg-white/40 dark:bg-white/5 rounded-[12px] border border-dashed border-black/10 dark:border-white/10">
                    <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No recall snapshots found</p>
                    <p className="text-xs text-neutral-400 mt-1">Try another search keyword or generate activity</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSnapshots.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenSnapshot(item)}
                        className="group bg-white/90 dark:bg-[#202020]/90 backdrop-blur-md rounded-[12px] border border-black/5 dark:border-white/10 p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {item.appIcon ? (
                                <img src={item.appIcon} alt="" className="w-4 h-4 object-contain shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                              )}
                              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
                                {item.appName}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-400">{item.relativeTime}</span>
                          </div>

                          {/* Thumbnail preview with gradient frame */}
                          <div className="relative rounded-[8px] p-[1.5px] bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 mb-2.5">
                            <div className="relative w-full h-[110px] rounded-[7px] overflow-hidden bg-neutral-900">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/banners/vplay_background.webp';
                                }}
                              />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1 rounded-full">
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>
                          </div>

                          {/* Title & Subtitle */}
                          <h4 className="text-[13px] font-medium text-neutral-900 dark:text-white line-clamp-1 group-hover:text-[#0078d4] dark:group-hover:text-[#4cc2ff] transition-colors">
                            {item.title}
                          </h4>
                          {item.subtitle && (
                            <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Actions footer */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                          <span className="text-neutral-400 truncate max-w-[160px]">{item.timeFormatted}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, item.id)}
                              title="Delete snapshot"
                              className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="text-[#0078d4] dark:text-[#4cc2ff] font-medium hover:underline flex items-center">
                              Resume <ChevronRight className="w-3 h-3 inline" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: TIMELINE (Interactive scrubber) */}
          {activeRailTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md rounded-[16px] border border-black/5 dark:border-white/10 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <FluentTimelineIcon className="w-5 h-5 text-[#0078d4]" />
                      Timeline Scrubber
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Drag through time to see what you were working on at any minute
                    </p>
                  </div>
                  {filteredSnapshots[selectedTimelineIndex] && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/10 text-[#0078d4] dark:text-[#4cc2ff] border border-blue-500/20">
                      {filteredSnapshots[selectedTimelineIndex].timeFormatted} &bull; {filteredSnapshots[selectedTimelineIndex].dateFormatted}
                    </span>
                  )}
                </div>

                {filteredSnapshots.length > 0 ? (
                  <div>
                    {/* Active Selected Snapshot in Timeline */}
                    {filteredSnapshots[selectedTimelineIndex] && (
                      <div className="my-6 rounded-[14px] p-[2.5px] bg-gradient-to-r from-red-500 via-amber-400 to-sky-500 shadow-md">
                        <div className="bg-neutral-950 rounded-[12px] p-4 flex flex-col md:flex-row items-center gap-6">
                          <div className="w-full md:w-2/3 h-[280px] rounded-[8px] overflow-hidden relative">
                            <img
                              src={filteredSnapshots[selectedTimelineIndex].thumbnail}
                              alt={filteredSnapshots[selectedTimelineIndex].title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#1f1f1f]/95 px-3 py-1 rounded-full text-xs font-semibold text-neutral-900 dark:text-white shadow">
                              {filteredSnapshots[selectedTimelineIndex].badgeText}
                            </div>
                          </div>
                          <div className="w-full md:w-1/3 flex flex-col justify-between self-stretch text-white">
                            <div>
                              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                                {filteredSnapshots[selectedTimelineIndex].appName}
                              </span>
                              <h3 className="text-lg font-semibold mt-1">
                                {filteredSnapshots[selectedTimelineIndex].title}
                              </h3>
                              <p className="text-xs text-neutral-400 mt-2">
                                {filteredSnapshots[selectedTimelineIndex].subtitle || 'No extra metadata recorded.'}
                              </p>
                              <div className="mt-4 p-2.5 rounded bg-white/5 border border-white/10 text-xs text-neutral-300">
                                <p className="text-neutral-400 text-[11px]">Logged relative time:</p>
                                <p className="font-semibold">{filteredSnapshots[selectedTimelineIndex].relativeTime} ({filteredSnapshots[selectedTimelineIndex].timeFormatted})</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenSnapshot(filteredSnapshots[selectedTimelineIndex])}
                              className="mt-6 w-full py-2.5 px-4 rounded-[6px] bg-[#0078d4] hover:bg-[#006cbd] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Resume this activity
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline Slider Track */}
                    <div className="pt-4 pb-2">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 font-mono">
                        <span>Latest (Now)</span>
                        <span>Drag slider across hours</span>
                        <span>Older</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, filteredSnapshots.length - 1)}
                        value={selectedTimelineIndex}
                        onChange={(e) => setSelectedTimelineIndex(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0078d4] cursor-pointer"
                      />
                    </div>

                    {/* Timeline Ticks and Thumbnails Scrubber Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto py-4 mt-2">
                      {filteredSnapshots.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedTimelineIndex(idx)}
                          className={`shrink-0 w-28 text-left rounded-[8px] p-2 border transition-all cursor-pointer ${
                            selectedTimelineIndex === idx
                              ? 'border-[#0078d4] bg-[#0078d4]/10 scale-105'
                              : 'border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 bg-black/5 dark:bg-white/5'
                          }`}
                        >
                          <div className="w-full h-14 rounded overflow-hidden mb-1.5 bg-neutral-800">
                            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[10px] font-semibold truncate text-neutral-800 dark:text-neutral-200">
                            {item.appName}
                          </p>
                          <p className="text-[9px] text-neutral-400 truncate">{item.relativeTime}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-neutral-400">
                    No snapshots available in timeline
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal: Clear History */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0078d4] text-white rounded-none p-0 max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="px-6 py-2.5 bg-[#0063b1] text-xs font-normal text-white/90 select-none">
              Recall History
            </div>
            <div className="p-6 pt-5 pb-4 space-y-2 text-left">
              <h3 className="text-2xl font-normal text-white tracking-tight leading-snug">
                Clear Recall History?
              </h3>
              <p className="text-sm text-white/95 mt-2 leading-relaxed font-normal">
                This will remove all snapshot logs and timeline memory from this device. This cannot be undone.
              </p>
            </div>
            <div className="bg-[#0078d4] px-6 py-4 pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
