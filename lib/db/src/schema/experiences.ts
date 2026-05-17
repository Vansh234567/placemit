import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const experiencesTable = pgTable("experiences", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  studentAvatarUrl: text("student_avatar_url"),
  companyId: integer("company_id"),
  companyName: text("company_name").notNull(),
  role: text("role").notNull(),
  outcome: text("outcome").notNull(),
  rounds: integer("rounds").notNull().default(1),
  description: text("description"),
  tips: text("tips"),
  packageOffered: text("package_offered"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExperienceSchema = createInsertSchema(experiencesTable).omit({ id: true, createdAt: true });
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiencesTable.$inferSelect;
