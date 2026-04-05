import { useState, useEffect } from "react";
import {
  useAdminEntries,
  useAdminCreateEntry,
  useAdminUpdateEntry,
  useAdminSoftDeleteEntry,
  useAdminRestoreEntry,
  useAdminHardDeleteEntry,
  useAdminUsers,
  useAdminTags,
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
import type { AdminEntry } from "@/types";

const MOOD_COLORS: Record<string, string> = {
  happy:    "#22c55e",
  neutral:  "#6b7280",
  sad:      "#3b82f6",
  anxious:  "#f97316",
  grateful: "#a855f7",
};

const MOODS = ["", "happy", "neutral", "sad", "anxious", "grateful"] as const;

type ViewFilter = "all" | "active" | "deleted";

// ── Entry Create / Edit modal ─────────────────────────────────────────────

function EntryFormModal({ entry, onClose }: { entry?: AdminEntry; onClose: () => void }) {
  const isEdit = !!entry;
  const { toast } = useToast();
  const createEntry = useAdminCreateEntry();
  const updateEntry = useAdminUpdateEntry();

  // Fetch users for author dropdown (create only)
  const { data: usersData } = useAdminUsers({ page: 1 });
  // Fetch tags for tag selection
  const { data: tagsData } = useAdminTags({ page: 1 });

  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [mood, setMood] = useState<string>(entry?.mood ?? "");
  const [isFavorite, setIsFavorite] = useState(entry?.is_favorite ?? false);
  const [isDeleted, setIsDeleted] = useState(entry?.is_deleted ?? false);
  const [selectedTags, setSelectedTags] = useState<string[]>(entry?.tags ?? []);

  const isPending = createEntry.isPending || updateEntry.isPending;

  // Default author to first user once loaded (create mode only)
  useEffect(() => {
    if (!isEdit && !author && usersData?.results.length) {
      setAuthor(usersData.results[0].id);
    }
  }, [isEdit, author, usersData]);

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      body,
      mood: mood || undefined,
      is_favorite: isFavorite,
      tags: selectedTags,
      ...(isEdit ? { is_deleted: isDeleted } : { author }),
    };

    if (isEdit) {
      updateEntry.mutate(
        { id: entry!.id, ...payload },
        {
          onSuccess: () => { toast("Entry updated.", "success"); onClose(); },
          onError: () => toast("Failed to update entry.", "error"),
        }
      );
    } else {
      createEntry.mutate(payload, {
        onSuccess: () => { toast("Entry created.", "success"); onClose(); },
        onError: (e: unknown) => {
          const data = (e as { response?: { data?: Record<string, string[]> } })?.response?.data;
          toast(data ? Object.values(data).flat().join(" ") : "Failed to create entry.", "error");
        },
      });
    }
  }

  return (
    <AdminModal title={isEdit ? "Edit Entry" : "New Entry"} onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit}>
        {isEdit ? (
          <FormField label="Author">
            <div className="text-sm py-1.5" style={{ color: "var(--j-text-secondary)" }}>
              {entry!.author_email} (@{entry!.author_username})
            </div>
          </FormField>
        ) : (
          <FormField label="Author">
            <select
              style={selectStyle}
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            >
              {!usersData?.results.length && <option value="">Loading…</option>}
              {usersData?.results.map((u) => (
                <option key={u.id} value={u.id}>{u.email} (@{u.username})</option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Title">
          <input style={inputStyle} type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>

        <FormField label="Body">
          <textarea
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </FormField>

        <FormField label="Mood">
          <select style={selectStyle} value={mood} onChange={(e) => setMood(e.target.value)}>
            {MOODS.map((m) => (
              <option key={m} value={m}>{m === "" ? "— none —" : m}</option>
            ))}
          </select>
        </FormField>

        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--j-text-secondary)" }}>
            <input type="checkbox" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--j-accent)" }} />
            Favorite
          </label>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--j-text-secondary)" }}>
              <input type="checkbox" checked={isDeleted} onChange={(e) => setIsDeleted(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--j-accent)" }} />
              Deleted (in trash)
            </label>
          )}
        </div>

        {/* Tags */}
        {tagsData && tagsData.results.length > 0 && (
          <FormField label="Tags" hint={tagsData.next ? "Showing first page of tags." : undefined}>
            <div
              className="rounded-lg p-2 flex flex-wrap gap-1.5"
              style={{ backgroundColor: "var(--j-bg-page)", border: "1px solid var(--j-border)", maxHeight: 120, overflowY: "auto" }}
            >
              {tagsData.results.map((tag) => {
                const selected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: selected ? tag.color : "var(--j-bg-elevated)",
                      color: selected ? "#fff" : "var(--j-text-secondary)",
                      border: `2px solid ${selected ? tag.color : "transparent"}`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </FormField>
        )}

        <ModalActions>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary disabled={isPending}>{isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Entry"}</BtnPrimary>
        </ModalActions>
      </form>
    </AdminModal>
  );
}

// ── Entry row ─────────────────────────────────────────────────────────────

function EntryRow({ entry, onEdit, onSoftDelete, onRestore, onHardDelete }: {
  entry: AdminEntry;
  onEdit: (entry: AdminEntry) => void;
  onSoftDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
}) {
  const moodColor = entry.mood ? MOOD_COLORS[entry.mood] : undefined;

  return (
    <tr className="border-b text-sm transition-colors" style={{ borderColor: "var(--j-border)" }}>
      <td className="px-4 py-3 max-w-xs">
        <div className="font-medium truncate" style={{ color: "var(--j-text-primary)" }}>{entry.title}</div>
        <div className="text-xs truncate mt-0.5" style={{ color: "var(--j-text-muted)" }}>{entry.body_preview}</div>
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: "var(--j-text-secondary)" }}>{entry.author_email}</td>
      <td className="px-4 py-3">
        {entry.mood ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: moodColor }}>
            {entry.mood}
          </span>
        ) : (
          <span style={{ color: "var(--j-text-muted)" }}>—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center tabular-nums text-xs" style={{ color: "var(--j-text-secondary)" }}>{entry.tag_count}</td>
      <td className="px-4 py-3">
        {entry.is_deleted ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>Deleted</span>
        ) : (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-muted)" }}>Active</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: "var(--j-text-muted)" }}>{new Date(entry.created_at).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => onEdit(entry)}
            className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--j-border)", color: "var(--j-text-secondary)", backgroundColor: "var(--j-bg-elevated)" }}
          >
            Edit
          </button>
          {!entry.is_deleted && (
            <button onClick={() => onSoftDelete(entry.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: "#d97706", backgroundColor: "#fef3c7" }}>
              Trash
            </button>
          )}
          {entry.is_deleted && (
            <>
              <button onClick={() => onRestore(entry.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: "#059669", backgroundColor: "#d1fae5" }}>Restore</button>
              <button onClick={() => onHardDelete(entry.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: "#dc2626", backgroundColor: "#fee2e2" }}>Delete</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export function AdminEntriesPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewFilter>("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    | { type: "create" }
    | { type: "edit"; entry: AdminEntry }
    | null
  >(null);

  const { data, isLoading } = useAdminEntries({ search: search || undefined, view, page });
  const softDelete = useAdminSoftDeleteEntry();
  const restore = useAdminRestoreEntry();
  const hardDelete = useAdminHardDeleteEntry();
  const { toast } = useToast();

  function handleSoftDelete(id: string) {
    softDelete.mutate(id, {
      onSuccess: () => toast("Entry moved to trash.", "success"),
      onError: () => toast("Failed.", "error"),
    });
  }

  function handleRestore(id: string) {
    restore.mutate(id, {
      onSuccess: () => toast("Entry restored.", "success"),
      onError: () => toast("Failed.", "error"),
    });
  }

  function handleHardDelete(id: string) {
    if (!confirm("Permanently delete this entry? This cannot be undone.")) return;
    hardDelete.mutate(id, {
      onSuccess: () => toast("Entry permanently deleted.", "success"),
      onError: () => toast("Failed.", "error"),
    });
  }

  const thClass = "px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider";
  const filters: { value: ViewFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "deleted", label: "Deleted" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--j-text-primary)" }}>Entries</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--j-text-muted)" }}>
            {data?.count ?? 0} result{data?.count !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setView(f.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={
                view === f.value
                  ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)" }
                  : { backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-secondary)" }
              }
            >
              {f.label}
            </button>
          ))}
          <input
            className="input w-48"
            placeholder="Search…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="btn-primary text-sm px-4 py-2 whitespace-nowrap" onClick={() => setModal({ type: "create" })}>
            + New Entry
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-muted)" }}>
              <th className={thClass}>Entry</th>
              <th className={thClass}>Author</th>
              <th className={thClass}>Mood</th>
              <th className={`${thClass} text-center`}>Tags</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Created</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>Loading…</td></tr>
            )}
            {!isLoading && data?.results.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: "var(--j-text-muted)" }}>No entries found.</td></tr>
            )}
            {data?.results.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onEdit={(e) => setModal({ type: "edit", entry: e })}
                onSoftDelete={handleSoftDelete}
                onRestore={handleRestore}
                onHardDelete={handleHardDelete}
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

      {modal?.type === "create" && <EntryFormModal onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <EntryFormModal entry={modal.entry} onClose={() => setModal(null)} />}
    </div>
  );
}
