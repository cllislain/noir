import { useState, useEffect, useRef, type FormEvent } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { MarkdownEditor } from "@/components/MarkdownEditor"
import { TagSelector } from "@/features/tags/TagSelector"
import { DrawingCanvas } from "@/features/canvas/DrawingCanvas"
import { AttachmentUpload } from "@/features/entries/AttachmentUpload"
import { AttachmentGallery } from "@/features/entries/AttachmentGallery"
import { TemplatePicker } from "@/features/entries/TemplatePicker"
import {
  useEntry,
  useCreateEntry,
  useUpdateEntry,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/features/entries/useEntries"
import { useToast } from "@/toast/ToastContext"
import type { MoodValue, PlacedSticker, Attachment } from "@/types"

const MOODS: { value: MoodValue; label: string }[] = [
  { value: "happy",    label: "😊 Happy" },
  { value: "neutral",  label: "😐 Neutral" },
  { value: "sad",      label: "😢 Sad" },
  { value: "anxious",  label: "😰 Anxious" },
  { value: "grateful", label: "🙏 Grateful" },
]

const DRAFT_KEY = "journal-draft"

interface Draft {
  title: string
  body: string
  mood: MoodValue | ""
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

function saveDraft(draft: Draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) } catch { /* storage full */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}

function getWordStats(text: string): { words: number; readingTime: number } {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return { words, readingTime: Math.max(1, Math.round(words / 200)) }
}

export function EntryFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: existing, isLoading } = useEntry(id ?? "")
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()

  // These hooks are only active when editing (need an entryId)
  const uploadAttachment = useUploadAttachment(id ?? "")
  const deleteAttachment = useDeleteAttachment(id ?? "")

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [mood, setMood] = useState<MoodValue | "">("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [stickers, setStickers] = useState<PlacedSticker[]>([])
  const [canvasData, setCanvasData] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showDraftBanner, setShowDraftBanner] = useState(false)

  // Pending files queued for new entries (uploaded after creation)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!isEditing) {
      const draft = readDraft()
      if (draft && (draft.title || draft.body)) setShowDraftBanner(true)
    }
  }, [isEditing])

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setBody(existing.body)
      setMood(existing.mood)
      setIsFavorite(existing.is_favorite)
      setTagIds(existing.tags.map((t: { id: string }) => t.id))
      setStickers(existing.stickers ?? [])
      setCanvasData(existing.canvas_data ?? "")
    }
  }, [existing])

  useEffect(() => {
    if (isEditing) return
    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      saveDraft({ title, body, mood })
    }, 1000)
    return () => clearTimeout(autosaveTimer.current)
  }, [title, body, mood, isEditing])

  const restoreDraft = () => {
    const draft = readDraft()
    if (!draft) return
    setTitle(draft.title)
    setBody(draft.body)
    setMood(draft.mood)
    setShowDraftBanner(false)
    toast("Draft restored", "info")
  }

  const discardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
    toast("Draft discarded", "info")
  }

  // Upload files for an existing entry immediately
  const handleFilesForEdit = async (files: File[]) => {
    setUploadingFiles(true)
    for (const file of files) {
      try {
        await uploadAttachment.mutateAsync(file)
      } catch {
        toast(`Failed to upload ${file.name}`, "error")
      }
    }
    setUploadingFiles(false)
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    setDeletingIds((prev) => new Set(prev).add(attachmentId))
    try {
      await deleteAttachment.mutateAsync(attachmentId)
    } catch {
      toast("Failed to remove attachment", "error")
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(attachmentId)
        return next
      })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required."); return }
    if (!body.trim()) { setError("Body is required."); return }
    setError(null)

    const payload = {
      title,
      body,
      mood: (mood || "") as MoodValue | "",
      is_favorite: isFavorite,
      tag_ids: tagIds,
      stickers,
      canvas_data: canvasData,
    }

    try {
      if (isEditing) {
        await updateEntry.mutateAsync({ id: id!, ...payload })
        toast("Entry saved", "success")
        navigate(`/entries/${id}`, { replace: true })
      } else {
        const res = await createEntry.mutateAsync(payload)
        const newId = res.data.id

        // Upload any queued files after entry is created
        if (pendingFiles.length > 0) {
          setUploadingFiles(true)
          // Hook is bound to "" (no id yet); call the API directly with the real newId
          const { attachmentsApi } = await import("@/api/endpoints")
          for (const file of pendingFiles) {
            try {
              await attachmentsApi.upload(newId, file)
            } catch {
              toast(`Failed to upload ${file.name}`, "error")
            }
          }
          setUploadingFiles(false)
        }

        clearDraft()
        toast("Entry created", "success")
        navigate(`/entries/${newId}`, { replace: true })
      }
    } catch {
      const msg = "Failed to save entry. Please try again."
      setError(msg)
      toast(msg, "error")
    }
  }

  if (isEditing && isLoading) {
    return (
      <Layout sidebar={<AppSidebar />}>
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      </Layout>
    )
  }

  const isPending = createEntry.isPending || updateEntry.isPending || uploadingFiles
  const { words, readingTime } = getWordStats(body)
  const existingAttachments: Attachment[] = existing?.attachments ?? []

  return (
    <Layout sidebar={<AppSidebar />}>
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link
            to={isEditing ? `/entries/${id}` : "/"}
            className="text-sm hover:underline"
            style={{ color: "var(--j-accent)" }}
          >
            ← {isEditing ? "Back to entry" : "Back"}
          </Link>
          <h1 className="text-xl font-bold flex-1" style={{ color: "var(--j-text-primary)" }}>
            {isEditing ? "Edit entry" : "New entry"}
          </h1>
          {!isEditing && (
            <TemplatePicker currentBody={body} onSelect={setBody} />
          )}
        </div>

        {/* Draft restore banner */}
        {showDraftBanner && (
          <div
            className="flex items-center justify-between rounded-lg border px-4 py-3 mb-4 text-sm"
            style={{
              backgroundColor: "var(--j-bg-elevated)",
              borderColor: "var(--j-accent)",
              color: "var(--j-text-secondary)",
            }}
          >
            <span>You have an unsaved draft. Restore it?</span>
            <div className="flex gap-3 ml-4">
              <button
                type="button"
                onClick={restoreDraft}
                className="font-medium hover:underline"
                style={{ color: "var(--j-accent)" }}
              >
                Restore
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="hover:underline"
                style={{ color: "var(--j-text-muted)" }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input
              id="title"
              type="text"
              required
              className="input text-lg font-medium"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Mood */}
          <div>
            <label className="label">Mood</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMood("")}
                className="px-3 py-1 rounded-full text-sm border transition-colors"
                style={
                  mood === ""
                    ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)", borderColor: "var(--j-accent)" }
                    : { backgroundColor: "var(--j-bg-surface)", color: "var(--j-text-secondary)", borderColor: "var(--j-border)" }
                }
              >
                None
              </button>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                  className="px-3 py-1 rounded-full text-sm border transition-colors"
                  style={
                    mood === m.value
                      ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)", borderColor: "var(--j-accent)" }
                      : { backgroundColor: "var(--j-bg-surface)", color: "var(--j-text-secondary)", borderColor: "var(--j-border)" }
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <TagSelector selectedIds={tagIds} onChange={setTagIds} />
          </div>

          {/* Content + word count */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Content</label>
              {body.trim() && (
                <span className="text-xs" style={{ color: "var(--j-text-muted)" }}>
                  {words} {words === 1 ? "word" : "words"} · ~{readingTime} min read
                </span>
              )}
            </div>
            <MarkdownEditor value={body} onChange={setBody} minHeight={350} />
          </div>

          {/* Canvas (drawing + stickers) */}
          <div>
            <label className="label mb-2">Canvas</label>
            <DrawingCanvas
              value={canvasData}
              onChange={setCanvasData}
              stickers={stickers}
              onStickersChange={setStickers}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="label">Images</label>

            {/* Existing attachments in edit mode */}
            {isEditing && existingAttachments.length > 0 && (
              <div className="mb-3">
                <AttachmentGallery
                  attachments={existingAttachments}
                  editMode
                  onDelete={handleDeleteAttachment}
                  deletingIds={deletingIds}
                />
              </div>
            )}

            {/* Upload zone */}
            {(!isEditing || existingAttachments.length < 10) && (
              <AttachmentUpload
                onFiles={isEditing ? handleFilesForEdit : (files) => setPendingFiles((prev) => [...prev, ...files])}
                uploading={uploadingFiles}
                disabled={isPending}
              />
            )}

            {/* Thumbnail previews for pending files (new entries) */}
            {!isEditing && pendingFiles.length > 0 && (
              <div
                className="mt-3 grid gap-2"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
              >
                {pendingFiles.map((f, i) => {
                  const objectUrl = URL.createObjectURL(f)
                  return (
                    <div
                      key={i}
                      className="relative rounded-lg overflow-hidden border aspect-square"
                      style={{ borderColor: "var(--j-border)" }}
                    >
                      <img
                        src={objectUrl}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(objectUrl)}
                      />
                      <button
                        type="button"
                        onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                        style={{ backgroundColor: "rgba(239,68,68,0.9)" }}
                        aria-label={`Remove ${f.name}`}
                      >
                        ×
                      </button>
                      <span
                        className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-xs truncate"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}
                      >
                        {f.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Favorite */}
          <div className="flex items-center gap-2">
            <input
              id="favorite"
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded focus:ring-2"
              style={{ accentColor: "var(--j-accent)" }}
            />
            <label
              htmlFor="favorite"
              className="text-sm cursor-pointer"
              style={{ color: "var(--j-text-secondary)" }}
            >
              Mark as favorite ★
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create entry"}
            </button>
            <Link to={isEditing ? `/entries/${id}` : "/"} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}
