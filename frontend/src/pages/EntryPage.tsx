import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { format } from "date-fns"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { TagBadge } from "@/features/tags/TagBadge"
import { StickerOverlay } from "@/features/stickers/StickerOverlay"
import { parseCanvasData } from "@/features/canvas/DrawingCanvas"
import { AttachmentGallery } from "@/features/entries/AttachmentGallery"
import { EditHistoryPanel } from "@/features/entries/EditHistoryPanel"
import { ShareButton } from "@/features/entries/ShareButton"
import { useEntry, useDeleteEntry } from "@/features/entries/useEntries"
import { useToast } from "@/toast/ToastContext"
import type { PlacedSticker } from "@/types"

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", neutral: "😐", sad: "😢", anxious: "😰", grateful: "🙏",
}

export function EntryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showHistory, setShowHistory] = useState(false)
  const { data: entry, isLoading } = useEntry(id!)
  const deleteEntry = useDeleteEntry()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return
    try {
      await deleteEntry.mutateAsync(id!)
      toast("Entry deleted", "success")
      navigate("/", { replace: true })
    } catch {
      toast("Failed to delete entry. Please try again.", "error")
    }
  }

  if (isLoading) {
    return (
      <Layout sidebar={<AppSidebar />}>
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      </Layout>
    )
  }

  if (!entry) {
    return (
      <Layout sidebar={<AppSidebar />}>
        <p className="text-center py-16" style={{ color: "var(--j-text-muted)" }}>
          Entry not found.
        </p>
      </Layout>
    )
  }

  const stickers: PlacedSticker[] = entry.stickers ?? []
  const canvasParsed = entry.canvas_data ? parseCanvasData(entry.canvas_data) : null
  const hasCanvas = Boolean(canvasParsed?.svg)

  return (
    <Layout sidebar={<AppSidebar />}>
      <article>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              to="/"
              className="text-sm hover:underline"
              style={{ color: "var(--j-accent)" }}
            >
              ← All entries
            </Link>
            <div className="flex gap-2 flex-wrap">
              <ShareButton entry={entry} />
              <button
                type="button"
                className="btn-secondary text-sm py-1.5 px-3"
                onClick={() => setShowHistory(true)}
              >
                History
              </button>
              <Link to={`/entries/${id}/edit`} className="btn-secondary text-sm py-1 px-3">
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn-danger text-sm py-1 px-3"
                disabled={deleteEntry.isPending}
              >
                Delete
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold" style={{ color: "var(--j-text-primary)" }}>
            {entry.title}
          </h1>

          <div
            className="flex flex-wrap items-center gap-3 mt-2 text-sm"
            style={{ color: "var(--j-text-muted)" }}
          >
            <time dateTime={entry.created_at}>
              {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </time>
            {entry.mood && (
              <span className="flex items-center gap-1">
                {MOOD_EMOJI[entry.mood]} {entry.mood}
              </span>
            )}
            {entry.is_favorite && <span className="text-yellow-400">★ Favorite</span>}
          </div>

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {entry.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
            </div>
          )}
        </div>

        <div
          className="prose max-w-none"
          style={{ color: "var(--j-text-primary)" }}
        >
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {entry.body}
          </ReactMarkdown>
        </div>

        {/* Attachments gallery */}
        {entry.attachments && entry.attachments.length > 0 && (
          <div className="mt-6">
            <p className="text-xs mb-2" style={{ color: "var(--j-text-muted)" }}>Images</p>
            <AttachmentGallery attachments={entry.attachments} />
          </div>
        )}

        {/* Canvas with stickers on top */}
        {(hasCanvas || stickers.length > 0) && (
          <div className="mt-6">
            <p className="text-xs mb-2" style={{ color: "var(--j-text-muted)" }}>Canvas</p>
            <div
              className="relative rounded-xl border overflow-hidden"
              style={{
                borderColor: "var(--j-border)",
                // When no SVG, give container a minimum height so sticker overlay has space
                minHeight: hasCanvas ? undefined : 120,
              }}
            >
              {hasCanvas && canvasParsed && (
                <div
                  style={{ lineHeight: 0 }}
                  dangerouslySetInnerHTML={{ __html: canvasParsed.svg }}
                />
              )}
              {stickers.length > 0 && (
                <StickerOverlay stickers={stickers} onChange={() => {}} readOnly />
              )}
            </div>
          </div>
        )}
      </article>

      {showHistory && (
        <EditHistoryPanel entryId={id!} onClose={() => setShowHistory(false)} />
      )}
    </Layout>
  )
}
