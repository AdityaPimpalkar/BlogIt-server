import { NextFunction, Request, Response } from "express";
import { CreateUser, LoginUser } from "@/interfaces/users.interface";
import AuthService from "@/services/auth.service";

class AuthController {
  public authService = new AuthService();

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUser = req.body;
      const user = await this.authService.signup(userData);

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginDetails: LoginUser = req.body;
      const user = await this.authService.login(loginDetails);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
