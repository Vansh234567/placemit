import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Clock, IndianRupee } from "lucide-react";
import { Link } from "wouter";

export default function Jobs() {
  const { data: jobs, isLoading } = useListJobs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
          <p className="text-muted-foreground mt-2">Discover and apply to open positions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : (
          jobs?.map((job) => (
            <Card key={job.id} className="flex flex-col hover-elevate transition-all duration-200">
              <CardHeader className="flex-1 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                      {job.title}
                    </CardTitle>
                    <Link href={`/companies/${job.companyId}`} className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.companyName}
                    </Link>
                  </div>
                  <Badge variant={job.type === 'full-time' ? 'default' : 'secondary'} className="capitalize shrink-0">
                    {job.type.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </div>
                  {job.stipend && (
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.stipend}
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-1 text-destructive font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Ends {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardFooter className="pt-4 border-t">
                <Link href={`/jobs/${job.id}`} className="w-full">
                  <Button className="w-full" variant="outline">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}