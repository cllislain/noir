import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/endpoints"
import { useToast } from "@/toast/ToastContext"

const TIMEOUT_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
]

export function AdminSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminApi.getSettings().then((r) => r.data),
  })

  const [timeout, setTimeout_] = useState<number>(15)

  useEffect(() => {
    if (settings) setTimeout_(settings.default_inactivity_timeout)
  }, [settings])

  const save = useMutation({
    mutationFn: (value: number) =>
      adminApi.updateSettings({ default_inactivity_timeout: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] })
      toast("Settings saved", "success")
    },
    onError: () => toast("Failed to save settings", "error"),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>Site Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>
          Global configuration for all users
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm" style={{ color: "var(--j-text-muted)" }}>Loading…</div>
      ) : (
        <div className="space-y-4">
          {/* Auth rate limit — read-only info */}
          <div
            className="rounded-xl border p-5 space-y-1"
            style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--j-text-primary)" }}>
              Auth rate limit
            </h2>
            <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
              Configured via the <code className="font-mono">AUTH_THROTTLE_RATE</code> environment variable.
              Changing it requires a server restart.
            </p>
            <div
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono"
              style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-secondary)" }}
            >
              <span>🔒</span>
              <span>{settings?.auth_throttle_rate ?? "10/hour"}</span>
            </div>
          </div>

          {/* Default inactivity timeout */}
          <div
            className="rounded-xl border p-5 space-y-4"
            style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
          >
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--j-text-primary)" }}>
                Default auto-lock timeout
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--j-text-muted)" }}>
                Applied to new users. Existing users can override this in their account settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TIMEOUT_OPTIONS.map((opt) => {
                const active = timeout === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTimeout_(opt.value)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                    style={
                      active
                        ? {
                            backgroundColor: "var(--j-accent)",
                            color: "var(--j-accent-text)",
                            borderColor: "var(--j-accent)",
                          }
                        : {
                            backgroundColor: "var(--j-bg-elevated)",
                            color: "var(--j-text-secondary)",
                            borderColor: "var(--j-border)",
                          }
                    }
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => save.mutate(timeout)}
              disabled={save.isPending || timeout === settings?.default_inactivity_timeout}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }}
              onMouseEnter={(e) => { if (!save.isPending) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-accent-hover)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-accent)" }}
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
