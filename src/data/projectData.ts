export interface Metric {
  id: string;
  label: string;
  value: string;
  subValue: string;
  icon: string;
  color: string;
  trend: string;
  trendUp: boolean;
}

export interface TechBadge {
  name: string;
  color: string;
  glow: string;
}

export interface Insight {
  id: string;
  type: 'security' | 'optimization' | 'architecture';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  location: string;
  icon: string;
}

export interface CodeLine {
  number: number;
  content: string;
  type: 'keyword' | 'function' | 'string' | 'comment' | 'plain' | 'decorator' | 'type' | 'number';
}

export interface ArchNode {
  id: string;
  label: string;
  type: 'client' | 'server' | 'database' | 'service';
  x: number;
  y: number;
  w: number;
  h: number;
  icon: string;
  color: string;
}

export interface ArchEdge {
  from: string;
  to: string;
  label: string;
  animated?: boolean;
}

export const metrics: Metric[] = [
  {
    id: 'files',
    label: 'Files Scanned',
    value: '2,847',
    subValue: 'across 184 directories',
    icon: 'FileCode',
    color: 'blue',
    trend: '+12.4%',
    trendUp: true,
  },
  {
    id: 'architecture',
    label: 'Architecture Detected',
    value: 'Client-Server',
    subValue: 'Full-Stack SPA + REST API',
    icon: 'Network',
    color: 'violet',
    trend: 'Confidence 94%',
    trendUp: true,
  },
  {
    id: 'routes',
    label: 'API Routes Mapped',
    value: '67',
    subValue: '14 WebSocket, 53 REST',
    icon: 'Route',
    color: 'emerald',
    trend: '+3 new',
    trendUp: true,
  },
  {
    id: 'deps',
    label: 'External Dependencies',
    value: '42',
    subValue: '0 vulnerabilities found',
    icon: 'Package',
    color: 'emerald',
    trend: 'All clean',
    trendUp: true,
  },
];

export const techBadges: TechBadge[] = [
  { name: 'Python', color: 'text-sky-300', glow: 'glow-blue' },
  { name: 'TypeScript', color: 'text-blue-300', glow: 'glow-blue' },
  { name: 'FastAPI', color: 'text-emerald-300', glow: 'glow-emerald' },
  { name: 'React', color: 'text-cyan-300', glow: 'glow-blue' },
];

export const insights: Insight[] = [
  {
    id: 'cors',
    type: 'security',
    severity: 'success',
    title: 'CORS Origins Restricted',
    description: 'Wildcard allow_origins=["*"] replaced with explicit allowlist (localhost:3000, localhost:5173). Cross-origin requests now restricted to known frontend hosts.',
    location: 'backend/main.py:42',
    icon: 'ShieldCheck',
  },
  {
    id: 'sql-inject',
    type: 'security',
    severity: 'success',
    title: 'SQL Injection Patched',
    description: 'Raw f-string interpolation in user lookup queries replaced with parameterized queries using bound parameters. User input is no longer concatenated into SQL.',
    location: 'backend/repositories/user_repo.py:118',
    icon: 'ShieldCheck',
  },
  {
    id: 'n-plus-1',
    type: 'optimization',
    severity: 'success',
    title: 'N+1 Query Eliminated',
    description: 'Order fetching refactored from per-item queries inside a loop to a single batch query using selectinload(). Query count reduced from N+1 to 2.',
    location: 'backend/services/order_service.py:67',
    icon: 'Zap',
  },
  {
    id: 'circular',
    type: 'architecture',
    severity: 'info',
    title: 'Circular Dependency Identified',
    description: 'auth_service.py and user_service.py import from each other. Consider extracting a shared module to break the cycle.',
    location: 'backend/services/',
    icon: 'GitBranch',
  },
  {
    id: 'dead-code',
    type: 'optimization',
    severity: 'info',
    title: 'Dead Code Detected',
    description: '3 functions and 1 class have no inbound references. Safe to remove for cleaner architecture.',
    location: 'frontend/src/utils/',
    icon: 'Trash2',
  },
  {
    id: 'auth-pass',
    type: 'security',
    severity: 'success',
    title: 'Password Hashing Verified',
    description: 'All password storage uses bcrypt with appropriate salt rounds. No plaintext credentials detected.',
    location: 'backend/auth/',
    icon: 'ShieldCheck',
  },
];

export const archNodes: ArchNode[] = [
  { id: 'client', label: 'React SPA', type: 'client', x: 5, y: 30, w: 150, h: 56, icon: 'Monitor', color: 'cyan' },
  { id: 'router', label: 'React Router', type: 'client', x: 5, y: 110, w: 150, h: 56, icon: 'Navigation', color: 'cyan' },
  { id: 'api', label: 'FastAPI Gateway', type: 'server', x: 210, y: 70, w: 160, h: 56, icon: 'Server', color: 'emerald' },
  { id: 'auth', label: 'Auth Service', type: 'service', x: 425, y: 10, w: 150, h: 56, icon: 'Lock', color: 'amber' },
  { id: 'user', label: 'User Service', type: 'service', x: 425, y: 80, w: 150, h: 56, icon: 'Users', color: 'amber' },
  { id: 'order', label: 'Order Service', type: 'service', x: 425, y: 150, w: 150, h: 56, icon: 'ShoppingCart', color: 'amber' },
  { id: 'db', label: 'PostgreSQL', type: 'database', x: 630, y: 50, w: 140, h: 56, icon: 'Database', color: 'blue' },
  { id: 'cache', label: 'Redis Cache', type: 'database', x: 630, y: 130, w: 140, h: 56, icon: 'HardDrive', color: 'rose' },
];

export const archEdges: ArchEdge[] = [
  { from: 'client', to: 'router', label: 'routes' },
  { from: 'router', to: 'api', label: 'HTTP/REST', animated: true },
  { from: 'api', to: 'auth', label: 'verify' },
  { from: 'api', to: 'user', label: 'CRUD' },
  { from: 'api', to: 'order', label: 'process' },
  { from: 'user', to: 'db', label: 'SQL', animated: true },
  { from: 'order', to: 'db', label: 'SQL', animated: true },
  { from: 'auth', to: 'cache', label: 'sessions' },
  { from: 'user', to: 'cache', label: 'cache' },
];

export const codeLines: CodeLine[] = [
  { number: 1, content: 'from fastapi import FastAPI, Depends, HTTPException', type: 'keyword' },
  { number: 2, content: 'from fastapi.middleware.cors import CORSMiddleware', type: 'keyword' },
  { number: 3, content: 'from sqlalchemy.orm import Session', type: 'keyword' },
  { number: 4, content: 'from sqlalchemy import text', type: 'keyword' },
  { number: 5, content: '', type: 'plain' },
  { number: 6, content: 'app = FastAPI(title="DevLens API", version="2.1.0")', type: 'plain' },
  { number: 7, content: '', type: 'plain' },
  { number: 8, content: '# CORS configuration — fixed by DevLens AI', type: 'comment' },
  { number: 9, content: 'ALLOWED_ORIGINS = [', type: 'plain' },
  { number: 10, content: '    "http://localhost:3000",', type: 'string' },
  { number: 11, content: '    "http://localhost:5173",', type: 'string' },
  { number: 12, content: ']', type: 'plain' },
  { number: 13, content: 'app.add_middleware(', type: 'function' },
  { number: 14, content: '    CORSMiddleware,', type: 'type' },
  { number: 15, content: '    allow_origins=ALLOWED_ORIGINS,', type: 'plain' },
  { number: 16, content: '    allow_credentials=True,', type: 'plain' },
  { number: 17, content: '    allow_methods=["GET", "POST", "PUT", "DELETE"],', type: 'string' },
  { number: 18, content: '    allow_headers=["Authorization", "Content-Type"],', type: 'string' },
  { number: 19, content: ')', type: 'plain' },
  { number: 20, content: '', type: 'plain' },
  { number: 21, content: '@app.get("/api/v2/users/{user_id}")', type: 'decorator' },
  { number: 22, content: 'async def get_user(user_id: int, db: Session = Depends(get_db)):', type: 'function' },
  { number: 23, content: '    # Parameterized query — no string interpolation', type: 'comment' },
  { number: 24, content: '    stmt = text("SELECT * FROM users WHERE id = :uid")', type: 'plain' },
  { number: 25, content: '    user = db.execute(stmt, {"uid": user_id}).first()', type: 'plain' },
];

export const codeTokenColors: Record<string, string> = {
  keyword: 'text-violet-400',
  function: 'text-blue-400',
  string: 'text-emerald-400',
  comment: 'text-slate-500 italic',
  decorator: 'text-amber-400',
  type: 'text-cyan-400',
  number: 'text-orange-400',
  plain: 'text-slate-300',
}
export const API_BASE_URL  = "https://devlens-ai-9a3w.onrender.com";