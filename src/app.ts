import express from "express";
import { NODE_ENV, PORT } from "@config";
import initializeRoutes from "@startup/routes.startup";
import initializeDatabase from "@startup/db.startup";
import Logger from "@utils/logger";

const app = express();
const logger = new Logger();

initializeRoutes(app);
initializeDatabase();

const server = app.listen(PORT || 3001, () => {
  logger.info(
    `🚀 App listening on the port ${PORT} ENV: ${NODE_ENV || "DEVELOPEMENT"}`
  );
});

export default server;
