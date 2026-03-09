import { useEffect, useState, useCallback } from "react";
import { XCircle, X, AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  type?: "error" | "warning";
}

export function ErrorMessage({
  message,
  duration = 5000,
  onClose,
  type = "error",
}: ErrorMessageProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);

  const handleClose = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        handleClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, handleClose]);

  if (!visible) return null;

  const isWarning = type === "warning";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] animate-in slide-in-from-right-full duration-300`}
    >
      <div
        className={`
        relative overflow-hidden min-w-[320px] max-w-md
        bg-white dark:bg-slate-900 
        border-l-4 ${isWarning ? "border-amber-500" : "border-red-500"}
        rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none
        p-4 pr-10
      `}
      >
        <div className="flex items-start gap-4">
          <div
            className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${isWarning ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}
          `}
          >
            {isWarning ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 pt-0.5">
            <h4
              className={`text-sm font-semibold ${isWarning ? "text-amber-900" : "text-red-900"} mb-1`}
            >
              {isWarning ? "Warning" : "Error Occurred"}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all ease-linear ${isWarning ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
