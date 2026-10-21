import React, { useMemo, useState } from 'react';
import { ChevronRight, ExternalLink, Mic, MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react';

type Match = { title: string; age: string; source: string; image: string; kind: 'All' | 'Word' | 'Edge' | 'PowerPoint' | 'Outlook'; accent: string };

const textMatches: Match[] = [
  { title: 'Found Korean Restaurant that Alice', age: '6d ago', source: 'Whatsapp - Alice', kind: 'All', accent: '#22c55e', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80' },
  { title: 'Found Korean Restaurant', age: '1d ago', source: 'Stonekorean.com', kind: 'Edge', accent: '#0ea5e9', image: 'https://images.unsplash.com/photo-1562565652-a0d9f0c59eb4?auto=format&fit=crop&w=700&q=80' },
  { title: 'Found Korean Restaurant', age: '25d ago', source: 'Google.com', kind: 'Edge', accent: '#3b82f6', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=700&q=80' },
  { title: 'Found Korean Restaurant', age: '2mo ago', source: 'Doordash.com', kind: 'Edge', accent: '#ef4444', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=700&q=80' },
];
const visualMatches: Match[] = [
  { title: 'Close match to Korean Restaurant that Alice', age: '25d ago', source: 'Koggieexpress.com', kind: 'Edge', accent: '#ef4444', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=80' },
  { title: 'Close match to Korean Restaurant that Alice', age: '2mo ago', source: 'Epicurious.com', kind: 'Edge', accent: '#e11d48', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=700&q=80' },
  { title: 'Close match to Korean Restaurant that Alice', age: '2mo ago', source: 'Yelp.com', kind: 'Edge', accent: '#dc2626', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80' },
  { title: 'Related to Korean Restaurant that Alice', age: '6mo ago', source: 'Business Application', kind: 'Outlook', accent: '#ef4444', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=80' },
];
const filters = ['All', 'Word', 'Edge', 'PowerPoint', 'Outlook'];

function MatchCard({ item, key: _key }: { item: Match; key?: string }) {
  return <article className="group min-w-0 rounded-md border border-slate-200/80 bg-white/70 p-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.07]">
    <div className="flex items-center justify-between px-1.5 py-1 text-[9px] text-slate-500 dark:text-slate-400"><span className="truncate font-medium text-slate-700 dark:text-slate-200">{item.title}</span><MoreHorizontal className="size-3 shrink-0" /></div>
    <div className="relative aspect-[1.72] overflow-hidden rounded-sm bg-slate-200"><img src={item.image} alt="Activity preview" className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" /><span className="absolute bottom-1 left-1 rounded-md border border-white/70 bg-white/90 px-2 py-1 text-[9px] font-medium text-slate-700 shadow-sm dark:bg-slate-900/85 dark:text-white"><span className="mr-1 inline-block size-1.5 rounded-full" style={{ backgroundColor: item.accent }} />{item.source}</span></div>
    <div className="px-1.5 pt-1 text-[9px] text-slate-400">{item.age}</div>
  </article>;
}

export function Recall(_props: { navigate?: (path: string) => void }) {
  const [query, setQuery] = useState('Korean restaurant that Alice');
  const [activeFilter, setActiveFilter] = useState('All');
  const filter = (items: Match[]) => items.filter((item) => (activeFilter === 'All' || item.kind === activeFilter) && `${item.title} ${item.source}`.toLowerCase().includes(query.toLowerCase()));
  const text = useMemo(() => filter(textMatches), [query, activeFilter]);
  const visual = useMemo(() => filter(visualMatches), [query, activeFilter]);

  return <main className="min-h-full overflow-y-auto bg-[#edf6fb] text-slate-800 dark:bg-[#151c24] dark:text-white">
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7 px-5 py-4 sm:px-10 lg:px-14">
      <header className="flex items-center gap-4"><div className="flex size-7 items-center justify-center rounded-full bg-sky-500 text-white"><Search className="size-3.5" /></div><div className="flex flex-1 items-center justify-center gap-2"><label className="flex h-8 w-full max-w-[385px] items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 shadow-sm dark:border-white/10 dark:bg-white/10"><Search className="size-3.5 text-slate-400" /><input aria-label="Search your history" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[11px] outline-none" /><Mic className="size-3.5 text-slate-400" /></label><button type="button" className="flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 text-[10px] dark:border-white/10 dark:bg-white/10"><SlidersHorizontal className="size-3" /> Timeline</button></div><button type="button" className="text-slate-400" aria-label="More options"><MoreHorizontal className="size-4" /></button></header>
      <section className="flex flex-col gap-5"><h1 className="text-2xl font-semibold tracking-tight">Results</h1><nav className="flex items-center gap-2 overflow-x-auto" aria-label="Result filters">{filters.map((filterName) => <button key={filterName} type="button" onClick={() => setActiveFilter(filterName)} className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition ${activeFilter === filterName ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-white/60 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300'}`}>{filterName}</button>)}<button type="button" className="ml-1 text-[10px] text-sky-700 hover:underline dark:text-sky-300">View File Explorer results <ExternalLink className="ml-1 inline size-3" /></button></nav>
        <ResultSection title="Text matches" items={text} />
        <ResultSection title="Visual matches" items={visual} />
      </section>
    </div>
  </main>;
}

function ResultSection({ title, items }: { title: string; items: Match[] }) { return <section className="flex flex-col gap-3"><h2 className="flex items-center gap-1 text-[11px] font-medium">{title}<ChevronRight className="size-3" /></h2>{items.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <MatchCard key={`${title}-${item.source}`} item={item} />)}</div> : <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/10">No matches found.</p>}</section>; }
