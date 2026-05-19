import type { LeadStatus, LeadSource } from '../../types';

const statusStyles: Record<LeadStatus, string> = {
  New: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Contacted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Qualified: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Lost: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const statusDot: Record<LeadStatus, string> = {
  New: 'bg-blue-500',
  Contacted: 'bg-amber-500',
  Qualified: 'bg-emerald-500',
  Lost: 'bg-rose-500',
};

const sourceStyles: Record<LeadSource, string> = {
  Website: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Instagram: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-200',
  Referral: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`} />
      {status}
    </span>
  );
}

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sourceStyles[source]}`}>
      {source}
    </span>
  );
}
