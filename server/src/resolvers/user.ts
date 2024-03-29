import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constansts";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import sendEmail from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  // check if current user is logged in
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    if (!req.session.userId) {
      return undefined;
    }

    // find the user through session id thats saved in the cookie
    const user = await User.findOne(req.session.userId);

    return user;
  }

  // registers a user
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // perform validation
    const response = validateRegister(options);
    if (response?.errors) {
      return { errors: response.errors };
    }

    // creates the user in db
    const hashedPassword = await argon2.hash(options.password); // hashed password
    const user = User.create({
      username: options.username,
      password: hashedPassword,
      email: options.email,
    });

    // catch if there are errors flushing a user
    try {
      await user.save();
    } catch (error) {
      console.log("message: ", error.message);
    }

    // store a session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  // login a user
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    // if there is no user
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username does not exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    // store a session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  // logout a user
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    // find the user in db
    const user = await User.findOne({ where: { email } });

    // if we cannot find a user
    if (!user) {
      return true;
    }

    // generate random token
    const token = v4();

    // store this in redis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    const html = `<a href="http://localhost:3000/change-password/${token}">forgot password</a>`;

    // send email to our client
    await sendEmail(email, html);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ) {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 3",
          },
        ],
      };
    }

    // get the token from redis
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    // find the user in db
    const userIdToNum = parseInt(userId);
    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    // change the password in the db
    await User.update(
      { id: userIdToNum },
      { password: await argon2.hash(newPassword) }
    );

    // delete the token
    redis.del(key);

    // logged in the user after changing the password by setting a session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @FieldResolver()
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the user
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see some else's user
    return "";
  }
}
