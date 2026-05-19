import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <h1 className="text-8xl font-bold text-slate-200 dark:text-slate-800">404</h1>
      <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Page not found</p>
      <p className="text-slate-400 dark:text-slate-500">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
