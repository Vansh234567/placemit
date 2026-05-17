import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import { serializeDates, serializeRows } from "../lib/serialize";
import {
  ListDocumentsResponse,
  CreateDocumentBody,
  DeleteDocumentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/documents", async (req, res): Promise<void> => {
  const documents = await db.select().from(documentsTable).orderBy(desc(documentsTable.createdAt));
  res.json(ListDocumentsResponse.parse(serializeRows(documents)));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [document] = await db.insert(documentsTable).values(parsed.data).returning();
  res.status(201).json(serializeDates(document));
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [doc] = await db.delete(documentsTable).where(eq(documentsTable.id, params.data.id)).returning();
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
