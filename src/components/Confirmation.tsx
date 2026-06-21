import { motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowLeft,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { ConfirmationState, DecisionType } from "../types";
import { getDeviceById } from "../data";

interface ConfirmationProps {
  confirmation: ConfirmationState;
  onBackToDashboard: () => void;
  onViewActivityLog: () => void;
}

const decisionConfig: Record<
  DecisionType,
  { icon: typeof CheckCircle2; gradient: string; title: string; message: string }
> = {
  Approved: {
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-600",
    title: "Action Approved ✓",
    message: "Your decision has been recorded and the recommended action will proceed.",
  },
  Overridden: {
    icon: XCircle,
    gradient: "from-amber-500 to-orange-600",
    title: "Recommendation Overridden",
    message: "Your override has been recorded. The AI recommendation was not executed.",
  },
  Escalated: {
    icon: ArrowUpRight,
    gradient: "from-purple-600 to-violet-600",
    title: "Escalated to Human Review",
    message: "This case has been forwarded to a senior admin or analyst for manual review.",
  },
};

export default function Confirmation({
  confirmation,
  onBackToDashboard,
  onViewActivityLog,
}: ConfirmationProps) {
  const { decision, recommendation, notes } = confirmation;
  const device = getDeviceById(recommendation.deviceId);
  const config = decisionConfig[decision];
  const Icon = config.icon;

  return (
    <div className="mesh-bg flex flex-1 items-center justify-center overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/50"
      >
        <div className={`bg-gradient-to-r ${config.gradient} px-8 py-10 text-center text-white`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring" }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <Icon className="h-10 w-10" />
          </motion.div>
          <h1 className="mt-5 font-display text-2xl font-bold">{config.title}</h1>
          <p className="mt-2 text-sm text-white/80">{config.message}</p>
        </div>

        <div className="space-y-3 px-8 py-6">
          {[
            ["Recommendation", recommendation.action],
            ["Device", device?.name ?? recommendation.deviceId],
            ["Your Decision", decision],
            ["Confidence", recommendation.confidence],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold text-slate-900">{value}</span>
            </div>
          ))}
          {notes && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <span className="text-slate-500">Notes</span>
              <p className="mt-1 text-slate-800">{notes}</p>
            </div>
          )}
          <p className="flex items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
            <Sparkles className="h-3 w-3" />
            Recorded · Added to Activity Log
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-8 py-5">
          <button
            onClick={onBackToDashboard}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={onViewActivityLog}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-3 text-sm font-bold text-white shadow-lg`}
          >
            <ClipboardList className="h-4 w-4" />
            Activity Log
          </button>
        </div>
      </motion.div>
    </div>
  );
}
