import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, postsTable, commentsTable } from "@workspace/db";
import {
  ListPostsResponse,
  GetPostResponse,
  GetPostParams,
  CreatePostBody,
  DeletePostParams,
  UpvotePostParams,
  UpvotePostResponse,
  ListPostsQueryParams,
  GetTrendingPostsResponse,
  ListCommentsResponse,
  ListCommentsParams,
  CreateCommentBody,
  CreateCommentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts/trending", async (req, res): Promise<void> => {
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.upvotes)).limit(10);
  res.json(GetTrendingPostsResponse.parse(posts));
});

router.get("/posts", async (req, res): Promise<void> => {
  const queryParams = ListPostsQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }
  let query = db.select().from(postsTable).$dynamic();
  if (queryParams.data.category) {
    query = query.where(eq(postsTable.category, queryParams.data.category));
  }
  const posts = await query.orderBy(desc(postsTable.createdAt));
  res.json(ListPostsResponse.parse(posts));
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [post] = await db.insert(postsTable).values(parsed.data).returning();
  res.status(201).json(GetPostResponse.parse(post));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(GetPostResponse.parse(post));
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db.delete(postsTable).where(eq(postsTable.id, params.data.id)).returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/posts/:id/upvote", async (req, res): Promise<void> => {
  const params = UpvotePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db
    .update(postsTable)
    .set({ upvotes: sql`${postsTable.upvotes} + 1` })
    .where(eq(postsTable.id, params.data.id))
    .returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(UpvotePostResponse.parse(post));
});

// Comments
router.get("/posts/:postId/comments", async (req, res): Promise<void> => {
  const params = ListCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const comments = await db.select().from(commentsTable).where(eq(commentsTable.postId, params.data.postId)).orderBy(desc(commentsTable.createdAt));
  res.json(ListCommentsResponse.parse(comments));
});

router.post("/posts/:postId/comments", async (req, res): Promise<void> => {
  const params = CreateCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [comment] = await db
    .insert(commentsTable)
    .values({ ...parsed.data, postId: params.data.postId })
    .returning();
  // increment commentsCount
  await db.update(postsTable).set({ commentsCount: sql`${postsTable.commentsCount} + 1` }).where(eq(postsTable.id, params.data.postId));
  res.status(201).json(comment);
});

export default router;
