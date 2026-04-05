import { useEffect, useRef } from "react"
import { format } from "date-fns"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"
import { EntryCardSkeleton } from "@/features/entries/EntryCardSkeleton"
import { useTrashEntries, useRestoreEntry, useHardDeleteEntry } from "@/features/entries/useEntries"
import { useToast } from "@/toast/ToastContext"
import type { Entry } from "@/types"

function TrashEntryCard({ entry, onRestore, onDelete }: {
  entry: Entry
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="card p-4 space-y-2"
      style={{ opacity: 0.85 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2
            className="font-semibold line-clamp-1"
            style={{ color: "var(--j-text-primary)" }}
          >
            {entry.title}
          </h2>
          {entry.body_preview && (
            <p
              className="text-sm line-clamp-2 mt-1"
              style={{ color: "var(--j-text-muted)" }}
            >
              {entry.body_preview}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onRestore(entry.id)}
            className="btn-secondary text-xs py-1 px-2.5"
          >
            Restore
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="btn-danger text-xs py-1 px-2.5"
          >
            Delete forever
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--j-text-muted)" }}>
        <span>Created {format(new Date(entry.created_at), "MMM d, yyyy")}</span>
        {entry.deleted_at && (
          <span>· Deleted {format(new Date(entry.deleted_at), "MMM d, yyyy")}</span>
        )}
      </div>
    </div>
  )
}

export function TrashPage() {
  const { toast } = useToast()
  const restore = useRestoreEntry()
  const hardDelete = useHardDeleteEntry()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTrashEntries()

  const entries = data?.pages.flatMap((p) => p.results) ?? []
  const totalCount = data?.pages[0]?.count ?? 0

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleRestore = async (id: string) => {
    try {
      await restore.mutateAsync(id)
      toast("Entry restored", "success")
    } catch {
      toast("Failed to restore entry", "error")
    }
  }

  const handleHardDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this entry? This cannot be undone.")) return
    try {
      await hardDelete.mutateAsync(id)
      toast("Entry permanently deleted", "success")
    } catch {
      toast("Failed to delete entry", "error")
    }
  }

  return (
    <Layout sidebar={<AppSidebar />}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--j-text-primary)" }}>
            Trash
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--j-text-muted)" }}>
            Deleted entries are shown here. Restore them or delete them forever.
          </p>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => <EntryCardSkeleton key={i} />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--j-text-muted)" }}>
            <p className="text-4xl mb-3">🗑️</p>
            <p className="font-medium text-lg">Trash is empty</p>
            <p className="text-sm mt-1">Deleted entries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
              {totalCount} {totalCount === 1 ? "entry" : "entries"} in trash
            </p>
            {entries.map((entry) => (
              <TrashEntryCard
                key={entry.id}
                entry={entry}
                onRestore={handleRestore}
                onDelete={handleHardDelete}
              />
            ))}
            <div ref={sentinelRef} className="h-px" />
            {isFetchingNextPage && (
              <div className="space-y-3">
                <EntryCardSkeleton />
                <EntryCardSkeleton />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
