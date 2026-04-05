import { useRef, useCallback } from "react"
import type { PlacedSticker } from "@/types"

interface Props {
  stickers: PlacedSticker[]
  onChange: (stickers: PlacedSticker[]) => void
  readOnly?: boolean
}

const MIN_SIZE = 24
const MAX_SIZE = 120

export function StickerOverlay({ stickers, onChange, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSticker = useCallback(
    (id: string, patch: Partial<PlacedSticker>) => {
      onChange(stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    },
    [stickers, onChange]
  )

  const removeSticker = useCallback(
    (id: string) => {
      onChange(stickers.filter((s) => s.id !== id))
    },
    [stickers, onChange]
  )

  const startDrag = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (readOnly) return
      e.preventDefault()
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const sticker = stickers.find((s) => s.id === id)
      if (!sticker) return

      const startX = e.clientX
      const startY = e.clientY
      const startPctX = sticker.x
      const startPctY = sticker.y

      const onMove = (ev: PointerEvent) => {
        const dx = ((ev.clientX - startX) / rect.width) * 100
        const dy = ((ev.clientY - startY) / rect.height) * 100
        updateSticker(id, {
          x: Math.max(0, Math.min(100, startPctX + dx)),
          y: Math.max(0, Math.min(100, startPctY + dy)),
        })
      }

      const onUp = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
      }

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    },
    [readOnly, stickers, updateSticker]
  )

  const startResize = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (readOnly) return
      e.preventDefault()
      e.stopPropagation()
      const sticker = stickers.find((s) => s.id === id)
      if (!sticker) return

      const startX = e.clientX
      const startSize = sticker.size

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startX
        const newSize = Math.min(MAX_SIZE, Math.max(MIN_SIZE, startSize + delta))
        updateSticker(id, { size: newSize })
      }

      const onUp = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
      }

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    },
    [readOnly, stickers, updateSticker]
  )

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute select-none"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            transform: "translate(-50%, -50%)",
            fontSize: sticker.size,
            lineHeight: 1,
            pointerEvents: readOnly ? "none" : "auto",
            cursor: readOnly ? "default" : "grab",
            userSelect: "none",
          }}
          onPointerDown={(e) => startDrag(e, sticker.id)}
        >
          {sticker.emoji}

          {/* Remove button — edit mode only */}
          {!readOnly && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => removeSticker(sticker.id)}
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs leading-none"
              style={{
                backgroundColor: "var(--j-bg-elevated)",
                border: "1px solid var(--j-border)",
                color: "var(--j-text-muted)",
                fontSize: "9px",
              }}
            >
              ✕
            </button>
          )}

          {/* Resize handle — edit mode only */}
          {!readOnly && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-sm cursor-se-resize"
              style={{ backgroundColor: "var(--j-accent)", opacity: 0.8 }}
              onPointerDown={(e) => startResize(e, sticker.id)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
