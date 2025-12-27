import { useEffect, useState } from "react";
import { XCircle, X } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export function ErrorMessage({
  message,
  duration = 3000,
  onClose,
}: ErrorMessageProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);

    const timeout = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-2 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Close error message"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-200 rounded-b-lg">
        <div
          className="h-full bg-red-600 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
