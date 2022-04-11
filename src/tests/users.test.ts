import { Server } from "http";
import { disconnect } from "mongoose";
import request from "supertest";
import server from "../app";
import { User, CreateUser, UpdateUser } from "../interfaces/users.interface";
import usersModel, { createToken } from "../models/users.model";

let appServer: Server;
describe("/users", () => {
  beforeEach(() => {
    appServer = server;
  });

  afterEach(async () => {
    appServer.close();
    await usersModel.deleteMany({});
  });

  afterAll(async () => {
    await disconnect();
  });

  describe("/me", () => {
    describe("GET /", () => {
      it("should 401 if authentication token is missing", async () => {
        const res = await request(appServer).get("/me");

        expect(res.status).toBe(401);
      });

      it("should return a user by if authorization token is valid", async () => {
        const user: CreateUser = {
          firstName: "firstName1",
          lastName: "lastName1",
          email: "test1@test1.test",
          password: "password",
        };
        const createdUser: User = await usersModel.create({
          ...user,
          fullName: "fullName1",
        });

        const tokenData = createToken(createdUser);

        const res = await request(appServer)
          .get("/me")
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("firstName", "firstName1");
      });
    });
    describe("PUT /", () => {
      it("should update the user if user object is valid", async () => {
        const userCreate: CreateUser = {
          firstName: "firstName1",
          lastName: "lastName1",
          email: "test1@test1.test",
          password: "password",
        };

        const newUser: User = await usersModel.create({
          ...userCreate,
          fullName: "fullName1",
        });

        const userUpdate: UpdateUser = {
          firstName: "firstName2",
          lastName: "lastName1",
          avatar: "avatar1",
        };

        const tokenData = createToken(newUser);

        const res = await request(appServer)
          .put("/me")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(userUpdate);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("firstName", "firstName2");
      });
    });
  });
});
