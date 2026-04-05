import { useState } from "react"
import { STICKER_PACKS } from "./stickerPacks"

interface Props {
  onPick: (emoji: string) => void
  onClose: () => void
}

export function StickerPicker({ onPick, onClose }: Props) {
  const [activePackId, setActivePackId] = useState(STICKER_PACKS[0].id)
  const activePack = STICKER_PACKS.find((p) => p.id === activePackId) ?? STICKER_PACKS[0]

  return (
    <div
      className="rounded-xl border shadow-xl overflow-hidden"
      style={{
        backgroundColor: "var(--j-bg-elevated)",
        borderColor: "var(--j-border)",
        width: 300,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--j-border)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--j-text-muted)" }}>
          Pick a sticker
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-sm transition-colors"
          style={{ color: "var(--j-text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-primary)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-muted)" }}
        >
          ✕
        </button>
      </div>

      {/* Pack tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: "var(--j-border)", backgroundColor: "var(--j-bg-surface)" }}
      >
        {STICKER_PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setActivePackId(pack.id)}
            title={pack.name}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-xs transition-colors border-b-2"
            style={
              activePackId === pack.id
                ? {
                    borderColor: "var(--j-accent)",
                    color: "var(--j-text-primary)",
                    backgroundColor: "var(--j-bg-elevated)",
                  }
                : {
                    borderColor: "transparent",
                    color: "var(--j-text-muted)",
                  }
            }
          >
            <span className="text-base">{pack.icon}</span>
            <span className="font-medium" style={{ fontSize: 10 }}>{pack.name}</span>
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="p-2 grid grid-cols-5 gap-1">
        {activePack.stickers.map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(emoji)}
            className="flex items-center justify-center rounded-lg transition-all"
            style={{ height: 48, fontSize: 24 }}
            title={emoji}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = "var(--j-bg-surface)"
              el.style.transform = "scale(1.15)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = "transparent"
              el.style.transform = "scale(1)"
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div
        className="px-3 py-1.5 border-t text-center"
        style={{ borderColor: "var(--j-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
          Click a sticker to place it on the canvas
        </p>
      </div>
    </div>
  )
}
