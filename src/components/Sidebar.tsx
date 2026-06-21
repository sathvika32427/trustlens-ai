import { useState, useRef, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  FileCheck2,
  GitCompare,
  History,
  User,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Role } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
}

const personas = [
  {
    role: Role.IT_ADMIN,
    icon: ShieldCheck,
    shortLabel: "IT Admin",
    description: "Full access — approve, override, and manage all recommendations.",
  },
  {
    role: Role.SECURITY_ANALYST,
    icon: Shield,
    shortLabel: "Security Analyst",
    description: "Reviews flagged threats — same controls, focused on anomaly investigation.",
  },
  {
    role: Role.STAKEHOLDER,
    icon: Eye,
    shortLabel: "Stakeholder",
    description: "Read-only view with plain-language summaries, no decision buttons.",
  },
];

export default function Sidebar({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
}: SidebarProps) {
  const [personaOpen, setPersonaOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  const activePersona = personas.find((p) => p.role === activeRole) ?? personas[0];
  const ActiveIcon = activePersona.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setPersonaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRole = (role: Role) => {
    setActiveRole(role);
    setPersonaOpen(false);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "details", label: "Reasoning Panel", icon: FileCheck2 },
    { id: "alternatives", label: "Alternatives", icon: GitCompare },
    { id: "audit", label: "Activity Log", icon: History },
  ];

  return (
    <aside className="relative flex w-64 shrink-0 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC.02Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJWNDBoMnYtMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      <div className="relative border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">
              Trust<span className="text-blue-400">Lens</span> AI
            </h1>
            <p className="text-[11px] text-slate-400">Trustworthy AI Agent Interface</p>
          </div>
        </div>
      </div>

      {/* Custom persona picker — replaces broken native select on Windows */}
      <div className="relative border-b border-white/10 p-4" ref={personaRef}>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <User className="h-3.5 w-3.5" />
          Active Persona
        </div>

        <button
          type="button"
          onClick={() => setPersonaOpen((o) => !o)}
          aria-expanded={personaOpen}
          aria-haspopup="listbox"
          className="flex w-full items-center gap-3 rounded-xl border border-white/15 bg-slate-800 px-3 py-2.5 text-left transition hover:border-blue-500/50 hover:bg-slate-700"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/30">
            <ActiveIcon className="h-4 w-4 text-blue-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{activePersona.role}</p>
            <p className="truncate text-[10px] text-slate-400">{activePersona.shortLabel}</p>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${personaOpen ? "rotate-180" : ""}`}
          />
        </button>

        {personaOpen && (
          <div
            role="listbox"
            aria-label="Select persona"
            className="absolute left-4 right-4 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-600 bg-slate-800 shadow-2xl shadow-black/50"
          >
            {personas.map(({ role, icon: Icon, description }) => {
              const isSelected = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectRole(role)}
                  className={`flex w-full items-start gap-3 border-b border-slate-700/60 px-3 py-3 text-left transition last:border-b-0 ${
                    isSelected
                      ? "bg-blue-600/20 hover:bg-blue-600/30"
                      : "hover:bg-slate-700"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? "bg-blue-600" : "bg-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{role}</p>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Always-visible quick summary of current persona */}
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          {activePersona.description}
        </p>
      </div>

      <nav className="relative flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {isActive && (
                <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-white/10 p-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            5 Transparency Elements
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            Reasoning · Confidence · Data Source · Limitations · Human Controls
          </p>
        </div>
      </div>
    </aside>
  );
}
