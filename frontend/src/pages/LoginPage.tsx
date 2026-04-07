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

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch {
      setError("Invalid username or password. Please try again.")
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
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

        {/* Google sign-in temporarily disabled — pending OAuth config
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--j-border)" }} />
          </div>
          <div className="relative flex justify-center text-xs" style={{ color: "var(--j-text-muted)" }}>
            <span className="px-2" style={{ backgroundColor: "var(--j-bg-base)" }}>or</span>
          </div>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  await googleLogin(credentialResponse.credential)
                  navigate(from, { replace: true })
                } catch {
                  setError("Google sign-in failed. Please try again.")
                }
              }
            }}
            onError={() => setError("Google sign-in failed.")}
            theme="outline"
            shape="rectangular"
            size="large"
            text="continue_with"
            width="360"
          />
        </div>
        */}

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
