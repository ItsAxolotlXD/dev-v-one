import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { AppTabIcon } from '../components/FluentIcons';
import { HeroCarousel } from '../components/HeroCarousel';
import { Channel } from '../types';

interface XAMLHomeProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onNavigate: (route: string) => void;
}

const quickAccess = [
  { label: 'Articles', route: '/news', icon: 'articles' as const },
  { label: 'Updates', route: '/updates', icon: 'updates' as const },
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

  return (
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-1 pb-10 text-[#e8e8e8] font-sans">
      {/* 3D Coverflow Hero Banner Card from Home */}
      <div className="w-full mb-3 pt-1">
        <HeroCarousel
          navigate={onNavigate}
          onSelectChannel={onSelectChannel}
          channels={channels}
        />
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
