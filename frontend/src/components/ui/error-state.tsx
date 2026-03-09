import React from "react";
import {
  AlertCircle,
  RefreshCw,
  WifiOff,
  ServerCrash,
  ShieldAlert,
} from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  errorType?: "network" | "server" | "auth" | "generic";
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message = "Something went wrong while trying to load the data.",
  onRetry,
  errorType = "generic",
}) => {
  const getIcon = () => {
    switch (errorType) {
      case "network":
        return <WifiOff className="h-16 w-16 text-slate-400" />;
      case "server":
        return <ServerCrash className="h-16 w-16 text-red-400" />;
      case "auth":
        return <ShieldAlert className="h-16 w-16 text-amber-400" />;
      default:
        return <AlertCircle className="h-16 w-16 text-red-400" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (errorType) {
      case "network":
        return "Connection Lost";
      case "server":
        return "Server Error";
      case "auth":
        return "Access Denied";
      default:
        return "Execution Error";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-100 dark:border-slate-800 shadow-inner">
        {getIcon()}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {getTitle()}
      </h2>

      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="group flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
          Try Again
        </button>
      )}
    </div>
  );
};
