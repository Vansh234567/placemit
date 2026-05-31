import { Router, type IRouter } from "express";
import { desc, count, sql, isNotNull, eq, and } from "drizzle-orm";
import { db, studentsTable, companiesTable, jobsTable, applicationsTable, postsTable, experiencesTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetRecentActivityResponse,
  GetTopCompaniesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [totalStudentsResult] = await db.select({ count: count() }).from(studentsTable);
  const [totalPlacedResult] = await db.select({ count: count() }).from(studentsTable).where(isNotNull(studentsTable.placedAt));
  const [totalCompaniesResult] = await db.select({ count: count() }).from(companiesTable);
  const [totalJobsResult] = await db.select({ count: count() }).from(jobsTable);
  const [activeAppsResult] = await db.select({ count: count() }).from(applicationsTable).where(sql`${applicationsTable.status} NOT IN ('selected', 'rejected')`);

  const totalStudents = totalStudentsResult?.count ?? 0;
  const totalPlaced = totalPlacedResult?.count ?? 0;
  const placementRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

  // Compute average package from actual placed students' packageOffered values
  const placedStudents = await db
    .select({ packageOffered: studentsTable.packageOffered })
    .from(studentsTable)
    .where(and(isNotNull(studentsTable.placedAt), isNotNull(studentsTable.packageOffered)));

  const packageNums = placedStudents
    .map(s => parseFloat((s.packageOffered ?? "").replace(/[^0-9.]/g, "")))
    .filter(n => !isNaN(n) && n > 0);

  const avgPackage =
    packageNums.length > 0
      ? `${(packageNums.reduce((a, b) => a + b, 0) / packageNums.length).toFixed(1)} LPA`
      : "N/A";

  const stats = {
    totalStudents,
    totalPlaced,
    totalCompanies: totalCompaniesResult?.count ?? 0,
    totalJobs: totalJobsResult?.count ?? 0,
    avgPackage,
    placementRate,
    activeApplications: activeAppsResult?.count ?? 0,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const recentStudents = await db.select().from(studentsTable).where(isNotNull(studentsTable.placedAt)).orderBy(desc(studentsTable.createdAt)).limit(3);
  const recentPosts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(3);
  const recentExperiences = await db.select().from(experiencesTable).orderBy(desc(experiencesTable.createdAt)).limit(2);

  const activities: Array<{id: number, type: string, message: string, actorName: string, actorAvatarUrl: string | null, createdAt: string}> = [];

  let idCounter = 1;
  for (const student of recentStudents) {
    activities.push({
      id: idCounter++,
      type: "placement",
      message: `${student.name} got placed at ${student.placedAt}${student.packageOffered ? ` for ${student.packageOffered}` : ""}`,
      actorName: student.name,
      actorAvatarUrl: student.avatarUrl ?? null,
      createdAt: student.createdAt.toISOString(),
    });
  }
  for (const post of recentPosts) {
    activities.push({
      id: idCounter++,
      type: "post",
      message: `${post.authorName} posted "${post.title}"`,
      actorName: post.authorName,
      actorAvatarUrl: post.authorAvatarUrl ?? null,
      createdAt: post.createdAt.toISOString(),
    });
  }
  for (const exp of recentExperiences) {
    activities.push({
      id: idCounter++,
      type: "experience",
      message: `${exp.studentName} shared their experience at ${exp.companyName} — ${exp.outcome}`,
      actorName: exp.studentName,
      actorAvatarUrl: exp.studentAvatarUrl ?? null,
      createdAt: exp.createdAt.toISOString(),
    });
  }

  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(GetRecentActivityResponse.parse(activities));
});

router.get("/dashboard/top-companies", async (req, res): Promise<void> => {
  // Compute placements count dynamically from experiences (selected outcome)
  // instead of relying on the static denormalized companies.placements_count column
  const rows = await db
    .select({
      companyId: companiesTable.id,
      companyName: companiesTable.name,
      logoUrl: companiesTable.logoUrl,
      avgPackage: companiesTable.avgPackage,
      placementsCount: sql<number>`cast(count(${experiencesTable.id}) as integer)`,
    })
    .from(companiesTable)
    .leftJoin(
      experiencesTable,
      and(
        eq(experiencesTable.companyId, companiesTable.id),
        eq(experiencesTable.outcome, "selected"),
      ),
    )
    .groupBy(
      companiesTable.id,
      companiesTable.name,
      companiesTable.logoUrl,
      companiesTable.avgPackage,
    )
    .orderBy(desc(sql`count(${experiencesTable.id})`))
    .limit(10);

  res.json(GetTopCompaniesResponse.parse(rows));
});

export default router;
