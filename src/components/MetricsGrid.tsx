import React from 'react';
import { FileCode, Network, Route, Package, TrendingUp, TrendingDown, Cpu, GitBranch, ShieldCheck } from 'lucide-react';
import { metrics, techBadges } from '@/data/projectData';
import type { LucideIcon } from 'lucide-react';
import { useSimulatedFetch } from '@/hooks/useSimulatedFetch';
import { LoadingSkeleton, ErrorState } from '@/components/LoadingStates';

const iconMap: Record<string, LucideIcon> = {
  FileCode,
  Network,
  Route,
  Package,
  Cpu,
  GitBranch,
  ShieldCheck,
};

const colorMap: Record<string, { text: string; bg: string; border: string; glow: string; gradient: string }> = {
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'group-hover:glow-blue',
    gradient: 'from-blue-500 to-cyan-500',
  },
  violet: {
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'group-hover:glow-violet',
    gradient: 'from-violet-500 to-purple-500',
  },
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'group-hover:glow-emerald',
    gradient: 'from-emerald-500 to-teal-500',
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'group-hover:glow-amber',
    gradient: 'from-amber-500 to-orange-500',
  },
  indigo: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    glow: 'group-hover:glow-indigo',
    gradient: 'from-indigo-500 to-blue-500',
  },
};

interface MetricsProps {
  filesCount?: number;
  routesCount?: number;
  securityScore?: number;
}

export function MetricsGrid({ filesCount, routesCount, securityScore }: MetricsProps) {
  const { status, data, retry } = useSimulatedFetch({ metrics, techBadges });

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      {status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState message="Failed to load project metrics. Check your connection and try again." onRetry={retry} />
      )}

      {status === 'ready' && data && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Project Metrics
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.techBadges.map((badge) => (
                <span
                  key={badge.name}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${badge.color} bg-slate-800/60 border border-slate-700/50 hover:scale-105 transition-transform duration-200`}
                >
                  {badge.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.metrics.map((metric, idx) => {
              // Override specific metric values if props are provided
              let displayValue = metric.value;
              if (filesCount !== undefined && metric.label.toLowerCase().includes('files')) {
                displayValue = filesCount.toLocaleString();
              } else if (routesCount !== undefined && metric.label.toLowerCase().includes('route')) {
                displayValue = routesCount.toString();
              } else if (securityScore !== undefined && metric.label.toLowerCase().includes('security')) {
                displayValue = `${securityScore}/100`;
              }

              const Icon = iconMap[metric.icon] || FileCode;
              const colors = colorMap[metric.color] || colorMap.blue;

              return (
                <div
                  key={metric.id}
                  className={`group glass rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 cursor-default animate-fade-in-up ${colors.glow}`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    {metric.trend && (
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                          metric.trendUp
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {metric.trendUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {metric.trend}
                      </div>
                    )}
                  </div>

                  <div className={`text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}>
                    {displayValue}
                  </div>
                  <div className="text-sm font-medium text-slate-300">{metric.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{metric.subValue}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}