import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rollNo: text("roll_no").notNull().unique(),
  branch: text("branch").notNull(),
  year: integer("year").notNull(),
  cgpa: real("cgpa").notNull(),
  bio: text("bio"),
  skills: text("skills"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  resumeUrl: text("resume_url"),
  placedAt: text("placed_at"),
  packageOffered: text("package_offered"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
