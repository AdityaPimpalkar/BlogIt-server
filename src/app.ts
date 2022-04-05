import express from "express";
import { NODE_ENV, PORT } from "@config";
import initializeRoutes from "@startup/routes.startup";
import initializeDatabase from "@startup/db.startup";

const app = express();

initializeRoutes(app);
initializeDatabase();

const server = app.listen(PORT || 3000, () => {
  console.log(`=================================`);
  console.log(`======= ENV: ${NODE_ENV || "DEVELOPEMENT"} =======`);
  console.log(`🚀 App listening on the port ${PORT}`);
  console.log(`=================================`);
});

export default server;
