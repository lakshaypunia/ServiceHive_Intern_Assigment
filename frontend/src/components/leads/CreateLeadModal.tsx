import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, User } from 'lucide-react';
import type { CreateLeadPayload } from '../../api/leads.api';
import type { LeadSource, LeadStatus } from '../../types';

interface FormData {
  name: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
}

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadPayload) => void;
  isPending: boolean;
}

const selectClass =
  'w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent hover:border-slate-400 transition-colors';

export function CreateLeadModal({ isOpen, onClose, onSubmit, isPending }: CreateLeadModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { status: 'New' } });

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add new lead">
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select {...register('status')} className={selectClass}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
            <select
              {...register('source', { required: true })}
              className={selectClass}
              defaultValue=""
            >
              <option value="" disabled>Select…</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
            </select>
            {errors.source && <p className="mt-1 text-xs text-red-600">Source is required</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isPending} fullWidth>
            {isPending ? 'Adding…' : 'Add lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
