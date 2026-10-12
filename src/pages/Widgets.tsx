import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Sun, 
  CloudSun, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  Image as ImageIcon, 
  MapPin, 
  Gamepad2, 
  Briefcase, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Heart, 
  ThumbsUp, 
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSystemTasks } from '../context/SystemTasksContext';

interface VnExpressArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl: string;
  source: string;
}

interface WidgetsProps {
  navigate?: (route: string) => void;
}

export const Widgets: React.FC<WidgetsProps> = ({ navigate }) => {
  const { isTaskRunning, restartTask } = useSystemTasks();
  const isWidgetsRunning = isTaskRunning('task-widgets');

  // Live real-time clock matching "11:11 AM" in screenshot
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web search state
  const [webQuery, setWebQuery] = useState('');

  // VnExpress real-time news state
  const [news, setNews] = useState<VnExpressArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  const fetchVnExpressNews = async () => {
    setIsLoadingNews(true);
    setNewsError(null);
    try {
      const res = await fetch('/api/vnexpress-news');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        setNews(data.articles);
      } else {
        throw new Error('No articles returned');
      }
    } catch (err: any) {
      console.warn('Failed to load VnExpress news, using local fallback:', err);
      setNewsError(err?.message || 'Lỗi tải tin tức');
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchVnExpressNews();
  }, []);

  // Helper to format relative time (e.g. "12 mins ago")
  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Vừa cập nhật';
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${Math.floor(diffHours / 24)} ngày trước`;
    } catch {
      return 'Hôm nay';
    }
  };

  const handleWebSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webQuery.trim()) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(webQuery.trim())}`, '_blank');
  };

  // Divide fetched VnExpress news into different card sections
  const topStories = news.slice(0, 3);
  const heroStory = news[3] || news[0];
  const secondaryStory = news[4] || news[1];
  const visualStory = news[5] || news[2];

  if (!isWidgetsRunning) {
    return (
      <div className="w-full min-h-[70vh] bg-transparent text-[#111827] dark:text-[#f3f4f6] flex flex-col items-center justify-center p-6 select-none font-sans text-center">
        <div className="max-w-md p-6 rounded-[12px] bg-white/80 dark:bg-[#282c31]/80 border border-black/10 dark:border-white/10 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-black dark:text-white">Widgets Dashboard Experience đã bị dừng</h2>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Tiến trình <strong>Widgets Dashboard Experience</strong> đã bị đóng trong Task Manager. Do đó bảng tiện ích và nguồn cấp tin tức VnExpress tạm thời không thể hoạt động.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => restartTask('task-widgets')}
              className="px-4 py-2 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] text-white dark:text-black font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Khởi động lại tác vụ
            </button>
            <button
              type="button"
              onClick={() => navigate?.('/task-manager')}
              className="px-4 py-2 rounded-[6px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium cursor-pointer"
            >
              Mở Task Manager
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent text-[#111827] dark:text-[#f3f4f6] flex flex-col p-3 sm:p-6 md:p-8 select-none font-sans relative overflow-x-hidden">
      {/* Top Header matching Windows 11 Widgets Board in screenshot */}
      <header className="relative z-10 flex flex-col items-center justify-center gap-3 mb-6 sm:mb-8">
        {/* Right Corner Action Controls: + Add, Layout, Profile Avatar */}
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <button
            type="button"
            title="Thêm tiện ích (Add widget)"
            onClick={() => alert('Bảng Widgets V-One (Dev) đang đồng bộ dữ liệu thời tiết, lịch và tin tức VnExpress!')}
            className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white shadow-xs backdrop-blur-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Tùy chọn bố cục"
            className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white shadow-xs backdrop-blur-md cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0078d4] to-[#4cc2ff] border border-white/40 shadow-xs flex items-center justify-center text-white text-xs font-bold">
            V
          </div>
        </div>

        {/* 1. Large Central Digital Clock (11:11 AM style) */}
        <div className="text-3xl sm:text-4xl md:text-[42px] font-semibold tracking-tight text-neutral-800 dark:text-white/95 mt-1 sm:mt-0 font-sans">
          {currentTime}
        </div>

        {/* 2. Central Search Bar ("Search the web") */}
        <form onSubmit={handleWebSearch} className="w-full max-w-md sm:max-w-lg mt-0.5">
          <div className="w-full h-9 sm:h-10 px-3.5 rounded-full bg-white/80 dark:bg-[#282c31]/90 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center gap-2.5 transition-all focus-within:ring-2 focus-within:ring-[#0078d4] dark:focus-within:ring-[#4cc2ff]">
            <Search className="w-4 h-4 text-[#71717a] dark:text-[#a1a1aa] shrink-0" />
            <input
              type="text"
              value={webQuery}
              onChange={(e) => setWebQuery(e.target.value)}
              placeholder="Search the web"
              className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#9ca3af] outline-none"
            />
            {isLoadingNews && (
              <RefreshCw className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff] animate-spin shrink-0" />
            )}
          </div>
        </form>
      </header>

      {/* Main Responsive Grid Layout (Tiles matching user screenshot) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* ================= COLUMN 1 ================= */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* 1. Weather Widget (Top Left in screenshot) */}
          <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#1c4980] via-[#245899] to-[#3a79c9] text-white p-4 sm:p-5 shadow-[0_8px_24px_rgba(28,73,128,0.25)] border border-white/20 select-text">
            <div className="flex items-center justify-between text-xs text-white/80 mb-2">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>Hà Nội, VN</span>
              </div>
              <span className="text-[11px] opacity-75">Hôm nay</span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3">
                <Sun className="w-12 h-12 text-amber-300 drop-shadow-md animate-pulse" />
                <div className="text-4xl sm:text-5xl font-light tracking-tighter">
                  28°<span className="text-2xl font-normal opacity-80">C</span>
                </div>
              </div>
              <div className="text-right text-xs leading-tight">
                <span className="text-amber-200 font-medium block">Nắng nhẹ</span>
                <span className="text-white/70 text-[11px] block mt-0.5">UV mạnh 60%</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
              <span className="hover:underline cursor-pointer">Xem dự báo đầy đủ</span>
              <span className="text-[11px] opacity-75">Độ ẩm 65%</span>
            </div>
          </div>

          {/* 2. Photos Widget ("On This Day") */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
              <div className="flex items-center gap-1.5 font-medium text-black dark:text-white">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                <span>Ảnh kỷ niệm • Photos</span>
              </div>
              <button type="button" className="text-xs hover:underline cursor-pointer">Xem tất cả</button>
            </div>

            <div className="text-xs text-[#4b5563] dark:text-[#d1d5db]">
              Vào ngày này • 12 tháng 10 (24 khoảnh khắc)
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80"
                alt="Memory 1"
                className="w-full h-24 object-cover rounded-md hover:scale-105 transition-transform"
              />
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
                alt="Memory 2"
                className="w-full h-24 object-cover rounded-md hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* 3. Real-Time VnExpress: Top Stories Card */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <Flame className="w-4 h-4 fill-current" />
                <span>Tin nóng • VnExpress</span>
              </div>
              <button
                type="button"
                onClick={fetchVnExpressNews}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500"
                title="Cập nhật tin mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNews ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5 space-y-2.5 pt-1">
              {topStories.map((item, idx) => (
                <div key={item.id || idx} className="pt-2 first:pt-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] flex items-center gap-1.5 mb-1">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">VnExpress</span>
                      <span>•</span>
                      <span>{formatTimeAgo(item.pubDate)}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#111827] dark:text-white group-hover:text-[#0078d4] dark:group-hover:text-[#4cc2ff] line-clamp-2 leading-snug transition-colors">
                      {item.title}
                    </h4>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* 1. Calendar Widget (April / Events in screenshot) */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                <CalendarIcon className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                <span>Lịch biểu • Calendar</span>
              </div>
              <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">Tháng 10, 2026</span>
            </div>

            {/* Date Pills */}
            <div className="flex items-center justify-between gap-1 py-1 px-1 bg-black/5 dark:bg-white/5 rounded-lg text-center text-xs">
              {['10', '11', '12', '13', '14'].map((day, i) => (
                <div
                  key={day}
                  className={`flex-1 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    day === '12'
                      ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-bold shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#4b5563] dark:text-[#d1d5db]'
                  }`}
                >
                  <span className="block text-[10px] opacity-75">{['T7', 'CN', 'T2', 'T3', 'T4'][i]}</span>
                  <span>{day}</span>
                </div>
              ))}
            </div>

            {/* Events List */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 border-l-3 border-emerald-500 text-[#111827] dark:text-white">
                <div className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">Cả ngày</div>
                <div className="text-xs">🎂 Sinh nhật thành viên V-One (Dev)</div>
              </div>

              <div className="p-2 rounded-lg bg-sky-500/10 border-l-3 border-sky-500 text-[#111827] dark:text-white">
                <div className="font-semibold text-[11px] text-sky-600 dark:text-sky-400">8:30 AM (30 phút)</div>
                <div className="text-xs">📺 Trực tiếp chương trình Thời sự VTV1</div>
              </div>

              <div className="p-2 rounded-lg bg-purple-500/10 border-l-3 border-purple-500 text-[#111827] dark:text-white">
                <div className="font-semibold text-[11px] text-purple-600 dark:text-purple-400">12:30 PM (1 giờ)</div>
                <div className="text-xs">💼 Họp trực tuyến định hướng bản cập nhật</div>
              </div>
            </div>
          </div>

          {/* 2. Watchlist / Financial Markets Card */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Thị trường • Watchlist</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <div>
                  <span className="font-bold text-black dark:text-white block font-sans">VN-INDEX</span>
                  <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Sàn HOSE</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">1,288.42</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">+0.75% ▲</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <div>
                  <span className="font-bold text-black dark:text-white block font-sans">WGRB</span>
                  <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Global Index</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">435.75</span>
                  <span className="text-[11px] text-rose-500 font-sans">-1.67% ▼</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <div>
                  <span className="font-bold text-black dark:text-white block font-sans">CTSP</span>
                  <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Tech Index</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">23.98</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">+2.23% ▲</span>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-black/5 dark:border-white/5 text-right">
              <a href="https://vnexpress.net/kinh-doanh" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0078d4] dark:text-[#4cc2ff] hover:underline">
                Xem chi tiết chứng khoán →
              </a>
            </div>
          </div>

          {/* 3. Real-Time VnExpress: Feature Story with Image */}
          {heroStory && (
            <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 overflow-hidden shadow-sm group">
              <div className="relative h-40 overflow-hidden bg-black/20">
                <img
                  src={heroStory.imageUrl}
                  alt={heroStory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                  VnExpress
                </span>
              </div>
              <div className="p-3.5 space-y-2">
                <div className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] flex items-center gap-1.5">
                  <span>{formatTimeAgo(heroStory.pubDate)}</span>
                </div>
                <a
                  href={heroStory.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs sm:text-[13px] font-bold text-[#111827] dark:text-white group-hover:text-[#0078d4] dark:group-hover:text-[#4cc2ff] line-clamp-2 leading-snug transition-colors"
                >
                  {heroStory.title}
                </a>
                <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] line-clamp-2 leading-relaxed">
                  {heroStory.description}
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs text-[#6b7280] dark:text-[#9ca3af] border-t border-black/5 dark:border-white/5">
                  <span className="flex items-center gap-1 text-[11px] hover:text-rose-500 cursor-pointer">
                    <Heart className="w-3.5 h-3.5" /> 1.4k
                  </span>
                  <span className="flex items-center gap-1 text-[11px] hover:text-sky-500 cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" /> 842
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUMN 3 ================= */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* 1. Xbox Game Pass & Entertainment Card */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                <Gamepad2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Xbox Game Pass</span>
              </div>
              <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">Mới cập nhật</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md overflow-hidden bg-black/10 group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
                  alt="Halo"
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-1 text-[10px] font-semibold text-center truncate bg-black/60 text-white">
                  Halo
                </div>
              </div>
              <div className="rounded-md overflow-hidden bg-black/10 group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80"
                  alt="Forza"
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-1 text-[10px] font-semibold text-center truncate bg-black/60 text-white">
                  Forza
                </div>
              </div>
              <div className="rounded-md overflow-hidden bg-black/10 group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80"
                  alt="Craftmine"
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-1 text-[10px] font-semibold text-center truncate bg-black/60 text-white">
                  Craftmine
                </div>
              </div>
            </div>
          </div>

          {/* 2. Real-Time VnExpress: Secondary Story Card */}
          {secondaryStory && (
            <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 overflow-hidden shadow-sm group">
              <div className="relative h-36 overflow-hidden bg-black/20">
                <img
                  src={secondaryStory.imageUrl}
                  alt={secondaryStory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0078d4] text-white">
                  Thời sự
                </span>
              </div>
              <div className="p-3.5 space-y-2">
                <a
                  href={secondaryStory.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs sm:text-[13px] font-bold text-[#111827] dark:text-white group-hover:text-[#0078d4] dark:group-hover:text-[#4cc2ff] line-clamp-2 leading-snug transition-colors"
                >
                  {secondaryStory.title}
                </a>
                <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] line-clamp-2 leading-relaxed">
                  {secondaryStory.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#6b7280] dark:text-[#9ca3af] pt-1">
                  <span>{formatTimeAgo(secondaryStory.pubDate)}</span>
                  <span className="text-[#0078d4] dark:text-[#4cc2ff] hover:underline flex items-center gap-1">
                    Đọc báo <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Traffic / Map Widget */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Giao thông • Traffic</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                Thông thoáng
              </span>
            </div>

            <div className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
              Tuyến Cầu Nhật Tân - Nội Bài • Lưu lượng ổn định
            </div>

            <div className="h-28 rounded-lg overflow-hidden relative border border-black/10 dark:border-white/10">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=500&q=80"
                alt="Traffic Map Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5 text-white text-xs font-medium">
                Tốc độ trung bình: 65 km/h
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 4 ================= */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* 1. Microsoft 365 / Workspace Widget */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                <Briefcase className="w-4 h-4 text-[#0078d4]" />
                <span>Microsoft 365</span>
              </div>
              <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">V-One Office</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 space-y-1">
                <div className="text-[11px] font-semibold text-[#0078d4] dark:text-[#4cc2ff] flex items-center gap-1">
                  <span>@ Henry Brill</span> nhắc đến bạn
                </div>
                <p className="text-[#4b5563] dark:text-[#d1d5db] line-clamp-2">
                  "Bản thiết kế Fluent Acrylic cho các thẻ Widgets và Copilot đã sẵn sàng thử nghiệm..."
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 space-y-1">
                <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  Xu hướng tài liệu
                </div>
                <div className="font-medium text-black dark:text-white truncate">
                  Kế hoạch phát hành V-One (Dev) Build 261013
                </div>
              </div>
            </div>
          </div>

          {/* 2. Visual Story / Editorial Card */}
          {visualStory && (
            <div className="rounded-[14px] bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-4 shadow-sm space-y-3 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-[11px] text-white/80">
                <span className="font-semibold uppercase tracking-wider">Tiêu điểm VnExpress</span>
                <span>{formatTimeAgo(visualStory.pubDate)}</span>
              </div>

              <a
                href={visualStory.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-bold text-white hover:underline leading-snug line-clamp-3"
              >
                {visualStory.title}
              </a>

              <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                {visualStory.description}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-white/90 border-t border-white/20">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-current" /> Đọc nhiều nhất
                </span>
                <span className="flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                  Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* 3. Quick V-One Navigation Card */}
          <div className="rounded-[14px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-black dark:text-white">Lối tắt V-One (Dev)</span>
              <Sparkles className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => navigate?.('/live-tv')}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#0078d4]/10 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold">Live TV</div>
                <div className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Xem kênh HD</div>
              </button>

              <button
                type="button"
                onClick={() => navigate?.('/task-manager')}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#0078d4]/10 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold">Task Manager</div>
                <div className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Quản lý tác vụ</div>
              </button>

              <button
                type="button"
                onClick={() => navigate?.('/notes')}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#0078d4]/10 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold">Notes</div>
                <div className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Soạn thảo ghi chú</div>
              </button>

              <button
                type="button"
                onClick={() => navigate?.('/craftmine')}
                className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#0078d4]/10 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold">Craftmine</div>
                <div className="text-[10px] text-[#6b7280] dark:text-[#9ca3af]">Game 3D web</div>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
