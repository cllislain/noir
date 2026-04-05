import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { ThemeSwitcher } from "./ThemeSwitcher"

function mediaPath(url: string | null | undefined): string | null {
  if (!url) return null
  try { return new URL(url).pathname } catch { return url }
}

interface NavbarProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
  /** Optional center slot — e.g. search bar injected by a page */
  navSlot?: ReactNode
}

export function Navbar({ onMenuClick, sidebarOpen, navSlot }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleLogout = async () => {
    setSigningOut(true)
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--j-bg-surface)",
        borderColor: "var(--j-border)",
      }}
    >
      <div className="w-full px-4 h-14 flex items-center gap-3">
        {/* Hamburger — mobile only */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--j-text-muted)" }}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}

        {/* Brand */}
        <Link
          to="/"
          className="text-base font-bold tracking-widest uppercase flex-shrink-0"
          style={{ color: "var(--j-accent)" }}
        >
          Noir
        </Link>

        {/* Center slot (search + extras injected by page) */}
        {navSlot && (
          <div className="flex-1 flex items-center gap-2 mx-2">
            {navSlot}
          </div>
        )}

        {/* Right side spacer when no navSlot */}
        {!navSlot && <div className="flex-1" />}

        {user && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* New Entry */}
            <Link
              to="/entries/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
              style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-accent-hover)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-accent)" }}
            >
              ✏️ <span className="hidden sm:inline">New Entry</span>
            </Link>

            {/* Theme switcher */}
            <ThemeSwitcher />

            {/* Avatar / account chip */}
            <Link
              to="/account"
              className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
              style={{ color: "var(--j-text-secondary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
              title="Account settings"
            >
              {mediaPath(user.avatar) ? (
                <img
                  src={mediaPath(user.avatar)!}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
                >
                  {(user.display_name || user.username || "?")[0].toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                {user.display_name || user.username}
              </span>
            </Link>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
              style={{
                color: "var(--j-text-muted)",
                borderColor: "var(--j-border)",
                backgroundColor: "var(--j-bg-elevated)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-primary)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-muted)" }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
