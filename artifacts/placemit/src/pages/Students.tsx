import { useListStudents } from "@workspace/api-client-react";
import { yearToLabel } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Building2, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Students() {
  const { data: students, isLoading } = useListStudents();
  const [search, setSearch] = useState("");

  const filteredStudents = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase()) ||
      (s.placedAt && s.placedAt.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Directory
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with peers and view placement outcomes.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students, branches, companies..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))
          : filteredStudents?.map((student) => (
              <Link key={student.id} href={`/students/${student.id}`}>
                <Card className="h-full hover-elevate transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Avatar className="w-12 h-12 border border-border">
                        <AvatarImage src={student.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary font-medium">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {student.placedAt ? (
                        <Badge
                          variant="default"
                          className="bg-green-600/10 text-green-700 hover:bg-green-600/20 border-green-600/20"
                        >
                          Placed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Looking
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {student.branch} &bull; {student.year}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {student.placedAt ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md max-w-full">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{student.placedAt}</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground">
                        CGPA:{" "}
                        <span className="font-medium text-foreground">
                          {student.cgpa}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {filteredStudents?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No students found matching your search.
        </div>
      )}
    </div>
  );
}
