import Comments, {
  CreateComment,
  UpdateComment,
} from "@/interfaces/comments.interface";
import Joi from "joi";
import { Document, model, Schema } from "mongoose";

const commentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  commentBy: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const commentsModel = model<Comments & Document>("Comments", commentSchema);
export default commentsModel;

const createCommentSchema = Joi.object({
  postId: Joi.string().required(),
  comment: Joi.string().required(),
  commentBy: Joi.string().required(),
});

const updateCommentSchema = Joi.object({
  _id: Joi.string().required(),
  comment: Joi.string().required(),
});

export const validateCreateComment = (comment: CreateComment) =>
  createCommentSchema.validate(comment);

export const validateUpdateComment = (comment: UpdateComment) =>
  updateCommentSchema.validate(comment);
