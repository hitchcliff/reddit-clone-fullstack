import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  // query all posts
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // finds a post by giving them an id
  @Query(() => Post)
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }
}
