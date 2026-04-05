import { useState } from "react";
import {
  useAdminUsers,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminSetPassword,
  useToggleUser,
  useAdminDeleteUser,
} from "@/features/admin/useAdmin";
import {
  AdminModal,
  FormField,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
  inputStyle,
} from "@/components/AdminModal";
import { useToast } from "@/toast/ToastContext";
import type { AdminUser } from "@/types";

// ── Badge ─────────────────────────────────────────────────────────────────

function Badge({ on, labelOn, labelOff }: { on: boolean; labelOn: string; labelOff: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: on ? "var(--j-accent)" : "var(--j-bg-elevated)",
        color: on ? "var(--j-accent-text)" : "var(--j-text-muted)",
      }}
    >
      {on ? labelOn : labelOff}
    </span>
  );
}

// ── Create / Edit modal ───────────────────────────────────────────────────

function UserFormModal({ user, onClose }: { user?: AdminUser; onClose: () => void }) {
  const isEdit = !!user;
  const { toast } = useToast();
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();

  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [isStaff, setIsStaff] = useState(user?.is_staff ?? false);
  const [isSuperuser, setIsSuperuser] = useState(user?.is_superuser ?? false);

  const isPending = createUser.isPending || updateUser.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      updateUser.mutate(
        { id: user!.id, email, username, is_active: isActive, is_staff: isStaff, is_superuser: isSuperuser },
        {
          onSuccess: () => { toast("User updated.", "success"); onClose(); },
          onError: () => toast("Failed to update user.", "error"),
        }
      );
    } else {
      createUser.mutate(
        { email, username, password, is_active: isActive, is_staff: isStaff, is_superuser: isSuperuser },
        {
          onSuccess: () => { toast("User created.", "success"); onClose(); },
          onError: (e: unknown) => {
            const data = (e as { response?: { data?: Record<string, string[]> } })?.response?.data;
            toast(data ? Object.values(data).flat().join(" ") : "Failed to create user.", "error");
          },
        }
      );
    }
  }

  return (
    <AdminModal title={isEdit ? "Edit User" : "New User"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField label="Email">
          <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Username">
          <input style={inputStyle} type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormField>
        {!isEdit && (
          <FormField label="Password" hint="Minimum 8 characters.">
            <input
              style={inputStyle}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        )}
        <div className="flex flex-col gap-2 mb-4">
          {(
            [
              { label: "Active", value: isActive, set: setIsActive },
              { label: "Staff", value: isStaff, set: setIsStaff },
              { label: "Superuser", value: isSuperuser, set: setIsSuperuser },
            ] as const
          ).map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--j-text-secondary)" }}>
              <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--j-accent)" }} />
              {label}
            </label>
          ))}
        </div>
        <ModalActions>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary disabled={isPending}>{isPending ? "Saving…" : isEdit ? "Save Changes" : "Create User"}</BtnPrimary>
        </ModalActions>
      </form>
    </AdminModal>
  );
}

// ── Set password modal ────────────────────────────────────────────────────

function SetPasswordModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const { toast } = useToast();
  const setPassword = useAdminSetPassword();
  const [password, setPass] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPassword.mutate(
      { id: user.id, password },
      {
        onSuccess: () => { toast("Password updated.", "success"); onClose(); },
        onError: () => toast("Failed to set password.", "error"),
      }
    );
  }

  return (
    <AdminModal title={`Set Password — ${user.email}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField label="New Password" hint="Minimum 8 characters.">
          <input style={inputStyle} type="password" required minLength={8} value={password} onChange={(e) => setPass(e.target.value)} autoFocus />
        </FormField>
        <ModalActions>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary disabled={setPassword.isPending}>{setPassword.isPending ? "Saving…" : "Set Password"}</BtnPrimary>
        </ModalActions>
      </form>
    </AdminModal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    | { type: "create" }
    | { type: "edit"; user: AdminUser }
    | { type: "password"; user: AdminUser }
    | null
  >(null);

  const { data, isLoading } = useAdminUsers({ search: search || undefined, page });
  const toggleUser = useToggleUser();
  const deleteUser = useAdminDeleteUser();
  const { toast } = useToast();

  function handleToggle(id: string, field: "is_active" | "is_staff", val: boolean) {
    toggleUser.mutate({ id, [field]: val }, {
      onSuccess: () => toast("User updated.", "success"),
      onError: () => toast("Failed to update user.", "error"),
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this user and all their data?")) return;
    deleteUser.mutate(id, {
      onSuccess: () => toast("User deleted.", "success"),
      onError: (e: unknown) => {
        const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to delete user.";
        toast(msg, "error");
      },
    });
  }

  const thClass = "px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>{data?.count ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="input w-52"
            placeholder="Search by email or username…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="btn-primary text-sm px-4 py-2 whitespace-nowrap" onClick={() => setModal({ type: "create" })}>
            + New User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-muted)" }}>
              <th className={thClass}>User</th>
              <th className={`${thClass} text-right`}>Entries</th>
              <th className={thClass}>Active</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Joined</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>Loading…</td>
              </tr>
            )}
            {!isLoading && data?.results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>No users found.</td>
              </tr>
            )}
            {data?.results.map((user) => (
              <tr key={user.id} className="border-b text-sm transition-colors" style={{ borderColor: "var(--j-border)" }}>
                <td className="px-4 py-3" style={{ color: "var(--j-text-primary)" }}>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs" style={{ color: "var(--j-text-muted)" }}>@{user.username}</div>
                  {user.is_superuser && <span className="text-xs font-semibold" style={{ color: "var(--j-accent)" }}>Superuser</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--j-text-secondary)" }}>{user.entry_count}</td>
                <td className="px-4 py-3">
                  <button disabled={user.is_superuser} onClick={() => handleToggle(user.id, "is_active", !user.is_active)}>
                    <Badge on={user.is_active} labelOn="Active" labelOff="Inactive" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button disabled={user.is_superuser} onClick={() => handleToggle(user.id, "is_staff", !user.is_staff)}>
                    <Badge on={user.is_staff} labelOn="Staff" labelOff="User" />
                  </button>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--j-text-muted)" }}>
                  {new Date(user.date_joined).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModal({ type: "edit", user })}
                      className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                      style={{ borderColor: "var(--j-border)", color: "var(--j-text-secondary)", backgroundColor: "var(--j-bg-elevated)" }}
                    >
                      Edit
                    </button>
                    {!user.is_superuser && (
                      <>
                        <button
                          onClick={() => setModal({ type: "password", user })}
                          className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                          style={{ borderColor: "var(--j-border)", color: "var(--j-text-secondary)", backgroundColor: "var(--j-bg-elevated)" }}
                        >
                          Password
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                          style={{ color: "#dc2626", backgroundColor: "#fee2e2" }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(data?.previous || data?.next) && (
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary text-xs" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <button className="btn-secondary text-xs" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {/* Modals */}
      {modal?.type === "create" && <UserFormModal onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <UserFormModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === "password" && <SetPasswordModal user={modal.user} onClose={() => setModal(null)} />}
    </div>
  );
}
