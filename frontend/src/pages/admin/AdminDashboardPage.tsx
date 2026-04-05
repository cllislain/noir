import { useAdminStats } from "@/features/admin/useAdmin";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: string;
  accent?: boolean;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex items-center gap-4"
      style={{
        backgroundColor: "var(--j-bg-surface)",
        borderColor: accent ? "var(--j-accent)" : "var(--j-border)",
        borderWidth: accent ? 2 : 1,
      }}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--j-text-primary)" }}>
          {value ?? "—"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--j-text-muted)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--j-text-muted)" }}>
          Site-wide overview
        </p>
      </div>

      {isError && (
        <p className="text-sm text-red-500">Failed to load stats.</p>
      )}

      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "var(--j-text-muted)" }}
        >
          Users
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total users"  icon="👥" value={stats?.total_users}  accent />
          <StatCard label="Active users" icon="✅" value={stats?.active_users} />
          <StatCard label="Staff users"  icon="🔑" value={stats?.staff_users}  />
        </div>
      </section>

      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "var(--j-text-muted)" }}
        >
          Entries
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total entries"   icon="📝" value={stats?.total_entries}   accent />
          <StatCard label="Active entries"  icon="📄" value={stats?.active_entries}  />
          <StatCard label="Deleted entries" icon="🗑️" value={stats?.deleted_entries} />
        </div>
      </section>

      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "var(--j-text-muted)" }}
        >
          Tags
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total tags" icon="🏷️" value={stats?.total_tags} accent />
        </div>
      </section>

      {isLoading && (
        <p className="text-sm" style={{ color: "var(--j-text-muted)" }}>Loading…</p>
      )}
    </div>
  );
}
