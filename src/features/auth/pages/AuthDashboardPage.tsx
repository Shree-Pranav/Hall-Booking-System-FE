import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../layouts/AppShell";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

type AuthMode = "login" | "register";

type AuthDashboardPageProps = {
  initialMode?: AuthMode;
};

export function AuthDashboardPage({
  initialMode = "login",
}: AuthDashboardPageProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  function showRegister() {
    setMode("register");
    setError(null);
    navigate("/register");
  }

  function showLogin() {
    setMode("login");
    setError(null);
    navigate("/");
  }

  return (
    <AppShell>
      {error ? (
        <div className="alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="auth-layout">
        <section className="auth-intro">
          <p className="eyebrow">Workspace access</p>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>
            {mode === "login"
              ? "Sign in to browse halls, manage favourites, and book available time slots."
              : "Register as a member, then sign in to start booking enabled halls."}
          </p>
        </section>
        {mode === "login" ? (
          <LoginForm onError={setError} onShowRegister={showRegister} />
        ) : (
          <RegisterForm onError={setError} onShowLogin={showLogin} />
        )}
      </div>
    </AppShell>
  );
}
