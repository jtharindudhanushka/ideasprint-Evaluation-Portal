export default function EvaluatorLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
      <div>
        <div className="skeleton" style={{ height: 36, width: 300, marginBottom: "var(--bw-space-2)", borderRadius: "var(--bw-radius-sm)" }} />
        <div className="skeleton" style={{ height: 20, width: 250, borderRadius: "var(--bw-radius-sm)" }} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-card" style={{ height: 110, borderRadius: "var(--bw-radius-md)" }} />
            ))}
          </div>
          <div className="skeleton skeleton-card" style={{ height: 350, borderRadius: "var(--bw-radius-md)" }} />
          <div className="skeleton skeleton-card" style={{ height: 450, borderRadius: "var(--bw-radius-md)" }} />
        </div>
        
        {/* RIGHT COLUMN */}
        <div style={{ position: "sticky", top: 72, alignSelf: "start" }}>
          <div className="skeleton skeleton-card" style={{ height: 800, borderRadius: "var(--bw-radius-md)" }} />
        </div>
      </div>
    </div>
  );
}

