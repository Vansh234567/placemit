import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, applicationsTable } from "@workspace/db";
import { serializeDates, serializeRows } from "../lib/serialize";
import {
  ListApplicationsResponse,
  CreateApplicationBody,
  UpdateApplicationParams,
  UpdateApplicationBody,
  UpdateApplicationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (req, res): Promise<void> => {
  const applications = await db.select().from(applicationsTable).orderBy(desc(applicationsTable.appliedAt));
  res.json(ListApplicationsResponse.parse(serializeRows(applications)));
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [application] = await db.insert(applicationsTable).values(parsed.data).returning();
  res.status(201).json(serializeDates(application));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [application] = await db
    .update(applicationsTable)
    .set(parsed.data)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(UpdateApplicationResponse.parse(serializeDates(application)));
});

export default router;
