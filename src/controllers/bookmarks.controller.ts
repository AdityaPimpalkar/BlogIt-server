import { RequestWithUser } from "@/interfaces/auth.interface";
import BookmarksService from "@/services/bookmarks.service";
import { NextFunction, Response } from "express";

class BookmarksController {
  private bookmarksService = new BookmarksService();

  public createBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const bookmarkedBy = req.user._id;
      const postId: string = req.body.postId;
      const newBookmark = await this.bookmarksService.createBookmark(
        bookmarkedBy,
        postId
      );
      res.status(200).send(newBookmark);
    } catch (error) {
      next(error);
    }
  };

  public removeBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const bookmarkedBy = req.user._id;
      const bookmarkId: string = req.params.id;
      const removedBookmark = await this.bookmarksService.removeBookmark(
        bookmarkedBy,
        bookmarkId
      );
      res.status(200).send(removedBookmark);
    } catch (error) {
      next(error);
    }
  };

  public getbookmarks = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const bookmarkedBy = req.user._id;
      const bookmarks = await this.bookmarksService.getBookmarks(bookmarkedBy);
      res.status(200).send(bookmarks);
    } catch (error) {
      next(error);
    }
  };
}

export default BookmarksController;
