// artifacts/placemit/src/hooks/useAuth.ts
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
  console.log("USEAUTH_V2");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "[useAuth] restored session:",
        session ? `uid=${session.user.id}` : "none",
      );
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "[useAuth] auth state change:",
        event,
        session ? `uid=${session.user.id}` : "none",
      );
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

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[useAuth] fetchProfile error:", error.code, error.message);
      setProfile(null);
      setLoading(false);
      return;
    }

    if (!data) {
      console.log("[useAuth] profile missing - waiting for ProfileSetupPage");
      setProfile(null);
      setLoading(false);
      return;
    }

    console.log("[useAuth] profile loaded:", data);
    setProfile(data as Profile);
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
