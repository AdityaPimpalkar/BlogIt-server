import { Schema, Document, model } from "mongoose";
import Joi from "joi";
import { sign } from "jsonwebtoken";
import {
  User,
  CreateUser,
  LoginUser,
  UpdateUser,
  UserData,
} from "@interfaces/users.interface";
import { Token, TokenData } from "@/interfaces/auth.interface";
import { SECRET_KEY } from "@/config";

const userSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 30,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 30,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowerCase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    trim: true,
  },
});

const userModel = model<User & Document>("User", userSchema);
export default userModel;

const createUserSchema = Joi.object({
  firstName: Joi.string().required().min(3).max(30),
  lastName: Joi.string().required().min(3).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().required().min(3).max(30),
  lastName: Joi.string().required().min(3).max(30),
  avatar: Joi.string(),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateSignup = (user: CreateUser) =>
  createUserSchema.validate(user);

export const validateLogin = (user: LoginUser) =>
  loginUserSchema.validate(user);

export const validateUpdate = (user: UpdateUser) =>
  updateUserSchema.validate(user);

export const createToken = (user: UserData): Token => {
  const dataInToken: TokenData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
  };
  const secretKey: string = SECRET_KEY;
  const expiresIn: number = 60 * 60;

  return {
    token: sign(dataInToken, secretKey, { expiresIn }),
    expiresIn,
  };
};
