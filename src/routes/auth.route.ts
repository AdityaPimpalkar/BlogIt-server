import { Router } from "express";
import AuthController from "@/controllers/auth.controller";

const authController = new AuthController();
const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

export default router;
