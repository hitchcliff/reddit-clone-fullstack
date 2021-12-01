import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constansts";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // connects to the db
  const orm = await MikroORM.init(mikroConfig);

  // get migrator up
  await orm.getMigrator().up();

  const app = express();

  // run server through apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  // create graphql endpoint
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  // run the server using express
  app.listen(4000, () => {
    console.log("serve started on localhost:4000");
  });
};

// needs to add an error
main().catch((err) => {
  console.log(err);
});
