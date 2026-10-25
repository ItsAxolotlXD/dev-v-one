import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, ChevronDown, Folder, Newspaper, Radio, ChevronLeft } from 'lucide-react';
import { AppTabIcon } from '../components/FluentIcons';
import { Channel } from '../types';
import { useSettings } from '../hooks/useSettings';

interface XAMLHomeProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onNavigate: (route: string) => void;
}

interface VnExpressArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl?: string;
  source?: string;
}

const FALLBACK_ARTICLES: VnExpressArticle[] = [
  {
    id: 'fb-1',
    title: 'Thị trường công nghệ đón nhận làn sóng nâng cấp AI thế hệ mới',
    link: 'https://vnexpress.net',
    pubDate: 'Hôm nay',
    description: 'Các tập đoàn công nghệ lớn liên tục tích hợp các mô hình trí tuệ nhân tạo thế hệ mới vào hệ điều hành và nền tảng dịch vụ.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/12-1791792565-9383-1791792583.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dYMdNpTlc0sGu_BCVjKx0g',
    source: 'VnExpress'
  },
  {
    id: 'fb-2',
    title: 'Hạ tầng số Việt Nam bứt phá với các giải pháp truyền hình đa nền tảng',
    link: 'https://vnexpress.net',
    pubDate: 'Hôm nay',
    description: 'Các giải pháp truyền dẫn trực tuyến chuẩn HLS độ trễ thấp mang lại trải nghiệm xem truyền hình sắc nét cho người dùng cả nước.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/GeminiGeneratedImageyxxcc0yxxc-5642-1454-1791795399.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=cYGimVQpPzsAh1aAMvHa9A',
    source: 'VnExpress'
  },
  {
    id: 'fb-3',
    title: 'Dự báo thời tiết các khu vực trên cả nước trong tuần mới',
    link: 'https://vnexpress.net',
    pubDate: 'Hôm nay',
    description: 'Bắc Bộ duy trì thời tiết mát mẻ dễ chịu, trong khi khu vực Nam Bộ có mưa rào rải rác về chiều tối.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/gemini-generated-imagehgj4c1hg-8847-3849-1791793049.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=a8eEFn-MzysZwbPrIEQkXg',
    source: 'VnExpress'
  }
];

const quickAccess = [
  { label: 'Articles', route: '/news', icon: 'articles' as const },
  { label: 'Widgets', route: '/widgets', icon: 'widgets' as const },
  { label: 'Store', route: '/store', icon: 'store' as const },
  { label: 'Live Tiles', route: '/live-tiles', icon: 'sparkos' as const },
  { label: 'SparkOS', route: '/sparkos', icon: 'sparkos' as const },
  { label: 'Settings', route: '/settings', icon: 'settings' as const },
];

export const XAMLHome: React.FC<XAMLHomeProps> = ({ channels, onSelectChannel, onNavigate }) => {
  const { updateSetting } = useSettings();
  const [expanded, setExpanded] = useState({ quickAccess: true, favorites: true, recent: false, liveChannels: true });

  // Real-time VnExpress News State
  const [newsArticles, setNewsArticles] = useState<VnExpressArticle[]>(FALLBACK_ARTICLES);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Fetch real-time news from server
  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/vnexpress-news');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.articles) && data.articles.length > 0) {
            setNewsArticles(data.articles);
          }
        }
      } catch {
        // Fallback already pre-set
      }
    };

    fetchNews();

    // Refetch every 60s for real-time updates
    const pollTimer = setInterval(fetchNews, 60000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, []);

  // 5-second rotation effect for summarized news
  useEffect(() => {
    if (newsArticles.length <= 1) return;
    const rotateTimer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsArticles.length);
    }, 5000);

    return () => clearInterval(rotateTimer);
  }, [newsArticles.length]);

  const toggleCategory = (category: keyof typeof expanded) => {
    setExpanded((current) => ({ ...current, [category]: !current[category] }));
  };

  const currentArticle = newsArticles[currentNewsIndex] || newsArticles[0];

  const handlePrevNews = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentNewsIndex((prev) => (prev === 0 ? newsArticles.length - 1 : prev - 1));
  };

  const handleNextNews = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentNewsIndex((prev) => (prev + 1) % newsArticles.length);
  };

  return (
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-transparent px-1 pb-10 text-neutral-900 dark:text-[#e8e8e8] font-sans">
      <div className="mx-auto w-full max-w-5xl px-2 sm:px-4 pt-3 space-y-4">
        {/* Live Tiles Home Insider Flag Banner */}
        <div className="w-full rounded-xl bg-gradient-to-r from-[#0078d4]/20 via-[#0050ef]/10 to-transparent border border-[#0078d4]/30 p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0078d4] text-white uppercase tracking-wider">
              Insider Flag
            </span>
            <span className="text-neutral-200 font-medium">
              Trải nghiệm giao diện <strong className="text-white">Live Tiles Home</strong> phong cách Windows 8 & Windows 10
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => updateSetting('liveTilesHome', true)}
              className="px-3 py-1 bg-[#0078d4] hover:bg-[#0067b8] text-white font-semibold rounded text-xs transition-colors cursor-pointer"
            >
              Bật Live Tiles
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/settings')}
              className="text-neutral-400 hover:text-white px-1.5 py-1 text-xs underline cursor-pointer"
            >
              Cài đặt
            </button>
          </div>
        </div>

        {/* Real-Time VnExpress News Summary Block (5s auto-rotate) */}
        <div className="w-full rounded-2xl bg-black/25 dark:bg-black/35 border border-white/10 p-4 sm:p-5 shadow-2xl overflow-hidden relative backdrop-blur-md">
          {/* Top Bar inside News Block */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-red-400 uppercase">
                <Radio className="w-3.5 h-3.5" />
                <span>Trực tiếp VnExpress</span>
              </div>
              <span className="text-[11px] text-neutral-400 hidden sm:inline-block">
                • Cập nhật tự động (5s đổi tin)
              </span>
            </div>

            {/* Controls & Nav to /news */}
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-neutral-400 font-mono">
                {newsArticles.length > 0 ? `${currentNewsIndex + 1}/${newsArticles.length}` : '1/1'}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevNews}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Tin trước"
                  aria-label="Tin trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextNews}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Tin tiếp theo"
                  aria-label="Tin tiếp theo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/news')}
                className="text-xs font-medium text-[#4cc2ff] hover:text-[#7fd7ff] hover:underline flex items-center gap-1 ml-2 cursor-pointer transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Animated Article Content */}
          {currentArticle && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentArticle.id || currentNewsIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-1 md:grid-cols-[180px_1fr] sm:grid-cols-[140px_1fr] gap-4 items-center cursor-pointer group"
                onClick={() => onNavigate('/news')}
              >
                {/* Thumbnail Image */}
                {currentArticle.imageUrl ? (
                  <div className="w-full h-28 sm:h-24 md:h-28 rounded-lg overflow-hidden bg-neutral-900 border border-white/5 shrink-0 relative">
                    <img
                      src={currentArticle.imageUrl}
                      alt={currentArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0 text-neutral-500">
                    <Newspaper className="w-8 h-8" />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span className="font-semibold text-neutral-300">
                      {currentArticle.source || 'VnExpress'}
                    </span>
                    <span>•</span>
                    <span className="truncate">{currentArticle.pubDate}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#4cc2ff] transition-colors line-clamp-2 leading-snug">
                    {currentArticle.title}
                  </h3>

                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {currentArticle.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* 5-second animated progress line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <motion.div
              key={currentNewsIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-[#4cc2ff]"
            />
          </div>
        </div>

        {/* Quick Access Section */}
        <div>
          <button type="button" onClick={() => toggleCategory('quickAccess')} className="flex cursor-pointer items-center gap-1 py-1 text-[13px] font-normal hover:text-white transition-colors">
            {expanded.quickAccess ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
            <span>Quick access</span>
          </button>

          <AnimatePresence initial={false}>
            {expanded.quickAccess && (
              <motion.div
                key="quick-access"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="xaml-category-items flex flex-col">
                  {quickAccess.map(({ label, route, icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => onNavigate(route)}
                      className="grid min-h-9 cursor-pointer grid-cols-[1fr_155px] items-center px-1 text-left text-[13px] hover:bg-white/10 transition-colors rounded-[4px]"
                    >
                      <div className="flex items-center gap-2">
                        <AppTabIcon name={icon} className="size-4 shrink-0" />
                        <span>{label}</span>
                      </div>
                      <span className="text-[#777]">App</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Favorites Section */}
        <div>
          <button type="button" onClick={() => toggleCategory('favorites')} className="mt-2 flex cursor-pointer items-center gap-1 text-[13px] hover:text-white transition-colors">
            {expanded.favorites ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
            <span>Favorites</span>
          </button>
          <AnimatePresence initial={false}>
            {expanded.favorites && (
              <motion.div
                key="favorites"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="xaml-category-items flex min-h-8 items-center gap-2 px-1 text-[13px]">
                  <Folder className="size-4 text-[#8d8d8d]" strokeWidth={1.5} />
                  <span className="text-[#dedede]">No Items</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Section */}
        <div>
          <button type="button" onClick={() => toggleCategory('recent')} className="mt-2 flex cursor-pointer items-center gap-1 text-[13px] hover:text-white transition-colors">
            {expanded.recent ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
            <span>Recent</span>
          </button>
          <AnimatePresence initial={false}>
            {expanded.recent && (
              <motion.div
                key="recent"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="xaml-category-items min-h-8 overflow-hidden px-1 text-[13px] text-[#777]"
              >
                No Items
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Channels Section */}
        <div className="mt-5 border-t border-white/10 pt-3">
          <button type="button" onClick={() => toggleCategory('liveChannels')} className="mb-1 flex cursor-pointer items-center gap-1 text-[13px] hover:text-white transition-colors">
            {expanded.liveChannels ? <ChevronDown className="size-3 text-[#bdbdbd]" /> : <ChevronRight className="size-3 text-[#bdbdbd]" />}
            <span>Live channels</span>
            <span className="ml-1 text-[11px] text-[#777]">{channels.length}</span>
          </button>
          <AnimatePresence initial={false}>
            {expanded.liveChannels && (
              <motion.div
                key="live-channels"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="xaml-category-items flex flex-col">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => onSelectChannel(channel)}
                      className="grid min-h-11 cursor-pointer grid-cols-[34px_1fr_155px] items-center gap-1 px-1 text-left text-[13px] hover:bg-white/10 transition-colors rounded-[4px]"
                    >
                      <span className="flex size-7 items-center justify-center">
                        <img src={channel.logo} alt="" className="max-h-6 max-w-7 object-contain" referrerPolicy="no-referrer" />
                      </span>
                      <span className="truncate text-[#ededed]">{channel.name}</span>
                      <span className="truncate text-[#8f8f8f]">{channel.currentProgram?.title || channel.category}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
