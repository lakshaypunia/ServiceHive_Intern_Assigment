import { useForm, useWatch } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { registerApi } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'sales_user';
}

const roles = [
  { value: 'sales_user' as const, label: 'Sales User', desc: 'Manage your own leads', icon: BarChart3 },
  { value: 'admin' as const, label: 'Admin', desc: 'Full access to all data', icon: Shield },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: { role: 'sales_user' },
  });
  const selectedRole = useWatch({ control, name: 'role' });

  const { mutate, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: (res) => {
      if (res.data.data) { login(res.data.data); navigate('/', { replace: true }); }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setError('root', {
          message: (error.response?.data as { message?: string })?.message ?? 'Registration failed.',
        });
      }
    },
  });

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Smart Leads</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-10">
          <div>
            <p className="text-violet-300 text-sm font-medium mb-3 tracking-wide uppercase">Get started free</p>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15]">
              Your sales pipeline,<br />organised.
            </h1>
            <p className="mt-4 text-violet-200/70 text-base leading-relaxed">
              Join teams that rely on Smart Leads to track, qualify, and convert their pipeline.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '4 stages', label: 'Lead tracking' },
              { value: '3 sources', label: 'Traffic origins' },
              { value: 'CSV export', label: 'One-click export' },
              { value: 'RBAC', label: 'Access control' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/8 border border-white/10 rounded-2xl p-4">
                <p className="text-white font-bold text-base">{value}</p>
                <p className="text-violet-300/60 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-violet-400/50 text-xs">© 2026 Smart Leads</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
              <p className="mt-1.5 text-slate-500 dark:text-slate-400 text-sm">Get started in less than a minute</p>
            </div>

            <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
              <Input
                label="Full name"
                type="text"
                autoComplete="name"
                placeholder="Lakshay Punia"
                icon={User}
                error={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                })}
              />
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
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
              />

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Account type</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(({ value, label, desc, icon: Icon }) => {
                    const active = selectedRole === value;
                    return (
                      <label
                        key={value}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-150 ${
                          active
                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input type="radio" value={value} className="sr-only" {...register('role')} />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                          active ? 'bg-violet-600' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                        {active && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {errors.root && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-400">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" isLoading={isPending} fullWidth className="mt-2 h-11">
                {isPending ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
