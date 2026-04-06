import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "@/auth/AuthProvider"
import { ProtectedRoute } from "@/auth/ProtectedRoute"
import { ThemeProvider } from "@/theme/ThemeProvider"
import { ToastProvider } from "@/toast/ToastProvider"

const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const EntryPage = lazy(() => import("@/pages/EntryPage").then((m) => ({ default: m.EntryPage })))
const EntryFormPage = lazy(() => import("@/pages/EntryFormPage").then((m) => ({ default: m.EntryFormPage })))
const TrashPage = lazy(() => import("@/pages/TrashPage").then((m) => ({ default: m.TrashPage })))
const InsightsPage = lazy(() => import("@/pages/InsightsPage").then((m) => ({ default: m.InsightsPage })))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))
const AdminLayout = lazy(() => import("@/components/AdminLayout").then((m) => ({ default: m.AdminLayout })))
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })))
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })))
const AdminEntriesPage = lazy(() => import("@/pages/admin/AdminEntriesPage").then((m) => ({ default: m.AdminEntriesPage })))
const AdminTagsPage = lazy(() => import("@/pages/admin/AdminTagsPage").then((m) => ({ default: m.AdminTagsPage })))
const AdminSharedLinksPage = lazy(() => import("@/pages/admin/AdminSharedLinksPage").then((m) => ({ default: m.AdminSharedLinksPage })))
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })))
const SharedEntryPage = lazy(() => import("@/pages/SharedEntryPage").then((m) => ({ default: m.SharedEntryPage })))
const AccountPage = lazy(() => import("@/pages/AccountPage").then((m) => ({ default: m.AccountPage })))
const ChangelogPage = lazy(() => import("@/pages/ChangelogPage").then((m) => ({ default: m.ChangelogPage })))

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <Suspense
                fallback={
                  <div
                    className="min-h-screen flex items-center justify-center"
                    style={{ backgroundColor: "var(--j-bg-base)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 animate-spin"
                      style={{ borderColor: "var(--j-border)", borderTopColor: "var(--j-accent)" }}
                    />
                  </div>
                }
              >
                <Routes>
                  {/* Public */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/share/:token" element={<SharedEntryPage />} />

                  {/* Protected journal routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/entries/new" element={<EntryFormPage />} />
                    <Route path="/entries/:id" element={<EntryPage />} />
                    <Route path="/entries/:id/edit" element={<EntryFormPage />} />
                    <Route path="/trash" element={<TrashPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/changelog" element={<ChangelogPage />} />
                  </Route>

                  {/* Admin routes — staff guard handled inside AdminLayout */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                      <Route path="/admin/entries" element={<AdminEntriesPage />} />
                      <Route path="/admin/tags" element={<AdminTagsPage />} />
                      <Route path="/admin/shared-links" element={<AdminSharedLinksPage />} />
                      <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}
