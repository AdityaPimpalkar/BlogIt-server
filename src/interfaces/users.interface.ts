import { Schema } from "mongoose";

export interface User {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  avatar: string;
  following: Array<string>;
}

export interface UserData {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar: string;
}

export interface SignupUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface LoginUser {
  email: string;
  password: string;
}
