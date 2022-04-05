import { Server } from "http";
import request from "supertest";
import server from "../../app";

let appServer: Server;

describe("/users", () => {
  beforeEach(() => {
    appServer = server;
  });

  afterEach(() => {
    appServer.close();
  });
  it("should return a user by id", () => {
    const res = request(appServer).get("/users");
  });
});
