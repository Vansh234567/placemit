import { useListCompanies } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Building2, IndianRupee, Users } from "lucide-react";
import { Link } from "wouter";

export default function Companies() {
  const { data: companies, isLoading } = useListCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-2">Explore visiting recruiters and their placement track records.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-56 w-full" />)
        ) : (
          companies?.map((company) => (
            <Card key={company.id} className="flex flex-col hover-elevate transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold line-clamp-1">{company.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{company.sector}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-center p-3 rounded-md bg-muted/50">
                    <div className="flex justify-center items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      Placed
                    </div>
                    <p className="font-semibold text-foreground">{company.placementsCount}</p>
                  </div>
                  <div className="space-y-1 text-center p-3 rounded-md bg-muted/50">
                    <div className="flex justify-center items-center gap-1.5 text-xs text-muted-foreground">
                      <IndianRupee className="w-3.5 h-3.5" />
                      Avg Pkg
                    </div>
                    <p className="font-semibold text-foreground">{company.avgPackage || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/companies/${company.id}`} className="w-full">
                  <Button className="w-full" variant="secondary">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}