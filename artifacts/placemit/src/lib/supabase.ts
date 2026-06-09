import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl) {
  console.error(
    "[supabase] VITE_SUPABASE_URL is not set. Check your environment variables.",
  );
}
if (!supabaseAnonKey) {
  console.error(
    "[supabase] VITE_SUPABASE_ANON_KEY is not set. Check your environment variables.",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const ALLOWED_DOMAIN = "learner.manipal.edu";

export const BRANCHES = [
  "Aeronautical Engineering",
  "Automobile Engineering",
  "Biomedical Engineering",
  "Biotechnology",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Science & Engineering",
  "Computer Science & Engineering (AI & ML)",
  "Computer Science & Communication Engineering",
  "Computer Science & Financial Technology",
  "Cyber Physical Systems",
  "Data Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Electronics & Instrumentation Engineering",
  "Electronics Engineering (VLSI Design and Technology)",
  "Industrial Engineering",
  "Information Technology",
  "Mathematics & Computing",
  "Mechanical Engineering",
  "Mechatronics",
] as const;

export type Branch = (typeof BRANCHES)[number];

/** Year stored as integer: 1=1st Year, 2=2nd Year, 3=3rd Year, 4=4th Year, 5=Graduated */
export const YEARS: { label: string; value: number }[] = [
  { label: "2030 batch", value: 1 },
  { label: "2029 batch", value: 2 },
  { label: "2028 batch", value: 3 },
  { label: "2027 batch", value: 4 },
  { label: "2026 batch", value: 5 },
  { label: "2025 batch", value: 6 },
  { label: "2024 batch", value: 7 },
  { label: "2023 batch", value: 8 },
  { label: "2022 batch", value: 9 },
  { label: "2021 batch", value: 10 },
  { label: "2020 batch", value: 11 },
  { label: "Earlier batch", value: 12 },
];

/** Convert stored year integer to display label */
export function yearToLabel(year: number | string | null | undefined): string {
  const n = Number(year);
  return (
    YEARS.find((y) => y.value === n)?.label ??
    (year != null ? String(year) : "")
  );
}

export type Profile = {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  batch_year: number | null;
  roll_no: string | null;
};
