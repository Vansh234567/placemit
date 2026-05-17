import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, experiencesTable } from "@workspace/db";
import { serializeDates, serializeRows } from "../lib/serialize";
import {
  ListExperiencesResponse,
  GetExperienceResponse,
  GetExperienceParams,
  CreateExperienceBody,
  ListExperiencesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/experiences", async (req, res): Promise<void> => {
  const queryParams = ListExperiencesQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }
  let query = db.select().from(experiencesTable).$dynamic();
  if (queryParams.data.outcome) {
    query = query.where(eq(experiencesTable.outcome, queryParams.data.outcome));
  }
  const experiences = await query.orderBy(desc(experiencesTable.createdAt));
  res.json(ListExperiencesResponse.parse(serializeRows(experiences)));
});

router.post("/experiences", async (req, res): Promise<void> => {
  const parsed = CreateExperienceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [experience] = await db.insert(experiencesTable).values(parsed.data).returning();
  res.status(201).json(GetExperienceResponse.parse(serializeDates(experience)));
});

router.get("/experiences/:id", async (req, res): Promise<void> => {
  const params = GetExperienceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [experience] = await db.select().from(experiencesTable).where(eq(experiencesTable.id, params.data.id));
  if (!experience) {
    res.status(404).json({ error: "Experience not found" });
    return;
  }
  res.json(GetExperienceResponse.parse(serializeDates(experience)));
});

export default router;
