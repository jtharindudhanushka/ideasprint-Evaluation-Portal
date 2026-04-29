export default function AdminLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
      {/* Header skeleton */}
      <div>
        <div className="skeleton" style={{ height: 36, width: 300, marginBottom: "var(--bw-space-2)", borderRadius: "var(--bw-radius-sm)" }} />
        <div className="skeleton" style={{ height: 20, width: 250, borderRadius: "var(--bw-radius-sm)" }} />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton skeleton-card" style={{ height: 100, borderRadius: "var(--bw-radius-md)" }} />
        ))}
      </div>

      {/* Split View: Table + Leaderboard */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Table skeleton */}
        <div className="skeleton skeleton-card" style={{ height: 600, borderRadius: "var(--bw-radius-md)" }} />
        
        {/* Leaderboard skeleton */}
        <div style={{ position: "sticky", top: 72, alignSelf: "start" }}>
          <div className="skeleton skeleton-card" style={{ height: 800, borderRadius: "var(--bw-radius-md)" }} />
        </div>
      </div>
    </div>
  );
}
