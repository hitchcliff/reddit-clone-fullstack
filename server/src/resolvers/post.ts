import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  // query all posts
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  // finds a post by giving them an id
  @Query(() => Post)
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    const post = Post.findOne(id);
    return post;
  }

  // creates a single post
  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    const post = Post.create({ title }).save();

    return post;
  }

  // updates a post
  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ) {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await Post.update({ id }, { title });
    }

    return post;
  }

  // deletes a post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);

    return true;
  }
}
