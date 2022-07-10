import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "@config";
import { HttpException } from "@exceptions/HttpException";
import { RequestWithUser, TokenData } from "@interfaces/auth.interface";
import userModel from "@models/users.model";

const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization = req.header("Authorization")
      ? req.header("Authorization").split("Bearer ")[1]
      : null;

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(
        Authorization,
        secretKey
      ) as TokenData;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        const user: TokenData = {
          _id: findUser._id,
          firstName: findUser.firstName,
          lastName: findUser.lastName,
          fullName: findUser.fullName,
          email: findUser.email,
          avatar: findUser.avatar,
        };
        req.user = user;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(401, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;
