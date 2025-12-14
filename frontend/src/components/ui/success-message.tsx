import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  duration?: number;
}

export function SuccessMessage({
  message,
  duration = 3000,
}: SuccessMessageProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);

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
      setVisible(false);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
      <div className="flex items-center space-x-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-green-800 text-sm font-medium">{message}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-200 rounded-b-lg">
        <div
          className="h-full bg-green-600 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
