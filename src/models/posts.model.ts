import Posts, { CreatePost, UpdatePost } from "@/interfaces/posts.interface";
import Joi from "joi";
import { Document, model, Schema } from "mongoose";

const postsSchema = new Schema({
  image: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subTitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
  publishedOn: {
    type: Number,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const postsModel = model<Posts & Document>("Posts", postsSchema);
export default postsModel;

const createPostSchema = Joi.object({
  image: Joi.string(),
  title: Joi.string().min(3).max(100).required(),
  subTitle: Joi.string().min(3).max(300),
  description: Joi.string().required(),
  isPublished: Joi.boolean().required(),
  publishedOn: Joi.number(),
});

const updatePostSchema = Joi.object({
  _id: Joi.string().not().empty().required(),
  image: Joi.string(),
  title: Joi.string().min(3).max(100).required(),
  subTitle: Joi.string().min(3).max(300),
  description: Joi.string().required(),
  isPublished: Joi.boolean().required(),
  publishedOn: Joi.number(),
});

export const validateCreatePost = (post: CreatePost) =>
  createPostSchema.validate(post);

export const validateUpdatePost = (post: UpdatePost) =>
  updatePostSchema.validate(post);
