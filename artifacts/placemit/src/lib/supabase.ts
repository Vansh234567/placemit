import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl) {
  console.error("[supabase] VITE_SUPABASE_URL is not set. Check your environment variables.");
}
if (!supabaseAnonKey) {
  console.error("[supabase] VITE_SUPABASE_ANON_KEY is not set. Check your environment variables.");
}

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
);

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
  "Other",
] as const;

export type Branch = typeof BRANCHES[number];

/** Year stored as integer: 1=1st Year, 2=2nd Year, 3=3rd Year, 4=4th Year, 5=Graduated */
export const YEARS: { label: string; value: number }[] = [
  { label: "1st Year",  value: 1 },
  { label: "2nd Year",  value: 2 },
  { label: "3rd Year",  value: 3 },
  { label: "4th Year",  value: 4 },
  { label: "Graduated", value: 5 },
];

/** Convert stored year integer to display label */
export function yearToLabel(year: number | string | null | undefined): string {
  const n = Number(year);
  return YEARS.find(y => y.value === n)?.label ?? (year != null ? String(year) : "");
}

export type Profile = {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  roll_no?: string;
  linkedin_url?: string;
  created_at: string;
};
