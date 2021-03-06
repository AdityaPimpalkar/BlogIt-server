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
    ref: "User",
  },
});

const commentsModel = model<Comments & Document>("Comments", commentSchema);
export default commentsModel;

const createCommentSchema = Joi.object({
  postId: Joi.string().not().empty().required(),
  comment: Joi.string().not().empty().required(),
});

const updateCommentSchema = Joi.object({
  _id: Joi.string().not().empty().required(),
  comment: Joi.string().not().empty().required(),
});

export const validateCreateComment = (comment: CreateComment) =>
  createCommentSchema.validate(comment);

export const validateUpdateComment = (comment: UpdateComment) =>
  updateCommentSchema.validate(comment);
