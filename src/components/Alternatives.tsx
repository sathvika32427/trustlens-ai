import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { AIRecommendation } from "../types";

interface AlternativesProps {
  selectedRec: AIRecommendation;
  onBack: () => void;
}

export default function Alternatives({ selectedRec, onBack }: AlternativesProps) {
  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/60 px-6 py-6 backdrop-blur-sm lg:px-10">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recommendation
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-900">Alternative Actions</h1>
        <p className="mt-2 text-slate-600">
          Other options the AI considered for{" "}
          <strong className="text-blue-700">{selectedRec.action}</strong> on{" "}
          <strong>{selectedRec.deviceId}</strong>.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-4 px-6 py-8 lg:px-10">
        {selectedRec.alternatives.map((alt, i) => (
          <motion.div
            key={alt.option}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`overflow-hidden rounded-2xl border shadow-lg ${
              alt.recommended
                ? "border-blue-300 bg-white shadow-blue-100/60"
                : "border-slate-200 bg-white shadow-slate-100/60"
            }`}
          >
            {alt.recommended && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-1.5 text-center text-xs font-bold text-white">
                ✓ AI Recommended Option
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600">
                    Option {alt.option}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                    {alt.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{alt.description}</p>
                </div>
                {alt.recommended ? (
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-blue-600" />
                ) : (
                  <XCircle className="h-8 w-8 shrink-0 text-slate-300" />
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 text-sm">
                  <span className="text-xs font-bold uppercase text-slate-400">Risk if chosen</span>
                  <p className="mt-1 text-slate-700">{alt.riskLevel}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm">
                  <span className="text-xs font-bold uppercase text-slate-400">Business impact</span>
                  <p className="mt-1 text-slate-700">{alt.businessImpact}</p>
                </div>
              </div>

              <p className="mt-4 border-t border-slate-100 pt-3 text-sm italic text-slate-500">
                {alt.reasoning}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
