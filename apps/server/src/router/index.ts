import { Router } from "express";
import gameRouter from "./game";
import authRouter from "./auth";
import userRouter from "./user";
import storageRouter from "./storage";
import managementRouter from "./management";
import adminRouter from "./admin";

const router = Router();

router.use("/games", gameRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/storage", storageRouter);
router.use("/management", managementRouter);
router.use("/admin", adminRouter);

export default router;
