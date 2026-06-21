import { Shield, Brain, Database, AlertTriangle, UserCheck, Sparkles } from "lucide-react";
import Modal from "./Modal";

interface WelcomeTourProps {
  open: boolean;
  onClose: () => void;
}

const elements = [
  { icon: Brain, label: "Reasoning", color: "text-blue-600 bg-blue-50" },
  { icon: Shield, label: "Confidence", color: "text-emerald-600 bg-emerald-50" },
  { icon: Database, label: "Data Source", color: "text-indigo-600 bg-indigo-50" },
  { icon: AlertTriangle, label: "Limitations", color: "text-amber-600 bg-amber-50" },
  { icon: UserCheck, label: "Human Controls", color: "text-purple-600 bg-purple-50" },
];

export default function WelcomeTour({ open, onClose }: WelcomeTourProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Welcome to TrustLens AI"
      subtitle="Your trustworthy AI agent interface for IT security decisions"
      icon={<Sparkles className="h-6 w-6" />}
      accent="blue"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40"
          >
            Start Exploring →
          </button>
        </div>
      }
    >
      <p className="text-slate-600 leading-relaxed">
        TrustLens AI helps your organization govern AI security recommendations with full
        transparency. Switch personas in the sidebar to see role-specific dashboards.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {elements.map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center"
          >
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800">
        <strong>Tip:</strong> Dashboards show summary metrics only. Open the Recommendation
        Explorer for full reasoning, evidence, alternatives, and human review controls.
      </div>
    </Modal>
  );
}
