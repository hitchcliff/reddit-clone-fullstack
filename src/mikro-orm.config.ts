import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constansts";
import { Post } from "./entities/Post";
import path from "path";

// get the types of the fn that has parameters
type MikroOrmConfigTypes = Parameters<typeof MikroORM.init>;

// configuration
export default {
  entities: [Post],
  dbName: "lilredit",
  user: "postgres",
  password: "postgres",
  debug: !__prod__,
  type: "postgresql",
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as MikroOrmConfigTypes[0];
