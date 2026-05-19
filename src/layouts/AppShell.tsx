import type { ReactNode } from "react";

import { useAuth } from "../context/AuthContext";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user, isHydrating } = useAuth();

  return (
    <main className="app-shell">
      <section className="app-shell__header">
        <div>
          <h1>Hall Booking System</h1>
          {!isHydrating ? (
            <p>
              {user
                ? `Signed in as ${user.name} (${user.role})`
                : "Sign in to access protected hall endpoints."}
            </p>
          ) : null}
        </div>
      </section>
      {children}
    </main>
  );
}
