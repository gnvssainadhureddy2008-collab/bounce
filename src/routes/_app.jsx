import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import AppShell from "@/components/app/AppShell";
import { isGuest } from "@/lib/store";

/**
 * The app shell. Signed-in people pass the normal login gate; a visitor who chose
 * "Try as guest" is let through with `guest: true` and their data stays in this
 * browser until they sign in (at which point it moves to their account).
 */
export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async (ctx) => {
    if (isGuest()) return { user: null, guest: true };
    const result = await requireSignedIn(ctx);
    return { ...result, guest: false };
  },
  errorComponent: AuthGateError,
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}