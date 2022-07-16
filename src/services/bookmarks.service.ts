import { HttpException } from "@/exceptions/HttpException";
import Bookmarks from "@/interfaces/bookmarks.interface";
import bookmarksModel from "@/models/bookmarks.model";
import postsModel from "@/models/posts.model";
import userModel from "@/models/users.model";
import { isEmpty } from "@/utils/util";
import { mongo, Schema } from "mongoose";

class BookmarksService {
  private posts = postsModel;
  private bookmarks = bookmarksModel;

  public createBookmark = async (
    bookmarkedBy: Schema.Types.ObjectId,
    postId: string
  ): Promise<Bookmarks> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    if (!mongo.ObjectId.isValid(postId))
      throw new HttpException(400, "Invalid id.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    const bookmarkExists = await this.bookmarks.where({
      post: postId,
      bookmarkedBy,
    });
    if (bookmarkExists.length > 0)
      throw new HttpException(409, "Post was already bookmarked.");

    const bookmarked = this.bookmarks.create({ post: postId, bookmarkedBy });

    return bookmarked;
  };

  public removeBookmark = async (
    bookmarkedBy: Schema.Types.ObjectId,
    bookmarkId: string
  ): Promise<Bookmarks> => {
    if (isEmpty(bookmarkId))
      throw new HttpException(400, "No bookmark id found in request.");

    if (!mongo.ObjectId.isValid(bookmarkId))
      throw new HttpException(400, "Invalid id.");

    const bookmarkExists = await this.bookmarks.findById(bookmarkId);
    if (!bookmarkExists)
      throw new HttpException(404, "Bookmarked post not found.");

    if (
      JSON.stringify(bookmarkedBy) !==
      JSON.stringify(bookmarkExists.bookmarkedBy)
    )
      throw new HttpException(403, "Not authorized to bookmark this post.");

    const bookmarked = await this.bookmarks.findByIdAndDelete(bookmarkId);

    return bookmarked;
  };

  public getBookmarks = async (
    bookmarkedBy: Schema.Types.ObjectId
  ): Promise<Bookmarks[]> => {
    const bookmarks = await this.bookmarks.where({ bookmarkedBy }).populate({
      path: "post",
      model: postsModel,
      populate: { path: "createdBy", model: userModel },
    });

    return bookmarks;
  };
}

export default BookmarksService;
