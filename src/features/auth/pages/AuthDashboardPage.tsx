import { useState } from "react";
import { AppShell } from "../../../layouts/AppShell";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

export function AuthDashboardPage() {
  const [error, setError] = useState<string | null>(null);

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

      <div className="dashboard-grid">
        <RegisterForm onError={setError} />
        <LoginForm onError={setError} />
      </div>
    </AppShell>
  );
}
