import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constansts";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
  // connects to the db
  const orm = await MikroORM.init(mikroConfig);

  // get migrator up
  await orm.getMigrator().up();

  // creates post
  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);

  // finds post
  const posts = await orm.em.find(Post, {});
  console.log(posts);
};

// needs to add an error
main().catch((err) => {
  console.log(err);
});
