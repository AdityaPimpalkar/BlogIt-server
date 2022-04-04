import { connect } from "mongoose";
import { dbConnection } from "@databases";
import Logger from "@utils/logger";

const logger = new Logger();

export default function () {
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
}
