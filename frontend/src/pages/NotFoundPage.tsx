import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-8xl font-bold text-gray-200">404</h1>
      <p className="text-xl font-semibold text-gray-700">Page not found</p>
      <p className="text-gray-400">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
