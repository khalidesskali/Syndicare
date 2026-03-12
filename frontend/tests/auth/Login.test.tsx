import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Login from "../../src/pages/Login";
import { useAuth } from "../../src/context/AuthContext";

// Mock the useAuth hook
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: "/" } } }),
  };
});

describe("Login Component", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      error: null,
    });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
  };

  it("renders login form correctly", () => {
    renderLogin();

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderLogin();

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid email format", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is invalid/i)).toBeInTheDocument();
    });
  });

  it("calls login function with correct credentials", async () => {
    mockLogin.mockResolvedValue({ user: { role: "ADMIN" } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "admin@example.com",
        "password123",
      );
    });
  });

  it("navigates to dashboard after successful login", async () => {
    mockLogin.mockResolvedValue({ user: { role: "ADMIN" } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows general error when login fails", async () => {
    mockLogin.mockResolvedValue({ user: null });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });

  it("toggles password visibility", () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleButton = screen.getByRole("button", { name: "" }); // Password toggle button doesn't have text

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
