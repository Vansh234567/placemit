import { useListExperiences, getListExperiencesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Award, Briefcase, ChevronRight, IndianRupee } from "lucide-react";

export default function Experiences() {
  const { data: experiences, isLoading } = useListExperiences();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Experiences</h1>
        <p className="text-muted-foreground mt-2">Learn from your peers' interview rounds and read their tips.</p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : experiences?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No interview experiences shared yet.
          </div>
        ) : (
          experiences?.map((exp) => (
            <Card key={exp.id} className="overflow-hidden">
              <div className="bg-muted/30 p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border border-background shadow-sm">
                    <AvatarImage src={exp.studentAvatarUrl || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {exp.studentName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{exp.studentName}</p>
                    <p className="text-xs text-muted-foreground">Shared on {new Date(exp.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-sm font-medium">
                    <Building2 className="w-4 h-4 mr-1.5 text-muted-foreground" />
                    {exp.companyName}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center text-sm font-medium">
                    <Briefcase className="w-4 h-4 mr-1.5 text-muted-foreground" />
                    {exp.role}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex gap-2">
                    <Badge 
                      className="px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                      variant={
                        exp.outcome === 'selected' ? 'default' : 
                        exp.outcome === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {exp.outcome}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      {exp.rounds} Rounds
                    </Badge>
                  </div>
                  {exp.packageOffered && (
                    <div className="text-sm font-bold flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {exp.packageOffered}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {exp.description && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-primary" /> 
                        Interview Process
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-4 rounded-lg border border-border/50">
                        {exp.description}
                      </p>
                    </div>
                  )}
                  
                  {exp.tips && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">
                        Preparation Tips
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {exp.tips}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}