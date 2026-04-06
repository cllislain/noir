import { useState, type ReactNode } from "react"
import { Navbar } from "./Navbar"
import { useSidebarCollapse } from "./useSidebarCollapse"

interface LayoutProps {
  children: ReactNode
  /** Rendered inside the persistent sidebar */
  sidebar?: ReactNode
  /** Injected into the navbar center slot (e.g. search bar) */
  navSlot?: ReactNode
}

export function Layout({ children, sidebar, navSlot }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isCollapsed, toggle } = useSidebarCollapse()

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "var(--j-bg-base)", color: "var(--j-text-primary)" }}>
      <Navbar
        onMenuClick={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        navSlot={navSlot}
      />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <>
            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            <aside
              className={[
                "flex-shrink-0 flex flex-col border-r",
                "transition-all duration-300 ease-in-out",
                // Mobile: slide in/out from left
                "fixed top-14 bottom-0 left-0 z-40 w-72 overflow-y-auto",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: static, collapsible
                isCollapsed
                  ? "md:static md:translate-x-0 md:z-auto md:w-0 md:h-full md:overflow-hidden md:border-r-0"
                  : "md:static md:translate-x-0 md:z-auto md:w-64 md:h-full md:overflow-y-auto",
              ].join(" ")}
              style={{
                backgroundColor: "var(--j-sidebar-bg)",
                borderColor: "var(--j-sidebar-border)",
              }}
            >
              {/* Close button — mobile only */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b md:hidden"
                style={{ borderColor: "var(--j-sidebar-border)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "var(--j-text-secondary)" }}>
                  Filters
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-lg leading-none p-1 rounded"
                  style={{ color: "var(--j-text-muted)" }}
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1">{sidebar}</div>

              {/* Desktop collapse toggle — inside sidebar at the bottom */}
              <div
                className="hidden md:flex justify-end px-3 py-2 border-t flex-shrink-0"
                style={{ borderColor: "var(--j-sidebar-border)" }}
              >
                <button
                  onClick={toggle}
                  title="Collapse sidebar"
                  className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                  style={{ color: "var(--j-text-muted)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                  }}
                  aria-label="Collapse sidebar"
                >
                  ‹
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Expand button — pinned to left edge when sidebar is collapsed, desktop only */}
        {sidebar && isCollapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            className="hidden md:flex items-center justify-center w-5 self-start mt-4 ml-0 rounded-r-md border border-l-0 flex-shrink-0 h-10 transition-colors"
            style={{
              backgroundColor: "var(--j-sidebar-bg)",
              borderColor: "var(--j-sidebar-border)",
              color: "var(--j-text-muted)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--j-text-primary)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--j-text-muted)"
            }}
            aria-label="Expand sidebar"
          >
            ›
          </button>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
