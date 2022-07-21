import { NextFunction, Request, Response } from "express";
import { UpdateUser, UserData } from "@/interfaces/users.interface";
import { RequestWithUser } from "@interfaces/auth.interface";
import UserService from "@/services/users.service";

class UserController {
  private userService = new UserService();

  public getUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user._id;
      const user: UserData = await this.userService.getUser(userId);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user: UpdateUser = req.body;
      const userId = req.user._id;
      const updatedUser: UserData = await this.userService.updateUser(
        userId,
        user
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  public followUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const followUserId: string = req.body.id;
      const userId = req.user._id;

      const updatedUser: UserData = await this.userService.followUser(
        followUserId,
        userId
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  public followingUsers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const followUserId: string = req.body.id;
      const userId = req.user._id;

      const users: UserData = await this.userService.followingUsers(userId);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
