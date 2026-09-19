import { Scan } from 'lucide-react';

const tabs = [
  'Overview Dashboard',
  'Architecture Map',
  'Code Explorer & AST',
  'AI Insights',
];

interface AppBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppBar({ activeTab, onTabChange }: AppBarProps) {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="glass glass-highlight rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/40 blur-lg rounded-lg" />
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center glow-blue">
              <Scan className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-base tracking-tight">
              DevLens<span className="text-blue-400"> AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
              Codebase Intelligence
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1 mx-auto overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`tab-pill whitespace-nowrap ${
                activeTab === tab ? 'tab-pill-active' : 'tab-pill-inactive'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-300">Scan Active</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center text-xs font-bold text-slate-300">
            DV
          </div>
        </div>
      </div>
    </header>
  );
}
