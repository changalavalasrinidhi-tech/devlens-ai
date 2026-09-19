import { ShieldAlert, ShieldCheck, Zap, GitBranch, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { insights } from '@/data/projectData';
import type { Insight } from '@/data/projectData';
import { useSimulatedFetch } from '@/hooks/useSimulatedFetch';
import { LoadingSkeleton, ErrorState } from '@/components/LoadingStates';

const iconMap: Record<string, LucideIcon> = {
  ShieldAlert,
  ShieldCheck,
  Zap,
  GitBranch,
  Trash2,
};

const severityMap: Record<string, { label: string; text: string; bg: string; border: string; dot: string; glow: string }> = {
  critical: {
    label: 'Critical',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
    glow: 'hover:glow-rose',
  },
  warning: {
    label: 'Warning',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    glow: 'hover:glow-amber',
  },
  info: {
    label: 'Info',
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    glow: 'hover:glow-blue',
  },
  success: {
    label: 'Passed',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
    glow: 'hover:glow-emerald',
  },
};

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const Icon = iconMap[insight.icon];
  const sev = severityMap[insight.severity];

  return (
    <div
      className={`group glass rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 ${sev.glow} animate-fade-in-up`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl ${sev.bg} ${sev.border} border flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${sev.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md ${sev.bg} ${sev.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} ${insight.severity === 'critical' ? 'animate-pulse' : ''}`} />
              {sev.label}
            </span>
            <span className="text-xs text-slate-600 font-mono">{insight.location}</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-200 mb-1">{insight.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

export function AIInsightsPanel() {
  const { status, data, retry } = useSimulatedFetch(insights, 600);

  const resolved = data ? data.filter((i) => i.severity === 'success').length : 0;
  const warnings = data ? data.filter((i) => i.severity === 'warning').length : 0;
  const info = data ? data.filter((i) => i.severity === 'info').length : 0;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            AI Insights & Security
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Real-time
          </span>
        </div>

        {status === 'ready' && data && (
          <div className="flex items-center gap-2">
            {resolved > 0 && (
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                {resolved} Resolved
              </span>
            )}
            {warnings > 0 && (
              <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                {warnings} Warnings
              </span>
            )}
            {info > 0 && (
              <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                {info} Info
              </span>
            )}
          </div>
        )}
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState message="Failed to load AI insights. The analysis engine may be temporarily unavailable." onRetry={retry} />
      )}

      {status === 'ready' && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((insight, idx) => (
            <InsightCard key={insight.id} insight={insight} index={idx} />
          ))}
        </div>
      )}
    </section>
  );
}
