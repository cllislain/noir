import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundColor: "var(--j-bg-base)" }}
    >
      <p className="text-6xl font-bold" style={{ color: "var(--j-border)" }}>404</p>
      <h1 className="mt-4 text-2xl font-semibold" style={{ color: "var(--j-text-primary)" }}>
        Page not found
      </h1>
      <p className="mt-2" style={{ color: "var(--j-text-muted)" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  )
}
