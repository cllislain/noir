export interface StickerPack {
  id: string
  name: string
  icon: string
  stickers: string[]
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "kuromi",
    name: "Kuromi",
    icon: "🖤",
    stickers: [
      "🖤", "💜", "⭐", "💀", "🐾", "🌙", "🦇", "🎸",
      "🌹", "💫", "🎃", "🕷️", "✨", "🔮", "💅", "🌑",
      "👾", "🫀", "🩸", "🌚",
    ],
  },
  {
    id: "cinnamoroll",
    name: "Cinnamoroll",
    icon: "☁️",
    stickers: [
      "☁️", "⭐", "💙", "🌸", "🎀", "🫧", "❄️", "🌊",
      "💫", "🍬", "🌟", "🫶", "🩵", "🌙", "🐰", "🌈",
      "🍭", "🫐", "🪷", "💐",
    ],
  },
  {
    id: "badtzbadtzmaru",
    name: "Bad Badtz-Maru",
    icon: "🐧",
    stickers: [
      "🐧", "⚡", "💛", "🌟", "😤", "💥", "🎯", "🔥",
      "🤜", "💢", "👊", "🏆", "🎮", "⭐", "🚀", "💣",
      "🎱", "🤘", "🦾", "👑",
    ],
  },
  {
    id: "noir",
    name: "Sergei Noir",
    icon: "🐈‍⬛",
    stickers: [
      "🐈‍⬛", "🌃", "🕯️", "🔦", "🌫️", "🃏", "♟️", "🎭",
      "🖊️", "📖", "🌒", "⌚", "🧊", "💎", "🗝️", "🪞",
      "🕰️", "📸", "🎬", "🌺",
    ],
  },
]
