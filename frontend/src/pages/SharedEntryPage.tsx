import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { format } from "date-fns"
import { StickerOverlay } from "@/features/stickers/StickerOverlay"
import { parseCanvasData } from "@/features/canvas/DrawingCanvas"
import { TagBadge } from "@/features/tags/TagBadge"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { shareApi } from "@/api/endpoints"
import type { Entry, PlacedSticker } from "@/types"

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", neutral: "😐", sad: "😢", anxious: "😰", grateful: "🙏",
}

export function SharedEntryPage() {
  const { token } = useParams<{ token: string }>()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    shareApi.getPublic(token)
      .then((r) => setEntry(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  const stickers: PlacedSticker[] = entry?.stickers ?? []
  const canvasParsed = entry?.canvas_data ? parseCanvasData(entry.canvas_data) : null
  const hasCanvas = Boolean(canvasParsed?.svg)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--j-bg-base)", color: "var(--j-text-primary)" }}>
      {/* Minimal navbar */}
      <nav
        className="sticky top-0 z-40 border-b px-4 h-12 flex items-center justify-between"
        style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
      >
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--j-accent)" }}>
          Noir
        </span>
        <Link
          to="/register"
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
        >
          Start your own journal →
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        )}

        {!loading && notFound && (
          <div className="text-center py-20 space-y-3">
            <p className="text-4xl">🔒</p>
            <p className="text-lg font-semibold" style={{ color: "var(--j-text-primary)" }}>
              This entry isn't available
            </p>
            <p className="text-sm" style={{ color: "var(--j-text-muted)" }}>
              The link may have been revoked or doesn't exist.
            </p>
          </div>
        )}

        {!loading && entry && (
          <article className="space-y-6">
            {/* Title + meta */}
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--j-text-primary)" }}>
                {entry.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--j-text-muted)" }}>
                <time dateTime={entry.created_at}>
                  {format(new Date(entry.created_at), "MMMM d, yyyy")}
                </time>
                {entry.mood && (
                  <span>{MOOD_EMOJI[entry.mood]} {entry.mood}</span>
                )}
              </div>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {entry.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="prose max-w-none" style={{ color: "var(--j-text-primary)" }}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {entry.body}
              </ReactMarkdown>
            </div>

            {/* Canvas + stickers */}
            {(hasCanvas || stickers.length > 0) && (
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--j-text-muted)" }}>Canvas</p>
                <div
                  className="relative rounded-xl border overflow-hidden"
                  style={{ borderColor: "var(--j-border)", minHeight: hasCanvas ? undefined : 120 }}
                >
                  {hasCanvas && canvasParsed && (
                    <div style={{ lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: canvasParsed.svg }} />
                  )}
                  {stickers.length > 0 && (
                    <StickerOverlay stickers={stickers} onChange={() => {}} readOnly />
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div
              className="rounded-xl border p-5 text-center space-y-2"
              style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--j-text-primary)" }}>
                Keep your own journal
              </p>
              <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
                Write daily, track your mood, and look back on what matters.
              </p>
              <Link
                to="/register"
                className="inline-block mt-1 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
              >
                Start for free →
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
