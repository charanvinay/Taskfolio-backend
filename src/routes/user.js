import { Router } from "express";
import { getAllUsers, getUserDetails, login, logout, registerUser } from "../controllers/auth.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getUserDetails", authenticateToken, getUserDetails);
router.get("/", authenticateToken, getAllUsers);

export default router;
