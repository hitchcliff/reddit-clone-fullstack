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

    let userId;
    if (req.session.userId) {
      userId = req.session.userId;
    }

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
        select p.*, 
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'createdAt', u."createdAt",
          'updatedAt', u."updatedAt"
        ) creator,
        ${
          userId
            ? `(select value from updoot where "userId" = ${userId} and "postId" = p.id) "voteStatus"`
            : 'null as "voteStatus"'
        }
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

        console.log(updoot?.value, realValue);

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
}
