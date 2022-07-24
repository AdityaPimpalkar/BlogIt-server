import { HttpException } from "@/exceptions/HttpException";
import Comments, {
  CreateComment,
  UpdateComment,
} from "@/interfaces/comments.interface";
import commentsModel, {
  validateCreateComment,
  validateUpdateComment,
} from "@/models/comments.model";
import postsModel from "@/models/posts.model";
import userModel from "@/models/users.model";
import { isEmpty } from "@/utils/util";
import { mongo, Schema } from "mongoose";

class CommentsService {
  private comments = commentsModel;
  private posts = postsModel;

  public createComment = async (
    commentBy: Schema.Types.ObjectId,
    comment: CreateComment
  ): Promise<Comments> => {
    if (isEmpty(comment))
      throw new HttpException(400, "No comment details in body.");

    const validation = validateCreateComment(comment);
    if (validation.error)
      throw new HttpException(
        400,
        `Invalid comment details - ${validation.error}`
      );

    const postExists = await this.posts.findById(comment.postId);

    if (!postExists) throw new HttpException(404, "Blog post does not exist.");

    const newComment = await this.comments.create({ ...comment, commentBy });

    return newComment;
  };

  public updateComment = async (
    commentBy: Schema.Types.ObjectId,
    comment: UpdateComment
  ): Promise<Comments> => {
    if (isEmpty(comment))
      throw new HttpException(400, "No comment details in body.");

    const validation = validateUpdateComment(comment);
    if (validation.error)
      throw new HttpException(
        400,
        `Invalid comment details - ${validation.error}`
      );

    const commentExists = await this.comments.findById(comment._id);
    if (!commentExists) throw new HttpException(404, "Comment does not exist.");

    const postExists = await this.posts.findById(commentExists.postId);
    if (!postExists) throw new HttpException(404, "Blog post does not exist.");

    if (JSON.stringify(commentBy) !== JSON.stringify(commentExists.commentBy))
      throw new HttpException(403, "Not authorized to update this comment.");

    const updatedComment = await this.comments
      .findByIdAndUpdate(comment._id, comment, {
        new: true,
        upsert: true,
      })
      .select({ commentBy: 0, __v: 0 });

    return updatedComment;
  };

  public deleteComment = async (
    commentBy: Schema.Types.ObjectId,
    commentId: string
  ): Promise<Comments> => {
    if (isEmpty(commentId))
      throw new HttpException(400, "No comment id found in request.");

    if (!mongo.ObjectId.isValid(commentId))
      throw new HttpException(400, "Invalid id.");

    const commentExists = await this.comments.findById(commentId);
    if (!commentExists) throw new HttpException(404, "Comment does not exist.");

    const postExists = await this.posts.findById(commentExists.postId);
    if (!postExists) throw new HttpException(404, "Blog post does not exist.");

    if (JSON.stringify(commentBy) !== JSON.stringify(commentExists.commentBy))
      throw new HttpException(403, "Not authorized to delete this comment.");

    const deletedComment = await this.comments
      .findByIdAndRemove(commentId)
      .select({ commentBy: 0, __v: 0 });

    return deletedComment;
  };

  public getCommentById = async (commentId: string): Promise<Comments> => {
    if (isEmpty(commentId))
      throw new HttpException(400, "No comment id found in request.");

    if (!mongo.ObjectId.isValid(commentId))
      throw new HttpException(400, "Invalid id.");

    const comment = await this.comments
      .findById(commentId)
      .select({ commentBy: 0, __v: 0 });

    if (!comment) throw new HttpException(404, "Comment does not exist.");

    return comment;
  };

  public getComments = async (postId: string): Promise<Comments[]> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    if (!mongo.ObjectId.isValid(postId))
      throw new HttpException(400, "Invalid id.");

    const postExists = await this.posts.findById(postId);
    if (!postExists) throw new HttpException(404, "Blog post does not exist.");

    const comments = await this.comments
      .find({ postId: postExists._id })
      .populate({
        path: "commentBy",
        select: "fullName avatar",
        model: userModel,
      })
      .select({
        _id: 1,
        comment: 1,
      });

    return comments;
  };
}

export default CommentsService;
