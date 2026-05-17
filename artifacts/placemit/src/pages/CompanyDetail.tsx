import { useGetCompany, useListJobs, getGetCompanyQueryKey, getListJobsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Globe, Users, IndianRupee, ArrowLeft, Briefcase } from "lucide-react";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);
  
  const { data: company, isLoading: companyLoading } = useGetCompany(companyId, { 
    query: { enabled: !!id, queryKey: getGetCompanyQueryKey(companyId) } 
  });
  
  const { data: jobs, isLoading: jobsLoading } = useListJobs({ companyId }, {
    query: { enabled: !!id, queryKey: getListJobsQueryKey({ companyId }) }
  });

  if (companyLoading) {
    return <div className="space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link href="/companies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Companies
      </Link>

      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
            <Badge variant="outline">{company.sector}</Badge>
          </div>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-4 h-4 mr-1.5" />
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Users className="w-4 h-4" /> Total Placements
              </div>
              <p className="text-2xl font-bold">{company.placementsCount}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <IndianRupee className="w-4 h-4" /> Avg Package
              </div>
              <p className="text-2xl font-bold">{company.avgPackage || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About Company</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              {company.description ? (
                <div dangerouslySetInnerHTML={{ __html: company.description.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="italic">No description provided.</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Open Positions
            </h2>
            {jobsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : jobs && jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="hover-elevate transition-all duration-200 cursor-pointer">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <CardTitle className="text-base">{job.title}</CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-2">
                              <span>{job.location}</span>
                              {job.stipend && (
                                <>
                                  <span>&bull;</span>
                                  <span>{job.stipend}</span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant={job.type === 'full-time' ? 'default' : 'secondary'} className="capitalize">
                            {job.type.replace('-', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Briefcase className="w-8 h-8 mb-3 opacity-20" />
                  <p>No open positions at the moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}