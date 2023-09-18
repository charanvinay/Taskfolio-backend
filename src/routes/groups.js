import { Router } from "express";
import {
    addGroup,
    deleteGroup,
    editGroup,
    getGroup,
    getMembers,
} from "../controllers/group";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.post("/", authenticateToken, addGroup);
router.put("/:id", authenticateToken, editGroup);
router.delete("/:id", authenticateToken, deleteGroup);
router.get("/", authenticateToken, getGroup);
router.get("/:id/members", authenticateToken, getMembers);

export default router;
