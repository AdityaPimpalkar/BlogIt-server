import { NextFunction, Request, request, Response, response } from "express";
import { User, CreateUser } from "@/interfaces/users.interface";
import AuthService from "@/services/auth.service";

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUser = req.body;
      const signUpUser: User = await this.authService.signup(userData);

      res.status(201).json(signUpUser);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
