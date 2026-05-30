import { useEffect, useState, createContext, useContext } from "react";
import { supabase, type Profile } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
};

export function useAuthState(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[useAuth] restored session:", session ? `uid=${session.user.id}` : "none");
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useAuth] auth state change:", event, session ? `uid=${session.user.id}` : "none");
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    console.log("[useAuth] fetching profile for uid:", userId);
    // .maybeSingle() returns null (not an error) when no row exists,
    // avoiding PGRST116 "Cannot coerce result to single JSON object"
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      // Real errors (network, RLS, table not found) — not "no rows"
      console.error("[useAuth] fetchProfile error:", error.code, error.message, error);
    } else if (!data) {
      console.warn("[useAuth] no profile row found for uid:", userId, "— RLS may be blocking SELECT or row does not exist");
    } else {
      console.log("[useAuth] profile loaded:", data);
    }

    setProfile(data as Profile | null);
    setLoading(false);
  }

  async function logout() {
    console.log("[useAuth] logging out");
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  return { session, profile, loading, logout };
}

export const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
