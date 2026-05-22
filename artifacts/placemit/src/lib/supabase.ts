import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://brojqiepxptzpewzfbna.supabase.co",
  "sb_publishable_MeHdeS-qvd2txHPMDLVV3w_ncRnGQoS"
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
