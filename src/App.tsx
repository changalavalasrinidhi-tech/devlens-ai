import { useState, useEffect } from 'react';
import { MeshBackground } from '@/components/MeshBackground';
import { AppBar } from '@/components/AppBar';
import { HeroBanner } from '@/components/HeroBanner';
import { MetricsGrid } from '@/components/MetricsGrid';
import { ExplorerPanel } from '@/components/ExplorerPanel';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { API_BASE_URL } from '@/data/projectData';

export interface AnalysisItem {
  id?: number | string;
  repository_url?: string;
  url?: string;
  summary?: string;
  description?: string;
  security_score?: number;
  score?: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('Overview Dashboard');
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisItem[]>([]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyses`);
      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(Array.isArray(data) ? data : data.analyses || data.records || []);
      }
    } catch (err) {
      console.error("Failed to fetch database records:", err);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then(res => res.json())
      .then(data => console.log("✅ Backend connected successfully:", data))
      .catch(err => console.error("❌ Connection failed:", err));

    fetchAnalyses();
  }, []);

  const handleTestDatabaseSync = async () => {
    setLoading(true);
    setDbStatus(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository_url: "gojiplus.github.io/reporoulette/",
          summary: "Frontend-Backend Connected via App.tsx",
          security_score: 95
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDbStatus("✅ Success! Data saved to Supabase via FastAPI.");
        fetchAnalyses(); 
      } else {
        setDbStatus("❌ Failed to save data.");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setDbStatus("❌ Error: Could not connect to FastAPI server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-200 relative">
      <MeshBackground />

      <AppBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pb-16">
        <HeroBanner />

        {/* Database Sync Test Bar */}
        <div className="px-4 sm:px-6 lg:px-8 my-4">
          <div className="glass rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 border border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Database Integration Test</h3>
              <p className="text-xs text-slate-400">Click to send a test analysis payload from frontend to your FastAPI backend.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestDatabaseSync}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
              >
                {loading ? "Syncing..." : "Test Backend & DB Insert"}
              </button>
            </div>
          </div>
          {dbStatus && (
            <div className="mt-2 text-xs font-mono px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
              {dbStatus}
            </div>
          )}
        </div>

        {/* Dynamic Saved Analyses Grid with explicit types */}
        <div className="px-4 sm:px-6 lg:px-8 my-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Extracted Database Records 
              <span className="text-xs font-normal text-slate-400">({savedAnalyses.length} total)</span>
            </h3>
            <button 
              onClick={fetchAnalyses}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Refresh Records
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedAnalyses.length > 0 ? (
              savedAnalyses.slice(-4).map((item: AnalysisItem, index: number) => {
                const repoUrl = item?.repository_url || item?.url || "Untitled Repository";
                const summaryText = item?.summary || item?.description || "No summary provided";
                const scoreVal = item?.security_score ?? item?.score ?? 95;
                const itemId = item?.id || index + 1;

                return (
                  <div key={itemId} className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl backdrop-blur-md">
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
              })
            ) : (
              [1, 2, 3, 4].map((num) => (
                <div key={num} className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800 h-32 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs font-semibold text-slate-400">Empty Record Slot #{num}</p>
                  <p className="text-[10px] text-slate-600 mt-1">Click "Test Backend & DB Insert" above to populate</p>
                </div>
              ))
            )}
          </div>
        </div>

        {activeTab === 'Overview Dashboard' && (
          <>
            <MetricsGrid />
            <ExplorerPanel />
            <AIInsightsPanel />
          </>
        )}

        {activeTab === 'Interactive Dashboard & Tooling' && (
          <div className="pt-4 space-y-6">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 backdrop-blur-md shadow-xl">
                <h2 className="text-xl font-bold text-white mb-2">Interactive Dashboard & Tooling</h2>
                <p className="text-xs text-slate-400 mb-6">Real-time telemetry, live database synchronization, and AST code explorer tooling.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-semibold text-emerald-400 mb-1">Real-Time Metrics Grid</h4>
                    <p className="text-xs text-slate-400">Live telemetry tracking files scanned, API routes mapped, and architecture layers.</p>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-semibold text-indigo-400 mb-1">Live Database Sync</h4>
                    <p className="text-xs text-slate-400">Direct integration testing between FastAPI backend and Supabase data store.</p>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-1">AST Code Explorer</h4>
                    <p className="text-xs text-slate-400">Syntax-highlighted code analysis and instant AI security vulnerability flagging.</p>
                  </div>
                </div>
              </div>
            </div>
            <MetricsGrid />
            <ExplorerPanel />
            <AIInsightsPanel />
          </div>
        )}

        {activeTab === 'Architecture Map' && (
          <div className="pt-4">
            <ExplorerPanel />
          </div>
        )}

        {activeTab === 'Code Explorer & AST' && (
          <div className="pt-4">
            <ExplorerPanel />
          </div>
        )}

        {activeTab === 'AI Insights' && (
          <div className="pt-4">
            <AIInsightsPanel />
          </div>
        )}

        <footer className="px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-300">DevLens AI</span>
              <span className="text-slate-600">·</span>
              <span>Codebase Intelligence v2.1.0</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>Last scan: 2 min ago</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Engine operational
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;