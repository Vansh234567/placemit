import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  ListStudentsResponse,
  GetStudentResponse,
  GetStudentParams,
  CreateStudentBody,
  UpdateStudentParams,
  UpdateStudentBody,
  UpdateStudentResponse,
} from "@workspace/api-zod";
import { serializeDates, serializeRows } from "../lib/serialize";

const router: IRouter = Router();

router.get("/students", async (req, res): Promise<void> => {
  const students = await db.select().from(studentsTable).orderBy(desc(studentsTable.createdAt));
  res.json(ListStudentsResponse.parse(serializeRows(students)));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [student] = await db.insert(studentsTable).values(parsed.data).returning();
  res.status(201).json(GetStudentResponse.parse(serializeDates(student)));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(GetStudentResponse.parse(serializeDates(student)));
});

router.patch("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [student] = await db.update(studentsTable).set(parsed.data).where(eq(studentsTable.id, params.data.id)).returning();
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(UpdateStudentResponse.parse(serializeDates(student)));
});

export default router;
