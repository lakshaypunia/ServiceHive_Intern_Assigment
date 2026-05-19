import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { loginApi } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';

interface LoginFormData {
  email: string;
  password: string;
}

const previewLeads = [
  { name: 'Priya Sharma', email: 'priya@startup.io', status: 'Qualified' as const, time: '2m ago' },
  { name: 'Rahul Gupta', email: 'rahul@techco.com', status: 'New' as const, time: '18m ago' },
  { name: 'Neha Kapoor', email: 'neha@agency.co', status: 'Contacted' as const, time: '1h ago' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>();

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      if (res.data.data) { login(res.data.data); navigate('/', { replace: true }); }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setError('root', {
          message: (error.response?.data as { message?: string })?.message ?? 'Login failed.',
        });
      }
    },
  });

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Smart Leads</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-10">
          <div>
            <p className="text-violet-300 text-sm font-medium mb-3 tracking-wide uppercase">Lead Management</p>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15]">
              Convert prospects<br />into revenue.
            </h1>
            <p className="mt-4 text-violet-200/70 text-base leading-relaxed">
              Track every lead, collaborate with your team, and close deals faster.
            </p>
          </div>

          {/* Floating lead preview cards */}
          <div className="space-y-3">
            {previewLeads.map((lead, i) => (
              <div
                key={lead.email}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex items-center justify-between"
                style={{ transform: `translateX(${i % 2 === 0 ? '0px' : '16px'})` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {lead.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none">{lead.name}</p>
                    <p className="text-violet-300 text-xs mt-0.5">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <span className="text-violet-400 text-xs hidden sm:block">{lead.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-violet-400/50 text-xs">© 2026 Smart Leads</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white text-lg font-bold">Smart Leads</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="mt-1.5 text-slate-500 dark:text-slate-400 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                })}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
              />

              {errors.root && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-400">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" isLoading={isPending} fullWidth className="mt-2 h-11">
                {isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
