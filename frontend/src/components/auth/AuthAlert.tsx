import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthAlertProps {
  message?: string;
  onClose: () => void;
  duration?: number;
}

export function AuthAlert({ message, onClose, duration = 5000 }: AuthAlertProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key="error-alert"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 border border-red-100/50 text-red-600 shadow-sm">
            <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-red-500" />
            <p className="flex-1 text-[14px] font-medium leading-snug">
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1 opacity-50 hover:bg-red-100 hover:opacity-100 transition-all focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
