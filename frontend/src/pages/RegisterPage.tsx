import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "", username: "", password: "", passwordConfirm: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.email.includes("@")) errs.email = "Enter a valid email."
    if (form.username.length < 3) errs.username = "Username must be at least 3 characters."
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters."
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = "Passwords do not match."
    return errs
  }

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      await register(form.email, form.username, form.password, form.passwordConfirm)
      navigate("/", { replace: true })
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (apiErrors && typeof apiErrors === "object") {
        const mapped: Record<string, string> = {}
        for (const [key, messages] of Object.entries(apiErrors)) {
          const fieldMap: Record<string, string> = { password_confirm: "passwordConfirm", non_field_errors: "general" }
          mapped[fieldMap[key] ?? key] = Array.isArray(messages) ? messages[0] : String(messages)
        }
        setErrors(Object.keys(mapped).length ? mapped : { general: "Registration failed. Please try again." })
      } else {
        setErrors({ general: "Registration failed. Please try again." })
      }
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest uppercase" style={{ color: "var(--j-text-primary)" }}>
            Noir
          </h1>
          <p className="mt-2" style={{ color: "var(--j-text-muted)" }}>
            Create your account
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {(["email", "username", "password", "passwordConfirm"] as const).map((field) => (
              <div key={field}>
                <label htmlFor={field} className="label">
                  {field === "passwordConfirm"
                    ? "Confirm password"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  type={field.toLowerCase().includes("password") ? "password" : field === "email" ? "email" : "text"}
                  required
                  className={`input ${errors[field] ? "border-red-500" : ""}`}
                  value={form[field]}
                  onChange={handleChange(field)}
                />
                {errors[field] && (
                  <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--j-text-muted)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--j-accent)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
