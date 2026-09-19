import { useState, useEffect } from 'react';
import {
  Monitor, Server, Lock, Users, ShoppingCart, Database, HardDrive, Navigation,
  BarChart3, GitFork, Code2, FileCode, Network, Route, Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { archNodes, archEdges, codeLines, codeTokenColors, techBadges, API_BASE_URL } from '../data/projectData';
import { useSimulatedFetch } from '../hooks/useSimulatedFetch';
import { LoadingSkeleton } from './LoadingStates';

const iconMap: Record<string, LucideIcon> = {
  Monitor, Server, Lock, Users, ShoppingCart, Database, HardDrive, Navigation,
  FileCode, Network, Route, Package,
};

const nodeColorMap: Record<string, { fill: string; border: string; text: string; icon: string }> = {
  cyan: { fill: 'fill-cyan-500/10', border: 'stroke-cyan-500/40', text: 'text-cyan-300', icon: 'text-cyan-400' },
  emerald: { fill: 'fill-emerald-500/10', border: 'stroke-emerald-500/40', text: 'text-emerald-300', icon: 'text-emerald-400' },
  amber: { fill: 'fill-amber-500/10', border: 'stroke-amber-500/40', text: 'text-amber-300', icon: 'text-amber-400' },
  blue: { fill: 'fill-blue-500/10', border: 'stroke-blue-500/40', text: 'text-blue-300', icon: 'text-blue-400' },
  rose: { fill: 'fill-rose-500/10', border: 'stroke-rose-500/40', text: 'text-rose-300', icon: 'text-rose-400' },
};

const tabs = [
  { id: 'metrics', label: 'Metrics & Analyses', icon: BarChart3 },
  { id: 'architecture', label: 'Architecture Flow', icon: GitFork },
  { id: 'code', label: 'AST / Code', icon: Code2 },
];

type TabId = 'metrics' | 'architecture' | 'code';

export function ExplorerPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');
  const { status } = useSimulatedFetch(null, 500);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'tab-pill-active'
                      : 'tab-pill-inactive'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'loading' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400 animate-pulse'}`} />
            {status === 'loading' ? 'syncing' : 'live'}
          </div>
        </div>

        <div className="p-5">
          {status === 'loading' ? (
            <LoadingSkeleton className="h-80" />
          ) : (
            <>
              {activeTab === 'metrics' && <MetricsTab />}
              {activeTab === 'architecture' && <ArchitectureTab />}
              {activeTab === 'code' && <CodeTab />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MetricsTab() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analyses`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAnalyses(data.data);
        }
        setLoadingDb(false);
      })
      .catch(err => {
        console.error("Failed to fetch Supabase analyses:", err);
        setLoadingDb(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Live Supabase Database Records Section */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Supabase Code Analyses Records
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Connected Live
          </span>
        </div>

        {loadingDb ? (
          <p className="text-xs text-slate-400 font-mono py-4">Fetching records from Supabase...</p>
        ) : analyses.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-4">No records found in `code_analyses` table yet.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
            {analyses.map((item) => (
              <div key={item.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-mono text-xs font-medium">{item.repository_url}</span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                    Score: {item.security_score}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{item.summary}</p>
                <span className="text-[10px] text-slate-500 font-mono">Logged at: {new Date(item.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {techBadges.map((b) => (
          <span
            key={b.name}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${b.color} bg-slate-800/60 border border-slate-700/50`}
          >
            {b.name}
          </span>
        ))}
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-slate-800/60 p-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Complexity Distribution
        </div>
        {[
          { label: 'Low complexity', pct: 62, color: 'from-emerald-500 to-teal-500' },
          { label: 'Medium complexity', pct: 28, color: 'from-amber-500 to-orange-500' },
          { label: 'High complexity', pct: 10, color: 'from-rose-500 to-red-500' },
        ].map((bar) => (
          <div key={bar.label} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">{bar.label}</span>
              <span className="text-slate-300 font-mono">{bar.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${bar.color} transition-all duration-700`}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureTab() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeById = (id: string) => archNodes.find((n) => n.id === id)!;

  const isEdgeActive = (edge: (typeof archEdges)[number]) =>
    hoveredNode === null || edge.from === hoveredNode || edge.to === hoveredNode;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">System Architecture Map</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hover nodes to highlight connections</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {[
            { label: 'Client', color: 'bg-cyan-400' },
            { label: 'Server', color: 'bg-emerald-400' },
            { label: 'Service', color: 'bg-amber-400' },
            { label: 'Database', color: 'bg-blue-400' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-slate-400">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl bg-slate-950/40 border border-slate-800/60 overflow-hidden grid-bg">
        <svg viewBox="0 0 800 230" className="w-full h-auto min-h-[280px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill="rgba(148,163,184,0.5)" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill="rgba(56,189,248,0.9)" />
            </marker>
          </defs>

          {archEdges.map((edge, i) => {
            const from = nodeById(edge.from);
            const to = nodeById(edge.to);
            const x1 = from.x + from.w;
            const y1 = from.y + from.h / 2;
            const x2 = to.x;
            const y2 = to.y + to.h / 2;
            const midX = (x1 + x2) / 2;
            const active = isEdgeActive(edge);

            return (
              <g key={i} opacity={active ? 1 : 0.2} className="transition-opacity duration-300">
                <path
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={active ? 'rgba(56,189,248,0.6)' : 'rgba(148,163,184,0.3)'}
                  strokeWidth={1.5}
                  strokeDasharray={edge.animated ? '4 4' : undefined}
                  markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow)'}
                >
                  {edge.animated && active && (
                    <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.8s" repeatCount="indefinite" />
                  )}
                </path>
                {active && (
                  <text
                    x={midX}
                    y={(y1 + y2) / 2 - 4}
                    textAnchor="middle"
                    className="fill-slate-400 text-[9px] font-mono"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {archNodes.map((node) => {
            const colors = nodeColorMap[node.color];
            const Icon = iconMap[node.icon];
            const active = hoveredNode === null || hoveredNode === node.id;
            const connected = hoveredNode !== null && (
              archEdges.some((e) =>
                (e.from === hoveredNode && e.to === node.id) ||
                (e.to === hoveredNode && e.from === node.id)
              )
            );

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                opacity={active || connected ? 1 : 0.35}
                className="transition-opacity duration-300 cursor-pointer"
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx={10}
                  className={`${colors.fill} ${colors.border}`}
                  strokeWidth={1.5}
                />
                <foreignObject x={node.x + 8} y={node.y + 14} width={node.w - 16} height={node.h - 28}>
                  <div className="flex items-center gap-2 h-full">
                    <Icon className={`w-4 h-4 shrink-0 ${colors.icon}`} />
                    <span className={`text-xs font-semibold ${colors.text} leading-tight`}>
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[
          { label: 'Total Nodes', value: '8' },
          { label: 'Connections', value: '9' },
          { label: 'Circular Deps', value: '1', warn: true },
          { label: 'Max Depth', value: '3' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-900/40 border border-slate-800/60 px-3 py-2.5">
            <div className={`text-lg font-bold ${s.warn ? 'text-amber-400' : 'text-slate-200'}`}>
              {s.value}
            </div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeTab() {
  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">backend/main.py</span>
          <span className="text-xs text-slate-600 font-mono ml-2">— 25 lines</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <pre className="font-mono text-sm leading-relaxed">
          <code>
            {codeLines.map((line) => (
              <div
                key={line.number}
                className="flex hover:bg-slate-800/30 transition-colors duration-100"
              >
                <span className="select-none text-slate-600 text-right pr-4 pl-3 w-12 shrink-0 border-r border-slate-800/40">
                  {line.number}
                </span>
                <span className={`pl-4 pr-4 whitespace-pre ${codeTokenColors[line.type]}`}>
                  {line.content || ' '}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-800/60 bg-slate-900/40">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          All issues resolved
        </span>
        <span className="text-xs text-slate-500">Lines 8-19: CORS restricted, queries parameterized</span>
      </div>
    </div>
  );
}