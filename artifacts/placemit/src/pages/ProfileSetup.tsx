// artifacts/placemit/src/pages/ProfileSetup.tsx
import { useState, useEffect } from "react";
import { supabase, BRANCHES } from "@/lib/supabase";

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

export default function ProfileSetupPage() {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [branch, setBranch] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  async function handleSubmit() {
    setError("");

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

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Session expired. Please log in again.");
      return;
    }

    console.log("[ProfileSetup] upserting profile:", {
      id: user.id,
      email: user.email,
      name: name.trim(),
      roll_no: rollNo.trim() || null,
      branch,
      batch_year: Number(batchYear),
    });

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        name: name.trim(),
        roll_no: rollNo.trim() || null,
        branch,
        batch_year: Number(batchYear),
      },
      { onConflict: "id", ignoreDuplicates: false },
    );

    setLoading(false);

    if (upsertError) {
      console.error(
        "[ProfileSetup] upsert failed:",
        upsertError.code,
        upsertError.message,
      );
      setError("Failed to save profile. Please try again.");
      return;
    }

    console.log("[ProfileSetup] profile saved successfully — uid:", user.id);
    // AuthGate listens to profile state and will redirect to /experiences
    // once it re-fetches the profile. Force a reload of auth state:
    window.location.href = "/experiences";
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>M</div>
          <span style={styles.logoText}>PlaceMIT</span>
        </div>

        <p style={styles.subtitle}>
          Just a few details to complete your profile
          {email ? ` for ${email}` : ""}.
        </p>

        {error && <div style={styles.error}>{error}</div>}

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
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue →"}
        </button>
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
};
