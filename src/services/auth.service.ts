import { hash } from "bcrypt";
import userModel, { validate } from "@/models/users.model";
import { User, CreateUser } from "@interfaces/users.interface";
import { isEmpty } from "@utils/util";
import { HttpException } from "@exceptions/HttpException";

class AuthService {
  private users = userModel;

  public signup = async (user: CreateUser): Promise<User> => {
    if (isEmpty(user)) throw new HttpException(400, "User data not found");

    const validation = validate(user);

    if (validation.error)
      throw new HttpException(400, `Invalid user data - ${validation.error}`);

    const findUser: User = await this.users.findOne({ email: user.email });
    if (findUser)
      throw new HttpException(409, `You're email ${user.email} already exists`);

    const hashedPassword = await hash(user.password, 10);
    const createUserData: User = await this.users.create({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      password: hashedPassword,
    });

    return createUserData;
  };
}

export default AuthService;
