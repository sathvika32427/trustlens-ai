import { useAppData } from "../context/AppDataContext";
import AIHealthDashboard from "./features/AIHealthDashboard";

export default function AIHealthPage() {
  const { data } = useAppData();
  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-6 py-6">
        <h1 className="font-display text-3xl font-bold text-white">AI Health Dashboard</h1>
        <p className="mt-2 text-[var(--tl-text-secondary)]">
          Live metrics from ai_health.csv — recommendations, accuracy, incidents, and trust trends.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <AIHealthDashboard data={data.aiHealth} />
      </div>
    </div>
  );
}
