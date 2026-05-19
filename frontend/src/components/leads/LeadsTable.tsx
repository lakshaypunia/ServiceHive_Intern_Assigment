import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Lead } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface LeadRowProps {
  lead: Lead;
  isAdmin: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

function LeadRow({ lead, isAdmin, onEdit, onDelete, onView }: LeadRowProps) {
  const createdByName =
    typeof lead.createdBy === 'object' ? lead.createdBy.name : '';

  return (
    <tr className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
      <td className="pl-6 pr-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={lead.name} size="md" />
          <div className="min-w-0">
            <button
              onClick={() => onView(lead)}
              className="text-sm font-semibold text-slate-900 dark:text-white truncate hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-left"
            >
              {lead.name}
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{lead.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-4 py-4">
        <SourceBadge source={lead.source} />
      </td>
      {isAdmin && (
        <td className="px-4 py-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{createdByName}</p>
        </td>
      )}
      <td className="px-4 py-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{timeAgo(lead.createdAt)}</p>
      </td>
      <td className="pl-4 pr-6 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(lead)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="View details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(lead)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(lead)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

interface LeadsTableProps {
  leads: Lead[];
  isAdmin: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

export function LeadsTable({ leads, isAdmin, onEdit, onDelete, onView }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="pl-6 pr-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Lead
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Source
            </th>
            {isAdmin && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Owner
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Added
            </th>
            <th className="pl-4 pr-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {leads.map((lead) => (
            <LeadRow
              key={lead._id}
              lead={lead}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
