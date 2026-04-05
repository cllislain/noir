import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/endpoints"
import { useToast } from "@/toast/ToastContext"
import type { SharedLink } from "@/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function AdminSharedLinksPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "shared-links", page],
    queryFn: () => adminApi.listSharedLinks({ page }).then((r) => r.data),
  })

  const revoke = useMutation({
    mutationFn: (id: string) => adminApi.revokeSharedLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shared-links"] })
      toast("Link revoked", "success")
    },
    onError: () => toast("Failed to revoke link", "error"),
  })

  const links: SharedLink[] = data?.results ?? []
  const total = data?.count ?? 0
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>Shared Links</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>
          All active public share links — {total} total
        </p>
      </div>

      <div className="card overflow-hidden" style={{ backgroundColor: "var(--j-bg-surface)" }}>
        {isLoading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>Loading…</div>
        ) : links.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>No active shared links.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "var(--j-border)", color: "var(--j-text-muted)" }}>
                  <th className="px-4 py-3 font-medium">Entry</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Share token</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr
                    key={link.id}
                    className="border-b last:border-0"
                    style={{ borderColor: "var(--j-border)" }}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <span
                        className="font-medium truncate block"
                        style={{ color: "var(--j-text-primary)" }}
                        title={link.title}
                      >
                        {link.title || "(untitled)"}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--j-text-secondary)" }}>
                      <div>{link.author_username}</div>
                      <div className="text-xs" style={{ color: "var(--j-text-muted)" }}>{link.author_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <code
                        className="text-xs px-2 py-0.5 rounded font-mono"
                        style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-muted)" }}
                      >
                        {link.share_token}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--j-text-muted)" }}>
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => revoke.mutate(link.id)}
                        disabled={revoke.isPending}
                        className="text-xs px-2.5 py-1 rounded-lg border transition-colors text-red-500 border-red-400/40 hover:bg-red-500/10"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--j-text-muted)" }}>
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
              style={{ borderColor: "var(--j-border)", backgroundColor: "var(--j-bg-elevated)" }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
              style={{ borderColor: "var(--j-border)", backgroundColor: "var(--j-bg-elevated)" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
