import { Server } from "http";
import { disconnect } from "mongoose";
import request from "supertest";
import server from "../app";
import { User, CreateUser, UpdateUser } from "../interfaces/users.interface";
import usersModel, { createToken } from "../models/users.model";

let appServer: Server;
let createdUser: User;

describe("/me", () => {
  beforeAll(() => {
    appServer = server;
  });
  beforeEach(async () => {
    createdUser = await usersModel.create({
      firstName: "firstName1",
      lastName: "lastName1",
      fullName: "fullName1",
      email: "test1@test1.test",
      password: "password",
    });
  });

  afterEach(async () => {
    await usersModel.deleteMany({});
  });

  afterAll(async () => {
    appServer.close();
    await disconnect();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  });

  describe("GET /", () => {
    it("should return 401 if authentication token is missing", async () => {
      const res = await request(appServer).get("/me");

      expect(res.status).toBe(401);
    });

    it("should return a user by if authorization token is valid", async () => {
      const tokenData = createToken(createdUser);

      const res = await request(appServer)
        .get("/me")
        .set("Authorization", `Bearer ${tokenData.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("firstName", "firstName1");
    });
  });

  describe("PUT /", () => {
    it("should return 401 if authentication token is missing", async () => {
      const res = await request(appServer).put("/me");

      expect(res.status).toBe(401);
    });

    it("should return 400 if user details is missing", async () => {
      const tokenData = createToken(createdUser);
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(null);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/No user details in body/);
    });

    it("should return 400 if firstName is not provided", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate = {
        lastName: "lastName1",
      };
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "firstName" is required/
      );
    });

    it("should return 400 if lastName is not provided", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate = {
        firstName: "firstName1",
      };
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "lastName" is required/
      );
    });

    it("should return 400 if firstName is less than 3 characters", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate = {
        firstName: "aa",
      };
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "firstName" length must be at least 3 characters long/
      );
    });

    it("should return 400 if firstName is more than 30 characters", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate = {
        firstName: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      };
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "firstName" length must be less than or equal to 30 characters long/
      );
    });

    it("should return 400 if lastName is less than 3 characters", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate = {
        firstName: "firstName1",
        lastName: "aa",
      };
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "lastName" length must be at least 3 characters long/
      );
    });

    it("should return 400 if lastName is more than 30 characters", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate = {
        firstName: "firstName1",
        lastName: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      };
      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "lastName" length must be less than or equal to 30 characters long/
      );
    });

    it("should update the user if user object is valid", async () => {
      const tokenData = createToken(createdUser);

      const userUpdate: UpdateUser = {
        firstName: "firstName2",
        lastName: "lastName1",
        avatar: "avatar1",
      };

      const res = await request(appServer)
        .put("/me")
        .set("Authorization", `Bearer ${tokenData.token}`)
        .send(userUpdate);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("firstName", "firstName2");
    });
  });
});
