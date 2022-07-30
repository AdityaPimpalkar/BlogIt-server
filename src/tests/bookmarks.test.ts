import { Server } from "http";
import { disconnect, mongo, Schema } from "mongoose";
import request from "supertest";
import server from "../app";
import { User } from "../interfaces/users.interface";
import usersModel, { createToken } from "../models/users.model";
import bookmarksModel from "../models/bookmarks.model";
import postsModel from "../models/posts.model";

let appServer: Server;
let createdUser: User;
let _id: string;

describe("bookmarks", () => {
  beforeAll(() => {
    appServer = server;
    _id = new mongo.ObjectId().toHexString();
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
    await bookmarksModel.deleteMany({});
    await postsModel.deleteMany({});
  });

  afterAll(async () => {
    appServer.close();
    await disconnect();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  });

  describe("POST /", () => {
    describe("createBookmark", () => {
      it("should return 401 if no authentication token was not provided", async () => {
        const res = await request(appServer).post("/bookmarks");
        expect(res.status).toBe(401);
      });

      describe("input validations", () => {
        it("should return 400 if no post details were passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const res = await request(appServer)
            .post("/bookmarks")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(undefined);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(/No post id found in request./);
        });

        it("should return 400 if post id sent is an invalid object id.", async () => {
          const tokenData = createToken(createdUser);
          const body = {
            postId: "abcdef",
          };
          const res = await request(appServer)
            .post("/bookmarks")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(/Invalid id./);
        });
      });

      it("should 409 if the bookmarking post doesnt exists or is deleted", async () => {
        const tokenData = createToken(createdUser);
        const body = {
          postId: _id,
        };
        const res = await request(appServer)
          .post("/bookmarks")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post does not exist./);
      });

      it("should 409 if the post is already bookmarked by user", async () => {
        const tokenData = createToken(createdUser);

        const post = {
          _id,
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: new mongo.ObjectId().toHexString(),
        };

        await postsModel.create(post);

        const bookmark = {
          post: _id,
          bookmarkedBy: createdUser._id,
        };

        await bookmarksModel.create(bookmark);

        const body = {
          postId: _id,
        };

        const res = await request(appServer)
          .post("/bookmarks")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post was already bookmarked./);
      });

      it("should return a new bookmark object if client has passed valid details", async () => {
        const tokenData = createToken(createdUser);

        const post = {
          _id,
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: new mongo.ObjectId().toHexString(),
        };

        await postsModel.create(post);

        const body = {
          postId: _id,
        };

        const res = await request(appServer)
          .post("/bookmarks")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("post", _id);
      });
    });
  });

  describe("DELETE /", () => {
    describe("removeBookmark", () => {
      it("should return 401 if no authentication token was not provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).delete(`/bookmarks/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 400 if bookmark id was passed in the request", async () => {
        const tokenData = createToken(createdUser);

        const res = await request(appServer)
          .delete("/bookmarks/null")
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No bookmark id found in request./);
      });

      it("should return 404 if bookmark id passed was not found.", async () => {
        const tokenData = createToken(createdUser);

        const res = await request(appServer)
          .delete(`/bookmarks/${_id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Bookmarked post not found./);
      });

      it("should return 403 if user is not authorized to bookmark this post", async () => {
        const tokenData = createToken(createdUser);

        const bookmark = {
          _id,
          post: new mongo.ObjectId().toHexString(),
          bookmarkedBy: new mongo.ObjectId().toHexString(),
        };

        await bookmarksModel.create(bookmark);

        const res = await request(appServer)
          .delete(`/bookmarks/${_id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(
          /Not authorized to bookmark this post./
        );
      });

      it("should delete bookmark and return object if client has passed valid details", async () => {
        const tokenData = createToken(createdUser);

        const post = {
          _id,
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: new mongo.ObjectId().toHexString(),
        };

        await postsModel.create(post);

        const bookmark = {
          post: _id,
          bookmarkedBy: createdUser._id,
        };

        const createdBookmark = await bookmarksModel.create(bookmark);

        const res = await request(appServer)
          .delete(`/bookmarks/${createdBookmark._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("post", _id);
      });
    });
  });
});
