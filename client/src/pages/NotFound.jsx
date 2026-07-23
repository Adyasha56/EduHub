import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 text-center">
      <p className="text-8xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
      >
        Back to Dashboard.
      </button>
    </div>
  );
};

export default NotFound;
