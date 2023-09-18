import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken";
import { addGroup, deleteGroup, editGroup, getGroup } from "../controllers/group";

const router = Router();

router.post("/", authenticateToken, addGroup);
router.put("/:id", authenticateToken, editGroup);
router.delete("/:id", authenticateToken, deleteGroup);
router.get("/", authenticateToken, getGroup)

export default router;