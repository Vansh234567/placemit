import { useGetJob, useCreateApplication, getListApplicationsQueryKey, getGetJobQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Clock, IndianRupee, ArrowLeft, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useGetJob(Number(id), { query: { enabled: !!id, queryKey: getGetJobQueryKey(Number(id)) } });
  
  const createApplication = useCreateApplication();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApply = () => {
    if (!job) return;
    createApplication.mutate({
      data: {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        studentId: 1, // Mock student
        studentName: "Student User",
      }
    }, {
      onSuccess: () => {
        toast({ title: "Application submitted successfully" });
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
      }
    });
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link href={`/companies/${job.companyId}`} className="font-medium text-foreground hover:underline flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {job.companyName}
            </Link>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            {job.stipend && (
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                {job.stipend}
              </div>
            )}
            <Badge variant={job.type === 'full-time' ? 'default' : 'secondary'} className="capitalize">
              {job.type.replace('-', ' ')}
            </Badge>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Button onClick={handleApply} disabled={createApplication.isPending} size="lg">
            <Send className="w-4 h-4 mr-2" />
            Apply Now
          </Button>
          {job.deadline && (
            <p className="text-xs font-medium text-destructive">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {job.description ? (
                <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {job.requirements ? (
                <div dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-muted-foreground italic">No specific requirements listed.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
           {/* Add company summary card here if we want */}
        </div>
      </div>
    </div>
  );
}