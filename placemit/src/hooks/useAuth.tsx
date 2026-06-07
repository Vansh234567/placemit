// placemit/src/hooks/useAuth.ts
// Full version with logout helper.
// REPLACE placemit/src/hooks/useAuth.ts with this.

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
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } =const { error } = await supabase.from("profiles").upsert({
    id: userId,
    name: pending.name,
    email: user.email!,
    branch: pending.branch,
    batch_year: pending.batch,
    roll_no: pending.roll_no || null,
  }, {
    onConflict: "id",
    ignoreDuplicates: true,
  });

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  return { session, profile, loading, logout };
}

export const AuthContext = createContext<AuthState>({
  session: null, profile: null, loading: true,
  logout: async () => {},
});

// Use this in any component to get current user + logout
export function useAuth() {
  return useContext(AuthContext);
}
