import { Router } from "express";
import AuthController from "@/controllers/auth.controller";

const authController = new AuthController();
const router = Router();

router.post("/signup", authController.signUp);

export default router;
