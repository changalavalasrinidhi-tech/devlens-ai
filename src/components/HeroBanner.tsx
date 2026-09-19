import React, { useState } from 'react';
import { Sparkles, ArrowRight, Cpu, GitBranch, Brain, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../data/projectData';

export function HeroBanner() {
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setAnalyzing(true);
    setResultMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository_url: repoUrl,
          summary: "Triggered from DevLens Dashboard UI",
          security_score: Math.floor(Math.random() * 25) + 75
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResultMessage(`✅ Success! Analysis saved for: ${repoUrl}`);
        setRepoUrl('');
      } else {
        setResultMessage(`❌ Error: ${data.message || 'Failed to save analysis.'}`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setResultMessage("❌ Could not connect to the backend server.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-6 animate-fade-in-up">
      <div className="glass rounded-3xl p-8 sm:p-10 lg:p-12 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full -z-0" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full -z-0" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 tracking-wide">
              AI-Powered Analysis Engine
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
            <span className="text-white text-shadow-glow">10x Deeper</span>
            <br />
            <span className="gradient-text">Codebase Understanding</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
            Automated code parsing, dependency mapping, and AI-driven architecture analysis.
            DevLens AI reads every file, traces every route, and surfaces insights that matter.
          </p>

          {/* Interactive Repository URL Form */}
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Paste GitHub repository URL (e.g. user/repo)..."
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm shadow-inner"
                required
              />
            </div>
            <button
              type="submit"
              disabled={analyzing}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm hover:from-blue-400 hover:to-indigo-400 transition-all duration-300 glow-blue disabled:opacity-50 shadow-lg shadow-blue-900/20"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Repository
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Feedback Message */}
          {resultMessage && (
            <div className="mb-6 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 inline-block">
              {resultMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-5 mt-4">
            {[
              { icon: Cpu, label: '2,847 files parsed' },
              { icon: GitBranch, label: '67 routes mapped' },
              { icon: Brain, label: '4 issues resolved' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="hidden lg:flex items-center gap-2 text-slate-500 text-sm">
                <Icon className="w-4 h-4 text-blue-400/70" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-8 right-8 hidden xl:flex flex-col items-end gap-2 opacity-60">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            parser@v2.1.0
          </div>
          <div className="text-xs text-slate-600 font-mono">scan_id: dl_8f3a92c1</div>
        </div>
      </div>
    </section>
  );
}