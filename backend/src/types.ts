import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Redis } from "ioredis";

import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

export type MyContext = {
  req: Request & { session: SessionData & { userId?: number } };
  res: Response;
  redisClient: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
