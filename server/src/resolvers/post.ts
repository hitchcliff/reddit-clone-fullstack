import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  // query all posts
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
        select p.*
        from post p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `p."createdAt" < ${cursor}` : ""}
        order by p."createdAt" DESC
        limit ${realLimitPlusOne}
      `
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  // finds a post by giving them an id
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    const post = Post.findOne(id, { relations: ["creator"] });
    return post;
  }

  // creates a single post
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    return post;
  }

  // updates a post
  @Mutation(() => Post)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return post.raw[0];
  }

  // deletes a post
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id);

    if (!post) {
      return false;
    }

    // check if user is logged in
    if (post.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }

    // deletes the updoot relation of the post
    await Updoot.delete({ postId: post.id });

    // deletes the post
    await Post.delete({ id });

    return true;
  }

  // slices the text from db
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50) + "...";
  }

  // updoots a post
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session;

    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({
      where: {
        postId,
        userId,
      },
    });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
      update updoot
      set value  = $1
      where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
      update post
      set points = points + $1
      where id = $2;
          `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
      insert into updoot ("userId", "postId", value)
      values ($1, $2, $3);
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
      update post
      set points = points + $2
      where id = $1;
          `,
          [postId, realValue]
        );
      });
    }

    return true;
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, updootLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }
}
