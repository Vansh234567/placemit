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

  if (!auth.session) {
    return <LoginPage />;
  }

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
