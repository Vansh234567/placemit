// artifacts/placemit/src/hooks/useAuth.ts
import { useEffect, useState, createContext, useContext } from "react";
import { supabase, safeStorage, type Profile } from "@/lib/supabase";
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

  async function attemptProfileRecovery(userId: string): Promise<boolean> {
    console.log("[useAuth] profile recovery attempt for uid:", userId);
    const raw = safeStorage.get("pending_profile");
    if (!raw) {
      console.warn(
        "[useAuth] no pending_profile in storage — cannot self-heal",
      );
      return false;
    }
    try {
      const pending = JSON.parse(raw);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn("[useAuth] recovery: no auth user found");
        return false;
      }

      // pending_profile saved by Login.tsx uses batch_year key directly
      const batchYear = pending.batch_year ?? pending.batch ?? null;

      console.log("[useAuth] recovery upsert payload:", {
        id: userId,
        name: pending.name,
        email: user.email,
        branch: pending.branch,
        batch_year: batchYear,
        roll_no: pending.roll_no,
      });

      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          name: pending.name,
          email: user.email!,
          branch: pending.branch,
          batch_year: batchYear,
          roll_no: pending.roll_no || null,
        },
        { onConflict: "id", ignoreDuplicates: false },
      );

      if (error) {
        console.error(
          "[useAuth] profile recovery upsert failed:",
          error.code,
          error.message,
        );
        return false;
      }

      safeStorage.remove("pending_profile");
      console.log("[useAuth] profile recovery upsert succeeded");
      return true;
    } catch (e) {
      console.error("[useAuth] profile recovery exception:", e);
      return false;
    }
  }

  async function fetchProfile(userId: string, isRecovery = false) {
    console.log(
      isRecovery
        ? "[useAuth] re-fetching profile after recovery for uid:"
        : "[useAuth] fetching profile for uid:",
      userId,
    );

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
      if (!isRecovery) {
        console.warn(
          "[useAuth] no profile row found for uid:",
          userId,
          "— attempting self-healing recovery",
        );
        const recovered = await attemptProfileRecovery(userId);
        if (recovered) {
          await fetchProfile(userId, true);
        } else {
          console.error(
            "[useAuth] profile recovery failed — forcing sign out for uid:",
            userId,
          );
          await supabase.auth.signOut();
          setProfile(null);
          setLoading(false);
        }
      } else {
        console.error(
          "[useAuth] profile still missing after recovery — forcing sign out for uid:",
          userId,
        );
        await supabase.auth.signOut();
        setProfile(null);
        setLoading(false);
      }
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
