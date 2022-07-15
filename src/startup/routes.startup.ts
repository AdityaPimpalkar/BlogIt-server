import { Express } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ORIGIN } from "@config";
import errorMiddleware from "@middlewares/error.middleware";
import auth from "@routes/auth.route";
import posts from "@routes/posts.route";
import users from "@routes/users.route";
import comments from "@routes/comments.route";
import bookmarks from "@routes/bookmars.route";

export default function (app: Express) {
  app.use(cors({ origin: ORIGIN }));
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/auth", auth);
  app.use("/posts", posts);
  app.use("/comments", comments);
  app.use("/me", users);
  app.use("/bookmarks", bookmarks);

  app.use(errorMiddleware);
}
