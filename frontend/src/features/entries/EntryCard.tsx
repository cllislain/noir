import { Link } from "react-router-dom"
import { format } from "date-fns"
import { TagBadge } from "@/features/tags/TagBadge"
import { HighlightText } from "@/components/HighlightText"
import type { Entry } from "@/types"

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", neutral: "😐", sad: "😢", anxious: "😰", grateful: "🙏",
}

interface EntryCardProps {
  entry: Entry
  searchQuery?: string
}

export function EntryCard({ entry, searchQuery = "" }: EntryCardProps) {
  return (
    <Link to={`/entries/${entry.id}`} className="block card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h2
          className="font-semibold line-clamp-1"
          style={{ color: "var(--j-text-primary)" }}
        >
          <HighlightText text={entry.title} query={searchQuery} />
        </h2>
        <div className="flex items-center gap-1 flex-shrink-0">
          {entry.is_favorite && (
            <span className="text-yellow-400" aria-label="Favorite">★</span>
          )}
          {entry.mood && (
            <span title={entry.mood} className="text-lg leading-none">
              {MOOD_EMOJI[entry.mood] ?? ""}
            </span>
          )}
        </div>
      </div>

      {entry.body_preview && (
        <p
          className="text-sm line-clamp-2"
          style={{ color: "var(--j-text-muted)" }}
        >
          <HighlightText text={entry.body_preview} query={searchQuery} />
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {entry.tags.length > 3 && (
            <span className="text-xs" style={{ color: "var(--j-text-muted)" }}>
              +{entry.tags.length - 3}
            </span>
          )}
        </div>
        <time
          className="text-xs"
          dateTime={entry.created_at}
          style={{ color: "var(--j-text-muted)" }}
        >
          {format(new Date(entry.created_at), "MMM d, yyyy")}
        </time>
      </div>
    </Link>
  )
}
