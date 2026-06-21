import { useState, useRef, useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { Role } from "../types/datasets";
import { useAppData } from "../context/AppDataContext";
import { buildNotifications, countUnread } from "../lib/notifications";

interface Props {
  activeRole: Role;
  onOpenNotifications: () => void;
  onOpenRecommendation: (id: string) => void;
}

export default function NotificationBell({
  activeRole,
  onOpenNotifications,
  onOpenRecommendation,
}: Props) {
  const { data, recommendations } = useAppData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notifications = useMemo(() => {
    if (!data) return [];
    return buildNotifications(data, recommendations, activeRole);
  }, [data, recommendations, activeRole]);

  const unread = countUnread(notifications);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="tl-notification-btn"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="tl-notification-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="tl-notification-dropdown">
          <div className="tl-notification-dropdown-header">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unread > 0 && (
              <span className="text-xs font-semibold text-[var(--tl-dell-blue-light)]">
                {unread} new
              </span>
            )}
          </div>
          <div className="tl-notification-list">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--tl-text-muted)]">
                No notifications right now.
              </p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`tl-notification-item ${n.unread ? "tl-notification-item-unread" : ""}`}
                  onClick={() => {
                    setOpen(false);
                    if (n.recommendation_id) onOpenRecommendation(n.recommendation_id);
                    else onOpenNotifications();
                  }}
                >
                  <p className="tl-notification-title">{n.title}</p>
                  <p className="tl-notification-message">{n.message}</p>
                  <p className="tl-notification-time">{n.timestamp}</p>
                </button>
              ))
            )}
          </div>
          <button type="button" className="tl-notification-view-all" onClick={() => { setOpen(false); onOpenNotifications(); }}>
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
