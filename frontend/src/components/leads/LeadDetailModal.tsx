import { Mail, Globe, User, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import type { Lead } from '../../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}

export function LeadDetailModal({ lead, isAdmin, onClose, onEdit }: LeadDetailModalProps) {
  if (!lead) return null;

  const createdByName = typeof lead.createdBy === 'object' ? lead.createdBy.name : 'Unknown';
  const createdAt = new Date(lead.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const createdAtTime = new Date(lead.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Lead details" size="md">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Avatar name={lead.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{lead.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lead.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={lead.status} />
              <SourceBadge source={lead.source} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <DetailRow icon={Mail} label="Email" value={lead.email} />
          <DetailRow icon={Globe} label="Source" value={lead.source} />
          {isAdmin && (
            <DetailRow icon={User} label="Owner" value={createdByName} />
          )}
          <DetailRow icon={Calendar} label="Added" value={`${createdAt} at ${createdAtTime}`} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
          <Button fullWidth onClick={() => { onClose(); onEdit(lead); }}>Edit lead</Button>
        </div>
      </div>
    </Modal>
  );
}
