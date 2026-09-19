export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-800/40 ${className}`}>
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(56,189,248,0.06), transparent)',
          backgroundSize: '1000px 100%',
        }}
      />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm text-slate-400 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm font-medium text-slate-300 hover:bg-slate-700/60 transition-colors duration-200"
      >
        Retry
      </button>
    </div>
  );
}
