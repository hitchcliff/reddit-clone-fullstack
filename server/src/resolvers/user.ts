import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { COOKIE_NAME } from "../constansts";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

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

@Resolver()
export class UserResolver {
  // check if current user is logged in
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }

    // find the user through session id thats saved in the cookie
    const user = await em.findOne(User, { id: req.session.userId });

    return user;
  }

  // registers a user
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // perform validation
    const response = validateRegister(options);
    if (response?.errors) {
      return { errors: response.errors };
    }

    // creates the user in db
    const hashedPassword = await argon2.hash(options.password); // hashed password
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
      email: options.email,
    });

    // catch if there are errors flushing a user
    try {
      await em.persistAndFlush(user);
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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
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
}
