import { CommentsController } from "@/controllers/comments.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();
const commentsController = new CommentsController();

router.post("/", authMiddleware, commentsController.createComment);
router.put("/", authMiddleware, commentsController.updateComment);
router.delete("/:id", authMiddleware, commentsController.deleteComment);
router.get("/:id", authMiddleware, commentsController.getCommentById);
router.get("/", authMiddleware, commentsController.getComments);

export default router;
