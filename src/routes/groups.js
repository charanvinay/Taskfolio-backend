import { Router } from "express";
import {
  addGroup,
  deleteGroup,
  editGroup,
  getGroup,
  getGroupDetails,
  getMembers,
  leaveGroup,
} from "../controllers/group";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.post("/", authenticateToken, addGroup);
router.put("/:id", authenticateToken, editGroup);

router.delete("/:id", authenticateToken, deleteGroup);
router.delete("/:id/:uid", authenticateToken, leaveGroup);

router.get("/", authenticateToken, getGroup);
router.get("/:id", authenticateToken, getGroupDetails);
router.get("/:id/members", authenticateToken, getMembers);

export default router;
