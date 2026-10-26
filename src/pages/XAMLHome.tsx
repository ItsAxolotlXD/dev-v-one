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
        {/* Tab Title: Home (Font Regular, shifted down slightly) */}
        <div className="pt-2 sm:pt-3 pb-1">
          <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
            Home
          </h1>
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
                  <img src="https://winaero.com/blog/wp-content/uploads/2014/12/folder_win10.png" alt="Folder" className="size-4 object-contain" />
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
