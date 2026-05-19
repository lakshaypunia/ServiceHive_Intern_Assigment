import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Users, Sparkles, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { getLeadsApi, createLeadApi, updateLeadApi, deleteLeadApi, exportLeadsApi, getLeadsStatsApi, importLeadsApi } from '../api/leads.api';
import type { CreateLeadPayload, UpdateLeadPayload, ImportResult } from '../api/leads.api';
import type { Lead, LeadFilters } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { FiltersBar } from '../components/leads/FiltersBar';
import { LeadsTable } from '../components/leads/LeadsTable';
import { CreateLeadModal } from '../components/leads/CreateLeadModal';
import { EditLeadModal } from '../components/leads/EditLeadModal';
import { DeleteConfirmDialog } from '../components/leads/DeleteConfirmDialog';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton, StatsSkeleton } from '../components/ui/Skeleton';

/* ─── Helpers ─────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Stat card ───────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  colorClasses: { bg: string; icon: string; value: string };
}

function StatCard({ label, value, icon: Icon, colorClasses }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-extrabold mt-1 ${colorClasses.value}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
      </div>
    </div>
  );
}

const STAT_CONFIGS = [
  { key: 'total', label: 'Total Leads', icon: Users, colorClasses: { bg: 'bg-violet-50 dark:bg-violet-900/30', icon: 'text-violet-600 dark:text-violet-400', value: 'text-slate-900 dark:text-white' } },
  { key: 'New', label: 'New', icon: Sparkles, colorClasses: { bg: 'bg-blue-50 dark:bg-blue-900/30', icon: 'text-blue-500 dark:text-blue-400', value: 'text-slate-900 dark:text-white' } },
  { key: 'Qualified', label: 'Qualified', icon: CheckCircle2, colorClasses: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-500 dark:text-emerald-400', value: 'text-slate-900 dark:text-white' } },
  { key: 'Lost', label: 'Lost', icon: XCircle, colorClasses: { bg: 'bg-rose-50 dark:bg-rose-900/30', icon: 'text-rose-500 dark:text-rose-400', value: 'text-slate-900 dark:text-white' } },
] as const;

/* ─── Pagination ──────────────────────────────── */
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}

function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-900 dark:text-white">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-900 dark:text-white">{total}</span> leads
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | '…')[]>((acc, p, i, arr) => {
            const prev = arr[i - 1];
            if (prev !== undefined && p - prev > 1) acc.push('…');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-violet-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            )
          )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Dashboard Page ──────────────────────────── */
export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<LeadFilters>({ page: 1, sort: 'latest' });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult & { show: boolean } | null>(null);

  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['leads'] });
    void queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
  };

  /* Queries */
  const leadsQuery = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => getLeadsApi(filters).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ['leads-stats'],
    queryFn: () => getLeadsStatsApi().then((r) => r.data),
  });

  /* Mutations */
  const createMutation = useMutation({
    mutationFn: createLeadApi,
    onSuccess: () => { invalidate(); setCreateOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadPayload }) => updateLeadApi(id, data),
    onSuccess: () => { invalidate(); setEditingLead(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeadApi,
    onSuccess: () => { invalidate(); setDeletingLead(null); },
  });

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const res = await importLeadsApi(text);
      const result = res.data.data!;
      setImportResult({ ...result, show: true });
      invalidate();
      setTimeout(() => setImportResult(null), 6000);
    } catch {
      setImportResult({ imported: 0, failed: 1, errors: ['Import failed — check file format.'], show: true });
      setTimeout(() => setImportResult(null), 6000);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { page: _p, ...exportFilters } = filters;
      const res = await exportLeadsApi(exportFilters);
      const url = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (key: keyof LeadFilters, value: string | number | undefined) => {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));
  };

  const hasFilters = !!(filters.status ?? filters.source ?? filters.search);

  const leads = leadsQuery.data?.data ?? [];
  const meta = leadsQuery.data?.meta;
  const stats = statsQuery.data?.data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar user={user} onLogout={() => { logout(); navigate('/login', { replace: true }); }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Greeting */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {getGreeting()}, {user?.name.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's what's happening with your leads.</p>
          </div>
        </div>

        {/* Stats */}
        {statsQuery.isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CONFIGS.map(({ key, label, icon, colorClasses }) => (
              <StatCard
                key={key}
                label={label}
                value={stats?.[key] ?? 0}
                icon={icon}
                colorClasses={colorClasses}
              />
            ))}
          </div>
        )}

        {/* Leads card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Leads</h2>
              {meta && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {meta.total}
                </span>
              )}
            </div>
          </div>

          {/* Filters */}
          <FiltersBar
            search={search}
            filters={filters}
            onSearchChange={setSearch}
            onFilterChange={handleFilterChange}
            onExport={() => void handleExport()}
            onImport={(file) => void handleImport(file)}
            onNew={() => setCreateOpen(true)}
            isExporting={isExporting}
            isImporting={isImporting}
          />

          {/* Import result banner */}
          {importResult && (
            <div className={`mx-6 mt-4 p-3.5 rounded-xl border flex items-start justify-between gap-3 text-sm ${
              importResult.failed === 0
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : importResult.imported === 0
                ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}>
              <div>
                <p className="font-semibold">
                  {importResult.imported > 0 ? `✓ ${importResult.imported} lead${importResult.imported !== 1 ? 's' : ''} imported` : ''}
                  {importResult.failed > 0 ? `${importResult.imported > 0 ? ' · ' : ''}${importResult.failed} skipped` : ''}
                </p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs opacity-80">
                    {importResult.errors.slice(0, 3).map((e, i) => <li key={i}>• {e}</li>)}
                    {importResult.errors.length > 3 && <li>• and {importResult.errors.length - 3} more…</li>}
                  </ul>
                )}
              </div>
              <button onClick={() => setImportResult(null)} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">✕</button>
            </div>
          )}

          {/* Table / states */}
          {leadsQuery.isLoading ? (
            <TableSkeleton />
          ) : leadsQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Failed to load leads.</p>
              <button
                onClick={() => void leadsQuery.refetch()}
                className="mt-3 text-violet-600 dark:text-violet-400 text-sm font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          ) : leads.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={() => {
                setSearch('');
                setFilters({ page: 1, sort: 'latest' });
              }}
              onCreate={() => setCreateOpen(true)}
            />
          ) : (
            <LeadsTable
              leads={leads}
              isAdmin={isAdmin}
              onEdit={setEditingLead}
              onDelete={setDeletingLead}
              onView={setViewingLead}
            />
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateLeadModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(data: CreateLeadPayload) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
      <EditLeadModal
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={({ id, data }) => updateMutation.mutate({ id, data })}
        isPending={updateMutation.isPending}
      />
      <DeleteConfirmDialog
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={(id) => deleteMutation.mutate(id)}
        isPending={deleteMutation.isPending}
      />
      <LeadDetailModal
        lead={viewingLead}
        isAdmin={isAdmin}
        onClose={() => setViewingLead(null)}
        onEdit={setEditingLead}
      />
    </div>
  );
}
