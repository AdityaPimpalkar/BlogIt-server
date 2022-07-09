import { Request } from "express";
import { Schema } from "mongoose";
export interface Token {
  token: string;
  expiresIn: number;
}
export interface TokenData {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar: string;
}

export interface RequestWithUser extends Request {
  user: TokenData;
}
