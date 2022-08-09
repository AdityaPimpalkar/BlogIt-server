import { Server } from "http";
import { disconnect, mongo, Schema } from "mongoose";
import request from "supertest";
import server from "../app";
import { User } from "../interfaces/users.interface";
import usersModel, { createToken } from "../models/users.model";
import postsModel from "../models/posts.model";
import { Token } from "../interfaces/auth.interface";

let appServer: Server;
let createdUser: User;
let _id: string;
let tokenData: Token;
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

    tokenData = createToken(createdUser);
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
            .send(undefined);

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

        it("should return 400 if subTitle has more than 300 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aa".repeat(301),
            description: "aaa",
            isPublished: false,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "subTitle" length must be less than or equal to 300 characters long/
          );
        });

        it("should return 400 if no description was provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            isPublished: false,
          };

          const res = await request(appServer)
            .post("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "description" is required/
          );
        });

        it("should return 400 if isPublished was not provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
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
      });

      it("should return a new post object if client passed valid details", async () => {
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

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("title", "aaa");
      });
    });
  });

  describe("PUT /", () => {
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
            .send(undefined);

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

        it("should return 400 if subTitle has more than 300 characters", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aa".repeat(301),
            description: "aaa",
            isPublished: false,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "subTitle" length must be less than or equal to 300 characters long/
          );
        });

        it("should return 400 if no description was provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id,
            title: "aaa",
            subTitle: "aaa",
            isPublished: false,
          };

          const res = await request(appServer)
            .put("/posts")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid post details - ValidationError: "description" is required/
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
  });

  describe("DELETE /", () => {
    describe("deletePost", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).delete(`/posts/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 404 if postId is passed empty/null", async () => {
        const tokenData = createToken(createdUser);
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
  });

  describe("GET /", () => {
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

      it("should return 400 if postId passed was not valid", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .get(`/posts/1234`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
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

      it("should return post object by id", async () => {
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
          isPublished: true,
          publishedOn: Date.now(),
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

    describe("explorePosts", () => {
      it("should return all published posts without user authentication", async () => {
        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: true,
          publishedOn: Date.now(),
          createdBy: createdUser._id,
        };

        await postsModel.create(post);

        const res = await request(server).get("/posts/explore");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: "aaaaaa",
              createdBy: expect.objectContaining({
                fullName: "fullName1",
              }),
            }),
          ])
        );
      });
    });

    describe("explorePostsById", () => {
      it("should return 400 if post id is not sent by client in the request url.", async () => {
        const res = await request(server).get("/posts/explore/null");
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No post id found in request./);
      });

      it("should return 400 if post id sent by client is an invalid object id.", async () => {
        const res = await request(server).get("/posts/explore/1234");
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
      });

      it("should return 409 if post does not exists.", async () => {
        const res = await request(server).get(`/posts/explore/${_id}`);
        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post does not exist./);
      });

      it("should return 200 and post object by post id.", async () => {
        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: true,
          publishedOn: Date.now(),
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const res = await request(server).get(
          `/posts/explore/${createdPost._id.toHexString()}`
        );
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            title: "aaaaaa",
            createdBy: expect.objectContaining({
              fullName: "fullName1",
            }),
          })
        );
      });
    });

    describe("getPost", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).get(`/posts/edit/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 400 if post id is not sent by client in the request url.", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(server)
          .get("/posts/edit/null")
          .set("Authorization", `Bearer ${tokenData.token}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No post id found in request./);
      });

      it("should return 400 if post id sent by client is an invalid object id.", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(server)
          .get("/posts/edit/1234")
          .set("Authorization", `Bearer ${tokenData.token}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
      });

      it("should return 409 if post does not exists.", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(server)
          .get(`/posts/edit/${_id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);
        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/Post does not exist./);
      });

      it("should return 403 if client is trying to edit a post which was not created by him/her.", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: true,
          publishedOn: Date.now(),
          createdBy: new mongo.ObjectID().toHexString(),
        };

        const createdPost = await postsModel.create(post);
        const res = await request(server)
          .get(`/posts/edit/${createdPost._id.toHexString()}`)
          .set("Authorization", `Bearer ${tokenData.token}`);
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Not authorized to view this post./);
      });

      it("should return 200 and post object if client has passed valid details.", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: true,
          publishedOn: Date.now(),
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);
        const res = await request(server)
          .get(`/posts/edit/${createdPost._id.toHexString()}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            title: "aaaaaa",
            createdBy: expect.objectContaining({
              fullName: "fullName1",
            }),
          })
        );
      });
    });

    describe("getHomePots", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const res = await request(appServer).get(`/posts/homeposts`);

        expect(res.status).toBe(401);
      });

      it("should return 200 and array of posts which are followed by client.", async () => {
        const res = await request(appServer)
          .get(`/posts/homeposts`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: true,
          publishedOn: Date.now(),
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        expect(res.status).toBe(200);
      });
    });

    describe("getMyPosts", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const res = await request(appServer).get(`/posts/myposts`);

        expect(res.status).toBe(401);
      });

      it("should return 200 and array of posts which are created by client.", async () => {
        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: true,
          publishedOn: Date.now(),
          createdBy: createdUser._id,
        };

        await postsModel.create(post);

        const res = await request(appServer)
          .get(`/posts/myposts`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              isPublished: true,
            }),
          ])
        );
      });
    });

    describe("getMyDrafts", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const res = await request(appServer).get(`/posts/mydrafts`);

        expect(res.status).toBe(401);
      });

      it("should return 200 and an array of clients posts which are not published", async () => {
        const post = {
          title: "aaaaaa",
          subtitle: "aaaaaa",
          description: "aaaaaaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        await postsModel.create(post);

        const res = await request(appServer)
          .get(`/posts/mydrafts`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              isPublished: false,
            }),
          ])
        );
      });
    });
  });
});
