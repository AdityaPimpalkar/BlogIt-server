import { hash } from "bcrypt";
import { Server } from "http";
import { disconnect } from "mongoose";
import request from "supertest";
import server from "../app";
import usersModel from "../models/users.model";

let appServer: Server;

describe("/auth", () => {
  beforeAll(() => {
    appServer = server;
  });
  afterEach(async () => {
    await usersModel.deleteMany({});
  });

  afterAll(async () => {
    appServer.close();
    await disconnect();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  });

  describe("/signup", () => {
    describe("POST /", () => {
      it("should return 400 if client did not send login details in the request", async () => {
        const res = await request(appServer).post("/auth/signup").send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Request body not found/);
      });

      it("should return 400 if firstName is not provided", async () => {
        const user = {
          lastName: "lastName1",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "firstName" is required/
        );
      });

      it("should return 400 if lastName is not provided", async () => {
        const user = {
          firstName: "firstName1",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "lastName" is required/
        );
      });

      it("should return 400 if firstName is less than 3 characters", async () => {
        const user = {
          firstName: "aa",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "firstName" length must be at least 3 characters long/
        );
      });

      it("should return 400 if firstName is more than 30 characters", async () => {
        const user = {
          firstName: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "firstName" length must be less than or equal to 30 characters long/
        );
      });

      it("should return 400 if lastName is less than 3 characters", async () => {
        const user = {
          firstName: "firstName1",
          lastName: "aa",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "lastName" length must be at least 3 characters long/
        );
      });

      it("should return 400 if lastName is more than 30 characters", async () => {
        const user = {
          firstName: "firstName1",
          lastName: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "lastName" length must be less than or equal to 30 characters long/
        );
      });

      it("should return 400 if email is not provided", async () => {
        const user = {
          firstName: "firstName1",
          lastName: "lastName1",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "email" is required/
        );
      });

      it("should return 400 if email is not valid", async () => {
        const user = {
          firstName: "firstName1",
          lastName: "lastName1",
          email: "email.email",
        };
        const res = await request(appServer).post("/auth/signup").send(user);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(
          /Invalid user data - ValidationError: "email" must be a valid email/
        );
      });

      it("should return 409 if email already exists in the database", async () => {
        const user = {
          firstName: "firstName1",
          lastName: "lastName1",
          fullName: "fullName1",
          email: "test1@test1.com",
          password: "password",
        };

        await usersModel.create(user);

        const dummyUser = {
          firstName: "firstName1",
          lastName: "lastName1",
          email: "test1@test1.com",
          password: "password",
        };

        const res = await request(appServer)
          .post("/auth/signup")
          .send(dummyUser);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(
          /Your email test1@test1.com already exists/
        );
      });

      it("should return a new user object after signing in successfully", async () => {
        const dummyUser = {
          firstName: "firstName1",
          lastName: "lastName1",
          email: "test1@test1.com",
          password: "password",
        };

        const res = await request(appServer)
          .post("/auth/signup")
          .send(dummyUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("firstName", "firstName1");
      });
    });
  });

  describe("/login", () => {
    it("should return 400 if login details is missing", async () => {
      const res = await request(appServer).post("/auth/login").send(null);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/No login details in body/);
    });

    it("should return 400 if email is not provided", async () => {
      const user = {
        password: "password",
      };
      const res = await request(appServer).post("/auth/login").send(user);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "email" is required/
      );
    });

    it("should return 400 if email is not valid", async () => {
      const user = {
        email: "test1.test1",
      };
      const res = await request(appServer).post("/auth/login").send(user);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "email" must be a valid email/
      );
    });

    it("should return 400 if password is not provided", async () => {
      const user = {
        email: "test1@test1.com",
      };
      const res = await request(appServer).post("/auth/login").send(user);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Invalid user data - ValidationError: "password" is required/
      );
    });

    it("should return 400 if email already exists", async () => {
      const loginUser = {
        email: "test2@test2.com",
        password: "password",
      };
      const res = await request(appServer).post("/auth/login").send(loginUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Your email test2@test2.com was not found./
      );
    });

    it("should return 409 if password provided does not match the password provided in the database ", async () => {
      const password = await hash("password", 10);
      const user = {
        firstName: "firstName1",
        lastName: "lastName1",
        fullName: "fullName1",
        email: "test1@test1.com",
        password,
      };

      await usersModel.create(user);

      const dummyUser = {
        email: "test1@test1.com",
        password: "password1",
      };

      const res = await request(appServer).post("/auth/login").send(dummyUser);

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/Invalid password/);
    });

    it("should return a new user object after providing login details", async () => {
      const password = await hash("password", 10);
      const user = {
        firstName: "firstName1",
        lastName: "lastName1",
        fullName: "fullName1",
        email: "test1@test1.com",
        password,
      };

      await usersModel.create(user);

      const dummyUser = {
        email: "test1@test1.com",
        password: "password",
      };

      const res = await request(appServer).post("/auth/login").send(dummyUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tokenData");
    });
  });
});
