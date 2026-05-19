import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, User } from 'lucide-react';
import type { Lead, LeadSource, LeadStatus } from '../../types';
import type { UpdateLeadPayload } from '../../api/leads.api';

interface FormData {
  name: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
}

interface EditLeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSubmit: (args: { id: string; data: UpdateLeadPayload }) => void;
  isPending: boolean;
}

const selectClass =
  'w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-colors';

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';

export function EditLeadModal({ lead, onClose, onSubmit, isPending }: EditLeadModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (lead) {
      reset({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    }
  }, [lead, reset]);

  const onFormSubmit = (data: FormData) => {
    if (!lead) return;
    onSubmit({ id: lead._id, data });
  };

  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Edit lead">
      <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          icon={User}
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="jane@company.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
          })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select {...register('status')} className={selectClass}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <select {...register('source', { required: true })} className={selectClass}>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isPending} fullWidth>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
