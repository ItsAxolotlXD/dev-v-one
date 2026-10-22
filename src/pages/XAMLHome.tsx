import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Folder, 
  ExternalLink, 
  Clock, 
  Newspaper, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { AppTabIcon } from '../components/FluentIcons';
import { Channel } from '../types';

interface XAMLHomeProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onNavigate: (route: string) => void;
}

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl: string;
  source: string;
}

const DEFAULT_VNEXPRESS_NEWS: NewsItem[] = [
  {
    id: 'vn-1',
    title: 'Thị trường công nghệ đón nhận làn sóng nâng cấp AI thế hệ mới',
    link: 'https://vnexpress.net',
    pubDate: 'Hôm nay',
    description: 'Các tập đoàn công nghệ lớn liên tục tích hợp các mô hình trí tuệ nhân tạo thế hệ mới vào hệ điều hành và nền tảng dịch vụ đa phương tiện.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/12-1791792565-9383-1791792583.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dYMdNpTlc0sGu_BCVjKx0g',
    source: 'VnExpress'
  },
  {
    id: 'vn-2',
    title: 'Hạ tầng số Việt Nam bứt phá với các giải pháp truyền hình đa nền tảng',
    link: 'https://vnexpress.net',
    pubDate: 'Hôm nay',
    description: 'Các giải pháp truyền dẫn trực tuyến chuẩn HLS độ trễ thấp mang lại trải nghiệm xem truyền hình sắc nét cho người dùng cả nước.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/GeminiGeneratedImageyxxcc0yxxc-5642-1454-1791795399.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=cYGimVQpPzsAh1aAMvHa9A',
    source: 'VnExpress'
  },
  {
    id: 'vn-3',
    title: 'Đại hội Thể thao Châu Á ASIAD 2026: Khung giờ phát sóng các môn thi đấu trọng điểm',
    link: 'https://vnexpress.net',
    pubDate: 'Hôm nay',
    description: 'Lịch phát sóng trực tiếp các môn thi đấu của đoàn thể thao Việt Nam trên các kênh VTV1, VTV5 và VTV Cần Thơ.',
    imageUrl: '/banners/asiad_2026.jpg',
    source: 'VnExpress'
  }
];

const quickAccess = [
  { label: 'Articles', route: '/news', icon: 'articles' as const },
  { label: 'Widgets', route: '/widgets', icon: 'widgets' as const },
  { label: 'Store', route: '/store', icon: 'store' as const },
  { label: 'SparkOS', route: '/sparkos', icon: 'sparkos' as const },
  { label: 'Settings', route: '/settings', icon: 'settings' as const },
];

export const XAMLHome: React.FC<XAMLHomeProps> = ({ channels, onSelectChannel, onNavigate }) => {
  const [expanded, setExpanded] = useState({ quickAccess: true, favorites: true, recent: false, liveChannels: true });

  const toggleCategory = (category: keyof typeof expanded) => {
    setExpanded((current) => ({ ...current, [category]: !current[category] }));
  };

  // Real-time news state from VnExpress
  const [newsList, setNewsList] = useState<NewsItem[]>(DEFAULT_VNEXPRESS_NEWS);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real-time news from VnExpress API
  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/vnexpress-news');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles) && data.articles.length > 0) {
            if (isMounted) {
              setNewsList(data.articles);
            }
          }
        }
      } catch (err) {
        console.warn('[XAMLHome] Error fetching VnExpress news:', err);
      }
    };

    fetchNews();
    const pollInterval = setInterval(fetchNews, 45000); // Update in real-time every 45s
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // 5 seconds auto-switch news timer
  useEffect(() => {
    if (isPaused || newsList.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [newsList.length, isPaused, currentNewsIndex]);

  const activeArticle = newsList[currentNewsIndex] || newsList[0];

  const handleNextArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentNewsIndex((prev) => (prev + 1) % newsList.length);
  };

  const handlePrevArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentNewsIndex((prev) => (prev - 1 + newsList.length) % newsList.length);
  };

  return (
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-1 pb-10 text-[#e8e8e8] font-sans">
      {/* Real-time VnExpress News Summary Block (replaces banner) */}
      <div className="mx-auto w-full max-w-5xl px-2 sm:px-4 mb-4 pt-3">
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1b1c20] via-[#141518] to-[#101114] border border-white/10 shadow-lg shadow-black/40 p-4 sm:p-5 transition-all"
        >
          {/* Header Row: VnExpress Badge, Live Indicator & Controls */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5 text-xs select-none">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E50914] text-white font-bold text-[11px] tracking-wide flex items-center gap-1 shadow-xs">
                <Newspaper className="w-3.5 h-3.5" />
                VnExpress
              </span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Trực tiếp • Cập nhật liên tục</span>
              </div>
            </div>

            {/* Navigation and progress indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-mono">
                {currentNewsIndex + 1}/{newsList.length}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevArticle}
                  aria-label="Tin trước"
                  className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextArticle}
                  aria-label="Tin kế tiếp"
                  className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Animated 5s Progress Bar */}
          <div className="w-full h-[2px] bg-white/5 overflow-hidden my-2.5 rounded-full">
            <motion.div
              key={currentNewsIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-[#0078d4] to-[#4cc2ff]"
            />
          </div>

          {/* Article Card Content with Fluid Animation every 5 seconds */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeArticle.id || currentNewsIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-[180px_1fr] sm:grid-cols-[140px_1fr] gap-4 items-center pt-1"
            >
              {/* Thumbnail Image */}
              <div 
                onClick={() => onNavigate('/news')}
                className="w-full h-28 sm:h-32 md:h-28 rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0 cursor-pointer group"
              >
                <img
                  src={activeArticle.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'}
                  alt={activeArticle.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80';
                  }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Summary */}
              <div className="flex flex-col justify-center min-w-0 space-y-1.5">
                <div 
                  onClick={() => onNavigate('/news')}
                  className="cursor-pointer group"
                >
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#4cc2ff] transition-colors leading-snug line-clamp-2">
                    {activeArticle.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-[13px] text-neutral-300 line-clamp-2 leading-relaxed">
                  {activeArticle.description}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{activeArticle.pubDate ? new Date(activeArticle.pubDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) || 'Mới cập nhật' : 'Mới cập nhật'}</span>
                    <span>•</span>
                    <span className="text-[#4cc2ff]">Tin mới VnExpress</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('/news')}
                    className="inline-flex items-center gap-1 text-[#4cc2ff] hover:text-[#7ad6ff] hover:underline transition-colors font-medium cursor-pointer"
                  >
                    <span>Xem tin tức</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-2 sm:px-4">
        <button type="button" onClick={() => toggleCategory('quickAccess')} className="flex cursor-pointer items-center gap-1 py-1 text-[13px] font-normal hover:text-white transition-colors">
          {expanded.quickAccess ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
          <span>Quick access</span>
        </button>

        <AnimatePresence initial={false}>
          {expanded.quickAccess && <motion.div key="quick-access" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="xaml-category-items flex flex-col">
              {quickAccess.map(({ label, route, icon }) => (
                <button key={label} type="button" onClick={() => onNavigate(route)} className="grid min-h-9 cursor-pointer grid-cols-[1fr_155px] items-center px-1 text-left text-[13px] hover:bg-[#111111] transition-colors rounded-[4px]">
                  <div className="flex items-center gap-2">
                    <AppTabIcon name={icon} className="size-4 shrink-0" />
                    <span>{label}</span>
                  </div>
                  <span className="text-[#777]">App</span>
                </button>
              ))}
            </div>
          </motion.div>}
        </AnimatePresence>

        <button type="button" onClick={() => toggleCategory('favorites')} className="mt-2 flex cursor-pointer items-center gap-1 text-[13px] hover:text-white transition-colors">
          {expanded.favorites ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
          <span>Favorites</span>
        </button>
        <AnimatePresence initial={false}>
          {expanded.favorites && <motion.div key="favorites" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="xaml-category-items flex min-h-8 items-center gap-2 px-1 text-[13px]"><Folder className="size-4 text-[#8d8d8d]" strokeWidth={1.5} /><span className="text-[#dedede]">No Items</span></div>
          </motion.div>}
        </AnimatePresence>

        <button type="button" onClick={() => toggleCategory('recent')} className="mt-2 flex cursor-pointer items-center gap-1 text-[13px] hover:text-white transition-colors">
          {expanded.recent ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
          <span>Recent</span>
        </button>
        <AnimatePresence initial={false}>
          {expanded.recent && <motion.div key="recent" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="xaml-category-items min-h-8 overflow-hidden px-1 text-[13px] text-[#777]">No Items</motion.div>}
        </AnimatePresence>

        <div className="mt-5 border-t border-[#202020] pt-3">
          <button type="button" onClick={() => toggleCategory('liveChannels')} className="mb-1 flex cursor-pointer items-center gap-1 text-[13px] hover:text-white transition-colors">
            {expanded.liveChannels ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
            <span>Live channels</span>
            <span className="ml-1 text-[11px] text-[#777]">{channels.length}</span>
          </button>
          <AnimatePresence initial={false}>
            {expanded.liveChannels && <motion.div key="live-channels" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="xaml-category-items flex flex-col">
                {channels.map((channel) => (
                  <button key={channel.id} type="button" onClick={() => onSelectChannel(channel)} className="grid min-h-11 cursor-pointer grid-cols-[34px_1fr_155px] items-center gap-1 px-1 text-left text-[13px] hover:bg-[#171717] transition-colors rounded-[4px]"><span className="flex size-7 items-center justify-center"><img src={channel.logo} alt="" className="max-h-6 max-w-7 object-contain" referrerPolicy="no-referrer" /></span><span className="truncate text-[#ededed]">{channel.name}</span><span className="truncate text-[#8f8f8f]">{channel.currentProgram?.title || channel.category}</span></button>
                ))}
              </div>
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
