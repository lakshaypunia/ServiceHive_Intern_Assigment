import { useRef } from 'react';
import { Search, SlidersHorizontal, Download, Upload, Plus } from 'lucide-react';
import type { LeadFilters, LeadStatus, LeadSource } from '../../types';
import { Button } from '../ui/Button';

interface FiltersBarProps {
  search: string;
  filters: LeadFilters;
  onSearchChange: (v: string) => void;
  onFilterChange: (key: keyof LeadFilters, value: string | number | undefined) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onNew: () => void;
  isExporting: boolean;
  isImporting: boolean;
}

const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const sources: LeadSource[] = ['Website', 'Instagram', 'Referral'];

const selectClass =
  'text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer';

export function FiltersBar({
  search,
  filters,
  onSearchChange,
  onFilterChange,
  onExport,
  onImport,
  onNew,
  isExporting,
  isImporting,
}: FiltersBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

        {/* Search — full width on mobile, flexible on desktop */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Filters — mobile: 2-col grid (status+source), sort full-width below; desktop: flex row */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 sm:w-auto w-full">
          <SlidersHorizontal className="hidden sm:block w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <select
            value={filters.status ?? ''}
            onChange={(e) => onFilterChange('status', e.target.value as LeadStatus || undefined)}
            className={`${selectClass} w-full`}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.source ?? ''}
            onChange={(e) => onFilterChange('source', e.target.value as LeadSource || undefined)}
            className={`${selectClass} w-full`}
          >
            <option value="">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.sort ?? 'latest'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className={`${selectClass} w-full col-span-2 sm:col-span-1`}
          >
            <option value="latest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Actions — mobile: Import+Export side by side, New Lead full-width below; desktop: flex row */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 sm:ml-auto sm:w-auto w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isImporting}
            className="w-full sm:w-auto justify-center gap-1.5"
            title="Import leads from CSV"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </Button>
          <Button
            variant="secondary"
            onClick={onExport}
            isLoading={isExporting}
            className="w-full sm:w-auto justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            onClick={onNew}
            className="col-span-2 sm:col-span-1 w-full sm:w-auto justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
