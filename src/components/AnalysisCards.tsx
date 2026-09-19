import React from 'react';

export interface AnalysisCardProps {
  id?: number | string;
  repository_url?: string;
  url?: string;
  summary?: string;
  description?: string;
  security_score?: number;
  score?: number;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  id,
  repository_url,
  url,
  summary,
  description,
  security_score,
  score,
}) => {
  const repoUrl = repository_url || url || "Untitled Repository";
  const summaryText = summary || description || "No summary provided";
  const scoreVal = security_score ?? score ?? 95;
  const itemId = id || 1;

  return (
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl backdrop-blur-md transition-all hover:border-slate-700">
      <div className="flex justify-between items-center text-xs">
        <span className="text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/50">
          Score: {scoreVal}%
        </span>
        <span className="text-slate-500 font-mono text-[10px]">ID: {itemId}</span>
      </div>
      <h4 className="text-sm font-bold text-white truncate">{repoUrl}</h4>
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{summaryText}</p>
    </div>
  );
};