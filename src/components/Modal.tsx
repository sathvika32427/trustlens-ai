import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: "blue" | "green" | "amber" | "purple" | "red";
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}

const accentMap = {
  blue: "from-blue-600 to-indigo-600",
  green: "from-emerald-500 to-teal-600",
  amber: "from-amber-500 to-orange-600",
  purple: "from-purple-600 to-violet-600",
  red: "from-red-500 to-rose-600",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  accent = "blue",
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sizeClass =
    size === "xl" ? "max-w-2xl" : size === "lg" ? "max-w-xl" : "max-w-md";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`relative w-full ${sizeClass} overflow-hidden rounded-2xl border border-[var(--tl-border)] bg-[var(--tl-bg-card)] shadow-2xl`}
          >
            <div className={`bg-gradient-to-r ${accentMap[accent]} px-6 py-5 text-white`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-xl font-bold">{title}</h2>
                    {subtitle && (
                      <p className="mt-0.5 text-sm text-white/80">{subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5 text-[var(--tl-text-secondary)]">{children}</div>
            {footer && (
              <div className="border-t border-[var(--tl-border)] bg-[var(--tl-bg-elevated)] px-6 py-4">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
