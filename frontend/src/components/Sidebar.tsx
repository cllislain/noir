import { useEffect, type ReactNode } from "react"

interface SidebarProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Responsive sidebar:
 *  - Mobile  (<768px):  overlay drawer that slides in from the left
 *  - Tablet  (768-1023px): icon-rail collapsed by default, expands to full via `open`
 *  - Desktop (≥1024px): always visible fixed panel, `open` state ignored
 */
export function Sidebar({ open, onClose, children }: SidebarProps) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    const isSmall = window.innerWidth < 768
    if (isSmall && open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/*
        ── Sidebar panel ──
        Mobile:  fixed, slides in/out (translate-x)
        Tablet:  fixed, always at left edge (visible as narrow rail or expanded)
        Desktop: static, part of the layout grid
      */}
      <aside
        className={[
          /* shared */
          "flex flex-col h-full min-h-0 overflow-y-auto",
          "border-r transition-transform duration-300 ease-in-out",
          /* mobile: fixed full-height drawer */
          "fixed top-14 bottom-0 left-0 z-40 w-72",
          open ? "translate-x-0" : "-translate-x-full",
          /* tablet: always visible narrow strip, width controlled by open */
          "md:translate-x-0 md:static md:z-auto md:top-auto md:bottom-auto",
          "md:w-64",
          /* desktop: always visible */
          "lg:translate-x-0 lg:static lg:w-64",
        ].join(" ")}
        style={{
          backgroundColor: "var(--j-sidebar-bg)",
          borderColor: "var(--j-sidebar-border)",
        }}
      >
        {/* Close button — mobile only */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden border-b" style={{ borderColor: "var(--j-sidebar-border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--j-text-secondary)" }}>Filters</span>
          <button
            onClick={onClose}
            className="text-lg leading-none p-1 rounded"
            style={{ color: "var(--j-text-muted)" }}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex-1">
          {children}
        </div>
      </aside>
    </>
  )
}
