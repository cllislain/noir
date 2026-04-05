import { useState, type FormEvent } from "react"
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isLocked = searchParams.get("locked") === "1"
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setError("Invalid email or password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--j-bg-base)" }}
    >
      <div className="w-full max-w-sm">
        {isLocked && (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm text-center"
            style={{
              backgroundColor: "var(--j-bg-elevated)",
              borderColor: "var(--j-accent)",
              color: "var(--j-text-secondary)",
            }}
          >
            🔒 Your session was locked due to inactivity.
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest uppercase" style={{ color: "var(--j-text-primary)" }}>
            Noir
          </h1>
          <p className="mt-2" style={{ color: "var(--j-text-muted)" }}>
            Sign in to continue
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--j-text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium hover:underline"
            style={{ color: "var(--j-accent)" }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
