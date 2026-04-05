import { useState, useRef, useEffect } from "react"
import { useTags, useUpdateTag, useDeleteTag } from "./useTags"
import { ColorPicker } from "./ColorPicker"
import type { Tag } from "@/types"

interface TagManagePanelProps {
  open: boolean
  onClose: () => void
}

interface TagRowProps {
  tag: Tag
}

function TagRow({ tag }: TagRowProps) {
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(tag.name)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [nameError, setNameError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName) inputRef.current?.focus()
  }, [editingName])

  const commitRename = async () => {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === tag.name) {
      setNameValue(tag.name)
      setEditingName(false)
      setNameError("")
      return
    }
    try {
      await updateTag.mutateAsync({ id: tag.id, name: trimmed })
      setEditingName(false)
      setNameError("")
    } catch {
      setNameError("Name already exists")
    }
  }

  const handleColorChange = async (color: string) => {
    setShowColorPicker(false)
    await updateTag.mutateAsync({ id: tag.id, color })
  }

  const handleDelete = async () => {
    await deleteTag.mutateAsync(tag.id)
    setConfirmDelete(false)
  }

  return (
    <div
      className="relative rounded-lg px-3 py-2 space-y-1"
      style={{ backgroundColor: "var(--j-bg-elevated)" }}
    >
      <div className="flex items-center gap-2">
        {/* Color dot — click to open color picker */}
        <button
          type="button"
          title="Change color"
          onClick={() => setShowColorPicker((v) => !v)}
          className="w-4 h-4 rounded-full flex-shrink-0 hover:scale-110 transition-transform"
          style={{ backgroundColor: tag.color }}
          aria-label="Change tag color"
        />

        {/* Tag name */}
        {editingName ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitRename() }
              if (e.key === "Escape") { setNameValue(tag.name); setEditingName(false); setNameError("") }
            }}
            className="flex-1 text-sm bg-transparent border-b outline-none"
            style={{ borderColor: "var(--j-accent)", color: "var(--j-text-primary)" }}
          />
        ) : (
          <button
            type="button"
            title="Click to rename"
            onClick={() => setEditingName(true)}
            className="flex-1 text-sm text-left hover:underline"
            style={{ color: "var(--j-text-primary)" }}
          >
            {tag.name}
          </button>
        )}

        {/* Usage count badge */}
        {tag.entry_count !== undefined && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: "var(--j-bg-surface)",
              color: "var(--j-text-muted)",
            }}
          >
            {tag.entry_count}
          </span>
        )}

        {/* Delete button */}
        {confirmDelete ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteTag.isPending}
              className="text-xs px-1.5 py-0.5 rounded text-white transition-colors"
              style={{ backgroundColor: "#ef4444" }}
            >
              {deleteTag.isPending ? "…" : "Yes"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-1.5 py-0.5 rounded border"
              style={{ borderColor: "var(--j-border)", color: "var(--j-text-muted)" }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            title="Delete tag"
            onClick={() => setConfirmDelete(true)}
            className="flex-shrink-0 text-base leading-none opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: "var(--j-text-muted)" }}
            aria-label={`Delete tag ${tag.name}`}
          >
            ×
          </button>
        )}
      </div>

      {nameError && (
        <p className="text-xs" style={{ color: "#ef4444" }}>{nameError}</p>
      )}

      {confirmDelete && (
        <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
          Remove from {tag.entry_count ?? 0} {tag.entry_count === 1 ? "entry" : "entries"}?
        </p>
      )}

      {showColorPicker && (
        <div
          className="rounded-lg border mt-1"
          style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
        >
          <ColorPicker value={tag.color} onChange={handleColorChange} />
        </div>
      )}
    </div>
  )
}

export function TagManagePanel({ open, onClose }: TagManagePanelProps) {
  const { data: tags = [] } = useTags()
  const [search, setSearch] = useState("")

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-xl shadow-2xl flex flex-col max-h-[80vh]"
        style={{ backgroundColor: "var(--j-bg-surface)", border: "1px solid var(--j-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="font-semibold text-sm" style={{ color: "var(--j-text-primary)" }}>
            Manage Tags
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--j-text-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search */}
        {tags.length > 5 && (
          <div className="px-4 pb-3">
            <input
              type="text"
              placeholder="Search tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border bg-transparent outline-none"
              style={{
                borderColor: "var(--j-border)",
                color: "var(--j-text-primary)",
                backgroundColor: "var(--j-bg-elevated)",
              }}
            />
          </div>
        )}

        {/* Tag list */}
        <div className="overflow-y-auto px-4 pb-4 space-y-1.5 flex-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--j-text-muted)" }}>
              {search ? `No tags matching "${search}"` : "No tags yet"}
            </p>
          ) : (
            filtered.map((tag) => <TagRow key={tag.id} tag={tag} />)
          )}
        </div>
      </div>
    </div>
  )
}
