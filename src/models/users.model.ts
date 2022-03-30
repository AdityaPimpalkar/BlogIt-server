import { Schema, Document, model } from "mongoose";
import Joi from "joi";
import {
  User,
  CreateUser,
  LoginUser,
  UpdateUser,
} from "@interfaces/users.interface";

const userSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
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
  email: Joi.string().email().required(),
  password: Joi.string().required(),
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
