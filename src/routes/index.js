import { Router } from "express";
import health from "./health.js";
import userRouter from "./user.js";
import taskRouter from "./task.js";
import groupRouter from "./groups.js";

const baseRouter = Router();
baseRouter.use(health);
baseRouter.use("/user",userRouter);
baseRouter.use("/task",taskRouter);
baseRouter.use("/group", groupRouter);

export default baseRouter;
