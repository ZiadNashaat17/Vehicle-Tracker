import { connect } from "mongoose";
import { createServer } from "node:http";
import app from "./app.js";
import { initSocket } from "./services/socket.js";

const port = process.env.PORT || 3003;
const DB = process.env.DATABASE;
const httpServer = createServer(app);

(async () => {
  try {
    await connect(DB);
    console.log("Connected to DB successfully!");

    initSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (error) {
    console.log("Server startup error: ", error);
    process.exit(1);
  }
})();
