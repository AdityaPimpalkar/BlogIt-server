import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { SECRET_KEY } from "@config";
import userModel, {
  validateSignup,
  validateLogin,
  createToken,
} from "@/models/users.model";
import {
  User,
  UserData,
  SignupUser,
  CreateUser,
  LoginUser,
} from "@interfaces/users.interface";
import { Token, TokenData } from "@interfaces/auth.interface";
import { isEmpty } from "@utils/util";
import { HttpException } from "@exceptions/HttpException";

class AuthService {
  private users = userModel;

  public signup = async (user: CreateUser): Promise<SignupUser> => {
    if (isEmpty(user)) throw new HttpException(400, "Request body not found");

    const validation = validateSignup(user);

    if (validation.error)
      throw new HttpException(400, `Invalid user data - ${validation.error}`);

    const findUser: SignupUser = await this.users.findOne({
      email: user.email,
    });
    if (findUser)
      throw new HttpException(409, `Your email ${user.email} already exists`);

    const hashedPassword = await hash(user.password, 10);
    const createUserData: SignupUser = await this.users.create({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      password: hashedPassword,
    });

    return createUserData;
  };

  public login = async (
    user: LoginUser
  ): Promise<{ tokenData: Token; userData: UserData }> => {
    if (isEmpty(user)) throw new HttpException(400, "No login details in body");

    const validation = validateLogin(user);

    if (validation.error)
      throw new HttpException(400, `Invalid user data - ${validation.error}`);

    const findUser: User = await this.users.findOne({ email: user.email });
    if (!findUser)
      throw new HttpException(400, `Your email ${user.email} was not found.`);

    const passwordMatched = await compare(user.password, findUser.password);
    if (!passwordMatched) throw new HttpException(409, "Invalid password");

    const userData: UserData = {
      _id: findUser._id,
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      fullName: findUser.fullName,
      email: findUser.email,
      avatar: findUser.avatar,
    };

    const tokenData = createToken(userData);

    return { tokenData, userData };
  };
}

export default AuthService;
