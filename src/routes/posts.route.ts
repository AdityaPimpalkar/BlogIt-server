import { Router } from "express";
import PostsController from "@/controllers/posts.controller";
import authMiddleware from "@/middlewares/auth.middleware";

const router = Router();
const postsController = new PostsController();

router.post("/", authMiddleware, postsController.createPost);
router.put("/", authMiddleware, postsController.updatePost);
router.delete("/:id", authMiddleware, postsController.deletePost);
router.get("/:id", authMiddleware, postsController.getPostById);
router.get("/", authMiddleware, postsController.getPosts);

export default router;
