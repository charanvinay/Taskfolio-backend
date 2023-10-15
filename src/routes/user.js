import { Router } from "express";
import { getAllUsers, getUserDetails, login, logout, registerUser, update } from "../controllers/auth.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/:id", authenticateToken, getUserDetails);
router.put("/:id", authenticateToken, update);
router.get("/", authenticateToken, getAllUsers);

export default router;
