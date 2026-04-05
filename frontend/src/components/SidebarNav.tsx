import { Link, NavLink } from "react-router-dom"
import { SidebarStats } from "./SidebarStats"
import { useAuth } from "@/auth/useAuth"

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: "/",         label: "Home",     icon: "📓" },
  { to: "/insights", label: "Insights", icon: "📊" },
  { to: "/trash",    label: "Trash",    icon: "🗑️" },
]

const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? { backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-primary)", fontWeight: 600 }
    : { color: "var(--j-text-secondary)" }

export function SidebarNav() {
  const { user } = useAuth()

  return (
    <div className="mb-5 space-y-4">
      {/* New Entry CTA */}
      <Link
        to="/entries/new"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
        style={{
          backgroundColor: "var(--j-accent)",
          color: "var(--j-accent-text)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-accent-hover)"
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-accent)"
        }}
      >
        <span>✏️</span>
        <span>New Entry</span>
      </Link>

      {/* Navigation */}
      <nav>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={navLinkStyle}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          {user?.is_staff && (
            <li>
              <NavLink
                to="/admin"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={navLinkStyle}
              >
                <span>⚙️</span>
                <span>Admin</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Divider */}
      <div className="h-px" style={{ backgroundColor: "var(--j-border)" }} />

      {/* Quick Stats */}
      <SidebarStats />

      {/* Divider */}
      <div className="h-px" style={{ backgroundColor: "var(--j-border)" }} />
    </div>
  )
}
