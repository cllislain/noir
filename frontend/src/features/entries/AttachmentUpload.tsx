import { useRef, useState } from "react"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

interface AttachmentUploadProps {
  onFiles: (files: File[]) => void
  uploading?: boolean
  disabled?: boolean
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return `${file.name}: unsupported type (JPEG, PNG, WebP, GIF only)`
  if (file.size > MAX_SIZE) return `${file.name}: exceeds 5 MB limit`
  return null
}

export function AttachmentUpload({ onFiles, uploading = false, disabled = false }: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const processFiles = (rawFiles: FileList | null) => {
    if (!rawFiles) return
    const valid: File[] = []
    const errs: string[] = []
    Array.from(rawFiles).forEach((f) => {
      const err = validateFile(f)
      if (err) errs.push(err)
      else valid.push(f)
    })
    setErrors(errs)
    if (valid.length > 0) onFiles(valid)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (!disabled) processFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        className="border-2 border-dashed rounded-lg px-4 py-5 text-center text-sm cursor-pointer transition-colors select-none"
        style={{
          borderColor: dragOver ? "var(--j-accent)" : "var(--j-border)",
          backgroundColor: dragOver ? "var(--j-bg-elevated)" : "transparent",
          color: "var(--j-text-muted)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
          disabled={disabled}
        />
        {uploading ? (
          <span>Uploading…</span>
        ) : (
          <>
            <span style={{ color: "var(--j-accent)" }}>Click to upload</span>
            {" "}or drag & drop
            <br />
            <span className="text-xs">JPEG, PNG, WebP, GIF · max 5 MB each</span>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="space-y-0.5">
          {errors.map((e, i) => (
            <li key={i} className="text-xs" style={{ color: "#ef4444" }}>
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
