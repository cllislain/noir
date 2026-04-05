import { useState } from "react"
import { useEnableShare, useDisableShare } from "./useEntries"
import { useToast } from "@/toast/ToastContext"
import type { Entry } from "@/types"

interface Props {
  entry: Entry
}

export function ShareButton({ entry }: Props) {
  const { toast } = useToast()
  const enableShare  = useEnableShare(entry.id)
  const disableShare = useDisableShare(entry.id)
  const [open, setOpen] = useState(false)

  const shareUrl = entry.share_token
    ? `${window.location.origin}/share/${entry.share_token}`
    : null

  async function handleEnable() {
    await enableShare.mutateAsync()
    setOpen(true)
  }

  async function handleRevoke() {
    if (!window.confirm("Revoke this share link? Anyone with the link will lose access.")) return
    await disableShare.mutateAsync()
    setOpen(false)
    toast("Share link revoked", "info")
  }

  function handleCopy() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl).then(() => toast("Link copied!", "success"))
  }

  const isPending = enableShare.isPending || disableShare.isPending

  if (!entry.share_token && !open) {
    return (
      <button
        type="button"
        className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
        onClick={handleEnable}
        disabled={isPending}
      >
        🔗 <span className="hidden sm:inline">Share</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
        onClick={() => setOpen((v) => !v)}
        style={{ color: "var(--j-accent)", borderColor: "var(--j-accent)" }}
      >
        🔗 <span className="hidden sm:inline">Shared</span>
        <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl border shadow-lg z-50 p-4 space-y-3"
          style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-medium" style={{ color: "var(--j-text-secondary)" }}>
            Anyone with this link can view this entry:
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl ?? ""}
              className="input text-xs flex-1"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="btn-primary text-xs px-3 flex-shrink-0"
              onClick={handleCopy}
            >
              Copy
            </button>
          </div>
          <button
            type="button"
            className="text-xs hover:underline"
            style={{ color: "var(--j-text-muted)" }}
            onClick={handleRevoke}
            disabled={isPending}
          >
            Revoke link
          </button>
        </div>
      )}
    </div>
  )
}
