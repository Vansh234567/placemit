import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listExperiences,
  createExperience,
  type Experience,
} from "@/lib/supabase-experiences";
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

export default function Experiences() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isSenior = Number(profile?.year) >= 4;

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["experiences", debouncedSearch],
    queryFn: () => listExperiences(debouncedSearch || undefined),
  });

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => setDebouncedSearch(val), 300));
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleBranch(branch: string) {
    setForm((prev) => ({
      ...prev,
      eligibleBranches: prev.eligibleBranches.includes(branch)
        ? prev.eligibleBranches.filter((b) => b !== branch)
        : [...prev.eligibleBranches, branch],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    if (
      !form.companyName.trim() ||
      !form.role.trim() ||
      !form.interviewProcess.trim()
    ) {
      toast({
        title: "Missing fields",
        description: "Company, role and interview process are required.",
        variant: "destructive",
      });
      return;
    }

    const cgpaNum = form.cgpa.trim() ? parseFloat(form.cgpa) : undefined;
    if (
      form.cgpa.trim() &&
      (isNaN(cgpaNum!) || cgpaNum! < 0 || cgpaNum! > 10)
    ) {
      toast({
        title: "Invalid CGPA",
        description: "CGPA must be between 0 and 10.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createExperience({
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        rounds: parseInt(form.rounds) || 1,
        packageOffered: form.packageOffered.trim() || undefined,
        cgpa: cgpaNum,
        cgpaCriteria: form.cgpaCriteria.trim() || undefined,
        eligibleBranches:
          form.eligibleBranches.length > 0 ? form.eligibleBranches : undefined,
        oaQuestions: form.oaQuestions.trim() || undefined,
        interviewProcess: form.interviewProcess.trim() || undefined,
        resourcesUsed: form.resourcesUsed.trim() || undefined,
        tips: form.tips.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast({
        title: "Experience shared!",
        description: "Thanks for helping your juniors.",
      });
      setForm(EMPTY_FORM);
      setDialogOpen(false);
    } catch (err) {
      console.error("[submit experience]", err);
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Interview Experiences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real accounts from MIT Manipal students — OT rounds, interview
            process, tips.
          </p>
        </div>

        {isSenior ? (
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full sm:w-auto shrink-0 gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Share Experience
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed rounded-md px-3 py-2 w-full sm:w-auto">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Only 4th-year students can submit
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 w-full"
          placeholder="Search by company or role…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-4 w-full">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : experiences?.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg space-y-2 px-4">
            {debouncedSearch ? (
              <>
                <p className="text-base font-medium text-foreground break-words">
                  No experiences found for "{debouncedSearch}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Try a different company or role name.
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-medium text-foreground">
                  No experiences shared yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Be the first senior to share an experience.
                </p>
              </>
            )}
          </div>
        ) : (
          experiences?.map((exp) => <ExperienceCard key={exp.id} exp={exp} />)
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Share Your Interview Experience</DialogTitle>
            <DialogDescription>
              Help your juniors prepare. Company, role and interview process are
              required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            {/* Basic info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g. Google"
                    value={form.companyName}
                    onChange={(e) => setField("companyName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g. Software Engineer"
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
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
                  onChange={(e) => setField("packageOffered", e.target.value)}
                />
              </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-3">
              <FormSectionHeader number={1} title="Eligibility" />
              <div className="space-y-1.5">
                <Label htmlFor="cgpaCriteria">CGPA Criteria</Label>
                <Input
                  id="cgpaCriteria"
                  placeholder="e.g. 7.0 and above, No backlog, Open to all"
                  value={form.cgpaCriteria}
                  onChange={(e) => setField("cgpaCriteria", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The minimum CGPA cutoff announced by the company
                </p>
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
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto grid grid-cols-1 gap-2">
                  {BRANCHES.map((branch) => (
                    <div key={branch} className="flex items-center gap-2">
                      <Checkbox
                        id={`branch-${branch}`}
                        checked={form.eligibleBranches.includes(branch)}
                        onCheckedChange={() => toggleBranch(branch)}
                      />
                      <label
                        htmlFor={`branch-${branch}`}
                        className="text-sm cursor-pointer leading-tight"
                      >
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

            {/* OT */}
            <div className="space-y-3">
              <FormSectionHeader number={2} title="OT" />
              <div className="space-y-1.5">
                <Label htmlFor="ot">Questions Asked</Label>
                <Textarea
                  id="ot"
                  rows={3}
                  placeholder="Describe the online test — format, question types, difficulty, topics covered…"
                  value={form.oaQuestions}
                  onChange={(e) => setField("oaQuestions", e.target.value)}
                />
              </div>
            </div>

            {/* Interview Process */}
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
                  onChange={(e) => setField("rounds", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="process">
                  Round-wise Details <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="process"
                  rows={4}
                  placeholder="Walk through each round — what was asked, what they looked for, how long each round lasted…"
                  value={form.interviewProcess}
                  onChange={(e) => setField("interviewProcess", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <FormSectionHeader number={4} title="Resources Used" />
              <Textarea
                rows={2}
                placeholder="Books, courses, YouTube channels, LeetCode lists, mock interview tools…"
                value={form.resourcesUsed}
                onChange={(e) => setField("resourcesUsed", e.target.value)}
              />
            </div>

            {/* Tips */}
            <div className="space-y-3">
              <FormSectionHeader number={5} title="Tips for Juniors" />
              <Textarea
                rows={3}
                placeholder="What would you do differently? What gave you an edge? What tripped you up?"
                value={form.tips}
                onChange={(e) => setField("tips", e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? "Submitting…" : "Submit Experience"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExperienceCard({ exp }: { exp: Experience }) {
  const [expanded, setExpanded] = useState(false);
  const processText = exp.interviewProcess || exp.description;
  const hasBranches = exp.eligibleBranches && exp.eligibleBranches.length > 0;
  const hasExtra = !!(exp.resourcesUsed || exp.tips);

  return (
    <Card className="overflow-hidden w-full">
      {/* Header row */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {String(exp.batchYear ?? "?").slice(-2)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-none truncate">
              {exp.batchYear ? `${exp.batchYear} Batch` : "MIT Student"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(exp.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {exp.companyName}
            </span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">
              {exp.role}
            </span>
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center gap-2 border-b bg-muted/20">
        <Badge variant="outline" className="text-xs">
          {exp.rounds} Rounds
        </Badge>
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

      {/* CGPA criteria */}
      {exp.cgpaCriteria && (
        <div className="px-4 sm:px-5 py-2.5 flex items-start gap-2 border-b bg-amber-500/5 border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 shrink-0">
            CGPA Criteria:
          </span>
          <span className="text-sm text-foreground/90 break-words">
            {exp.cgpaCriteria}
          </span>
        </div>
      )}

      {/* Eligible branches */}
      {hasBranches && (
        <div className="px-4 sm:px-5 py-3 border-b bg-muted/10">
          <div className="flex items-start gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Eligible Branches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {exp.eligibleBranches!.map((b) => (
                  <Badge
                    key={b}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <CardContent className="p-4 sm:p-5 space-y-4">
        {exp.oaQuestions && (
          <Section icon={<BookOpen className="w-4 h-4" />} title="OT Questions">
            {exp.oaQuestions}
          </Section>
        )}

        {processText && (
          <Section
            icon={<Award className="w-4 h-4" />}
            title="Interview Process"
          >
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
              <Section
                icon={<GraduationCap className="w-4 h-4" />}
                title="Resources Used"
              >
                {exp.resourcesUsed}
              </Section>
            )}
            {exp.tips && (
              <Section
                icon={<Lightbulb className="w-4 h-4" />}
                title="Tips for Juniors"
              >
                {exp.tips}
              </Section>
            )}
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              Show less
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FormSectionHeader({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
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

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
        {icon}
        {title}
      </h4>
      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words bg-muted/30 rounded-md px-3 sm:px-4 py-3 border border-border/40">
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
      <span className="break-words">
        {shown}
        {!open && needsTrunc ? "…" : ""}
      </span>
      {needsTrunc && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="block mt-1 text-xs text-primary hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </>
  );
}
