import React, { useMemo, useState } from 'react';
import { Archive, ArrowUpRight, Clock3, FileText, Globe2, Search, Sparkles, Tv, X } from 'lucide-react';

type RecallItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: 'Search' | 'Tabs' | 'Writing' | 'Watching';
  icon: React.ElementType;
  accent: string;
};

const recallItems: RecallItem[] = [
  { id: '1', title: 'Sustainable restaurants review', detail: 'Edge · sustainable restaurants', time: 'Today, 11:24 AM', kind: 'Tabs', icon: Globe2, accent: 'bg-sky-500' },
  { id: '2', title: 'Morning Greeting', detail: 'Searched on Waves', time: 'Today, 10:48 AM', kind: 'Search', icon: Search, accent: 'bg-violet-500' },
  { id: '3', title: 'Reflection in Color', detail: 'Word · document opened', time: 'Yesterday, 4:16 PM', kind: 'Writing', icon: FileText, accent: 'bg-blue-500' },
  { id: '4', title: 'Heirloom Menu', detail: 'Watched on Live TV', time: 'Yesterday, 2:05 PM', kind: 'Watching', icon: Tv, accent: 'bg-emerald-500' },
  { id: '5', title: 'Recipes for a summer table', detail: 'Searched on Waves', time: 'Monday, 9:32 AM', kind: 'Search', icon: Search, accent: 'bg-violet-500' },
  { id: '6', title: 'Community presentation', detail: 'PowerPoint · file opened', time: 'Monday, 8:50 AM', kind: 'Writing', icon: FileText, accent: 'bg-orange-500' },
];

const filters = ['All activity', 'Searches', 'Tabs', 'Writing', 'Watching'];

export function Recall({ navigate }: { navigate?: (path: string) => void }) {
  const [activeFilter, setActiveFilter] = useState('All activity');
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(() => recallItems.filter((item) => {
    const matchesFilter = activeFilter === 'All activity' || item.kind === activeFilter.slice(0, -1);
    const matchesQuery = `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  }), [activeFilter, query]);

  return (
    <main className="min-h-screen overflow-y-auto bg-[#eef5fb] text-slate-900 dark:bg-[#151b22] dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-12">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-300"><Archive className="size-4" /> Recall</div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your activity, remembered</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">Find something you searched, opened, watched, or wrote recently.</p>
          </div>
          <button type="button" onClick={() => navigate?.('/')} className="rounded-full p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Close Recall"><X className="size-5" /></button>
        </header>

        <label className="flex h-12 items-center gap-3 rounded-full border border-white/80 bg-white/80 px-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.08]">
          <Search className="size-5 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your history" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          <kbd className="hidden rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-400 sm:block dark:border-white/10">Ctrl K</kbd>
        </label>

        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Recall filters">
          {filters.map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${activeFilter === filter ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'bg-white/60 text-slate-600 hover:bg-white dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/10'}`}>{filter}</button>)}
        </nav>

        <section className="rounded-3xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur sm:p-6 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Recent activity</h2><p className="text-sm text-slate-500 dark:text-slate-400">Your timeline across Waves</p></div><Sparkles className="size-5 text-sky-500" /></div>
          <div className="grid gap-3 md:grid-cols-2">{filteredItems.map((item) => { const Icon = item.icon; return <article key={item.id} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white ${item.accent}`}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium">{item.title}</h3><p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 className="size-3" /> {item.time}</p></div><button type="button" className="rounded-full p-2 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label={`Open ${item.title}`}><ArrowUpRight className="size-4" /></button></article>; })}</div>
          {filteredItems.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No activity matches your search.</div>}
        </section>
      </div>
    </main>
  );
}
