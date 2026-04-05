import { useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { format, parseISO } from "date-fns"
import { useEntryVersions } from "./useEntries"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import type { EntryVersion } from "@/types"

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", neutral: "😐", sad: "😢", anxious: "😰", grateful: "🙏",
}

interface Props {
  entryId: string
  onClose: () => void
}

export function EditHistoryPanel({ entryId, onClose }: Props) {
  const { data: versions, isLoading } = useEntryVersions(entryId)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[80vh]"
        style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--j-border)" }}
        >
          <h2 className="font-bold text-base" style={{ color: "var(--j-text-primary)" }}>
            Edit history
          </h2>
          <button
            onClick={onClose}
            className="text-lg leading-none opacity-60 hover:opacity-100"
            style={{ color: "var(--j-text-primary)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {isLoading && (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          )}

          {!isLoading && (!versions || versions.length === 0) && (
            <p className="text-sm text-center py-8" style={{ color: "var(--j-text-muted)" }}>
              No edit history yet. Versions are saved when you edit title, body, or mood.
            </p>
          )}

          {versions?.map((v: EntryVersion) => {
            const isOpen = expanded === v.id
            const wordCount = v.body.trim().split(/\s+/).filter(Boolean).length
            return (
              <div
                key={v.id}
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--j-border)" }}
              >
                {/* Row header */}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{ backgroundColor: isOpen ? "var(--j-bg-elevated)" : "var(--j-bg-surface)" }}
                >
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-accent)" }}
                  >
                    v{v.version_num}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--j-text-primary)" }}>
                    {v.title}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--j-text-muted)" }}>
                    {v.mood && <span className="mr-1">{MOOD_EMOJI[v.mood]}</span>}
                    {wordCount}w
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--j-text-muted)" }}>
                    {format(parseISO(v.edited_at), "MMM d, yyyy HH:mm")}
                  </span>
                  <span className="text-xs opacity-50" style={{ color: "var(--j-text-muted)" }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div
                    className="px-4 py-3 border-t text-sm prose prose-sm max-w-none"
                    style={{
                      borderColor: "var(--j-border)",
                      backgroundColor: "var(--j-bg-base)",
                      color: "var(--j-text-secondary)",
                    }}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {v.body}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
