// placemit/src/App.tsx
// REPLACE your entire existing App.tsx with this file.
// Only change from original: adds AuthContext + login gate before showing the app.

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Companies from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Community from "@/pages/Community";
import PostDetail from "@/pages/PostDetail";
import Experiences from "@/pages/Experiences";
import Documents from "@/pages/Documents";
import Applications from "@/pages/Applications";

// ── NEW IMPORTS ──────────────────────────────────────────────
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import LoginPage from "@/pages/Login";
// ─────────────────────────────────────────────────────────────

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
        <Route path="/" component={Dashboard} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/companies" component={Companies} />
        <Route path="/companies/:id" component={CompanyDetail} />
        <Route path="/students" component={Students} />
        <Route path="/students/:id" component={StudentDetail} />
        <Route path="/community" component={Community} />
        <Route path="/community/:id" component={PostDetail} />
        <Route path="/experiences" component={Experiences} />
        <Route path="/documents" component={Documents} />
        <Route path="/applications" component={Applications} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

// ── NEW: Auth-aware wrapper ───────────────────────────────────
function AuthGate() {
  const auth = useAuthState();

  if (auth.loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0a0c10",
        color: "#8a8f9a", fontSize: 16,
      }}>
        Loading PlaceMIT...
      </div>
    );
  }

  // Not logged in → show login page
  // Note: only block on session, not profile.
  // Profile may be null due to RLS policies or a race; that's recoverable
  // inside the app. Blocking on profile here traps users in an infinite
  // login loop when their profile row exists but SELECT is restricted.
  if (!auth.session) {
    return <LoginPage />;
  }

  // Logged in → show full app wrapped in auth context
  return (
    <AuthContext.Provider value={auth}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </AuthContext.Provider>
  );
}
// ─────────────────────────────────────────────────────────────

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
