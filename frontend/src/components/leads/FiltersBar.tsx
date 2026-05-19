import { Search, SlidersHorizontal, Download, Plus } from 'lucide-react';
import type { LeadFilters, LeadStatus, LeadSource } from '../../types';
import { Button } from '../ui/Button';

interface FiltersBarProps {
  search: string;
  filters: LeadFilters;
  onSearchChange: (v: string) => void;
  onFilterChange: (key: keyof LeadFilters, value: string | number | undefined) => void;
  onExport: () => void;
  onNew: () => void;
  isExporting: boolean;
}

const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const sources: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export function FiltersBar({
  search,
  filters,
  onSearchChange,
  onFilterChange,
  onExport,
  onNew,
  isExporting,
}: FiltersBarProps) {
  return (
    <div className="p-4 border-b border-slate-100">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all placeholder-slate-400"
          />
        </div>

        {/* Filters group */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />

          <select
            value={filters.status ?? ''}
            onChange={(e) => onFilterChange('status', e.target.value as LeadStatus || undefined)}
            className="text-sm bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filters.source ?? ''}
            onChange={(e) => onFilterChange('source', e.target.value as LeadSource || undefined)}
            className="text-sm bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filters.sort ?? 'latest'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="text-sm bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="latest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="secondary"
            onClick={onExport}
            isLoading={isExporting}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button onClick={onNew} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Lead</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
