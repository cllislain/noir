import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/auth/useAuth"
import { accountApi } from "@/api/endpoints"
import { useToast } from "@/toast/ToastContext"
import { getInactivityTimeout, setInactivityTimeout } from "@/hooks/useInactivityLock"

function mediaPath(url: string | null): string | null {
  if (!url) return null
  try { return new URL(url).pathname } catch { return url }
}

const LOCK_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
]

export function AccountPage() {
  const { user, logout, updateUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Profile
  const [displayName, setDisplayName] = useState(user?.display_name ?? "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(mediaPath(user?.avatar ?? null))
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Password
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [savingPw, setSavingPw] = useState(false)

  // Lock
  const [lockTimeout, setLockTimeoutState] = useState(getInactivityTimeout)

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Export
  const [exporting, setExporting] = useState(false)

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const form = new FormData()
      form.append("display_name", displayName)
      if (avatarFile) form.append("avatar", avatarFile)
      const res = await accountApi.updateProfile(form)
      updateUser(res.data)
      setAvatarFile(null)
      toast("Profile saved", "success")
    } catch {
      toast("Failed to save profile", "error")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { toast("New passwords do not match", "error"); return }
    setSavingPw(true)
    try {
      await accountApi.changePassword({ current_password: currentPw, new_password: newPw, new_password_confirm: confirmPw })
      setCurrentPw(""); setNewPw(""); setConfirmPw("")
      toast("Password changed", "success")
    } catch {
      toast("Failed to change password. Check your current password.", "error")
    } finally {
      setSavingPw(false)
    }
  }

  function handleLockChange(value: number) {
    setLockTimeoutState(value)
    setInactivityTimeout(value)
    toast(value === 0 ? "Auto-lock disabled" : `Auto-lock set to ${value} minutes`, "info")
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await accountApi.exportEntries()
      const blob = new Blob([res.data as BlobPart], { type: "application/zip" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = "journal-export.zip"; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast("Export failed", "error")
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteEmail.trim().toLowerCase() !== user?.email.toLowerCase()) {
      toast("Email doesn't match", "error"); return
    }
    setDeletingAccount(true)
    try {
      await accountApi.deleteAccount(deleteEmail)
      await logout()
      navigate("/register", { replace: true })
      toast("Account deleted", "info")
    } catch {
      toast("Failed to delete account", "error")
      setDeletingAccount(false)
    }
  }

  return (
    <Layout sidebar={<AppSidebar />}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>Account</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>
          Manage your profile and security settings
        </p>
      </div>

      {/* Two-column grid on md+, single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Profile */}
          <section
            className="card p-5 space-y-4"
            style={{ backgroundColor: "var(--j-bg-surface)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--j-text-primary)" }}>Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar + display name */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0 transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--j-accent)" }}
                  title="Click to change avatar"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-accent)" }}
                    >
                      {(user?.display_name || user?.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs">✏️</span>
                  </div>
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <div className="flex-1">
                  <label className="label">Display name</label>
                  <input
                    type="text"
                    className="input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={100}
                    placeholder={user?.username ?? ""}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>
                    Shown instead of your username
                  </p>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </form>
          </section>

          {/* Change Password */}
          <section
            className="card p-5 space-y-4"
            style={{ backgroundColor: "var(--j-bg-surface)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--j-text-primary)" }}>Change password</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="label">Current password</label>
                <input type="password" className="input" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
              </div>
              <div>
                <label className="label">New password</label>
                <input type="password" className="input" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input type="password" className="input" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={savingPw}>
                {savingPw ? "Changing…" : "Change password"}
              </button>
            </form>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Auto-lock */}
          <section
            className="card p-5 space-y-4"
            style={{ backgroundColor: "var(--j-bg-surface)" }}
          >
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--j-text-primary)" }}>Auto-lock</h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>
                Lock your session after a period of inactivity.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleLockChange(opt.value)}
                  className="px-4 py-1.5 rounded-full text-sm border transition-colors"
                  style={
                    lockTimeout === opt.value
                      ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)", borderColor: "var(--j-accent)" }
                      : { backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-secondary)", borderColor: "var(--j-border)" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Export */}
          <section
            className="card p-5 space-y-3"
            style={{ backgroundColor: "var(--j-bg-surface)" }}
          >
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--j-text-primary)" }}>Export data</h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>
                Download all your entries as a ZIP of Markdown files.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={handleExport} disabled={exporting}>
              {exporting ? "Preparing…" : "⬇ Download entries as ZIP"}
            </button>
          </section>

          {/* Danger zone */}
          <section
            className="card p-5 space-y-3 border-2"
            style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "rgba(239,68,68,0.4)" }}
          >
            <h2 className="text-base font-semibold text-red-500">Danger zone</h2>
            <p className="text-sm" style={{ color: "var(--j-text-muted)" }}>
              Permanently delete your account and all your entries. This cannot be undone.
            </p>
            <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)}>
              Delete my account
            </button>
          </section>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 space-y-4"
            style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "rgba(239,68,68,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-red-500">Delete account</h3>
            <p className="text-sm" style={{ color: "var(--j-text-secondary)" }}>
              This will permanently delete your account and all data. Type your email to confirm:
            </p>
            <input
              type="email"
              className="input"
              placeholder={user?.email}
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
            />
            <div className="flex gap-3">
              <button type="button" className="btn-danger flex-1" onClick={handleDeleteAccount} disabled={deletingAccount}>
                {deletingAccount ? "Deleting…" : "Delete forever"}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
