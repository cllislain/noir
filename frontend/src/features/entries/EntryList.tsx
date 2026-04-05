import { useEffect, useRef } from "react"
import { EntryCard } from "./EntryCard"
import { EntryCardSkeleton, EntryListSkeleton } from "./EntryCardSkeleton"
import type { Entry } from "@/types"

// ── Standard (single-page) list ───────────────────────────────────────────

interface EntryListProps {
  entries: Entry[]
  isLoading: boolean
  totalCount: number
  searchQuery?: string
}

export function EntryList({ entries, isLoading, totalCount, searchQuery = "" }: EntryListProps) {
  if (isLoading) {
    return <EntryListSkeleton count={5} />
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--j-text-muted)" }}>
        <p className="text-4xl mb-3">📓</p>
        <p className="font-medium text-lg">No entries yet</p>
        <p className="text-sm mt-1">Start writing your first entry.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
        {totalCount} {totalCount === 1 ? "entry" : "entries"}
      </p>
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} searchQuery={searchQuery} />
      ))}
    </div>
  )
}

// ── Infinite-scroll list ──────────────────────────────────────────────────

interface InfiniteEntryListProps {
  entries: Entry[]
  totalCount: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  searchQuery?: string
}

export function InfiniteEntryList({
  entries,
  totalCount,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  searchQuery = "",
}: InfiniteEntryListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver triggers onLoadMore when the sentinel enters the viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  if (isLoading) {
    return <EntryListSkeleton count={5} />
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--j-text-muted)" }}>
        <p className="text-4xl mb-3">📓</p>
        <p className="font-medium text-lg">No entries yet</p>
        <p className="text-sm mt-1">Start writing your first entry.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
        {totalCount} {totalCount === 1 ? "entry" : "entries"}
      </p>

      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} searchQuery={searchQuery} />
      ))}

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-px" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, i) => <EntryCardSkeleton key={i} />)}
        </div>
      )}

      {!hasNextPage && entries.length > 0 && (
        <p className="text-center text-xs py-4" style={{ color: "var(--j-text-muted)" }}>
          All entries loaded
        </p>
      )}
    </div>
  )
}
