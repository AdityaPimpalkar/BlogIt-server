import { UpdateUser, UserData } from "@/interfaces/users.interface";
import userModel, { validateUpdate } from "@/models/users.model";
import { isEmpty } from "@/utils/util";
import { HttpException } from "@/exceptions/HttpException";
import { mongo, Schema } from "mongoose";

class UserService {
  private users = userModel;

  public getUser = async (userId: Schema.Types.ObjectId): Promise<UserData> => {
    const user: UserData = await this.users.findById(userId).select({
      _id: 0,
      password: 0,
      __v: 0,
    });

    return user;
  };

  public updateUser = async (
    userId: Schema.Types.ObjectId,
    user: UpdateUser
  ): Promise<UserData> => {
    if (isEmpty(user)) throw new HttpException(400, "No user details in body");

    const validation = validateUpdate(user);
    if (validation.error)
      throw new HttpException(400, `Invalid user data - ${validation.error}`);

    const updatedUser: UserData = await this.users
      .findByIdAndUpdate(
        userId,
        { ...user, fullName: `${user.firstName} ${user.lastName}` },
        {
          new: true,
          upsert: true,
        }
      )
      .select({
        _id: 0,
        password: 0,
        __v: 0,
      });

    return updatedUser;
  };

  public followUser = async (
    followUserId: string,
    userId: Schema.Types.ObjectId
  ): Promise<UserData> => {
    if (isEmpty(followUserId))
      throw new HttpException(400, "No user details in body");

    const userExists = await this.users.findById(followUserId);
    if (!userExists) throw new HttpException(409, "User does not exist.");

    const isFollowing = await this.users.find({
      _id: userId,
      following: { $in: [followUserId] },
    });
    if (isFollowing.length > 0)
      throw new HttpException(409, "You're already following this user.");

    const updatedUser = this.users
      .findOneAndUpdate(
        { _id: userId },
        { $push: { following: followUserId } },
        {
          new: true,
          upsert: true,
        }
      )
      .select({
        _id: 0,
        password: 0,
        __v: 0,
      });

    return updatedUser;
  };
}

export default UserService;
