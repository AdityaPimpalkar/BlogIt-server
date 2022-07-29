import { hash } from "bcrypt";
import { Server } from "http";
import { disconnect, mongo } from "mongoose";
import request from "supertest";
import server from "../app";
import { User } from "../interfaces/users.interface";
import usersModel, { createToken } from "../models/users.model";
import postsModel from "../models/posts.model";
import commentsModel from "../models/comments.model";

let appServer: Server;
let createdUser: User;

describe("/comments", () => {
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
    await postsModel.deleteMany({});
    await commentsModel.deleteMany({});
  });

  afterAll(async () => {
    appServer.close();
    await disconnect();
  });

  describe("POST /", () => {
    describe("createComment", () => {
      it("should return 401 if no authentication token was not provided", async () => {
        const res = await request(appServer).post("/comments");
        expect(res.status).toBe(401);
      });

      describe("Input validations", () => {
        it("should return 400 if no comment details were passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const res = await request(appServer)
            .post("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(undefined);
          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(/No comment details in body./);
        });

        it("should return 400 if postId was not provided", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            comment: "aaaa",
            commentBy: "aaaa",
          };

          const res = await request(appServer)
            .post("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "postId" is required/
          );
        });

        it("should return 400 if comment was not provided", async () => {
          const tokenData = createToken(createdUser);
          const post = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const createdPost = await postsModel.create(post);

          const body = {
            postId: createdPost._id,
            commentBy: "aaaa",
          };

          const res = await request(appServer)
            .post("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "comment" is required/
          );
        });

        it("should return 400 if comment was empty", async () => {
          const tokenData = createToken(createdUser);
          const post = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const createdPost = await postsModel.create(post);

          const body = {
            postId: createdPost._id,
            comment: "",
            commentBy: "aaaa",
          };

          const res = await request(appServer)
            .post("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "comment" is not allowed to be empty/
          );
        });

        it("should return 400 if comment was null", async () => {
          const tokenData = createToken(createdUser);
          const post = {
            title: "aaa",
            subTitle: "aaa",
            description: "aaa",
            isPublished: false,
            createdBy: createdUser._id,
          };

          const createdPost = await postsModel.create(post);

          const body = {
            postId: createdPost._id,
            comment: null,
            commentBy: "aaaa",
          };

          const res = await request(appServer)
            .post("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "comment" must be a string/
          );
        });

        it("should return 404 if post does not exist", async () => {
          const tokenData = createToken(createdUser);
          const body = {
            postId: new mongo.ObjectId().toHexString(),
            comment: "aaa",
          };

          const res = await request(appServer)
            .post("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(404);
          expect(res.body.message).toMatch(/Blog post does not exist./);
        });
      });

      it("should return a new comment object if valid comment details are passed", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const body = {
          postId: createdPost._id,
          comment: "aaa",
        };

        const res = await request(appServer)
          .post("/comments")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("comment", "aaa");
      });
    });

    describe("updateComment", () => {
      it("should return 401 if no authentication token was not provided", async () => {
        const res = await request(appServer).put("/comments");
        expect(res.status).toBe(401);
      });

      describe("Input validation", () => {
        it("should return 400 if comment details were not passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(undefined);
          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(/No comment details in body./);
        });

        it("should return 400 if no commentId was not passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            comment: "aaa",
          };

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "_id" is required/
          );
        });

        it("should return 400 if commentId was empty", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id: "",
            comment: "aaa",
          };

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "_id" is not allowed to be empty/
          );
        });

        it("should return 400 if commentId was null", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id: null,
            comment: "aaa",
          };

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "_id" must be a string/
          );
        });

        it("should return 400 if comment was not passed in the request body", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id: "aaa",
          };

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "comment" is required/
          );
        });

        it("should return 400 if comment was empty", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id: "aaa",
            comment: "",
          };

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "comment" is not allowed to be empty/
          );
        });

        it("should return 400 if comment was null", async () => {
          const tokenData = createToken(createdUser);

          const body = {
            _id: "aaa",
            comment: null,
          };

          const res = await request(appServer)
            .put("/comments")
            .set("Authorization", `Bearer ${tokenData.token}`)
            .send(body);

          expect(res.status).toBe(400);
          expect(res.body.message).toMatch(
            /Invalid comment details - ValidationError: "comment" must be a string/
          );
        });
      });

      it("should return 404 if comment does not exist or was deleted", async () => {
        const tokenData = createToken(createdUser);

        const body = {
          _id: new mongo.ObjectId().toHexString(),
          comment: "aaa",
        };

        const res = await request(appServer)
          .put("/comments")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(body);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Comment does not exist./);
      });

      it("should return 404 if blog post does not exist or was deleted", async () => {
        const tokenData = createToken(createdUser);

        const comment = {
          postId: new mongo.ObjectId().toHexString(),
          comment: "aaa",
          commentBy: createdUser._id,
        };

        const createdComment = await commentsModel.create(comment);

        const updateComment = {
          _id: createdComment._id,
          comment: "aaaa",
        };

        const res = await request(appServer)
          .put("/comments")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(updateComment);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Blog post does not exist./);
      });

      it("should return 403 if client is updating a comment which is not created by them", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const comment = {
          postId: createdPost._id,
          comment: "aaa",
          commentBy: new mongo.ObjectId().toHexString(),
        };

        const createdComment = await commentsModel.create(comment);

        const updateComment = {
          _id: createdComment._id,
          comment: "aaaa",
        };

        const res = await request(appServer)
          .put("/comments")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(updateComment);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(
          /Not authorized to update this comment./
        );
      });

      it("should return updated comment if valid comment details were provided", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const comment = {
          postId: createdPost._id,
          comment: "aaa",
          commentBy: createdUser._id,
        };

        const createdComment = await commentsModel.create(comment);

        const updateComment = {
          _id: createdComment._id,
          comment: "aaaa",
        };

        const res = await request(appServer)
          .put("/comments")
          .set("Authorization", `Bearer ${tokenData.token}`)
          .send(updateComment);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("comment", "aaaa");
      });
    });

    describe("deleteComment", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).delete(`/comments/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 404 if commentId is passed empty/null", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .delete(`/comments/null`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No comment id found in request./);
      });

      it("should return 400 if commentId passed was not valid", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .delete(`/comments/1234`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
      });

      it("should return 409 if comment does not exist", async () => {
        const tokenData = createToken(createdUser);
        const id = new mongo.ObjectId().toHexString();

        const res = await request(appServer)
          .delete(`/comments/${id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Comment does not exist./);
      });

      it("should return 404 if blog post does not exist or was deleted", async () => {
        const tokenData = createToken(createdUser);

        const comment = {
          postId: new mongo.ObjectId().toHexString(),
          comment: "aaa",
          commentBy: createdUser._id,
        };

        const createdComment = await commentsModel.create(comment);

        const res = await request(appServer)
          .delete(`/comments/${createdComment._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Blog post does not exist./);
      });

      it("should return 403 if client is deleting a comment which is not created by them", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const comment = {
          postId: createdPost._id,
          comment: "aaa",
          commentBy: new mongo.ObjectId().toHexString(),
        };

        const createdComment = await commentsModel.create(comment);

        const res = await request(appServer)
          .delete(`/comments/${createdComment._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(
          /Not authorized to delete this comment./
        );
      });

      it("should return deleted comment if valid comment details were provided", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const comment = {
          postId: createdPost._id,
          comment: "aaa",
          commentBy: createdUser._id,
        };

        const createdComment = await commentsModel.create(comment);

        const res = await request(appServer)
          .delete(`/comments/${createdComment._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("comment", "aaa");
      });
    });

    describe("getCommentById", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer).get(`/comments/${id}`);

        expect(res.status).toBe(401);
      });

      it("should return 404 if commentId is passed empty/null", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .get(`/comments/null`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No comment id found in request./);
      });

      it("should return 400 if commentId passed was not valid", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .get(`/comments/1234`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
      });

      it("should return 404 if comment does not exist or was deleted", async () => {
        const tokenData = createToken(createdUser);
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer)
          .get(`/comments/${id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Comment does not exist./);
      });

      it("should return comment object if comment id is valid", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const comment = {
          postId: createdPost._id,
          comment: "aaa",
          commentBy: createdUser._id,
        };

        const createdComment = await commentsModel.create(comment);
        const res = await request(appServer)
          .get(`/comments/${createdComment._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("comment", "aaa");
      });
    });

    describe("getComments", () => {
      it("should return 401 if no authentication token was provided", async () => {
        const res = await request(appServer).get(`/comments`);

        expect(res.status).toBe(401);
      });

      it("should return 404 if postId is passed empty/null", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .get(`/comments?postId=null`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No post id found in request./);
      });

      it("should return 400 if postId passed was not valid", async () => {
        const tokenData = createToken(createdUser);
        const res = await request(appServer)
          .get(`/comments?postId=1234`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid id./);
      });

      it("should return 404 if post does not exist", async () => {
        const tokenData = createToken(createdUser);
        const id = new mongo.ObjectId().toHexString();
        const res = await request(appServer)
          .get(`/comments?postId=${id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Blog post does not exist./);
      });

      it("should return an array of comment objects if a valid postId is provided", async () => {
        const tokenData = createToken(createdUser);
        const post = {
          title: "aaa",
          subTitle: "aaa",
          description: "aaa",
          isPublished: false,
          createdBy: createdUser._id,
        };

        const createdPost = await postsModel.create(post);

        const comment = {
          postId: createdPost._id,
          comment: "aaa",
          commentBy: createdUser._id,
        };

        await commentsModel.create(comment);

        const res = await request(appServer)
          .get(`/comments?postId=${createdPost._id}`)
          .set("Authorization", `Bearer ${tokenData.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              comment: "aaa",
            }),
          ])
        );
      });
    });
  });
});
