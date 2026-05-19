import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Lock, Shield, Moon, Sun, ChevronRight, Copy, Check } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

/* ─── Types ───────────────────────────────────── */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  auth: boolean;
  adminOnly?: boolean;
  rbac?: string;
  params?: Param[];
  body?: string;
  response: string;
  responseCode: number;
}

interface Section {
  id: string;
  label: string;
  endpoints?: Endpoint[];
}

/* ─── Data ────────────────────────────────────── */
const BASE_URL = 'https://service-hive-intern-assigmentbacken.vercel.app';

const STANDARD_RESPONSE = `{
  "success": true,
  "message": "...",
  "data": { },
  "meta": { }
}`;

const ERROR_RESPONSE = `{
  "success": false,
  "message": "Error description"
}`;

const AUTH_ENDPOINTS: Endpoint[] = [
  {
    id: 'auth-register',
    method: 'POST',
    path: '/api/auth/register',
    summary: 'Register a new user account.',
    auth: false,
    body: `{
  "name": "Lakshay Punia",
  "email": "lakshay@example.com",
  "password": "secret123",
  "role": "admin"
}`,
    response: `{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Lakshay Punia",
      "email": "lakshay@example.com",
      "role": "admin"
    }
  }
}`,
    responseCode: 201,
  },
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/auth/login',
    summary: 'Login with existing credentials and receive a JWT.',
    auth: false,
    body: `{
  "email": "lakshay@example.com",
  "password": "secret123"
}`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Lakshay Punia",
      "email": "lakshay@example.com",
      "role": "admin"
    }
  }
}`,
    responseCode: 200,
  },
  {
    id: 'auth-me',
    method: 'GET',
    path: '/api/auth/me',
    summary: 'Get the currently authenticated user from the JWT.',
    auth: true,
    response: `{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Lakshay Punia",
    "email": "lakshay@example.com",
    "role": "admin"
  }
}`,
    responseCode: 200,
  },
];

const LEAD_ENDPOINTS: Endpoint[] = [
  {
    id: 'leads-list',
    method: 'GET',
    path: '/api/leads',
    summary: 'Get a paginated list of leads with optional filters. Admin sees all leads; Sales User sees only their own.',
    auth: true,
    rbac: 'Admin → all leads. Sales User → own leads only.',
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Records per page (default: 10, max: 100)' },
      { name: 'status', type: 'string', required: false, description: 'Filter by: New · Contacted · Qualified · Lost' },
      { name: 'source', type: 'string', required: false, description: 'Filter by: Website · Instagram · Referral' },
      { name: 'search', type: 'string', required: false, description: 'Case-insensitive search on name or email' },
      { name: 'sort', type: 'string', required: false, description: '"latest" (default) or "oldest"' },
    ],
    response: `{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Priya Sharma",
      "email": "priya@startup.io",
      "status": "Qualified",
      "source": "Instagram",
      "createdBy": { "name": "Lakshay Punia", "email": "lakshay@example.com" },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}`,
    responseCode: 200,
  },
  {
    id: 'leads-create',
    method: 'POST',
    path: '/api/leads',
    summary: 'Create a new lead. The lead is automatically associated with the authenticated user.',
    auth: true,
    body: `{
  "name": "Priya Sharma",
  "email": "priya@startup.io",
  "source": "Instagram",
  "status": "New"
}`,
    response: `{
  "success": true,
  "message": "Lead created",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Priya Sharma",
    "email": "priya@startup.io",
    "status": "New",
    "source": "Instagram",
    "createdBy": "64f1a2b3c4d5e6f7a8b9c0d2",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}`,
    responseCode: 201,
  },
  {
    id: 'leads-stats',
    method: 'GET',
    path: '/api/leads/stats',
    summary: 'Get lead counts grouped by status for the dashboard summary cards.',
    auth: true,
    rbac: 'Admin → counts for all leads. Sales User → counts for own leads only.',
    response: `{
  "success": true,
  "data": {
    "total": 42,
    "New": 15,
    "Contacted": 12,
    "Qualified": 10,
    "Lost": 5
  }
}`,
    responseCode: 200,
  },
  {
    id: 'leads-export',
    method: 'GET',
    path: '/api/leads/export',
    summary: 'Export leads as a CSV file download. Accepts the same query params as GET /api/leads except page and limit.',
    auth: true,
    params: [
      { name: 'status', type: 'string', required: false, description: 'Filter by status' },
      { name: 'source', type: 'string', required: false, description: 'Filter by source' },
      { name: 'search', type: 'string', required: false, description: 'Search by name or email' },
      { name: 'sort', type: 'string', required: false, description: '"latest" or "oldest"' },
    ],
    response: `Content-Type: text/csv
Content-Disposition: attachment; filename="leads.csv"

Name,Email,Status,Source,Created By,Created At
Priya Sharma,priya@startup.io,Qualified,Instagram,Lakshay Punia,2025-01-15`,
    responseCode: 200,
  },
  {
    id: 'leads-get-one',
    method: 'GET',
    path: '/api/leads/:id',
    summary: 'Retrieve a single lead by its MongoDB ObjectId.',
    auth: true,
    response: `{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Priya Sharma",
    "email": "priya@startup.io",
    "status": "Qualified",
    "source": "Instagram",
    "createdBy": { "name": "Lakshay Punia", "email": "lakshay@example.com" },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}`,
    responseCode: 200,
  },
  {
    id: 'leads-update',
    method: 'PUT',
    path: '/api/leads/:id',
    summary: 'Update one or more fields on a lead. All fields are optional.',
    auth: true,
    rbac: 'Sales User can only update their own leads.',
    body: `{
  "name": "Priya Sharma",
  "email": "priya@newdomain.io",
  "status": "Qualified",
  "source": "Referral"
}`,
    response: `{
  "success": true,
  "message": "Lead updated",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Priya Sharma",
    "email": "priya@newdomain.io",
    "status": "Qualified",
    "source": "Referral",
    "createdBy": "64f1a2b3c4d5e6f7a8b9c0d2",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}`,
    responseCode: 200,
  },
  {
    id: 'leads-delete',
    method: 'DELETE',
    path: '/api/leads/:id',
    summary: 'Permanently delete a lead. Admin role required.',
    auth: true,
    adminOnly: true,
    response: `{
  "success": true,
  "message": "Lead deleted",
  "data": null
}`,
    responseCode: 200,
  },
];

const SECTIONS: Section[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'authentication', label: 'Authentication', endpoints: AUTH_ENDPOINTS },
  { id: 'leads', label: 'Leads', endpoints: LEAD_ENDPOINTS },
  { id: 'errors', label: 'Error Codes' },
];

const ERROR_CODES = [
  { code: 400, label: 'Bad Request', desc: 'Validation error — check request body / query params.' },
  { code: 401, label: 'Unauthorized', desc: 'Missing, expired, or invalid JWT token.' },
  { code: 403, label: 'Forbidden', desc: 'Authenticated but insufficient role permissions.' },
  { code: 404, label: 'Not Found', desc: 'Resource (lead or user) does not exist.' },
  { code: 409, label: 'Conflict', desc: 'Email already registered.' },
  { code: 500, label: 'Server Error', desc: 'Unexpected internal server error.' },
];

/* ─── Helpers ─────────────────────────────────── */
const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const ERROR_CODE_STYLE: Record<number, string> = {
  400: 'text-amber-500',
  401: 'text-rose-500',
  403: 'text-rose-600',
  404: 'text-slate-400',
  409: 'text-orange-500',
  500: 'text-red-600',
};

/* ─── Components ──────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
        {label && <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>}
        <CopyButton text={code} />
      </div>
      <pre className="bg-slate-900 p-4 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider font-mono ${METHOD_STYLES[method]}`}>
      {method}
    </span>
  );
}

function ParamsTable({ params }: { params: Param[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Param</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Required</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {params.map((p) => (
            <tr key={p.name} className="bg-white dark:bg-transparent">
              <td className="px-4 py-3 font-mono text-violet-600 dark:text-violet-400 text-xs">{p.name}</td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{p.type}</td>
              <td className="px-4 py-3">
                {p.required
                  ? <span className="text-xs font-medium text-rose-600 dark:text-rose-400">required</span>
                  : <span className="text-xs text-slate-400 dark:text-slate-500">optional</span>}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  return (
    <div id={ep.id} className="scroll-mt-24">
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3 flex-wrap">
          <MethodBadge method={ep.method} />
          <code className="text-sm font-mono text-slate-800 dark:text-slate-200 flex-1">{ep.path}</code>
          <div className="flex items-center gap-2">
            {ep.auth && (
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-0.5">
                <Lock className="w-3 h-3" /> Protected
              </span>
            )}
            {ep.adminOnly && (
              <span className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-full px-2.5 py-0.5">
                <Shield className="w-3 h-3" /> Admin only
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ep.summary}</p>

          {ep.rbac && (
            <div className="flex items-start gap-2.5 p-3.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 rounded-xl">
              <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-violet-700 dark:text-violet-300">{ep.rbac}</p>
            </div>
          )}

          {ep.params && ep.params.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Query Parameters</p>
              <ParamsTable params={ep.params} />
            </div>
          )}

          {ep.body && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Request Body</p>
              <CodeBlock code={ep.body} label="JSON" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Response</p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{ep.responseCode}</span>
            </div>
            <CodeBlock code={ep.response} label={ep.path.includes('export') ? 'CSV' : 'JSON'} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────── */
export default function ApiDocsPage() {
  const { isDark, toggle } = useDarkMode();
  const [activeSection, setActiveSection] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    const targets = contentRef.current?.querySelectorAll('[id]') ?? [];
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const allEndpoints = [...AUTH_ENDPOINTS, ...LEAD_ENDPOINTS];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top header bar ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Smart Leads</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">API Reference</span>
          </div>

          <div className="flex items-center gap-3">
            <code className="hidden sm:inline text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-mono">
              {BASE_URL}
            </code>
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-widest mb-3">Smart Leads</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">API Reference</h1>
          <p className="mt-4 text-violet-200/80 text-base max-w-xl leading-relaxed">
            Complete documentation for the Smart Leads REST API. All endpoints return JSON
            and follow a consistent response format.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-medium backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" /> 10 Endpoints
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-medium backdrop-blur-sm">
              <Lock className="w-3 h-3" /> JWT Auth
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-medium backdrop-blur-sm">
              <Shield className="w-3 h-3" /> RBAC
            </span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-10 py-10">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav className="sticky top-20 space-y-1">
              {SECTIONS.map((section) => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeSection === section.id
                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {section.label}
                  </button>
                  {section.endpoints && (
                    <div className="mt-1 ml-3 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                      {section.endpoints.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => scrollTo(ep.id)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                            activeSection === ep.id
                              ? 'text-violet-600 dark:text-violet-400 font-semibold'
                              : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                          }`}
                        >
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            ep.method === 'GET' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                            ep.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                            ep.method === 'PUT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                          }`}>{ep.method}</span>
                          <span className="truncate font-mono">{ep.path.replace('/api/', '').split('/')[0]}{ep.path.includes(':id') ? '/:id' : ep.path.includes('/stats') ? '/stats' : ep.path.includes('/export') ? '/export' : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <div ref={contentRef} className="flex-1 min-w-0 space-y-16">

            {/* Overview */}
            <section id="overview" className="scroll-mt-20 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  The Smart Leads API is a RESTful service built with Express.js and MongoDB. All requests and
                  responses use JSON. The base URL for all endpoints is shown below.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Base URL</p>
                  <code className="text-sm font-mono text-violet-600 dark:text-violet-400">{BASE_URL}</code>
                </div>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Content-Type</p>
                  <code className="text-sm font-mono text-violet-600 dark:text-violet-400">application/json</code>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Authentication Header</p>
                <CodeBlock code={`Authorization: Bearer <your-jwt-token>`} label="Header" />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Standard Response Format</p>
                <CodeBlock code={STANDARD_RESPONSE} label="JSON" />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Error Response Format</p>
                <CodeBlock code={ERROR_RESPONSE} label="JSON" />
              </div>

              {/* Method legend */}
              <div className="flex flex-wrap gap-3">
                {(['GET', 'POST', 'PUT', 'DELETE'] as HttpMethod[]).map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <MethodBadge method={m} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {m === 'GET' ? 'Read data' : m === 'POST' ? 'Create resource' : m === 'PUT' ? 'Update resource' : 'Delete resource'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-20 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Authentication</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Smart Leads uses JSON Web Tokens (JWT). After registering or logging in, include the token in the
                  <code className="mx-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-violet-600 dark:text-violet-400">Authorization</code>
                  header for all protected endpoints.
                </p>
              </div>
              <div className="space-y-6">
                {AUTH_ENDPOINTS.map((ep) => <EndpointCard key={ep.id} ep={ep} />)}
              </div>
            </section>

            {/* Leads */}
            <section id="leads" className="scroll-mt-20 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Full CRUD for the Lead resource. All endpoints require authentication.
                  The <code className="mx-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-violet-600 dark:text-violet-400">DELETE</code> endpoint
                  additionally requires the <strong className="text-slate-700 dark:text-slate-300">admin</strong> role.
                </p>
              </div>
              <div className="space-y-6">
                {LEAD_ENDPOINTS.map((ep) => <EndpointCard key={ep.id} ep={ep} />)}
              </div>
            </section>

            {/* Error Codes */}
            <section id="errors" className="scroll-mt-20 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Error Codes</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  All error responses follow the standard format with <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">"success": false</code>.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-36">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {ERROR_CODES.map((e) => (
                      <tr key={e.code} className="bg-white dark:bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`font-mono font-bold text-sm ${ERROR_CODE_STYLE[e.code] ?? 'text-slate-500'}`}>{e.code}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium text-sm">{e.label}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <CodeBlock code={ERROR_RESPONSE} label="Error Response" />
            </section>

            {/* Footer */}
            <footer className="pt-8 pb-16 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Smart Leads API</span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 space-y-0.5">
                <p>Built by <span className="font-medium text-slate-600 dark:text-slate-400">Lakshay Punia</span></p>
                <p>MERN Stack Internship Assignment · {new Date().getFullYear()}</p>
              </div>
            </footer>

            {/* Quick reference — all endpoints */}
            <div className="hidden">
              {allEndpoints.map((ep) => ep.id)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
