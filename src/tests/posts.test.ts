import { Server } from "http";
import { disconnect, mongo, Schema } from "mongoose";
import request from "supertest";
import server from "../app";
import { User } from "../interfaces/users.interface";
import usersModel, { createToken } from "../models/users.model";
import postsModel from "../models/posts.model";

let appServer: Server;
let createdUser: User;
let _id: string;

describe("/posts", () => {
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
    await postsModel.deleteMany({});
  });

  afterAll(async () => {
    appServer.close();
    await disconnect();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  });

  describe("POST /", () => {
    describe("createPost", () => {
      it("should return 401 if no authentication token was not provided", async () => {
        const res = await request(appServer).post("/posts");
        expect(res.status).toBe(401);
      });
      describe("Input validations", () => {
        it("should return 400 if no post details were passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(null);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(/No post details in body./);
        });

        it("should return 400 if no title was provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "title" is required/
          );
        });

        it("should return 400 if title has less than 3 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "title" length must be at least 3 characters long/
          );
        });

        it("should return 400 if title has more than 100 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aa".repeat(101),
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "title" length must be less than or equal to 100 characters long/
          );
        });

        it("should return 400 if subTitle has less than 3 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "subTitle" length must be at least 3 characters long/
          );
        });

        it("should return 400 if subTitle has more than 100 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aa".repeat(101),
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "subTitle" length must be less than or equal to 100 characters long/
          );
        });

        it("should return 400 if description has less than 3 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            description: "aa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "description" length must be at least 3 characters long/
          );
        });

        it("should return 400 if description has more than 500 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa".repeat(501),
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "description" length must be less than or equal to 500 characters long/
          );
        });

        it("should return 400 if isPublished was not provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "isPublished" is required/
          );
        });

        it("should return 400 if createdBy was not provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "createdBy" is required/
          );
        });
      });

      it("should return a new post object if client passed valid details", async () => {
        const tokenData = createToken(createdUser);

        const body = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const res = await request(appServer)
          .post("/posts")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("title", "aaa");
      });
    });

    describe("updatePost", () => {
      it("should return 401 if no authentication token was not provided", async () => {
        const res = await request(appServer).put("/posts");
        expect(res.status).toBe(401);
      });
      describe("Input validations", () => {
        it("should return 400 if no post details were passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(null);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(/No post details in body./);
        });

        it("should return 400 if no postId was provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "_id" is required/
          );
        });

        it("should return 400 if no title was provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "title" is required/
          );
        });

        it("should return 400 if title has less than 3 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "title" length must be at least 3 characters long/
          );
        });

        it("should return 400 if title has more than 100 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aa".repeat(101),
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "title" length must be less than or equal to 100 characters long/
          );
        });

        it("should return 400 if subTitle has less than 3 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "subTitle" length must be at least 3 characters long/
          );
        });

        it("should return 400 if subTitle has more than 100 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aa".repeat(101),
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "subTitle" length must be less than or equal to 100 characters long/
          );
        });

        it("should return 400 if description has less than 3 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aaa",
            description: "aa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "description" length must be at least 3 characters long/
          );
        });

        it("should return 400 if description has more than 500 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aaa",
            description: "aaa".repeat(501),
            isPublished: false,
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "description" length must be less than or equal to 500 characters long/
          );
        });

        it("should return 400 if isPublished was not provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            createdBy: createdUser._id,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "isPublished" is required/
          );
        });
      });

      it("should return 409 if post does not exist", async () => {
        const tokenData = createToken(createdUser);

        const post = {
          _id,
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        await postsModel.create(post);

        const body = {
          _id: new mongo.ObjectId().toHexString(),
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
        };

        const res = await request(appServer)
          .put("/posts")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post does not exist./);
      });

      it("should return 403 if client is trying to update a post which he not authorized to", async () => {
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
          _id,
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
        };

        const res = await request(appServer)
          .put("/posts")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Not authorized to update this post./);
      });

      it("should update and return an updated post object if client has passed valid post details", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const updatePost = {
          _id: createdPost._id,
          title: "aaaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
        };

        const res = await request(appServer)
          .put(`/posts`)
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(updatePost);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("title", "aaaa");
      });
    });

    describe("deletePost", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).delete(`/posts/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 404 if postId is passed empty/null", async () => {
        const tokenData = createToken(createdUser);
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer)
          .delete(`/posts/null`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No post id found in request./);
      });

      it("should return 400 if postId passed was not valid", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .delete(`/posts/1234`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
      });

      it("should return 409 if post does not exist", async () => {
        const tokenData = createToken(createdUser);
        const id = new mongo.ObjectId().toHexString();

        const res = await request(appServer)
          .delete(`/posts/${id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post does not exist./);
      });

      it("should return 403 if client is trying to delete post which is not authorized", async () => {
        const tokenData = createToken(createdUser);

        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: new mongo.ObjectId().toHexString(),
        };

        const createdPost = await postsModel.create(post);

        const res = await request(appServer)
          .delete(`/posts/${createdPost._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Not authorized to delete this post./);
      });

      it("should return deleted object when client passes a valid postId", async () => {
        const tokenData = createToken(createdUser);

        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const res = await request(appServer)
          .delete(`/posts/${createdPost._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("title", "aaa");
      });
    });

    describe("getPostById", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).get(`/posts/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 400 if postId client did not pass postId in the request", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .get(`/posts/null`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No post id found in request./);
      });

      it("should return 409 if post does not exist", async () => {
        const tokenData = createToken(createdUser);
        const id = new mongo.ObjectId().toHexString();

        const res = await request(appServer)
          .get(`/posts/${id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post does not exist./);
      });

      it("should delete and return deleted post object if client passed a valid postId", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const res = await request(appServer)
          .get(`/posts/${createdPost._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("title", "aaa");
      });
    });

    describe("getPosts", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const res = await request(appServer).get(`/posts`);

        expect(res.status).toBe(401);
      });

      it("should return all posts created by client", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        await postsModel.create(post);

        const res = await request(appServer)
          .get(`/posts`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: "aaa",
            }),
          ])
        );
      });
    });
  });
});
