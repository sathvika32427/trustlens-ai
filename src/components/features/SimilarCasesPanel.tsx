import { GitCompare } from "lucide-react";
import { SimilarCaseRow } from "../../types/datasets";

export default function SimilarCasesPanel({ cases }: { cases: SimilarCaseRow[] }) {
  if (!cases.length) return null;

  return (
    <div className="tl-panel">
      <h3 className="tl-panel-title flex items-center gap-2">
        <GitCompare className="h-5 w-5 text-[var(--tl-dell-blue)]" />
        Similar Cases
      </h3>
      <p className="mb-4 text-sm text-[var(--tl-text-muted)]">
        Compare this recommendation with historical similar cases.
      </p>
      <div className="overflow-x-auto">
        <table className="tl-table w-full">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Outcome</th>
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={`${c.similar_case_id}-${c.outcome}`}>
                <td className="font-mono text-[var(--tl-dell-blue-light)]">{c.similar_case_id}</td>
                <td>{c.outcome}</td>
                <td className="text-[var(--tl-text-secondary)]">{c.resolution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
