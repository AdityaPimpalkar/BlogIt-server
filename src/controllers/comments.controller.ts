import { RequestWithUser } from "@/interfaces/auth.interface";
import { CreateComment, UpdateComment } from "@/interfaces/comments.interface";
import CommentsService from "@/services/comments.service";
import { NextFunction, Response } from "express";

export class CommentsController {
  private comments = new CommentsService();

  public createComment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const comment: CreateComment = req.body;
      const commentBy = req.user._id;

      const newComment = await this.comments.createComment(commentBy, comment);

      res.status(200).json(newComment);
    } catch (error) {
      next(error);
    }
  };

  public updateComment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const comment: UpdateComment = req.body;
      const commentBy = req.user._id;

      const updatedComment = await this.comments.updateComment(
        commentBy,
        comment
      );

      res.status(200).json(updatedComment);
    } catch (error) {
      next(error);
    }
  };

  public deleteComment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const commentBy = req.user._id;
      const commentId = req.params.id;

      const deletedComment = await this.comments.deleteComment(
        commentBy,
        commentId
      );

      res.status(200).json(deletedComment);
    } catch (error) {
      next(error);
    }
  };

  public getCommentById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const commentId = req.params.id;

      const deletedComment = await this.comments.getCommentById(commentId);

      res.status(200).json(deletedComment);
    } catch (error) {
      next(error);
    }
  };

  public getComments = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId: string = req.query.postId ? String(req.query.postId) : null;

      const comments = await this.comments.getComments(postId);

      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  };
}
