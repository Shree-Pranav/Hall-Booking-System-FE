import { useEffect, useState, type ReactNode } from "react";
import { Building2, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/ui/toast";
import { env } from "../config/env";
import { getAccessToken } from "../lib/authToken";

type AppShellProps = {
  children: ReactNode;
  profileDetails?: ReactNode;
};

export function AppShell({ children, profileDetails }: AppShellProps) {
  const { user, isHydrating } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const roleLabel = user?.role === "admin" ? "Administrator" : "Member";
  const sessionSubtitle = profileDetails ? "Profile" : roleLabel;

  useEffect(() => {
    if (isHydrating) return;
    if (!user || user.role !== "user") {
      setNoticeMessage(null);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setNoticeMessage(null);
      return;
    }

    const eventUrl = new URL("/events/hall-status", env.bookingApiBaseUrl);
    eventUrl.searchParams.set("token", token);

    const source = new EventSource(eventUrl.toString());

    const handleHallDisabled = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        window.dispatchEvent(
          new CustomEvent("hall-disabled", {
            detail: data,
          }),
        );
        if (typeof data?.message === "string") {
          showToast({
            title: "Hall status update",
            description: data.message,
            variant: "info",
          });
          setNoticeMessage(data.message);
        }
      } catch {
        const fallbackMessage =
          "A booked hall is temporarily out of service. Please book another hall.";
        window.dispatchEvent(
          new CustomEvent("hall-disabled", {
            detail: {
              message: fallbackMessage,
            },
          }),
        );
        showToast({
          title: "Hall status update",
          description: fallbackMessage,
          variant: "info",
        });
        setNoticeMessage(fallbackMessage);
      }
    };

    source.addEventListener(
      "hall-disabled",
      handleHallDisabled as EventListener,
    );

    return () => {
      source.removeEventListener(
        "hall-disabled",
        handleHallDisabled as EventListener,
      );
      source.close();
    };
  }, [isHydrating, user]);

  return (
    <main className="app-shell">
      <section className="app-shell__hero">
        <div className="app-shell__brand">
          <span className="brand-mark" aria-hidden="true">
            <Building2 size={24} />
          </span>
          <div>
            <p className="eyebrow">Workspace scheduling</p>
            <h1>Hall Booking System</h1>
          </div>
        </div>
        <div className="app-shell__session">
          {!isHydrating ? (
            user ? (
              <>
                <button
                  type="button"
                  className="app-shell__session-button"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="dialog"
                  onClick={() => setIsProfileOpen((current) => !current)}
                >
                  <span className="session-avatar" aria-hidden="true">
                    {user.role === "admin" ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <UserRound size={18} />
                    )}
                  </span>
                  <span className="app-shell__session-copy">
                    <span>{user.name}</span>
                    <strong>{sessionSubtitle}</strong>
                  </span>
                </button>
                {isProfileOpen ? (
                  <div className="profile-popover" role="dialog">
                    <div className="profile-popover__header">
                      <span className="session-avatar" aria-hidden="true">
                        {user.role === "admin" ? (
                          <ShieldCheck size={18} />
                        ) : (
                          <UserRound size={18} />
                        )}
                      </span>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{sessionSubtitle}</span>
                      </div>
                    </div>
                    {profileDetails ?? (
                      <dl className="profile-popover__details">
                        <div>
                          <dt>Role</dt>
                          <dd>{roleLabel}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{user.is_active ? "Active" : "Inactive"}</dd>
                        </div>
                      </dl>
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <span className="session-copy">Sign in to access hall info.</span>
            )
          ) : null}
        </div>
      </section>
      {noticeMessage ? (
        <div className="notice" role="status">
          <span>{noticeMessage}</span>
          <button type="button" onClick={() => setNoticeMessage(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {children}
    </main>
  );
}
