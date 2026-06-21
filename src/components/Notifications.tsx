import { useState, useMemo } from "react";
import { Bell, AlertTriangle, Shield, MessageSquare, Info } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { Role } from "../types/datasets";
import { buildNotifications, NotificationType } from "../lib/notifications";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  pending: AlertTriangle,
  escalated: Shield,
  critical: AlertTriangle,
  incident: AlertTriangle,
  feedback: MessageSquare,
  info: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  pending: "var(--tl-warning)",
  escalated: "var(--tl-escalated)",
  critical: "var(--tl-danger)",
  incident: "var(--tl-danger)",
  feedback: "var(--tl-text-muted)",
  info: "var(--tl-dell-blue-light)",
};

interface Props {
  activeRole: Role;
  onOpenRecommendation?: (id: string) => void;
}

export default function Notifications({ activeRole, onOpenRecommendation }: Props) {
  const { data, recommendations } = useAppData();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const all = useMemo(() => {
    if (!data) return [];
    return buildNotifications(data, recommendations, activeRole);
  }, [data, recommendations, activeRole]);

  const shown = filter === "unread" ? all.filter((n) => n.unread) : all;
  const unreadCount = all.filter((n) => n.unread).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--tl-border)] bg-[var(--tl-bg-sidebar)] px-6 py-6">
        <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-white">
          <Bell className="h-8 w-8 text-[var(--tl-dell-blue-light)]" />
          Notifications
        </h1>
        <p className="mt-2 text-base text-[var(--tl-text-secondary)]">
          Alerts from recommendations, escalations, incidents, and feedback — generated from your datasets.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${filter === "all" ? "bg-[var(--tl-dell-blue)] text-white" : "bg-[var(--tl-bg-elevated)] text-white"}`}
          >
            All ({all.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${filter === "unread" ? "bg-[var(--tl-dell-blue)] text-white" : "bg-[var(--tl-bg-elevated)] text-white"}`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-3 px-5 py-6">
        {shown.length === 0 && (
          <p className="py-12 text-center text-base text-[var(--tl-text-secondary)]">
            No notifications in this view.
          </p>
        )}
        {shown.map((n) => {
          const Icon = TYPE_ICON[n.type];
          return (
            <article
              key={n.id}
              className={`tl-audit-card cursor-pointer transition hover:border-[var(--tl-dell-blue)] ${n.unread ? "border-[var(--tl-dell-blue)]" : ""}`}
              onClick={() => n.recommendation_id && onOpenRecommendation?.(n.recommendation_id)}
              onKeyDown={(e) => e.key === "Enter" && n.recommendation_id && onOpenRecommendation?.(n.recommendation_id)}
              role={n.recommendation_id ? "button" : undefined}
              tabIndex={n.recommendation_id ? 0 : undefined}
            >
              <div className="tl-audit-card-header">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: TYPE_COLOR[n.type] }} />
                  <span className="tl-field-value text-sm">{n.title}</span>
                </div>
                {n.unread && (
                  <span className="rounded-full bg-[var(--tl-dell-blue)] px-2 py-0.5 text-[10px] font-bold text-white">
                    NEW
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="tl-field-value text-sm font-normal leading-relaxed">{n.message}</p>
                <p className="tl-field-label mt-3">{n.timestamp}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
