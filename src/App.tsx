import { useState, useEffect } from 'react';
import { MeshBackground } from '@/components/MeshBackground';
import { AppBar } from '@/components/AppBar';
import { HeroBanner } from '@/components/HeroBanner';
import { MetricsGrid } from '@/components/MetricsGrid';
import { ExplorerPanel } from '@/components/ExplorerPanel';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { API_BASE_URL } from '@/data/projectData';

function App() {
  const [activeTab, setActiveTab] = useState('Overview Dashboard');
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then(res => res.json())
      .then(data => console.log("✅ Backend connected successfully:", data))
      .catch(err => console.error("❌ Connection failed:", err));
  }, []);

  // Function to test saving/fetching data from FastAPI & Supabase
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
        console.log("Database Sync Success:", data);
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

        {/* --- Added Database Sync Test Bar --- */}
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-50"
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
        {/* ------------------------------------ */}

        {activeTab === 'Overview Dashboard' && (
          <>
            <MetricsGrid />
            <ExplorerPanel />
            <AIInsightsPanel />
          </>
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