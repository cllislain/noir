import { useState, useEffect } from "react"
import { format } from "date-fns"

export function RealtimeClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="px-1 space-y-0.5">
      <p
        className="text-2xl font-bold tabular-nums tracking-widest"
        style={{ color: "var(--j-text-primary)", fontVariantNumeric: "tabular-nums" }}
      >
        {format(now, "HH:mm:ss")}
      </p>
      <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
        {format(now, "EEEE, MMMM d yyyy")}
      </p>
    </div>
  )
}
