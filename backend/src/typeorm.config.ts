import { ConnectionOptions } from "typeorm";

import path from "path";

import { __prod__ } from "./constants";
import { Post, User, Updoot } from "./entities";

const config: ConnectionOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: !__prod__,
  synchronize: true,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Post, User, Updoot],
};

export default config;
