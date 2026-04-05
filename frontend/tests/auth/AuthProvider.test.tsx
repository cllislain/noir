import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? "authenticated" : "unauthenticated"}</p>
      <p data-testid="user-email">{user?.email ?? "none"}</p>
      <button onClick={() => login("test@example.com", "password")}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unauthenticated when no tokens", async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent("unauthenticated")
    );
  });

  it("authenticates user on login", async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText("Login"));
    await waitFor(() =>
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com")
    );
  });

  it("clears user on logout", async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText("Login"));
    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated")
    );
    await userEvent.click(screen.getByText("Logout"));
    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent("unauthenticated")
    );
  });
});
