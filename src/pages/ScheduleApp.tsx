import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Tv,
  Search,
  Radio,
  ExternalLink,
  Bell,
  BellRing,
  Check,
  ChevronRight,
  Flame,
  Filter,
  Play,
  RotateCw,
  Sparkles,
  Share2,
  CalendarDays
} from 'lucide-react';
import { Channel } from '../types';
import { CHANNELS_DATA } from '../data/channels';
import { fetchChannelEpgGuide, EpgProgram, EpgGuideResponse } from '../services/epgService';
import { SpinningRing } from '../components/SpinningRing';
import { FluentScheduleColorIcon } from '../components/FluentIcons';

interface ScheduleAppProps {
  navigate?: (route: string) => void;
  initialChannelId?: string;
}

export const ScheduleApp: React.FC<ScheduleAppProps> = ({
  navigate,
  initialChannelId
}) => {
  const [channels] = useState<Channel[]>(CHANNELS_DATA);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(() => {
    if (initialChannelId) {
      const found = CHANNELS_DATA.find((c) => c.id === initialChannelId);
      if (found) return found;
    }
    return CHANNELS_DATA[0];
  });

  const [guideData, setGuideData] = useState<EpgGuideResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelSearch, setChannelSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [reminders, setReminders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vone_epg_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [toastMessage, setToastMessage] = useState<string>('');
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  // Load EPG data
  const loadEpg = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await fetchChannelEpgGuide(selectedChannel, selectedDate || undefined, isManualRefresh);
      setGuideData(data);
      if (!selectedDate && data.dates && data.dates.length > 0) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const match = data.dates.find((d) => d === todayStr) || data.dates[0];
        setSelectedDate(match);
      }
    } catch (err: any) {
      setError('Không thể tải lịch phát sóng trực tuyến. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedChannel, selectedDate]);

  useEffect(() => {
    loadEpg(false);
  }, [selectedChannel.id, selectedDate]);

  // Toggle Reminder
  const toggleReminder = (program: EpgProgram) => {
    const key = `${selectedChannel.id}_${program.id}_${program.start}`;
    setReminders((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('vone_epg_reminders', JSON.stringify(next));
      } catch {}
      return next;
    });

    const isSet = !reminders[`${selectedChannel.id}_${program.id}_${program.start}`];
    showToast(isSet ? `Đã đặt nhắc nhở: ${program.title}` : `Đã hủy nhắc nhở: ${program.title}`);
  };

  // Filter channels
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels;
    const q = channelSearch.trim().toLowerCase();
    return channels.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.shortName && c.shortName.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q)
    );
  }, [channels, channelSearch]);

  // Filter programs
  const displayedPrograms = useMemo(() => {
    if (!guideData?.programs) return [];
    let list = guideData.programs;

    // Filter by date
    if (selectedDate) {
      list = list.filter((p) => p.start.startsWith(selectedDate));
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Filter by genre
    if (selectedGenre !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    return list;
  }, [guideData, selectedDate, searchQuery, selectedGenre]);

  // Find currently live program
  const currentLiveProgram = useMemo(() => {
    return displayedPrograms.find((p) => p.isLive) || null;
  }, [displayedPrograms]);

  // Date formatting helpers
  const formatDateLabel = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date().toISOString().slice(0, 10);
      const isToday = dateStr === today;
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = isToday ? 'Hôm nay' : days[d.getDay()];
      return `${dayName}, ${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  const handleWatchNow = (channel: Channel) => {
    if (navigate) {
      navigate(`/live-tv?channel=${encodeURIComponent(channel.id)}`);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-full bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Bell className="w-3.5 h-3.5 text-[#0078d4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FluentScheduleColorIcon className="w-8 h-8 shrink-0 drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Lịch phát sóng truyền hình
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] text-[10px] font-bold uppercase tracking-wider">
                  EPG Live
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Cập nhật lịch phát sóng 24/7 của toàn bộ hệ thống kênh VTV, HTV, SCTV, VTC và truyền hình địa phương
              </p>
            </div>
          </div>

          {/* Quick Action: Search & Reload */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadEpg(true)}
              title="Làm mới lịch phát sóng"
              disabled={isRefreshing}
              className="h-9 px-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0078d4]' : ''}`} />
              <span>{isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleWatchNow(selectedChannel)}
              className="h-9 px-4 rounded-full bg-gradient-to-r from-[#0078d4] to-[#0284c7] hover:from-[#006cbd] hover:to-[#0369a1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Xem {selectedChannel.name} ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Channel Sidebar + Program Schedule Table */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row overflow-hidden p-3 sm:p-5 gap-4">
        {/* Left Column: Channels Selector (Pill search, Channel Cards) */}
        <div className="w-full md:w-72 lg:w-80 flex flex-col bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 p-3 shadow-sm shrink-0">
          <div className="pb-2.5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Danh sách kênh ({filteredChannels.length})
              </span>
              <Tv className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Search Input */}
            <div className="relative w-full h-8 flex items-center px-3 rounded-[5px] bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 focus-within:border-[#0078d4] focus-within:ring-1 focus-within:ring-[#0078d4] transition-all">
              <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Tìm kênh (VTV1, HTV7...)"
                className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
              />
            </div>
          </div>

          {/* Channels Scroll Area */}
          <div className="flex-1 overflow-y-auto mt-2 space-y-1 max-h-[520px] md:max-h-[640px] pr-1">
            {filteredChannels.map((ch) => {
              const isSelected = selectedChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChannel(ch)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] font-semibold border border-[#0078d4]/30 shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    {ch.logo ? (
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        className="w-7 h-7 rounded object-contain bg-black/5 dark:bg-white/5 p-0.5 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {ch.name.slice(0, 3)}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs truncate">{ch.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{ch.category}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] shrink-0 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: EPG Schedule Viewport */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 p-4 sm:p-5 shadow-sm overflow-hidden">
          {/* Header Controls: Date Picker & Search Query (All in pill styling) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
            {/* Date Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {guideData?.dates && guideData.dates.length > 0 ? (
                guideData.dates.map((d) => {
                  const isSelected = selectedDate === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0078d4] text-white shadow-xs'
                          : 'bg-black/5 dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:bg-black/10'
                      }`}
                    >
                      {formatDateLabel(d)}
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-neutral-400">Đang tải các ngày phát sóng...</span>
              )}
            </div>

            {/* Search Input for Programs */}
            <div className="relative w-full lg:w-72 h-9 flex items-center px-3.5 rounded-[5px] bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 focus-within:border-[#0078d4] focus-within:ring-1 focus-within:ring-[#0078d4] transition-all">
              <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chương trình, thời sự, phim..."
                className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
              />
            </div>
          </div>

          {/* Currently Live Highlight Card */}
          {currentLiveProgram && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>ĐANG PHÁT SÓNG</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                    {currentLiveProgram.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    <span className="font-mono font-medium">
                      {currentLiveProgram.start.slice(11, 16)} - {currentLiveProgram.stop.slice(11, 16)}
                    </span>
                    <span>•</span>
                    <span>{currentLiveProgram.category || 'Chương trình truyền hình'}</span>
                  </div>
                  {currentLiveProgram.desc && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">
                      {currentLiveProgram.desc}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleWatchNow(selectedChannel)}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Xem trực tiếp</span>
              </button>
            </div>
          )}

          {/* Category Genre Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3">
            {['All', 'Thời sự', 'Phim', 'Thể thao', 'Giải trí', 'Thiếu nhi', 'Giáo dục'].map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-black/5 dark:bg-white/[0.05] text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Program Schedule List */}
          <div className="flex-1 overflow-y-auto mt-1 space-y-2 max-h-[500px] pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-3">
                <SpinningRing size={48} strokeWidth={4} color="#0078d4" />
                <p className="text-xs text-neutral-500 font-medium">
                  Đang tải lịch phát sóng {selectedChannel.name}...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-xs text-red-500 bg-red-500/10 rounded-xl">
                {error}
              </div>
            ) : displayedPrograms.length === 0 ? (
              <div className="p-16 text-center text-neutral-400 text-xs">
                Không tìm thấy chương trình nào cho ngày và bộ lọc đã chọn
              </div>
            ) : (
              displayedPrograms.map((program) => {
                const startTime = program.start.slice(11, 16);
                const stopTime = program.stop.slice(11, 16);
                const reminderKey = `${selectedChannel.id}_${program.id}_${program.start}`;
                const hasReminder = Boolean(reminders[reminderKey]);

                return (
                  <div
                    key={`${program.id}_${program.start}`}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      program.isLive
                        ? 'bg-[#0078d4]/10 border-[#0078d4]/40 shadow-xs'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 truncate">
                      {/* Time Column */}
                      <div className="w-14 sm:w-16 shrink-0 text-left">
                        <span className={`font-mono text-xs font-bold ${
                          program.isLive ? 'text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-800 dark:text-neutral-200'
                        }`}>
                          {startTime}
                        </span>
                        <p className="font-mono text-[10px] text-neutral-400">
                          {stopTime}
                        </p>
                      </div>

                      {/* Content Column */}
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                            program.isLive ? 'text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-900 dark:text-white'
                          }`}>
                            {program.title}
                          </h4>
                          {program.isLive && (
                            <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase shrink-0">
                              LIVE
                            </span>
                          )}
                        </div>
                        {program.category && (
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {program.category}
                          </span>
                        )}
                        {program.desc && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {program.desc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Reminder & Watch */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleReminder(program)}
                        title={hasReminder ? 'Đã bật nhắc nhở' : 'Đặt nhắc nhở'}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          hasReminder
                            ? 'bg-[#0078d4] text-white'
                            : 'bg-black/5 dark:bg-white/10 text-neutral-500 hover:text-[#0078d4]'
                        }`}
                      >
                        {hasReminder ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                      </button>

                      {program.isLive && (
                        <button
                          type="button"
                          onClick={() => handleWatchNow(selectedChannel)}
                          title="Xem kênh ngay"
                          className="px-2.5 py-1 rounded-full bg-[#0078d4] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span className="hidden sm:inline">Xem</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
