
import { startServer } from "./app";
import { connectToDatabase, prisma } from "./config/db";
import { redis, startRedis } from "./config/redis";
// server.ts
import "./workers/emailWorker"; // ensures worker starts


(async () => {
  await connectToDatabase();
  // await startRedis()
  await startServer();
})();
