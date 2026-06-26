import {
  useGetStudent,
  getGetStudentQueryKey,
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { yearToLabel } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  GraduationCap,
  IndianRupee,
  FileText,
  Linkedin,
} from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const { data: student, isLoading } = useGetStudent(studentId, {
    query: { enabled: !!id, queryKey: getGetStudentQueryKey(studentId) },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/students"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Directory
      </Link>

      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
              <AvatarImage src={student.avatarUrl || ""} />
              <AvatarFallback className="text-3xl bg-muted font-semibold">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            {student.placedAt && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent px-3 py-1 text-sm font-semibold shadow-sm">
                Placed
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {student.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {student.branch} &bull; {student.year}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {student.linkedinUrl && (
                <a
                  href={student.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#0A66C2] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              )}
              {student.githubUrl && (
                <a
                  href={student.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SiGithub className="w-5 h-5" />
                  GitHub
                </a>
              )}
              {student.resumeUrl && (
                <a
                  href={student.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Resume
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {student.bio ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {student.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No bio provided.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {student.skills ? (
                <div className="flex flex-wrap gap-2">
                  {student.skills.split(",").map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 text-sm font-medium bg-secondary/50"
                    >
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No skills listed.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Academic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    CGPA
                  </p>
                  <p className="font-semibold">{student.cgpa}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Roll Number
                  </p>
                  <p className="font-semibold">{student.rollNo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {student.placedAt && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Placement Offer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Company
                  </p>
                  <p className="text-lg font-bold">{student.placedAt}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
