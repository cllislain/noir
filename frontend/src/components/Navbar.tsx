import { useState, useRef, useEffect, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { ThemeSwitcher } from "./ThemeSwitcher"

function mediaPath(url: string | null | undefined): string | null {
  if (!url) return null
  // If already an absolute URL (Supabase in production), use as-is
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return url
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
  const [accountOpen, setAccountOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    if (accountOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [accountOpen])

  const handleLogout = async () => {
    setAccountOpen(false)
    setSigningOut(true)
    await logout()
    navigate("/login", { replace: true })
  }

  const avatar = mediaPath(user?.avatar)
  const initials = (user?.display_name || user?.username || "?")[0].toUpperCase()

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
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

        {/* Center slot */}
        {navSlot && (
          <div className="flex-1 flex items-center gap-2 mx-2">
            {navSlot}
          </div>
        )}
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

            {/* Theme switcher — icon only */}
            <ThemeSwitcher />

            {/* Account dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 px-1.5 py-1 rounded-lg transition-colors"
                style={{ color: "var(--j-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
              >
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
                  >
                    {initials}
                  </div>
                )}
                <span className="hidden sm:inline text-sm max-w-[100px] truncate">
                  {user.display_name || user.username}
                </span>
                <span className="text-xs opacity-50">{accountOpen ? "▲" : "▼"}</span>
              </button>

              {accountOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border shadow-lg z-50 overflow-hidden"
                  style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
                >
                  {/* Profile header */}
                  <div
                    className="px-4 py-3 flex items-center gap-3 border-b"
                    style={{ borderColor: "var(--j-border)" }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--j-text-primary)" }}>
                        {user.display_name || user.username}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--j-text-muted)" }}>
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors w-full"
                      style={{ color: "var(--j-text-secondary)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
                    >
                      <span>⚙️</span>
                      <span>Account settings</span>
                    </Link>

                    <Link
                      to="/changelog"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors w-full"
                      style={{ color: "var(--j-text-secondary)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
                    >
                      <span>📋</span>
                      <span>Changelog</span>
                    </Link>

                    {user.is_staff && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors w-full"
                        style={{ color: "var(--j-text-secondary)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
                      >
                        <span>🛡️</span>
                        <span>Admin panel</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign out */}
                  <div className="border-t py-1" style={{ borderColor: "var(--j-border)" }}>
                    <button
                      onClick={handleLogout}
                      disabled={signingOut}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors text-left disabled:opacity-50"
                      style={{ color: "var(--j-text-muted)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
                    >
                      <span>↩</span>
                      <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                    </button>
                  </div>

                  <div
                    className="px-4 py-2 text-center text-xs"
                    style={{ color: "var(--j-text-muted)", borderTop: "1px solid var(--j-border)" }}
                  >
                    Noir v1.0.0
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
