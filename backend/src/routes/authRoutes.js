import { Router } from "express";
import { login, refresh, logout } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

export default router;
