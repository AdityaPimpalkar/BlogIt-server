import { Schema } from "mongoose";

export default interface Posts {
  _id: string;
  image: string;
  title: string;
  subTitle: string;
  description: string;
  isPublished: boolean;
  publishedOn: number;
  createdBy: Schema.Types.ObjectId;
}

export interface CreatePost {
  image: string;
  title: string;
  subTitle: string;
  description: string;
  isPublished: boolean;
  publishedOn: number;
  createdBy: Schema.Types.ObjectId;
}

export interface UpdatePost {
  _id: string;
  image: string;
  title: string;
  subTitle: string;
  description: string;
  isPublished: boolean;
  publishedOn: number;
}
