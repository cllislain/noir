import { useRef, useState, useEffect, useCallback } from "react"
import { ReactSketchCanvas, type ReactSketchCanvasRef, type CanvasPath } from "react-sketch-canvas"
import { useTheme } from "@/theme/ThemeContext"
import { StickerPicker } from "@/features/stickers/StickerPicker"
import { StickerOverlay } from "@/features/stickers/StickerOverlay"
import type { PlacedSticker } from "@/types"

// ── Canvas data serialization ──────────────────────────────────────────────
// canvas_data is stored as JSON: { svg: string, paths: CanvasPath[] }
// This allows restoring the drawing when editing.
// Legacy entries that stored a raw SVG string are handled gracefully.

export interface CanvasPayload {
  svg: string
  paths: CanvasPath[]
}

export function parseCanvasData(raw: string): CanvasPayload | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as CanvasPayload
    if (parsed && typeof parsed.svg === "string") return parsed
  } catch { /* fall through to legacy */ }
  // Legacy: raw SVG string (no paths to restore)
  return { svg: raw, paths: [] }
}

function serializeCanvasData(svg: string, paths: CanvasPath[]): string {
  return JSON.stringify({ svg, paths })
}

/**
 * react-sketch-canvas exports <svg width="100%" ...> when width prop is "100%".
 * Without a viewBox the coordinate system uses the SVG's intrinsic 0,0 origin
 * and doesn't rescale — paths appear shifted/clipped in differently-sized containers.
 * We measure the actual container pixel width and inject a viewBox.
 */
function makeFluidSvg(svgStr: string, containerWidth: number, canvasHeight: number): string {
  return svgStr.replace(/<svg([^>]*)>/, (_match, attrs: string) => {
    let a = attrs
    // Remove fixed width/height and add viewBox using measured dimensions
    a = a.replace(/\s*width="[^"]*"/, "")
    a = a.replace(/\s*height="[^"]*"/, "")
    if (!a.includes("viewBox")) {
      a = ` viewBox="0 0 ${containerWidth} ${canvasHeight}"` + a
    }
    a = ` width="100%" height="auto"` + a
    return `<svg${a}>`
  })
}

// ── Constants ──────────────────────────────────────────────────────────────

const CANVAS_HEIGHT = 320
const DARK_THEME_IDS = new Set(["dark", "kuromi", "badtzbadtzmaru", "noir"])
const BRUSH_COLORS = [
  "#f0f0f0", "#c8f135", "#818cf8", "#c026d3",
  "#3b82f6", "#4ade80", "#fb923c", "#f43f5e",
  "#000000", "#ffffff",
]

type DrawTool = "pen" | "eraser"

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (serialized: string) => void
  stickers: PlacedSticker[]
  onStickersChange: (stickers: PlacedSticker[]) => void
}

export function DrawingCanvas({ value, onChange, stickers, onStickersChange }: Props) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const exportTimer = useRef<ReturnType<typeof setTimeout>>()

  const { themeId } = useTheme()
  const isDark = DARK_THEME_IDS.has(themeId)

  const [drawTool, setDrawTool] = useState<DrawTool>("pen")
  const [color, setColor] = useState(isDark ? "#f0f0f0" : "#111827")
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [mode, setMode] = useState<"draw" | "sticker">("draw")
  const [showPicker, setShowPicker] = useState(false)

  // Restore existing paths once — when value first arrives from the server.
  // We can't use [] (mount-only) because the parent loads data async, so value
  // is "" on first render and only becomes non-empty after the fetch completes.
  const hasRestoredRef = useRef(false)
  useEffect(() => {
    if (hasRestoredRef.current || !value || !canvasRef.current) return
    const data = parseCanvasData(value)
    if (data && data.paths.length > 0) {
      canvasRef.current.loadPaths(data.paths)
      hasRestoredRef.current = true
    }
  }, [value])

  // Auto-export whenever paths change (debounced 600 ms)
  const scheduleExport = useCallback(
    (paths: CanvasPath[]) => {
      clearTimeout(exportTimer.current)
      exportTimer.current = setTimeout(async () => {
        if (!canvasRef.current || !containerRef.current) return
        if (paths.length === 0) {
          onChange("")
          return
        }
        try {
          const raw = await canvasRef.current.exportSvg()
          const w = containerRef.current.clientWidth || 600
          const svg = makeFluidSvg(raw, w, CANVAS_HEIGHT)
          onChange(serializeCanvasData(svg, paths))
        } catch { /* ignore */ }
      }, 600)
    },
    [onChange]
  )

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
    onChange("")
  }

  const handleAddSticker = (emoji: string) => {
    const sticker: PlacedSticker = {
      id: crypto.randomUUID(),
      emoji,
      x: 10 + Math.random() * 60,
      y: 10 + Math.random() * 60,
      size: 52,
    }
    onStickersChange([...stickers, sticker])
    setShowPicker(false)
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--j-bg-elevated)", borderColor: "var(--j-border)" }}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-2.5 py-2 border-b relative"
        style={{ borderColor: "var(--j-border)" }}
      >
        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--j-border)" }}>
          <button
            type="button"
            onClick={() => { setMode("draw"); setShowPicker(false) }}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={
              mode === "draw"
                ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }
                : { backgroundColor: "var(--j-bg-surface)", color: "var(--j-text-secondary)" }
            }
          >
            ✏️ Draw
          </button>
          <button
            type="button"
            onClick={() => setMode("sticker")}
            className="px-3 py-1.5 text-xs font-medium transition-colors relative"
            style={
              mode === "sticker"
                ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }
                : { backgroundColor: "var(--j-bg-surface)", color: "var(--j-text-secondary)" }
            }
          >
            🌟 Stickers
            {stickers.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                style={{
                  fontSize: 9,
                  backgroundColor: "var(--j-accent)",
                  color: "var(--j-accent-text)",
                  outline: "2px solid var(--j-bg-elevated)",
                }}
              >
                {stickers.length}
              </span>
            )}
          </button>
        </div>

        {/* Draw-mode controls */}
        {mode === "draw" && (
          <>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--j-border)" }}>
              {(["pen", "eraser"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDrawTool(t)}
                  className="px-2.5 py-1.5 text-xs transition-colors"
                  style={
                    drawTool === t
                      ? { backgroundColor: "var(--j-bg-surface)", color: "var(--j-text-primary)", fontWeight: 600 }
                      : { backgroundColor: "transparent", color: "var(--j-text-muted)" }
                  }
                >
                  {t === "pen" ? "Pen" : "Eraser"}
                </button>
              ))}
            </div>

            <div className="flex gap-1 flex-wrap">
              {BRUSH_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setColor(c); setDrawTool("pen") }}
                  className="w-5 h-5 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c && drawTool === "pen" ? "var(--j-accent)" : "var(--j-border)",
                    transform: color === c && drawTool === "pen" ? "scale(1.3)" : "scale(1)",
                  }}
                  title={c}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: "var(--j-text-muted)" }}>Size</span>
              <input
                type="range" min={1} max={24} value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-20" style={{ accentColor: "var(--j-accent)" }}
              />
              <span className="text-xs tabular-nums w-4" style={{ color: "var(--j-text-muted)" }}>
                {strokeWidth}
              </span>
            </div>

            <div className="flex gap-1 ml-auto">
              <button type="button" onClick={() => canvasRef.current?.undo()} className="btn-secondary text-xs py-1 px-2">Undo</button>
              <button type="button" onClick={handleClear} className="btn-secondary text-xs py-1 px-2">Clear</button>
            </div>
          </>
        )}

        {/* Sticker-mode controls */}
        {mode === "sticker" && (
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={
                showPicker
                  ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)", borderColor: "var(--j-accent)" }
                  : { backgroundColor: "var(--j-bg-surface)", color: "var(--j-text-secondary)", borderColor: "var(--j-border)" }
              }
            >
              ＋ Add sticker
            </button>
            {stickers.length > 0 && (
              <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
                Drag to move · corner to resize · ✕ to remove
              </p>
            )}
          </div>
        )}

        {/* Sticker picker — floating popover, doesn't shift canvas */}
        {showPicker && (
          <div className="absolute left-0 top-full mt-1 z-30">
            <StickerPicker onPick={handleAddSticker} onClose={() => setShowPicker(false)} />
          </div>
        )}
      </div>

      {/* ── Canvas + sticker overlay ── */}
      <div className="relative" ref={containerRef}>
        <div style={{ pointerEvents: mode === "sticker" ? "none" : "auto" }}>
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height={`${CANVAS_HEIGHT}px`}
            strokeColor={drawTool === "eraser" ? "transparent" : color}
            strokeWidth={drawTool === "eraser" ? strokeWidth * 4 : strokeWidth}
            eraserWidth={strokeWidth * 4}
            canvasColor={isDark ? "#0a0a0a" : "#ffffff"}
            style={{ border: "none", display: "block" }}
            withTimestamp
            onChange={scheduleExport}
          />
        </div>

        {stickers.length > 0 && (
          <StickerOverlay
            stickers={stickers}
            onChange={onStickersChange}
            readOnly={mode === "draw"}
          />
        )}

        {mode === "sticker" && stickers.length === 0 && !showPicker && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#fff" }}>
              Click "＋ Add sticker" to place stickers on the canvas
            </p>
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div
        className="px-3 py-1.5 border-t text-xs flex items-center justify-between"
        style={{ borderColor: "var(--j-border)", color: "var(--j-text-muted)" }}
      >
        <span>
          {mode === "draw"
            ? "Drawing auto-saves with your entry"
            : stickers.length > 0
              ? `${stickers.length} sticker${stickers.length !== 1 ? "s" : ""} placed`
              : "Pick a sticker to place it"}
        </span>
        {mode === "draw" && value && (
          <span className="opacity-60">Switch to Stickers to add stickers</span>
        )}
      </div>
    </div>
  )
}
