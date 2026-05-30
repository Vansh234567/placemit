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
  "CSE", "ECE", "MECH", "EEE", "CIVIL", "IT",
  "AI/ML", "VLSI", "MnC", "CSFT", "CCE",
];

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
