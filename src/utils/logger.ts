import { LOG_FORMAT } from "@config";

class Logger {
  public info(message: String) {
    if (LOG_FORMAT === "dev") console.info(message);
  }
  public warn(message: String) {
    if (LOG_FORMAT === "dev") console.warn(message);
  }
  public error(message: String) {
    if (LOG_FORMAT === "dev") console.error(message);
  }
}

export default Logger;
