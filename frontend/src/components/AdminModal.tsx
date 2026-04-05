import { useEffect, type ReactNode } from "react";

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export function AdminModal({ title, onClose, children, width = "max-w-lg" }: AdminModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${width} rounded-xl border shadow-2xl flex flex-col max-h-[90vh]`}
        style={{
          backgroundColor: "var(--j-bg-surface)",
          borderColor: "var(--j-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--j-border)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--j-text-primary)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-xl leading-none rounded-md px-2 py-0.5 hover:opacity-70 transition-opacity"
            style={{ color: "var(--j-text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Shared form field helpers ──────────────────────────────────────────────

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--j-text-secondary)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "var(--j-text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--j-border)",
  backgroundColor: "var(--j-bg-base)",
  color: "var(--j-text-primary)",
  fontSize: "0.875rem",
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-end gap-2 pt-4 mt-2 border-t"
      style={{ borderColor: "var(--j-border)" }}
    >
      {children}
    </div>
  );
}

export function BtnPrimary({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
      style={{
        backgroundColor: "var(--j-accent)",
        color: "var(--j-accent-text)",
      }}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-80"
      style={{
        borderColor: "var(--j-border)",
        color: "var(--j-text-secondary)",
        backgroundColor: "var(--j-bg-elevated)",
      }}
    >
      {children}
    </button>
  );
}
