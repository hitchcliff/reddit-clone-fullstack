import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  res: Response;
  req: Request;
  redis: Redis;
};

declare module "express-session" {
  interface Session {
    userId: string;
  }
}
