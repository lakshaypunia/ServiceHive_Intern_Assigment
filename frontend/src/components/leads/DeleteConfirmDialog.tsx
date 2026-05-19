import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Lead } from '../../types';

interface DeleteConfirmDialogProps {
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
}

export function DeleteConfirmDialog({ lead, onClose, onConfirm, isPending }: DeleteConfirmDialogProps) {
  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Delete lead" size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-slate-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{lead?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isPending}
            fullWidth
            onClick={() => lead && onConfirm(lead._id)}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
