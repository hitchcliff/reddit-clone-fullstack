import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
  res: Response;
  req: Request;
  redis: Redis;
};

declare module "express-session" {
  interface Session {
    userId: number;
  }
}
