// artifacts/placemit/src/App.tsx
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Community from "@/pages/Community";
import PostDetail from "@/pages/PostDetail";
import Experiences from "@/pages/Experiences";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import LoginPage from "@/pages/Login";
import ProfileSetupPage from "@/pages/ProfileSetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/">
          <Redirect to="/experiences" />
        </Route>
        <Route path="/experiences" component={Experiences} />
        <Route path="/community" component={Community} />
        <Route path="/community/:id" component={PostDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

/**
 * A profile is "complete" when it has the minimum fields required
 * to use the app. Existing users with these fields already set
 * will never see ProfileSetup again.
 */
function isProfileComplete(
  profile: {
    name?: string | null;
    branch?: string | null;
    batch_year?: number | null;
  } | null,
): boolean {
  if (!profile) return false;
  if (!profile.name || !profile.name.trim()) return false;
  if (!profile.branch || !profile.branch.trim()) return false;
  if (profile.batch_year == null) return false;
  return true;
}

function AuthGate() {
  const auth = useAuthState();

  console.log(
    "[AuthGate] loading:",
    auth.loading,
    "| session:",
    auth.session ? `uid=${auth.session.user.id}` : "none",
    "| profile:",
    auth.profile ? `name=${auth.profile.name}` : "none",
  );

  // Still resolving session from storage — show spinner
  if (auth.loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0c10",
          color: "#8a8f9a",
          fontSize: 16,
        }}
      >
        Loading PlaceMIT...
      </div>
    );
  }

  // No session at all — show login
  if (!auth.session) {
    console.log("[AuthGate] no session → showing LoginPage");
    return <LoginPage />;
  }

  // Session exists but profile row is missing entirely —
  // useAuth's recovery logic will create a minimal row; show spinner while it works.
  if (!auth.profile) {
    console.log(
      "[AuthGate] session exists but profile missing → showing spinner",
    );
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0c10",
          color: "#8a8f9a",
          fontSize: 16,
        }}
      >
        Setting up your account...
      </div>
    );
  }

  // Profile exists but required fields are missing — go to ProfileSetup.
  // Existing users with complete profiles skip this entirely.
  if (!isProfileComplete(auth.profile)) {
    console.log("[AuthGate] profile incomplete → showing ProfileSetupPage");
    return <ProfileSetupPage />;
  }

  // Fully authenticated with complete profile — render app
  console.log("[AuthGate] session + profile OK → rendering app");
  return (
    <AuthContext.Provider value={auth}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGate />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
