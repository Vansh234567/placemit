import { useState } from "react";
import { useListExperiences, useCreateExperience } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListExperiencesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  Award,
  Briefcase,
  ChevronRight,
  IndianRupee,
  Search,
  PlusCircle,
  Lock,
  GraduationCap,
  BookOpen,
  Lightbulb,
  Star,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BRANCHES } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  companyName: string;
  role: string;
  packageOffered: string;
  cgpa: string;
  cgpaCriteria: string;
  eligibleBranches: string[];
  oaQuestions: string;
  interviewProcess: string;
  resourcesUsed: string;
  tips: string;
  rounds: string;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  role: "",
  packageOffered: "",
  cgpa: "",
  cgpaCriteria: "",
  eligibleBranches: [],
  oaQuestions: "",
  interviewProcess: "",
  resourcesUsed: "",
  tips: "",
  rounds: "3",
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Experiences() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isSenior = Number(profile?.year) >= 4;

  const { data: experiences, isLoading } = useListExperiences(
    debouncedSearch ? { search: debouncedSearch } : {},
  );

  const { mutateAsync: createExperience } = useCreateExperience();

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => setDebouncedSearch(val), 300));
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleBranch(branch: string) {
    setForm(prev => ({
      ...prev,
      eligibleBranches: prev.eligibleBranches.includes(branch)
        ? prev.eligibleBranches.filter(b => b !== branch)
        : [...prev.eligibleBranches, branch],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    if (!form.companyName.trim() || !form.role.trim() || !form.interviewProcess.trim()) {
      toast({ title: "Missing fields", description: "Company, role and interview process are required.", variant: "destructive" });
      return;
    }

    const cgpaNum = form.cgpa.trim() ? parseFloat(form.cgpa) : undefined;
    if (form.cgpa.trim() && (isNaN(cgpaNum!) || cgpaNum! < 0 || cgpaNum! > 10)) {
      toast({ title: "Invalid CGPA", description: "CGPA must be between 0 and 10.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await createExperience({
        data: {
          studentName: profile.name,
          companyName: form.companyName.trim(),
          role: form.role.trim(),
          rounds: parseInt(form.rounds) || 1,
          packageOffered: form.packageOffered.trim() || undefined,
          cgpa: cgpaNum,
          cgpaCriteria: form.cgpaCriteria.trim() || undefined,
          eligibleBranches: form.eligibleBranches.length > 0 ? form.eligibleBranches : undefined,
          oaQuestions: form.oaQuestions.trim() || undefined,
          interviewProcess: form.interviewProcess.trim() || undefined,
          resourcesUsed: form.resourcesUsed.trim() || undefined,
          tips: form.tips.trim() || undefined,
        },
      });

      await queryClient.invalidateQueries({ queryKey: getListExperiencesQueryKey() });
      toast({ title: "Experience shared!", description: "Thanks for helping your juniors." });
      setForm(EMPTY_FORM);
      setDialogOpen(false);
    } catch (err) {
      console.error("[submit experience]", err);
      toast({ title: "Submission failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Experiences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real accounts from MIT Manipal students — OT rounds, interview process, tips.
          </p>
        </div>

        {isSenior ? (
          <Button onClick={() => setDialogOpen(true)} className="shrink-0 gap-2">
            <PlusCircle className="w-4 h-4" />
            Share Experience
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed rounded-md px-3 py-2">
            <Lock className="w-3.5 h-3.5" />
            Only 4th-year students can submit
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by company or role…"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)
        ) : experiences?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg space-y-2">
            {debouncedSearch ? (
              <>
                <p className="text-base font-medium text-foreground">No experiences found for "{debouncedSearch}"</p>
                <p className="text-sm text-muted-foreground">Try a different company or role name.</p>
              </>
            ) : (
              <>
                <p className="text-base font-medium text-foreground">No experiences shared yet.</p>
                <p className="text-sm text-muted-foreground">Be the first senior to share an experience.</p>
              </>
            )}
          </div>
        ) : (
          experiences?.map(exp => <ExperienceCard key={exp.id} exp={exp} />)
        )}
      </div>

      {/* Submission Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Interview Experience</DialogTitle>
            <DialogDescription>
              Help your juniors prepare. Company, role and interview process are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">

            {/* ── Basic info ───────────────────────────────────────── */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
                  <Input
                    id="company"
                    placeholder="e.g. Google"
                    value={form.companyName}
                    onChange={e => setField("companyName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                  <Input
                    id="role"
                    placeholder="e.g. Software Engineer"
                    value={form.role}
                    onChange={e => setField("role", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="package">Package</Label>
                <Input
                  id="package"
                  placeholder="e.g. 45 LPA"
                  value={form.packageOffered}
                  onChange={e => setField("packageOffered", e.target.value)}
                />
              </div>
            </div>

            {/* ── 1. Eligibility ───────────────────────────────────── */}
            <div className="space-y-3">
              <FormSectionHeader number={1} title="Eligibility" />

              <div className="space-y-1.5">
                <Label htmlFor="cgpaCriteria">CGPA Criteria</Label>
                <Input
                  id="cgpaCriteria"
                  placeholder="e.g. 7.0 and above, No backlog, Open to all"
                  value={form.cgpaCriteria}
                  onChange={e => setField("cgpaCriteria", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">The minimum CGPA cutoff announced by the company</p>
              </div>

              <div className="space-y-2">
                <Label>
                  Branches Allowed
                  {form.eligibleBranches.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {form.eligibleBranches.length} selected
                    </span>
                  )}
                </Label>
                <div className="border rounded-md p-3 max-h-44 overflow-y-auto grid grid-cols-1 gap-2">
                  {BRANCHES.map(branch => (
                    <div key={branch} className="flex items-center gap-2">
                      <Checkbox
                        id={`branch-${branch}`}
                        checked={form.eligibleBranches.includes(branch)}
                        onCheckedChange={() => toggleBranch(branch)}
                      />
                      <label htmlFor={`branch-${branch}`} className="text-sm cursor-pointer leading-tight">
                        {branch}
                      </label>
                    </div>
                  ))}
                </div>
                {form.eligibleBranches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setField("eligibleBranches", [])}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>

            {/* ── 2. OT ────────────────────────────────────────────── */}
            <div className="space-y-3">
              <FormSectionHeader number={2} title="OT" />
              <div className="space-y-1.5">
                <Label htmlFor="ot">Questions Asked</Label>
                <Textarea
                  id="ot"
                  rows={3}
                  placeholder="Describe the online test — format, question types, difficulty, topics covered…"
                  value={form.oaQuestions}
                  onChange={e => setField("oaQuestions", e.target.value)}
                />
              </div>
            </div>

            {/* ── 3. Interview Process ─────────────────────────────── */}
            <div className="space-y-3">
              <FormSectionHeader number={3} title="Interview Process" />
              <div className="space-y-1.5">
                <Label htmlFor="rounds">Number of Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  min="1"
                  max="10"
                  value={form.rounds}
                  onChange={e => setField("rounds", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="process">
                  Round-wise Details <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="process"
                  rows={5}
                  placeholder="Walk through each round — what was asked, what they looked for, how long each round lasted…"
                  value={form.interviewProcess}
                  onChange={e => setField("interviewProcess", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ── 4. Resources Used ────────────────────────────────── */}
            <div className="space-y-3">
              <FormSectionHeader number={4} title="Resources Used" />
              <Textarea
                rows={2}
                placeholder="Books, courses, YouTube channels, LeetCode lists, mock interview tools…"
                value={form.resourcesUsed}
                onChange={e => setField("resourcesUsed", e.target.value)}
              />
            </div>

            {/* ── 5. Tips for Juniors ──────────────────────────────── */}
            <div className="space-y-3">
              <FormSectionHeader number={5} title="Tips for Juniors" />
              <Textarea
                rows={3}
                placeholder="What would you do differently? What gave you an edge? What tripped you up?"
                value={form.tips}
                onChange={e => setField("tips", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Experience"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Experience Card ───────────────────────────────────────────────────────────

type Exp = {
  id: number;
  studentName: string;
  studentAvatarUrl?: string | null;
  companyName: string;
  role: string;
  rounds: number;
  packageOffered?: string | null;
  cgpa?: number | null;
  cgpaCriteria?: string | null;
  eligibleBranches?: string[] | null;
  oaQuestions?: string | null;
  interviewProcess?: string | null;
  description?: string | null;
  resourcesUsed?: string | null;
  tips?: string | null;
  createdAt: string;
};

function ExperienceCard({ exp }: { exp: Exp }) {
  const [expanded, setExpanded] = useState(false);

  const processText = exp.interviewProcess || exp.description;
  const hasBranches = exp.eligibleBranches && exp.eligibleBranches.length > 0;
  const hasExtra = !!(exp.resourcesUsed || exp.tips);

  return (
    <Card className="overflow-hidden">
      {/* Header row */}
      <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {exp.studentName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-none">{exp.studentName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            {exp.companyName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5" />
            {exp.role}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b bg-muted/20">
        <Badge variant="outline" className="text-xs">{exp.rounds} Rounds</Badge>
        {exp.cgpa != null && (
          <Badge variant="outline" className="text-xs gap-1">
            <Star className="w-3 h-3" />
            My CGPA {exp.cgpa}
          </Badge>
        )}
        {exp.packageOffered && (
          <span className="ml-auto text-sm font-bold text-primary flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5" />
            {exp.packageOffered}
          </span>
        )}
      </div>

      {/* CGPA Criteria — prominent banner */}
      {exp.cgpaCriteria && (
        <div className="px-5 py-2.5 flex items-center gap-2 border-b bg-amber-500/5 border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            CGPA Criteria:
          </span>
          <span className="text-sm text-foreground/90">{exp.cgpaCriteria}</span>
        </div>
      )}

      {/* Eligible Branches */}
      {hasBranches && (
        <div className="px-5 py-3 border-b bg-muted/10">
          <div className="flex items-start gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Eligible Branches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {exp.eligibleBranches!.map(b => (
                  <Badge key={b} variant="secondary" className="text-xs font-normal">{b}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <CardContent className="p-5 space-y-4">
        {exp.oaQuestions && (
          <Section icon={<BookOpen className="w-4 h-4" />} title="OT Questions">
            {exp.oaQuestions}
          </Section>
        )}

        {processText && (
          <Section icon={<Award className="w-4 h-4" />} title="Interview Process">
            <Collapsible text={processText} maxLines={4} />
          </Section>
        )}

        {hasExtra && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-primary hover:underline"
          >
            Show resources & tips →
          </button>
        )}

        {expanded && (
          <>
            {exp.resourcesUsed && (
              <Section icon={<GraduationCap className="w-4 h-4" />} title="Resources Used">
                {exp.resourcesUsed}
              </Section>
            )}
            {exp.tips && (
              <Section icon={<Lightbulb className="w-4 h-4" />} title="Tips for Juniors">
                {exp.tips}
              </Section>
            )}
            <button onClick={() => setExpanded(false)} className="text-xs text-muted-foreground hover:underline">
              Show less
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FormSectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
        {number}
      </span>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
        {icon}
        {title}
      </h4>
      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-md px-4 py-3 border border-border/40">
        {children}
      </div>
    </div>
  );
}

function Collapsible({ text, maxLines }: { text: string; maxLines: number }) {
  const [open, setOpen] = useState(false);
  const lines = text.split("\n");
  const needsTrunc = lines.length > maxLines || text.length > 400;
  const shown = open ? text : lines.slice(0, maxLines).join("\n");

  return (
    <>
      <span>{shown}{!open && needsTrunc ? "…" : ""}</span>
      {needsTrunc && (
        <button
          onClick={() => setOpen(o => !o)}
          className="block mt-1 text-xs text-primary hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </>
  );
}
