# PlaceMIT Authentication — Production Reference

## Overview

PlaceMIT uses **Supabase Auth** with **email OTP** (one-time passwords) as the sole
authentication method. Only `@learner.manipal.edu` email addresses are accepted.

---

## 1. Login Flow

```
User → enters email + name + branch + year
     → clicks "Send Verification Code"
     → sendOTP() validates domain (@learner.manipal.edu)
     → stores profile fields in localStorage["pending_profile"]
     → calls supabase.auth.signInWithOtp({ email, shouldCreateUser: true })
     → Supabase sends 6-digit code to inbox
     → 60-second resend cooldown starts
     → UI moves to Step 2 (OTP entry)
```

---

## 2. OTP Flow

```
User → enters 6-digit code
     → clicks "Verify & Enter PlaceMIT"
     → verifyOTP() calls supabase.auth.verifyOtp({ email, token, type: "email" })
     → On success: Supabase sets JWT session on the client
     → Profile row is upserted into `profiles` table
     → localStorage["pending_profile"] is cleared
     → AuthGate in App.tsx detects session change via onAuthStateChange
     → LoginPage unmounts; Router renders (user lands on Dashboard)
```

**Error cases:**
| Code | Meaning | Handling |
|------|---------|----------|
| `otp_expired` | Code >5 min old | Show error, allow resend after cooldown |
| `invalid_otp` | Wrong digits | Show error |
| Network error | Supabase unreachable | Show error, retry |

---

## 3. Session Flow

Session state is managed in `useAuthState()` (`src/hooks/useAuth.ts`):

```
Mount → supabase.auth.getSession()    → restore any active session
      → onAuthStateChange subscription → react to future login/logout events
      → fetchProfile(userId)           → load profile row from Supabase
```

Session is a JWT stored in `localStorage` by `@supabase/supabase-js`.
It auto-refreshes via the Supabase client before expiry. No manual token
management is needed.

**AuthGate** (`src/App.tsx`) gates the entire app:
- `loading === true` → show "Loading PlaceMIT..." spinner
- `session === null` → show `<LoginPage />`
- `session !== null` → show the full app (profile may be null if RLS blocks it)

> **Important**: AuthGate only blocks on `session`, not `profile`. Blocking on
> both causes an infinite login loop when RLS prevents the profile SELECT.

---

## 4. Profile Creation Flow

Profile rows live in the Supabase `profiles` table (separate from `auth.users`).

```
After OTP verify:
  supabase.from("profiles").upsert({
    id: user.id,          ← auth.uid(), must match RLS policy
    name: ...,
    email: user.email,
    branch: ...,
    year: ...,
    roll_no: ...,
  }, { onConflict: "id", ignoreDuplicates: true })
```

`ignoreDuplicates: true` means re-logins don't overwrite existing profile data.
Profile reads use `.maybeSingle()` (not `.single()`) to avoid `PGRST116` errors
when the row is absent.

---

## 5. Supabase RLS Policies

> **Action required**: Run the following SQL in your Supabase project's
> **SQL Editor** → **New query** → **Run**.

```sql
-- Enable RLS on profiles (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile
CREATE POLICY "users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read their own profile
CREATE POLICY "users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**All three policies use `auth.uid() = id`**, where `id` is the UUID primary key
on `profiles` that matches `auth.users.id`.

---

## 6. Environment Variables

| Variable | Used in | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` | Yes |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | Yes |

Both are set as Replit shared env vars. The client reads them via
`import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
The build will warn to the browser console if either is missing.

---

## 7. Resend Cooldown

- After `sendOTP()` succeeds, a **60-second countdown** starts.
- The "Send Verification Code" button is disabled and shows `"Resend in Xs"`.
- On the OTP step, a separate "Resend code" button is shown once the cooldown expires.
- This prevents OTP spam and duplicate Supabase requests per session.

---

## 8. Files Modified (Auth Audit)

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | Replaced hardcoded URL + key with `import.meta.env.*`; added missing-var guard |
| `src/hooks/useAuth.ts` | `.single()` → `.maybeSingle()`; added debug logging for session restore, auth state events, profile fetch errors |
| `src/pages/Login.tsx` | Removed `as any` from `verifyOtp` type; added 60s resend cooldown + countdown; added `[sendOTP]` and `[verifyOTP]` debug logs; added profile upsert error logging; added session-null guard after OTP verify |
| `src/App.tsx` | AuthGate now only blocks on `session`, not `profile` — fixes infinite login loop |

---

## 9. Issues Found

| Severity | Issue | Status |
|----------|-------|--------|
| 🔴 Critical | `profiles` SELECT blocked — `PGRST116` on every `fetchProfile` call. Almost certainly RLS is enabled with no policies, blocking all reads. | **Fix: run RLS SQL above** |
| 🔴 Critical | `AuthGate` blocked on `!profile` — caused infinite login loop for any user whose profile SELECT was blocked | **Fixed in App.tsx** |
| 🟠 High | `supabase.ts` hardcoded URL + anon key | **Fixed** |
| 🟠 High | `fetchProfile` used `.single()` — throws `PGRST116` on 0 rows instead of returning null | **Fixed → `.maybeSingle()`** |
| 🟡 Medium | No resend cooldown — user could spam OTP requests | **Fixed — 60s timer** |
| 🟡 Medium | `verifyOtp` had `type: "email" as any` — unnecessary cast | **Fixed** |
| 🟡 Medium | No `[sendOTP]` debug logs | **Fixed** |
| 🟡 Medium | No profile upsert error logging | **Fixed** |
| 🟡 Medium | No guard for session being null after successful `verifyOtp` response | **Fixed** |
| 🟢 Low | Duplicate `Login.tsx` at wrong path (`src/pages/placemit/src/pages/Login.tsx`) | **Fixed — deleted** |
| 🟢 Low | "Multiple GoTrueClient instances" warning in dev | Expected during HMR — harmless in production |

---

## 10. Remaining Blockers Before Production

1. **Run RLS policies** (Section 5 above) — this is the only step that requires
   manual action in the Supabase dashboard. Without it, all profile reads and
   inserts are blocked.

2. **Verify `profiles` table schema** in Supabase matches:
   ```sql
   id         uuid  PRIMARY KEY  -- must equal auth.users.id
   name       text  NOT NULL
   email      text  NOT NULL
   branch     text  NOT NULL
   year       int   NOT NULL
   roll_no    text  NULL
   linkedin_url text NULL
   created_at timestamptz DEFAULT now()
   ```

3. **Check Supabase email rate limits** — default is 4 OTP emails/hour per
   email address in the free tier. Upgrade or configure SMTP for production.

4. **Enable "Confirm email" in Supabase Auth settings** — verify that
   "Enable email confirmations" is set to match the OTP flow (not magic link).
   In the Supabase dashboard: Authentication → Providers → Email →
   set "Confirm email" to enabled and "Mailer OTP expiry" to 300s (5 min).
