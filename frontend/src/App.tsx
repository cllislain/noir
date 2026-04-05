import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/auth/AuthProvider"
import { ProtectedRoute } from "@/auth/ProtectedRoute"
import { ThemeProvider } from "@/theme/ThemeProvider"
import { ToastProvider } from "@/toast/ToastProvider"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { EntryPage } from "@/pages/EntryPage"
import { EntryFormPage } from "@/pages/EntryFormPage"
import { TrashPage } from "@/pages/TrashPage"
import { InsightsPage } from "@/pages/InsightsPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { AdminLayout } from "@/components/AdminLayout"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage"
import { AdminEntriesPage } from "@/pages/admin/AdminEntriesPage"
import { AdminTagsPage } from "@/pages/admin/AdminTagsPage"
import { AdminSharedLinksPage } from "@/pages/admin/AdminSharedLinksPage"
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage"
import { SharedEntryPage } from "@/pages/SharedEntryPage"
import { AccountPage } from "@/pages/AccountPage"

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
