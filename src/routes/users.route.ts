import { Router } from "express";
import UserController from "@/controllers/users.controller";
import authMiddleware from "@/middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

router.get("/", authMiddleware, userController.getUser);
router.put("/", authMiddleware, userController.updateUser);
router.get("/follow", authMiddleware, userController.followingUsers);
router.put("/follow", authMiddleware, userController.followUser);

export default router;
