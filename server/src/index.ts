import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constansts";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import { MyContext } from "./types";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const main = async () => {
  // connects to the db
  const orm = await MikroORM.init(mikroConfig);

  // get migrator up
  await orm.getMigrator().up();

  const app = express();

  // parser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  // start the redis and express-session
  app.use(
    session({
      name: "qid",
      secret: "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
    })
  );

  // run server through apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      em: orm.em,
      req,
      res,
      session: req.session,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  // create graphql endpoint
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  // run the server using express
  app.listen(4000, () => {
    console.log("serve started on http://localhost:4000/graphql");
  });
};

// needs to add an error
main().catch((err) => {
  console.log(err);
});
