import { useState } from "react"
import type { Attachment } from "@/types"

/** Strip origin so the URL goes through the Vite /media proxy instead of hitting the Docker hostname directly. */
function mediaPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

interface AttachmentGalleryProps {
  attachments: Attachment[]
  editMode?: boolean
  onDelete?: (id: string) => void
  deletingIds?: Set<string>
}

export function AttachmentGallery({
  attachments,
  editMode = false,
  onDelete,
  deletingIds = new Set(),
}: AttachmentGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (attachments.length === 0) return null

  return (
    <>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
      >
        {attachments.map((att) => (
          <div
            key={att.id}
            className="relative rounded-lg overflow-hidden border aspect-square"
            style={{ borderColor: "var(--j-border)" }}
          >
            <img
              src={mediaPath(att.file)}
              alt={att.original_filename}
              className="w-full h-full object-cover"
              onClick={() => !editMode && setLightbox(mediaPath(att.file))}
              style={{ cursor: editMode ? "default" : "zoom-in" }}
            />
            {editMode && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(att.id)}
                disabled={deletingIds.has(att.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow transition-opacity"
                style={{ backgroundColor: "rgba(239,68,68,0.9)" }}
                aria-label={`Remove ${att.original_filename}`}
              >
                {deletingIds.has(att.id) ? "…" : "×"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox ?? ""}
            alt="Attachment"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl leading-none opacity-70 hover:opacity-100"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
