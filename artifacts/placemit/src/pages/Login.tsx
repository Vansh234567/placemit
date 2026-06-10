// artifacts/placemit/src/pages/Login.tsx
import { useState, useEffect, useRef } from "react";
import {
  supabase,
  safeStorage,
  ALLOWED_DOMAIN,
  BRANCHES,
} from "@/lib/supabase";

type Step = "details" | "otp";

const RESEND_COOLDOWN_SECONDS = 60;

const BATCH_YEARS = [
  { value: "2020", label: "2020 Batch" },
  { value: "2021", label: "2021 Batch" },
  { value: "2022", label: "2022 Batch" },
  { value: "2023", label: "2023 Batch" },
  { value: "2024", label: "2024 Batch" },
  { value: "2025", label: "2025 Batch" },
  { value: "2026", label: "2026 Batch" },
  { value: "2027", label: "2027 Batch" },
  { value: "2028", label: "2028 Batch" },
  { value: "2029", label: "2029 Batch" },
  { value: "2030", label: "2030 Batch" },
];

export default function LoginPage() {
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  async function sendOTP() {
    setError("");

    if (!email.trim().endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Only @${ALLOWED_DOMAIN} emails are allowed`);
      return;
    }
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!branch) {
      setError("Please select your branch");
      return;
    }
    if (!batchYear) {
      setError("Please select your batch year");
      return;
    }
    if (cooldown > 0) return;

    setLoading(true);
    console.log("[sendOTP] sending OTP to:", email.trim());

    // Save everything needed for profile creation BEFORE calling Supabase.
    // Use batch_year key (not batch) so recovery reads it correctly.
    const pendingProfile = {
      name: name.trim(),
      email: email.trim(),
      branch,
      batch_year: Number(batchYear),
      roll_no: rollNo.trim() || null,
    };

    console.log(
      "[sendOTP] saving pending_profile to safeStorage:",
      pendingProfile,
    );
    safeStorage.set("pending_profile", JSON.stringify(pendingProfile));

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (err) {
      console.error("[sendOTP] error:", err.message, err);
      setError(err.message);
      return;
    }

    console.log("[sendOTP] OTP sent successfully");
    startCooldown();
    setStep("otp");
  }

  async function verifyOTP() {
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    setLoading(true);
    console.log("[verifyOTP] verifying OTP for:", email.trim());

    const { data, error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });

    console.log("[verifyOTP] session:", data?.session ? "present" : "null");
    console.log("[verifyOTP] user id:", data?.user?.id ?? "none");
    console.log("[verifyOTP] error:", err);

    if (err) {
      console.error("[verifyOTP] verification failed:", err.message);
      setLoading(false);
      setError(err.message);
      return;
    }

    if (!data.session) {
      console.error("[verifyOTP] no session returned after OTP verify");
      setLoading(false);
      setError(
        "Authentication failed — no session returned. Please try again.",
      );
      return;
    }

    console.log("[verifyOTP] OTP verification success — uid:", data.user?.id);

    if (data.user) {
      // Read pending_profile — saved before OTP was sent
      const rawPending = safeStorage.get("pending_profile");
      const pending = rawPending ? JSON.parse(rawPending) : {};

      // Resolve each field with fallback to current state values
      const profileName = pending.name ?? name.trim();
      const profileEmail = data.user.email ?? email.trim();
      const profileBranch = pending.branch ?? branch;
      const profileBatchYear =
        pending.batch_year != null
          ? Number(pending.batch_year)
          : Number(batchYear);
      const profileRollNo = pending.roll_no ?? (rollNo.trim() || null);

      console.log("[verifyOTP] pending_profile contents:", pending);
      console.log("[verifyOTP] resolved batch_year:", profileBatchYear);
      console.log("[verifyOTP] upserting profile:", {
        id: data.user.id,
        name: profileName,
        email: profileEmail,
        branch: profileBranch,
        batch_year: profileBatchYear,
        roll_no: profileRollNo,
      });

      // ignoreDuplicates: false — ensures all columns are updated even on re-registration
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          name: profileName,
          email: profileEmail,
          branch: profileBranch,
          batch_year: profileBatchYear,
          roll_no: profileRollNo,
        },
        { onConflict: "id", ignoreDuplicates: false },
      );

      if (upsertError) {
        console.error(
          "[verifyOTP] profile upsert failed:",
          upsertError.code,
          upsertError.message,
        );
        // Sign out so user doesn't get stuck in a broken state
        await supabase.auth.signOut();
        setLoading(false);
        setError("Account setup failed. Please try signing in again.");
        return;
      }

      console.log("[verifyOTP] profile upsert success — uid:", data.user.id);
      // Only remove pending_profile after confirmed success
      safeStorage.remove("pending_profile");
    }

    setLoading(false);
    console.log("[verifyOTP] auth complete — AuthGate will redirect");
    // onAuthStateChange in useAuth.ts will fire and load the profile automatically
  }

  function handleBackToDetails() {
    setStep("details");
    setOtp("");
    setError("");
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>M</div>
          <span style={styles.logoText}>PlaceMIT</span>
        </div>

        <p style={styles.subtitle}>
          The placement intelligence + mentorship hub for{" "}
          <strong style={{ color: "#f0f2f5" }}>MIT Manipal</strong>.
          <br />
          Verify with your college email to join.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {step === "details" ? (
          <>
            <input
              style={styles.input}
              type="email"
              placeholder={`yourname@${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Roll number (e.g. 220905001)"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
            <select
              style={{
                ...styles.input,
                backgroundColor: "#161a20",
                color: "#f0f2f5",
              }}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option
                value=""
                style={{ backgroundColor: "#161a20", color: "#f0f2f5" }}
              >
                Select branch
              </option>
              {BRANCHES.map((b) => (
                <option
                  key={b}
                  value={b}
                  style={{ backgroundColor: "#161a20", color: "#f0f2f5" }}
                >
                  {b}
                </option>
              ))}
            </select>
            <select
              style={{
                ...styles.input,
                backgroundColor: "#161a20",
                color: "#f0f2f5",
              }}
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
            >
              <option
                value=""
                style={{ backgroundColor: "#161a20", color: "#f0f2f5" }}
              >
                Select batch year
              </option>
              {BATCH_YEARS.map((y) => (
                <option
                  key={y.value}
                  value={y.value}
                  style={{ backgroundColor: "#161a20", color: "#f0f2f5" }}
                >
                  {y.label}
                </option>
              ))}
            </select>
            <button
              style={{
                ...styles.btn,
                opacity: loading || cooldown > 0 ? 0.6 : 1,
                cursor: loading || cooldown > 0 ? "not-allowed" : "pointer",
              }}
              onClick={sendOTP}
              disabled={loading || cooldown > 0}
            >
              {loading
                ? "Sending code..."
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Send Verification Code →"}
            </button>
            <p style={styles.hint}>
              A 6-digit code will be sent to your Manipal email inbox.
              <br />
              Fake or nonexistent emails won't receive it.
            </p>
          </>
        ) : (
          <>
            <p
              style={{
                color: "#8a8f9a",
                fontSize: 14,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Code sent to <strong style={{ color: "#7ca4ff" }}>{email}</strong>
            </p>
            <input
              style={{
                ...styles.input,
                fontSize: 24,
                letterSpacing: 10,
                textAlign: "center",
              }}
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <button
              style={{
                ...styles.btn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={verifyOTP}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Enter PlaceMIT →"}
            </button>
            <button style={styles.backBtn} onClick={handleBackToDetails}>
              ← Change email
            </button>
            {cooldown > 0 && (
              <p style={{ ...styles.hint, marginTop: 8 }}>
                Resend available in {cooldown}s
              </p>
            )}
            {cooldown === 0 && (
              <button
                style={{ ...styles.backBtn, marginTop: 8 }}
                onClick={() => {
                  setOtp("");
                  setError("");
                  sendOTP();
                }}
                disabled={loading}
              >
                Resend code
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "#0a0c10",
  },
  card: {
    background: "#161a20",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "3rem 2.5rem",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: "1.5rem",
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg,#4f7cff,#7c56ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
  },
  logoText: { fontSize: 24, fontWeight: 700, color: "#f0f2f5" },
  subtitle: {
    color: "#8a8f9a",
    fontSize: 14,
    marginBottom: "1.5rem",
    lineHeight: 1.7,
  },
  error: {
    color: "#ff5656",
    fontSize: 13,
    marginBottom: 12,
    padding: "8px 12px",
    background: "rgba(255,86,86,0.08)",
    borderRadius: 8,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#f0f2f5",
    fontSize: 14,
    outline: "none",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    marginTop: 6,
    background: "linear-gradient(135deg,#4f7cff,#7c56ff)",
    color: "#fff",
    borderRadius: 10,
    padding: "13px",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
  },
  hint: { color: "#8a8f9a", fontSize: 12, marginTop: "1rem", lineHeight: 1.6 },
  backBtn: {
    background: "none",
    border: "none",
    color: "#8a8f9a",
    fontSize: 13,
    marginTop: 10,
    cursor: "pointer",
    textDecoration: "underline",
    display: "block",
    width: "100%",
  },
};
