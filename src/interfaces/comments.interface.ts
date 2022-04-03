import { Schema } from "mongoose";

export default interface Comments {
  _id: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  comment: string;
  commentBy: Schema.Types.ObjectId;
}

export interface CreateComment {
  postId: Schema.Types.ObjectId;
  comment: string;
  commentBy: Schema.Types.ObjectId;
}

export interface UpdateComment {
  _id: Schema.Types.ObjectId;
  comment: string;
}
