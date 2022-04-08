import { Server } from "http";
import request from "supertest";
import server from "../app";
import { User, CreateUser } from "../interfaces/users.interface";
import usersModel from "../models/users.model";

let appServer: Server;
describe("/me", () => {
  beforeEach(() => {
    appServer = server;
  });

  afterEach(async () => {
    appServer.close();
    await usersModel.remove({});
  });

  it("should 401 if user is not logged in", async () => {
    const res = await request(appServer).get("/me");

    expect(res.status).toBe(401);
  });

  // it("should return a user by id", async () => {
  //   const user: CreateUser = {
  //     firstName: "firstName1",
  //     lastName: "lastName1",
  //     email: "test1@test1.test",
  //     password: "password",
  //   };
  //   const createdUser: User = await usersModel.create({
  //     ...user,
  //     fullName: "fullName1",
  //   });

  //   const res = await request(appServer)
  //     .get("/me")
  //     .send({ user: { _id: createdUser._id } });

  //   console.log(res);

  //   expect(res.status).toBe(201);
  // });
});
