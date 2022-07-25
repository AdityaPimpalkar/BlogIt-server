import { Router } from "express";
import PostsController from "@/controllers/posts.controller";
import authMiddleware from "@/middlewares/auth.middleware";

const router = Router();
const postsController = new PostsController();

router.post("/", authMiddleware, postsController.createPost);
router.put("/", authMiddleware, postsController.updatePost);
router.delete("/:id", authMiddleware, postsController.deletePost);
router.get("/explore", postsController.explorePosts);
router.get("/explore/:id", postsController.explorePostById);
router.get("/homeposts", authMiddleware, postsController.getHomePosts);
router.get("/myposts", authMiddleware, postsController.getMyPosts);
router.get("/mydrafts", authMiddleware, postsController.getMyDrafts);
router.get("/edit/:id", authMiddleware, postsController.getPost);
router.get("/:id", authMiddleware, postsController.getPostById);
router.get("/", authMiddleware, postsController.getPosts);

export default router;
