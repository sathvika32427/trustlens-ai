import { Loader2 } from "lucide-react";

export default function LoadingScreen({ message = "Loading governance datasets..." }: { message?: string }) {
  return (
    <div className="tl-shell flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-[var(--tl-dell-blue)]" />
      <p className="text-lg font-semibold text-white">{message}</p>
      <p className="text-sm text-[var(--tl-text-muted)]">Loading 15 CSV datasets from /data</p>
    </div>
  );
}
