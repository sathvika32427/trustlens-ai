import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const TYPE_ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const TYPE_CLASSES = {
  success: "border-[var(--tl-success)]/30 bg-slate-900/90 text-white",
  info: "border-[var(--tl-dell-blue-light)]/30 bg-slate-900/90 text-white",
  warning: "border-[var(--tl-warning)]/30 bg-slate-900/90 text-white",
};

const ICON_COLORS = {
  success: "text-[var(--tl-success)]",
  info: "text-[var(--tl-dell-blue-light)]",
  warning: "text-[var(--tl-warning)]",
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed right-6 top-6 z-50 flex flex-col gap-3 w-80 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const Icon = TYPE_ICONS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md pointer-events-auto ${TYPE_CLASSES[toast.type]}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_COLORS[toast.type]}`} />
      <div className="flex-1 text-sm font-medium leading-normal">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="rounded-lg p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white transition shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
