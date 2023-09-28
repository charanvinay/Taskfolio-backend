import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import { addTask, deleteTask, editTask, getFormNames, getTask } from "../controllers/task.js";
const router = Router();

router.post("/", authenticateToken, addTask);
router.put("/:id", authenticateToken, editTask);
router.delete("/:groupId/:id", authenticateToken, deleteTask);
router.get("/", authenticateToken, getTask)
router.get("/getFormNames", authenticateToken, getFormNames)

export default router;