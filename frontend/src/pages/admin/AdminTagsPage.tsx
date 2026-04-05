import { useState, useEffect } from "react";
import {
  useAdminTags,
  useAdminCreateTag,
  useAdminUpdateTag,
  useAdminDeleteTag,
  useAdminUsers,
} from "@/features/admin/useAdmin";
import {
  AdminModal,
  FormField,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
  inputStyle,
  selectStyle,
} from "@/components/AdminModal";
import { useToast } from "@/toast/ToastContext";
import type { AdminTag } from "@/types";

// ── Tag create / edit modal ───────────────────────────────────────────────

function TagFormModal({ tag, onClose }: { tag?: AdminTag; onClose: () => void }) {
  const isEdit = !!tag;
  const { toast } = useToast();
  const createTag = useAdminCreateTag();
  const updateTag = useAdminUpdateTag();

  const { data: usersData } = useAdminUsers({ page: 1 });

  const [owner, setOwner] = useState("");
  const [name, setName] = useState(tag?.name ?? "");
  const [color, setColor] = useState(tag?.color ?? "#6b7280");

  // Default owner to first user once loaded (create mode only)
  useEffect(() => {
    if (!isEdit && !owner && usersData?.results.length) {
      setOwner(usersData.results[0].id);
    }
  }, [isEdit, owner, usersData]);

  const isPending = createTag.isPending || updateTag.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      updateTag.mutate(
        { id: tag!.id, name, color },
        {
          onSuccess: () => { toast("Tag updated.", "success"); onClose(); },
          onError: () => toast("Failed to update tag.", "error"),
        }
      );
    } else {
      createTag.mutate(
        { owner, name, color },
        {
          onSuccess: () => { toast("Tag created.", "success"); onClose(); },
          onError: (e: unknown) => {
            const data = (e as { response?: { data?: Record<string, string[]> } })?.response?.data;
            toast(data ? Object.values(data).flat().join(" ") : "Failed to create tag.", "error");
          },
        }
      );
    }
  }

  return (
    <AdminModal title={isEdit ? "Edit Tag" : "New Tag"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {isEdit ? (
          <FormField label="Owner">
            <div className="text-sm py-1.5" style={{ color: "var(--j-text-secondary)" }}>
              {tag!.owner_email} (@{tag!.owner_username})
            </div>
          </FormField>
        ) : (
          <FormField label="Owner">
            <select
              style={selectStyle}
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              {!usersData?.results.length && <option value="">Loading…</option>}
              {usersData?.results.map((u) => (
                <option key={u.id} value={u.id}>{u.email} (@{u.username})</option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Name">
          <input style={inputStyle} type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>

        <FormField label="Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
              style={{ backgroundColor: "var(--j-bg-elevated)", border: "1px solid var(--j-border)" }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#6b7280"
              pattern="^#[0-9a-fA-F]{6}$"
            />
            <span
              className="inline-block w-6 h-6 rounded-full shrink-0"
              style={{ backgroundColor: color, border: "1px solid rgba(0,0,0,0.15)" }}
            />
          </div>
        </FormField>

        <ModalActions>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary disabled={isPending}>{isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Tag"}</BtnPrimary>
        </ModalActions>
      </form>
    </AdminModal>
  );
}

// ── Tag row ───────────────────────────────────────────────────────────────

function TagRow({ tag, onEdit, onDelete }: { tag: AdminTag; onEdit: (tag: AdminTag) => void; onDelete: (id: string) => void }) {
  return (
    <tr className="border-b text-sm transition-colors" style={{ borderColor: "var(--j-border)" }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tag.color, border: "1px solid rgba(0,0,0,0.15)" }} />
          <span className="font-medium" style={{ color: "var(--j-text-primary)" }}>{tag.name}</span>
          <code className="text-xs" style={{ color: "var(--j-text-muted)" }}>{tag.color}</code>
        </div>
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: "var(--j-text-secondary)" }}>{tag.owner_email}</td>
      <td className="px-4 py-3 text-right tabular-nums text-xs" style={{ color: "var(--j-text-secondary)" }}>{tag.entry_count}</td>
      <td className="px-4 py-3 text-xs" style={{ color: "var(--j-text-muted)" }}>{new Date(tag.created_at).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(tag)}
            className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--j-border)", color: "var(--j-text-secondary)", backgroundColor: "var(--j-bg-elevated)" }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(tag.id)}
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{ color: "#dc2626", backgroundColor: "#fee2e2" }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export function AdminTagsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    | { type: "create" }
    | { type: "edit"; tag: AdminTag }
    | null
  >(null);

  const { data, isLoading } = useAdminTags({ search: search || undefined, page });
  const deleteTag = useAdminDeleteTag();
  const { toast } = useToast();

  function handleDelete(id: string) {
    if (!confirm("Delete this tag? It will be removed from all entries.")) return;
    deleteTag.mutate(id, {
      onSuccess: () => toast("Tag deleted.", "success"),
      onError: () => toast("Failed to delete tag.", "error"),
    });
  }

  const thClass = "px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>Tags</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>{data?.count ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="input w-48"
            placeholder="Search by name or owner…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="btn-primary text-sm px-4 py-2 whitespace-nowrap" onClick={() => setModal({ type: "create" })}>
            + New Tag
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-muted)" }}>
              <th className={thClass}>Tag</th>
              <th className={thClass}>Owner</th>
              <th className={`${thClass} text-right`}>Entries</th>
              <th className={thClass}>Created</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>Loading…</td></tr>
            )}
            {!isLoading && data?.results.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>No tags found.</td></tr>
            )}
            {data?.results.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                onEdit={(t) => setModal({ type: "edit", tag: t })}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {(data?.previous || data?.next) && (
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary text-xs" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <button className="btn-secondary text-xs" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {modal?.type === "create" && <TagFormModal onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <TagFormModal tag={modal.tag} onClose={() => setModal(null)} />}
    </div>
  );
}
