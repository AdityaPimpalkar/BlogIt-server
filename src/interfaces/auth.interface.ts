import { Request } from "express";
export interface Token {
  token: string;
  expiresIn: number;
}
export interface TokenData {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: TokenData;
}
