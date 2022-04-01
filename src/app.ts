import { connect, disconnect } from "mongoose";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import Logger from "@utils/logger";
import { dbConnection } from "@databases";
import { NODE_ENV, PORT, ORIGIN } from "@config";
import errorMiddleware from "@middlewares/error.middleware";
import auth from "@routes/auth.route";
import posts from "@routes/posts.route";
import users from "@routes/users.route";

const app = express();
const logger = new Logger();

app.use(cors({ origin: ORIGIN }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", auth);
app.use("/posts", posts);
app.use("/me", users);

app.use(errorMiddleware);

connect(dbConnection.url, dbConnection.options, (error) => {
  if (error) {
    logger.error(error.message);
    return;
  } else {
    logger.info(`=================================`);
    logger.info(`Connected to database...`);
    logger.info(`=================================`);
  }
});

app.listen(PORT || 3000, () => {
  console.log(`=================================`);
  console.log(`======= ENV: ${NODE_ENV || "DEVELOPEMENT"} =======`);
  console.log(`🚀 App listening on the port ${PORT}`);
  console.log(`=================================`);
});
