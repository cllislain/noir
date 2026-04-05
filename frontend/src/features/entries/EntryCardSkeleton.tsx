/** Single pulsing skeleton card that mirrors the EntryCard layout */
function SkeletonBlock({
  width = "100%",
  height = "0.75rem",
  radius = "0.375rem",
}: {
  width?: string
  height?: string
  radius?: string
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: "var(--j-bg-elevated)",
      }}
    />
  )
}

export function EntryCardSkeleton() {
  return (
    <div
      className="card p-4 space-y-3"
      aria-hidden="true"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <SkeletonBlock width="60%" height="1rem" />
        <div className="flex gap-1">
          <SkeletonBlock width="1.25rem" height="1.25rem" radius="9999px" />
          <SkeletonBlock width="1.25rem" height="1.25rem" radius="9999px" />
        </div>
      </div>

      {/* Preview text lines */}
      <div className="space-y-1.5">
        <SkeletonBlock width="100%" />
        <SkeletonBlock width="75%" />
      </div>

      {/* Tags + date row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1">
          <SkeletonBlock width="3.5rem" height="1.25rem" radius="9999px" />
          <SkeletonBlock width="3rem" height="1.25rem" radius="9999px" />
        </div>
        <SkeletonBlock width="5rem" height="0.625rem" />
      </div>
    </div>
  )
}

/** A list of N skeleton cards used while entries are loading */
export function EntryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {/* Faux "X entries" label */}
      <div
        className="animate-pulse h-3 w-16 rounded"
        style={{ backgroundColor: "var(--j-bg-elevated)" }}
      />
      {Array.from({ length: count }, (_, i) => (
        <EntryCardSkeleton key={i} />
      ))}
    </div>
  )
}
