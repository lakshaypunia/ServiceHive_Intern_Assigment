import { TrendingUp, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useDarkMode } from '../../hooks/useDarkMode';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Smart Leads</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* User menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar name={user.name} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize leading-none">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/50 z-20 p-1">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
