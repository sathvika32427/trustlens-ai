import { Bell } from "lucide-react";
import { mockNotifications } from "../data";

export default function Notifications() {
  return (
    <div className="mesh-bg flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/60 bg-white/70 px-5 py-6 backdrop-blur-sm lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Bell className="h-4 w-4" />
            Personal Notifications
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">My Notifications</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-3 px-5 py-6 lg:px-8">
        {mockNotifications.map((n) => (
          <article
            key={n.id}
            className={`rounded-2xl border p-5 shadow-sm ${
              n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-slate-900">{n.title}</h2>
              {!n.read && (
                <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  New
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{n.message}</p>
            <p className="mt-3 text-xs text-slate-400">{n.timestamp}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
