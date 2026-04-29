export default function AssignmentsLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
      {/* Page header skeleton */}
      <div>
        <div
          style={{
            height: 32,
            width: 220,
            borderRadius: "var(--bw-radius-md)",
            background: "var(--bw-chip)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <div
          style={{
            height: 16,
            width: 360,
            borderRadius: "var(--bw-radius-md)",
            background: "var(--bw-chip)",
            marginTop: "var(--bw-space-2)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      </div>

      {/* Table card skeleton */}
      <div
        style={{
          borderRadius: "var(--bw-radius-lg)",
          border: "1px solid var(--bw-border)",
          background: "var(--bw-bg-primary)",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "var(--bw-space-6)",
            borderBottom: "1px solid var(--bw-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              height: 20,
              width: 120,
              borderRadius: "var(--bw-radius-md)",
              background: "var(--bw-chip)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          <div
            style={{
              height: 36,
              width: 200,
              borderRadius: "var(--bw-radius-pill)",
              background: "var(--bw-chip)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: "var(--bw-space-4) var(--bw-space-6)",
              borderBottom: i < 5 ? "1px solid var(--bw-border)" : undefined,
              display: "grid",
              gridTemplateColumns: "40px 1fr 100px 200px 120px",
              gap: "var(--bw-space-4)",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: "var(--bw-chip)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  height: 14,
                  width: `${60 + (i % 3) * 20}%`,
                  borderRadius: "var(--bw-radius-sm)",
                  background: "var(--bw-chip)",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "40%",
                  borderRadius: "var(--bw-radius-sm)",
                  background: "var(--bw-chip)",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
            <div
              style={{
                height: 22,
                width: 72,
                borderRadius: "var(--bw-radius-pill)",
                background: "var(--bw-chip)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              style={{
                height: 22,
                width: `${50 + (i % 2) * 30}%`,
                borderRadius: "var(--bw-radius-pill)",
                background: "var(--bw-chip)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              style={{
                height: 32,
                width: 100,
                borderRadius: "var(--bw-radius-pill)",
                background: "var(--bw-chip)",
                marginLeft: "auto",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
