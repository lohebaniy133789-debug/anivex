import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import animelistRouter from "./animelist";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/profile", profileRouter);
router.use("/animelist", animelistRouter);

export default router;
