import { supabase } from "./supabase";

export type Experience = {
  id: number;
  studentName: string;
  companyName: string;
  role: string;
  rounds: number;
  description?: string | null;
  interviewProcess?: string | null;
  oaQuestions?: string | null;
  cgpaCriteria?: string | null;
  eligibleBranches?: string[] | null;
  cgpa?: number | null;
  packageOffered?: string | null;
  resourcesUsed?: string | null;
  tips?: string | null;
  createdAt: string;
};

type InsertExperience = {
  studentName: string;
  companyName: string;
  role: string;
  rounds: number;
  packageOffered?: string;
  cgpa?: number;
  cgpaCriteria?: string;
  eligibleBranches?: string[];
  oaQuestions?: string;
  interviewProcess?: string;
  resourcesUsed?: string;
  tips?: string;
};

function mapRow(row: Record<string, unknown>): Experience {
  return {
    id: row.id as number,
    studentName: row.student_name as string,
    companyName: row.company as string,
    role: row.role as string,
    rounds: row.rounds as number,
    description: row.description as string | null,
    interviewProcess: row.interview_process as string | null,
    oaQuestions: row.oa_questions as string | null,
    cgpaCriteria: row.cgpa_criteria as string | null,
    eligibleBranches: row.eligible_branches as string[] | null,
    cgpa: row.cgpa as number | null,
    packageOffered: row.package_offered as string | null,
    resourcesUsed: row.resources_used as string | null,
    tips: row.tips as string | null,
    createdAt: row.created_at as string,
  };
}

export async function listExperiences(search?: string): Promise<Experience[]> {
  let query = supabase
    .from("experiences")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    const term = search.trim();
    query = query.or(`company.ilike.%${term}%,role.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function createExperience(input: InsertExperience): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .insert({
      student_name: input.studentName,
      company: input.companyName,
      role: input.role,
      rounds: input.rounds,
      package_offered: input.packageOffered ?? null,
      cgpa: input.cgpa ?? null,
      cgpa_criteria: input.cgpaCriteria ?? null,
      eligible_branches: input.eligibleBranches ?? null,
      oa_questions: input.oaQuestions ?? null,
      interview_process: input.interviewProcess ?? null,
      resources_used: input.resourcesUsed ?? null,
      tips: input.tips ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}
