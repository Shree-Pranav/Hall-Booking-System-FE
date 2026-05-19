import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="app-shell">
      <section className="app-shell__header">
        <div>
          <h1>Hall Booking System</h1>
        </div>
      </section>
      {children}
    </main>
  );
}
