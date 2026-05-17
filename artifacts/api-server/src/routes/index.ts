import { Router, type IRouter } from "express";
import healthRouter from "./health";
import companiesRouter from "./companies";
import studentsRouter from "./students";
import jobsRouter from "./jobs";
import postsRouter from "./posts";
import experiencesRouter from "./experiences";
import documentsRouter from "./documents";
import applicationsRouter from "./applications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(companiesRouter);
router.use(studentsRouter);
router.use(jobsRouter);
router.use(postsRouter);
router.use(experiencesRouter);
router.use(documentsRouter);
router.use(applicationsRouter);
router.use(dashboardRouter);

export default router;
