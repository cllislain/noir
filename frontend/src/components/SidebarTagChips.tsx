import { useTags } from "@/features/tags/useTags"

const MAX_VISIBLE = 8

interface Props {
  selectedTags: string | undefined
  onTagClick: (tagId: string) => void
}

export function SidebarTagChips({ selectedTags, onTagClick }: Props) {
  const { data: tags = [] } = useTags()

  if (tags.length === 0) return null

  const activeTags = selectedTags ? selectedTags.split(",") : []
  const visible = tags.slice(0, MAX_VISIBLE)
  const hasMore = tags.length > MAX_VISIBLE

  const handleClick = (tagId: string) => {
    // Toggle: clicking an active tag deactivates it; clicking an inactive tag sets it as sole filter
    if (activeTags.includes(tagId)) {
      const updated = activeTags.filter((t) => t !== tagId)
      onTagClick(updated.join(","))
    } else {
      onTagClick(tagId)
    }
  }

  return (
    <div className="space-y-2">
      <p
        className="text-xs font-semibold uppercase tracking-wider px-1"
        style={{ color: "var(--j-text-muted)" }}
      >
        Quick tags
      </p>
      <div className="flex flex-wrap gap-1.5 px-1">
        {visible.map((tag) => {
          const isActive = activeTags.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => handleClick(tag.id)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: tag.color,
                      color: "#000",
                      fontWeight: 600,
                    }
                  : {
                      backgroundColor: `${tag.color}22`,
                      color: tag.color,
                      border: `1px solid ${tag.color}44`,
                    }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? "#000" : tag.color }}
              />
              {tag.name}
            </button>
          )
        })}
        {hasMore && (
          <span
            className="text-xs px-1"
            style={{ color: "var(--j-text-muted)" }}
          >
            +{tags.length - MAX_VISIBLE} more
          </span>
        )}
      </div>
    </div>
  )
}
