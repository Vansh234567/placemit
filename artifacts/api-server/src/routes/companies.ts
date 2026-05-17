import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, companiesTable } from "@workspace/db";
import {
  ListCompaniesResponse,
  GetCompanyResponse,
  GetCompanyParams,
  CreateCompanyBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/companies", async (req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).orderBy(desc(companiesTable.placementsCount));
  res.json(ListCompaniesResponse.parse(companies));
});

router.post("/companies", async (req, res): Promise<void> => {
  const parsed = CreateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [company] = await db.insert(companiesTable).values(parsed.data).returning();
  res.status(201).json(GetCompanyResponse.parse(company));
});

router.get("/companies/:id", async (req, res): Promise<void> => {
  const params = GetCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, params.data.id));
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  res.json(GetCompanyResponse.parse(company));
});

export default router;
