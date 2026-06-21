import { Shield, AlertTriangle, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { mockRecommendations } from "../data";
import { AIRecommendation, Role } from "../types";
import RecommendationCard from "./RecommendationCard";

interface DashboardProps {
  activeRole: Role;
  setSelectedRec: (rec: AIRecommendation) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({
  activeRole,
  setSelectedRec,
  setCurrentTab,
}: DashboardProps) {
  const pendingRecs = mockRecommendations.filter((r) => r.status === "Pending");
  const isStakeholder = activeRole === Role.STAKEHOLDER;

  const handleReview = (rec: AIRecommendation) => {
    setSelectedRec(rec);
    setCurrentTab("details");
  };

  const stats = [
    {
      label: "Pending",
      value: pendingRecs.length,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
    },
    {
      label: "Active Cases",
      value: mockRecommendations.length,
      icon: Clock,
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
    },
    {
      label: "Transparency",
      value: "5/5",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      {/* Dashboard hero */}
      <div className="border-b border-slate-200/60 bg-white/60 px-6 py-8 backdrop-blur-sm lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Shield className="h-4 w-4" />
            TrustLens AI · Device Security Recommendations
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-4xl">
            {isStakeholder ? "AI Activity Summary" : "AI Recommendations Dashboard"}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            {isStakeholder
              ? "Plain-language overview of AI security recommendations awaiting or recently completed by your IT team."
              : "Review AI recommendations for your fleet. Each card shows what the AI suggests, how confident it is, and why — before you decide."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        {!isStakeholder && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card overflow-hidden rounded-2xl shadow-lg shadow-slate-200/40"
                >
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                  <div className="flex items-center gap-4 p-5">
                    <div className={`rounded-xl ${stat.bg} p-3`}>
                      <Icon className={`h-6 w-6 text-slate-700`} />
                    </div>
                    <div>
                      <p className="font-display text-3xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                {isStakeholder ? "Recent AI Recommendations" : "Recommendation Queue"}
              </h2>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {mockRecommendations.length} cases
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {mockRecommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <RecommendationCard
                  recommendation={rec}
                  onReview={handleReview}
                  compact={isStakeholder}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
