import { Router } from "express";
import { forgotPassword, getAllUsers, getUserDetails, login, logout, registerUser, resetPassword, update, verifyLink } from "../controllers/auth.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.get("/resetPassword/:id/:token", verifyLink);
router.post("/resetPassword/:id/:token", resetPassword);
router.post("/logout", logout);
router.get("/:id", authenticateToken, getUserDetails);
router.put("/:id", authenticateToken, update);
router.get("/", authenticateToken, getAllUsers);

export default router;
