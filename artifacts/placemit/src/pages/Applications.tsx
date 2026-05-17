import { useListApplications, useUpdateApplication, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, Briefcase } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ApplicationUpdateStatus } from "@workspace/api-client-react";

export default function Applications() {
  const { data: applications, isLoading } = useListApplications();
  const updateApp = useUpdateApplication();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateApp.mutate({
      id,
      data: { status: status as ApplicationUpdateStatus }
    }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'interview': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'selected': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications Tracker</h1>
        <p className="text-muted-foreground mt-2">Manage and track the status of your job applications.</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : applications?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground">
            You haven't applied to any jobs yet.
          </div>
        ) : (
          applications?.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-lg font-bold truncate text-foreground flex items-center gap-2">
                      {app.jobTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1.5" />
                        {app.companyName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 sm:border-l sm:pl-6">
                    <div className="flex flex-col items-end gap-2 w-full sm:w-[180px]">
                      <Badge variant="outline" className={`w-full justify-center py-1 font-semibold capitalize ${getStatusColor(app.status)}`}>
                        {app.status}
                      </Badge>
                      <Select 
                        defaultValue={app.status} 
                        onValueChange={(val) => handleStatusChange(app.id, val)}
                        disabled={updateApp.isPending}
                      >
                        <SelectTrigger className="h-8 text-xs font-medium bg-muted/50 w-full">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="selected">Selected</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}