import { useNavigate, NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AdminNavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin",              label: "Dashboard",    icon: "🏠", end: true },
  { to: "/admin/users",        label: "Users",        icon: "👤" },
  { to: "/admin/entries",      label: "Entries",      icon: "📝" },
  { to: "/admin/tags",         label: "Tags",         icon: "🏷️" },
  { to: "/admin/shared-links", label: "Shared Links", icon: "🔗" },
  { to: "/admin/settings",     label: "Settings",     icon: "⚙️" },
];

export function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--j-bg-base)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r"
        style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
      >
        {/* Brand */}
        <div
          className="h-14 flex items-center px-4 gap-2 border-b font-bold text-sm"
          style={{ borderColor: "var(--j-border)", color: "var(--j-text-primary)" }}
        >
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-primary)", fontWeight: 600 }
                  : { color: "var(--j-text-secondary)" }
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer — back link */}
        <div className="px-3 py-3 border-t" style={{ borderColor: "var(--j-border)" }}>
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors w-full"
            style={{ color: "var(--j-text-muted)" }}
          >
            <span>↩</span>
            <span>Back to Journal</span>
          </NavLink>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-6 gap-4 border-b"
          style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
        >
          <span
            className="text-base font-bold tracking-widest uppercase"
            style={{ color: "var(--j-accent)" }}
          >
            Noir
          </span>

          <div className="flex items-center gap-3 ml-auto">
            <ThemeSwitcher />

            <span
              className="hidden sm:block text-sm truncate max-w-[140px]"
              style={{ color: "var(--j-text-secondary)" }}
            >
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
              style={{
                color: "var(--j-text-muted)",
                borderColor: "var(--j-border)",
                backgroundColor: "var(--j-bg-elevated)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-primary)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-muted)"; }}
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
