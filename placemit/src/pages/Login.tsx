// placemit/src/pages/Login.tsx
// Drop this file into: placemit/src/pages/Login.tsx

import { useState } from "react";
import { supabase, ALLOWED_DOMAIN, BRANCHES } from "@/lib/supabase";

type Step = "details" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendOTP() {
    setError("");
    if (!email.trim().endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Only @${ALLOWED_DOMAIN} emails are allowed`);
      return;
    }
    if (!name.trim() || !branch || !year) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    // Store pending profile data; we'll save it after OTP verify
    sessionStorage.setItem(
      "pending_profile",
      JSON.stringify({
        name: name.trim(),
        branch,
        batch: parseInt(year),
        roll_no: rollNo.trim(),
      }),
    );
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStep("otp");
  }

  async function verifyOTP() {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }

    // Create profile row if it doesn't exist yet
    if (data.user) {
      const pending = JSON.parse(
        sessionStorage.getItem("pending_profile") || "{}",
      );
      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        name,
        batch_year,
      });
      sessionStorage.removeItem("pending_profile");
    }
    setLoading(false);
    // Auth state change listener in useAuth will pick up the new session automatically
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>M</div>
          <span style={styles.logoText}>PlaceMIT</span>
        </div>
        const [batchYear, setBatchYear] = useState("");
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
            <select
              value={batchYear}
              onChange={(e) => setBatchYear(Number(e.target.value))}
            >
              <option value="">Select Batch</option>
              <option value="Earlier batch">Earlier batch</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
            </select>
            <input
              style={styles.input}
              type="text"
              placeholder="Roll number (e.g. 230957001)"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
            <select
              style={styles.input}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <select
              style={styles.input}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select batch</option>

              {[
                "2027 Batch",
                "2026 Batch",
                "2025 Batch",
                "2024 Batch",
                "2023 Batch",
                "2022 Batch",
                "2021 Batch",
                "2020 Batch",
                "Other",
              ].map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            <button style={styles.btn} onClick={sendOTP} disabled={loading}>
              {loading ? "Sending code..." : "Send Verification Code →"}
            </button>
            <p style={styles.hint}>
              A 8-digit code will be sent to your Manipal email inbox.
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
            <button style={styles.btn} onClick={verifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Enter PlaceMIT →"}
            </button>
            <button
              style={styles.backBtn}
              onClick={() => {
                setStep("details");
                setOtp("");
                setError("");
              }}
            >
              ← Change email
            </button>
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
    cursor: "pointer",
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
  },
};
