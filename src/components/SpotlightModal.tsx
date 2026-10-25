import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Info, 
  Settings as SettingsIcon,
  ChevronLeft,
  SlidersHorizontal,
  Layers,
  Palette,
  Radio,
  Film,
  Mic,
  MicOff,
  MessageCircle
} from 'lucide-react';
import { 
  FluentHomeIcon, 
  FluentLiveTvIcon, 
  FluentNewsIcon, 
  FluentSearchIcon,
  FluentMicOutlineIcon,
  FluentMicOffOutlineIcon,
  FluentCalculatorIcon,
  FluentSnippingToolIcon,
  FluentFeedbackHubIcon
} from './FluentIcons';
import { CHANNELS_DATA } from '../data/channels';
import { NEWS_DATA } from '../data/news';
import { Channel } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { useSettings } from '../hooks/useSettings';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string, state?: any) => void;
  onSelectChannel: (channel: Channel) => void;
}

const CATEGORY_ITEMS = [
  { id: 'cat-home', title: 'Home', route: '/', icon: FluentHomeIcon, color: '#4cc2ff' },
  { id: 'cat-livetv', title: 'Watch', route: '/live-tv', icon: FluentLiveTvIcon, color: '#4cc2ff' },
  { id: 'cat-news', title: 'Articles', route: '/news', icon: FluentNewsIcon, color: '#4cc2ff' },
  { id: 'cat-calc', title: 'Calculator', route: '/calculator', icon: FluentCalculatorIcon, color: '#0078d4' },
  { id: 'cat-snip', title: 'Snipping Tool', route: '/snipping-tool', icon: FluentSnippingToolIcon, color: '#0078d4' },
  { id: 'cat-feedback', title: 'Feedback Hub', route: '/feedback-hub', icon: FluentFeedbackHubIcon, color: '#0078d4' },
  { id: 'cat-settings', title: 'Settings', route: '/settings', icon: SettingsIcon, color: '#4cc2ff' },
  { id: 'cat-pc-settings', title: 'PC Settings', route: '/pc-settings', icon: SettingsIcon, color: '#4cc2ff' },
];

const SETTINGS_SHORTCUTS = [
  { id: 'set-font', title: 'Text Scaling & Typography', keyword: 'font scale zoom size text typography' },
  { id: 'set-autohide', title: 'Auto-hide Side View', keyword: 'auto-hide sidebar collapse side view' },
  { id: 'set-motion', title: 'Motion & Movements', keyword: 'motion movements animation reduce' },
  { id: 'set-search', title: 'Customize Search Categories', keyword: 'search spotlight categories tv news settings' },
  { id: 'set-keybinds', title: 'Custom Keybinds & Shortcuts', keyword: 'keybinds shortcuts keyboard alt command ctrl' },
  { id: 'set-theme', title: 'App Theme & Appearance', keyword: 'theme appearance dark light oled acrylic glass blur' },
  { id: 'set-navigation', title: 'Navigation Bar', keyword: 'navigation bar sidebar side view position' },
  { id: 'set-transparency', title: 'Spatial Glass & Blur', keyword: 'transparency opacity blur acrylic glass' },
  { id: 'set-updates', title: 'Software Updates', keyword: 'software update version build' },
  { id: 'set-accessibility', title: 'Accessibility', keyword: 'accessibility contrast motion keyboard screen reader' },
  { id: 'set-experimental', title: 'Experimental Features', keyword: 'experimental dev preview beta' },
  { id: 'set-reset', title: 'Reset Settings', keyword: 'reset restore defaults clear settings' },
];

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  navigate,
  onSelectChannel
}) => {
  const { settings, updateSetting } = useSettings();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'search' | 'settings'>('search');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    errorMessage: voiceError,
    toggleListening
  } = useVoiceSearch((transcript) => {
    setQuery(transcript);
    setIsFocused(true);
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIsFocused(false);
      setViewMode('search');
      const timer = setTimeout(() => {
        setIsFocused(true);
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsFocused(false);
      setViewMode('search');
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut & ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        if (viewMode === 'settings') {
          setViewMode('search');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, viewMode]);

  const rawQuery = query.trim();
  const normalizedQuery = rawQuery.toLowerCase();

  // 1. Channel matching (Live TV search & Channel number search)
  const matchedChannels = settings.searchTv ? CHANNELS_DATA.filter((ch, index) => {
    if (!normalizedQuery) return false;
    
    // Check channel number search (if searchChannelNumber setting is enabled)
    if (settings.searchChannelNumber) {
      const chNum = ch.channelNumber || (index + 1);
      const chCode = ch.channelCode || String(chNum).padStart(3, '0');
      const cleanNum = normalizedQuery.replace(/[^0-9]/g, '');
      
      // Match "001", "1", "kênh 1", "ch 1", "#1", etc.
      if (cleanNum && (
        String(chNum) === cleanNum || 
        chCode === cleanNum || 
        chCode.endsWith(cleanNum) ||
        cleanNum === String(chNum).padStart(cleanNum.length, '0')
      )) {
        return true;
      }
      
      // Match query containing channel code or formatted string
      if (normalizedQuery.includes(chCode) || normalizedQuery.includes(String(chNum))) {
        if (/^(kênh|ch|kenh|#|\s)*\d+$/i.test(normalizedQuery)) {
          return true;
        }
      }
    }

    return (
      ch.name.toLowerCase().includes(normalizedQuery) ||
      ch.shortName?.toLowerCase().includes(normalizedQuery) ||
      ch.category.toLowerCase().includes(normalizedQuery) ||
      ch.tags?.some((t) => t.toLowerCase().includes(normalizedQuery)) ||
      ch.currentProgram?.title.toLowerCase().includes(normalizedQuery)
    );
  }) : [];

  // 2. Category matching
  const matchedCategories = settings.searchCategories ? CATEGORY_ITEMS.filter((item) => 
    normalizedQuery && item.title.toLowerCase().includes(normalizedQuery)
  ) : [];

  // 3. News matching
  const matchedNews = settings.searchNews ? NEWS_DATA.filter((n) =>
    normalizedQuery && (
      n.title.toLowerCase().includes(normalizedQuery) ||
      n.category.toLowerCase().includes(normalizedQuery) ||
      n.tags?.some((t) => t.toLowerCase().includes(normalizedQuery))
    )
  ) : [];

  // 4. Settings shortcuts matching
  const matchedSettings = settings.searchSettings ? SETTINGS_SHORTCUTS.filter((s) =>
    normalizedQuery && (s.title.toLowerCase().includes(normalizedQuery) || s.keyword.toLowerCase().includes(normalizedQuery))
  ) : [];

  const showCopilot = normalizedQuery.length > 1 && /copilot|ask|question|help|explain|hỏi|giúp/i.test(normalizedQuery);

  const hasAnyResults = matchedChannels.length > 0 || 
    matchedCategories.length > 0 || 
    matchedNews.length > 0 || 
    matchedSettings.length > 0 ||
    showCopilot;

  const shouldAnimateModal = !settings.reduceAllMotion && settings.animateModals;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="spotlight-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop */}
          <motion.div 
            id="spotlight-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* 2. Dialog Modal Box - Fluent Design */}
          <motion.div 
            id="spotlight-popup-card"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.24,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 1.04,
              transition: {
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            className="fluent-modal-dialog relative w-full max-w-[520px] bg-[#2b2725]/95 dark:bg-[#2b2725]/95 border border-white/[0.12] rounded-[20px] p-3 sm:p-3.5 shadow-[0_28px_70px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl overflow-hidden z-10 my-auto max-h-[calc(100vh-32px)] flex flex-col text-white"
          >
            {viewMode === 'settings' ? (
              /* View 2: Search Settings Menu (Without navigating to Settings tab) */
              <div id="spotlight-settings-view" className="space-y-3.5 flex flex-col min-h-0">
                {/* Header with Back button, Title strictly centered, and Close */}
                <div className="relative flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/10 min-h-[36px]">
                  <button
                    id="btn-spotlight-back-to-search"
                    type="button"
                    onClick={() => setViewMode('search')}
                    className="z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[#666666] dark:text-[#AAAAAA] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-default group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back</span>
                  </button>

                  {/* Perfectly Centered Title */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-[#4cc2ff]/15 flex items-center justify-center text-[#4cc2ff]">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-[#111827] dark:text-white tracking-wide">Search Settings</span>
                  </div>

                  <button
                    id="btn-spotlight-close-settings"
                    type="button"
                    onClick={onClose}
                    className="z-10 w-7 h-7 rounded-full bg-transparent hover:bg-transparent border-none flex items-center justify-center text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors cursor-default"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtitle description */}
                <p className="text-[12px] text-[#666666] dark:text-[#AAAAAA] px-1 font-normal leading-relaxed select-none text-center">
                  Customize search scope and categories in Spotlight
                </p>

                {/* Settings list - Identical to Settings tab search section */}
                <div id="spotlight-search-settings-list" className="space-y-2.5 max-h-[min(400px,55vh)] overflow-y-auto pr-1 sidebar-scroller text-left">
                  {/* 1. Categories */}
                  <div 
                    id="setting-spotlight-categories"
                    onClick={() => updateSetting('searchCategories', !settings.searchCategories)}
                    className="group p-3 rounded-[12px] bg-[#332e2b]/80 border border-white/[0.06] flex items-center justify-between gap-3.5 cursor-default hover:bg-[#443d39] hover:border-white/[0.12] transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[#111827] dark:text-white text-[13.5px]">
                        Categories
                      </div>
                      <div className="text-[11.5px] text-[#666666] dark:text-[#AAAAAA] mt-0.5 leading-snug">
                        Display navigation tabs and sections (Home, Live TV, News, etc.)
                      </div>
                    </div>

                    <button
                      id="toggle-spotlight-search-categories"
                      type="button"
                      role="switch"
                      aria-checked={settings.searchCategories}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('searchCategories', !settings.searchCategories);
                      }}
                      className="toggle-switch-btn"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </div>

                  {/* 2. News */}
                  <div 
                    id="setting-spotlight-news"
                    onClick={() => updateSetting('searchNews', !settings.searchNews)}
                    className="group p-3 rounded-[12px] bg-[#332e2b]/80 border border-white/[0.06] flex items-center justify-between gap-3.5 cursor-default hover:bg-[#443d39] hover:border-white/[0.12] transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[#111827] dark:text-white text-[13.5px]">
                        News & Articles
                      </div>
                      <div className="text-[11.5px] text-[#666666] dark:text-[#AAAAAA] mt-0.5 leading-snug">
                        Display articles, community announcements, and events
                      </div>
                    </div>

                    <button
                      id="toggle-spotlight-search-news"
                      type="button"
                      role="switch"
                      aria-checked={settings.searchNews}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('searchNews', !settings.searchNews);
                      }}
                      className="toggle-switch-btn"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </div>

                  {/* 3. Live TV & Channel Numbers */}
                  <div className="p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                    {/* 3.1 Live TV */}
                    <div 
                      id="setting-spotlight-tv"
                      onClick={() => updateSetting('searchTv', !settings.searchTv)}
                      className="group flex items-center justify-between gap-3.5 cursor-default"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[#111827] dark:text-white text-[13.5px]">
                          Live TV Channels
                        </div>
                        <div className="text-[11.5px] text-[#666666] dark:text-[#AAAAAA] mt-0.5 leading-snug">
                          Display live TV channels by title or genre
                        </div>
                      </div>

                      <button
                        id="toggle-spotlight-search-tv"
                        type="button"
                        role="switch"
                        aria-checked={settings.searchTv}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting('searchTv', !settings.searchTv);
                        }}
                        className="toggle-switch-btn"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    {/* Divider */}
                    <hr className="border-black/[0.06] dark:border-white/[0.08]" />

                    {/* 3.2 Search by Channel Number */}
                    <div 
                      id="setting-spotlight-channel-number"
                      onClick={() => updateSetting('searchChannelNumber', !settings.searchChannelNumber)}
                      className="group flex items-center justify-between gap-3.5 cursor-default"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#111827] dark:text-white text-[13.5px]">
                            Search by Channel Number
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4cc2ff]/15 text-[#4cc2ff] tracking-wider shrink-0 font-mono">
                            CH #
                          </span>
                        </div>
                        <div className="text-[11.5px] text-[#666666] dark:text-[#AAAAAA] mt-0.5 leading-snug">
                          Quickly find channels by typing numbers (e.g. 1, 001, #12, ch 5)
                        </div>
                      </div>

                      <button
                        id="toggle-spotlight-search-channel-number"
                        type="button"
                        role="switch"
                        aria-checked={settings.searchChannelNumber}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting('searchChannelNumber', !settings.searchChannelNumber);
                        }}
                        className="toggle-switch-btn"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>
                  </div>

                  {/* 4. Settings */}
                  <div 
                    id="setting-spotlight-settings"
                    onClick={() => updateSetting('searchSettings', !settings.searchSettings)}
                    className="group p-3 rounded-[12px] bg-[#332e2b]/80 border border-white/[0.06] flex items-center justify-between gap-3.5 cursor-default hover:bg-[#443d39] hover:border-white/[0.12] transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[#111827] dark:text-white text-[13.5px]">
                        Settings
                      </div>
                      <div className="text-[11.5px] text-[#666666] dark:text-[#AAAAAA] mt-0.5 leading-snug">
                        Quickly jump to system and display preference sections
                      </div>
                    </div>

                    <button
                      id="toggle-spotlight-search-settings"
                      type="button"
                      role="switch"
                      aria-checked={settings.searchSettings}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('searchSettings', !settings.searchSettings);
                      }}
                      className="toggle-switch-btn"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View 1: Spotlight Search Standard Mode */
              <>
                {/* Fluent AutoSuggestBox Search Input */}
                <div 
                  id="spotlight-search-container"
                  onClick={() => {
                    setIsFocused(true);
                    inputRef.current?.focus();
                  }}
                  className="group relative w-full h-10 rounded-none windows-search-box flex items-center px-3.5 gap-2 transition-all cursor-text select-none"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      if (!query && !isListening) setIsFocused(false);
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Spotlight Search..."}
                    className="bg-transparent text-xs sm:text-[13px] outline-none border-none font-medium w-full text-left pr-24 no-fluent-line"
                  />

                  {/* Right Side Actions: Clear, Voice Search Mic & Search Settings */}
                  <div className="absolute right-2 flex items-center gap-1.5 shrink-0 overflow-visible">
                    <AnimatePresence>
                      {query && (
                        <motion.button 
                          type="button"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuery('');
                            inputRef.current?.focus();
                          }}
                          className="p-1 rounded-full text-[#8E8E93] hover:text-[#111827] dark:hover:text-white transition-colors cursor-default"
                          title="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}

                      {(isFocused || isListening) && (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, x: 20, scale: 0.85 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.85 }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                            mass: 0.8
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleListening();
                          }}
                          className={`w-7 h-7 rounded-full transition-all cursor-default flex items-center justify-center shrink-0 ${
                            isListening
                              ? 'border border-[#4cc2ff] text-[#4cc2ff] bg-[#4cc2ff]/10 scale-105 animate-pulse'
                              : 'text-[#888888] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                          title={isListening ? "Stop listening" : "Voice search"}
                        >
                          {isListening ? (
                            <FluentMicOffOutlineIcon className="w-4 h-4" />
                          ) : (
                            <FluentMicOutlineIcon className="w-4 h-4" />
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Settings Button: Opens Search Settings Menu inside Spotlight */}
                    <button
                      id="btn-spotlight-open-settings"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode('settings');
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-default shrink-0"
                      title="Search settings"
                      aria-label="Search settings"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </button>
                    <FluentSearchIcon className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
                  </div>
                </div>

                {/* Dynamic Content Area */}
                {!query ? (
                  <div className="py-9 sm:py-11 px-3 text-center rounded-[14px] bg-[#332e2b]/45 border border-white/[0.05]">
                    <p className="text-[13px] sm:text-sm text-[#666666] dark:text-[#AAAAAA] leading-relaxed font-normal select-none max-w-[290px] mx-auto">
                      Type keywords or channel numbers to search Sparkle (Dev)
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key="spotlight-results-container"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
                    className="spotlight-search-results-container mt-3 max-h-[320px] overflow-y-auto space-y-2.5 pr-1 sidebar-scroller"
                  >
                    {/* 1. Channels */}
                    {matchedChannels.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fcae8] flex items-center gap-1.5">
                          <CategoryIcon className="w-4 h-4 shrink-0" />
                          <span>Channels ({matchedChannels.length})</span>
                        </div>
                        {matchedChannels.map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => {
                              onSelectChannel(ch);
                              navigate(`/live-tv?channel=${ch.slug}`);
                              onClose();
                            }}
                            className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#332e2b]/80 hover:bg-[#443d39] border border-white/[0.06] hover:border-white/[0.12] cursor-default transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white shrink-0 p-1 overflow-hidden">
                                <img
                                   src={ch.logo}
                                  alt={ch.name}
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#111827] dark:text-white group-hover:text-[#4cc2ff] truncate">
                                    {ch.name}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#666666] dark:text-[#AAAAAA] truncate">
                                  {ch.category}
                                </div>
                              </div>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-[#4cc2ff] flex items-center justify-center text-[#111827] dark:text-white group-hover:text-black shrink-0 transition-colors">
                              <Play className="w-3 h-3 fill-current ml-0.5 group-hover:text-black" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. Categories / Navigation */}
                    {matchedCategories.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fcae8] flex items-center gap-1.5">
                          <CategoryIcon className="w-4 h-4 shrink-0" />
                          <span>Categories ({matchedCategories.length})</span>
                        </div>
                        {matchedCategories.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                navigate(item.route);
                                onClose();
                              }}
                              className="flex items-center gap-2.5 p-2.5 rounded-[12px] bg-[#332e2b]/80 hover:bg-[#443d39] border border-white/[0.06] hover:border-white/[0.12] cursor-default transition-all"
                            >
                              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                <IconComponent className="w-4 h-4 text-[#4cc2ff]" />
                              </div>
                              <span className="text-xs font-medium text-[#111827] dark:text-white truncate">{item.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. News */}
                    {matchedNews.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fcae8] flex items-center gap-1.5">
                          <CategoryIcon className="w-4 h-4 shrink-0" />
                          <span>Articles ({matchedNews.length})</span>
                        </div>
                        {matchedNews.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              navigate(`/news/${n.slug}`);
                              onClose();
                            }}
                            className="flex items-center gap-2.5 p-2.5 rounded-[12px] bg-[#332e2b]/80 hover:bg-[#443d39] border border-white/[0.06] hover:border-white/[0.12] cursor-default transition-all"
                          >
                            <div className="w-10 h-7 rounded bg-black/10 dark:bg-black/40 overflow-hidden shrink-0">
                              <img src={n.coverImage} alt={n.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs text-[#111827] dark:text-white line-clamp-1 flex-1 font-medium">{n.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Ask Copilot */}
                    {showCopilot && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fcae8] flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          <span>Assistant</span>
                        </div>
                        <div
                          id="spotlight-ask-copilot"
                          onClick={() => {
                            navigate('/copilot', { initialPrompt: query });
                            onClose();
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-[12px] bg-[#332e2b]/80 hover:bg-[#443d39] border border-white/[0.06] hover:border-white/[0.12] cursor-default transition-all"
                        >
                          <MessageCircle className="w-5 h-5 text-[#4cc2ff] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-white truncate">Ask Copilot</div>
                            <div className="text-[10px] text-[#AAAAAA] truncate">Ask about “{query}”</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. Settings Shortcuts */}
                    {matchedSettings.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fcae8] flex items-center gap-1.5">
                          <CategoryIcon className="w-4 h-4 shrink-0" />
                          <span>Settings ({matchedSettings.length})</span>
                        </div>
                        {matchedSettings.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              navigate('/settings');
                              onClose();
                            }}
                            className="flex items-center gap-2.5 p-2.5 rounded-[12px] bg-[#332e2b]/80 hover:bg-[#443d39] border border-white/[0.06] hover:border-white/[0.12] cursor-default transition-all"
                          >
                            <div className="w-7 h-7 flex items-center justify-center shrink-0">
                              <SettingsIcon className="w-4 h-4 text-[#4cc2ff]" />
                            </div>
                            <span className="text-xs font-medium text-[#111827] dark:text-white truncate">{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!hasAnyResults && (
                      <div className="py-6 text-center text-xs text-[#8E8E93]">
                        No results found for "<span className="text-[#111827] dark:text-white font-medium">{query}</span>"
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
