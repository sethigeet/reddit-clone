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
import { hash, verify } from "argon2";
import { v4 } from "uuid";

import { User } from "../entities";
import { MyContext } from "../types";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";

import {
  validateRegister,
  RegisterInput,
  FieldError,
} from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redisClient }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password should be at least 3 characters long",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redisClient.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "The token is either expired or is tampered with!",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "The user no longer exists!",
          },
        ],
      };
    }

    await User.update({ id: userIdNum }, { password: await hash(newPassword) });

    await redisClient.del(key);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redisClient }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return false;
    }

    const resetToken = v4();
    await redisClient.set(
      FORGET_PASSWORD_PREFIX + resetToken,
      user.id,
      "ex",
      1000 * 60 * 60 * 24
    ); // 3 days

    const resetLink = `http://localhost:3000/change-password/${resetToken}`;
    const emailHTMLContent = `
<!DOCTYPE html>
<html>
  <head>
    <style type="text/css">
      a .yshortcuts:hover {
        background-color: transparent !important;
        border: none !important;
        color: inherit !important
      }
      a .yshortcuts:active {
        background-color: transparent !important;
        border: none !important;
        color: inherit !important
      }
      a .yshortcuts:focus {
        background-color: transparent !important;
        border: none !important;
        color: inherit !important
      }
    </style>
    <style media="only screen and (max-width: 520px)" type="text/css">
      /* /\/\/\/\/\/\/\/\/ RESPONSIVE MOJO /\/\/\/\/\/\/\/\/ */
      /*  must escape media query with double symbol */
      @media only screen and (max-width: 520px) {
        .main-table {
          width: 90% !important;
        }
        .top {
          padding-top: 33px !important;
          padding-bottom: 37px !important;
        }
        .content {
          padding: 24px 29px !important;
        }
        .verify-button {
          padding: 25px 0 !important;
        }
      }
    </style>
  </head>
  <body align="center" style="margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; background:#ffffff; width:100%; font-family:'Roboto',sans-serif; font-size:16px; text-align:center; line-height:22px; color:#AAB2BA" width="100%">
    <table class="main-table" height="100%" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0; margin:20px auto 10px; padding:0; height:100%; width:80%; max-width:600px" width="80%">
      <tr>
      </tr>
      <tr>
        <td align="center" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0" valign="top">

          <!-- BODY -->
          <div style="border: 1px solid rgba(223,226,230,0.6); border-radius: 4px; background-image:url(https://d1pgqke3goo8l6.cloudfront.net/DNHYRhpZQ2G5MrcSDPDm_help%20wave%402x.png); background-repeat: no-repeat; background-position: bottom -3px right -3px; background-size: 36%;">
            <table class="container" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0; width:100%; max-width:600px; margin:0 auto; padding:0; clear:both" width="100%">
              <tr>
                <td style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0">
                  <table class="row" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0; width:100%" width="100%">
                    <tr>
                      <td class="content" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-top:48px; padding-right:48px; padding-bottom:48px; padding-left:48px">
                        <table class="row" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0; width:100%" width="100%">
                          <tr>
                            <td style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; padding-left:0; padding-right:0; padding-top:0; padding-bottom:0; font-family:'Roboto', sans-serif; font-size:24px; line-height:38px; color:#1B2653">
                              Hey ${user.username},
                            </td>
                          </tr>
                          <tr>
                            <td style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; color:#2A3E52; padding-top:16px; padding-bottom:0px">There was a request to change your password!</td>
                          </tr>
                          <tr>
                            <td style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; color:#2A3E52; padding-top:16px; padding-bottom:0px">
                              If did not make this request, just ignore this email. Otherwise, please click the button below to change your password:
                            </td>
                          </tr>
                          <tr>
                            <td align="center" class="verify-button" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-right:0px; padding-top:35px; padding-left:0; text-align:center">
                              <a align="center" bgcolor="#4F8DF9" href="${resetLink}" style="display:inline-block; min-width:100px; background-color:#4F8DF9; border-width:14px; border-style:solid; border-color:#4F8DF9; border-radius:25px; padding:0; font-family:'Roboto', sans-serif; font-size:14px; line-height:16px; font-weight:bold; color:#ffffff !important; text-decoration:none; text-align:center">
                                <span style="display: inline-block; border-left-width: 3px; border-left-style: solid; border-left-color: #4F8DF9; border-right-width: 3px; border-right-style: solid; border-right-color: #4F8DF9; background-color: #4F8DF9; color: #ffffff; min-width: 150px; padding: 0; letter-spacing: 1.1px; text-transform: uppercase;">Reset Password</span>
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; font-size:13px; padding-top:24px; text-align:center">
                              If that button didn't work, follow this link:
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:'Roboto', sans-serif; padding-left:0; padding-right:0; padding-bottom:35px; font-size:13px; padding-top:4px; text-align:center">
                              <a href="${resetLink}">${resetLink}</a>
                            </td>
                          </tr>
                            <td style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; color:#2A3E52; font-family:'Roboto', sans-serif; font-size:16px; line-height:22px; padding-top:0px; padding-right:0px; padding-bottom:26px; padding-left:0">
                              Have a great day, <br />The Best Website
                            </td>
                          </tr>
                          <tr>
                            <td style="border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; padding-left:0; padding-top:0; padding-bottom:0; font-family:'Roboto', sans-serif; font-size:14px; line-height:16px; padding-right:80px">
                              Need help? Contact <a href="mailto:support@similarweb.com" style="color:#4F8DF9 !important; text-decoration:none" target="_blank">support@thebestwebsite.com</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <!-- BODY END -->
        </td>
      </tr
    </table>
  </body>
</html>
    `;
    await sendEmail(user.email, emailHTMLContent);
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    // not logged in
    if (!req.session.userId) {
      return undefined;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("credentials") credentials: RegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(credentials);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await hash(credentials.password);

    let user;
    try {
      user = await User.create({
        email: credentials.email,
        username: credentials.username,
        password: hashedPassword,
      }).save();
    } catch (err) {
      // err.detail.includes("already exists")
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "That username has already been taken!",
            },
          ],
        };
      }
      console.log("error: ", err);
    }

    if (user) {
      // store the user id in the session
      req.session.userId = user.id;
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "That username/email doesn't exist",
          },
        ],
      };
    }

    const valid = await verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "Incorrect Password" }],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);

        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
