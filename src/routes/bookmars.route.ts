import BookmarksController from "@/controllers/bookmarks.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();
const bookmarksController = new BookmarksController();

router.post("/", authMiddleware, bookmarksController.createBookmark);
router.delete("/:id", authMiddleware, bookmarksController.removeBookmark);
router.get("/", authMiddleware, bookmarksController.getbookmarks);

export default router;
