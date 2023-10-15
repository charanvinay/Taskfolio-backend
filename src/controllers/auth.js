import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Errors, Responses } from "../Responses/response.js";
import { ExistsException, ServerException } from "../exceptions/exception.js";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
} from "../models/user.js";
import {
  validatePayload,
  generateToken,
  StatusCodes,
} from "../services/index.js";
import { CONSTANTS } from "../services/constants.js";
const {
  PASSWORD_HASH_ROUNDS,
  ACCESS_TOKEN,
  RESET_TOKEN,
  REFRESH_TOKEN,
  ACCESS_TOKEN_EXP_IN_MS,
  REFRESH_TOKEN_EXP_IN_MS,
} = CONSTANTS;
export const registerUser = async (req, res) => {
  try {
    let { fullName, email, password } = req.body;
    let payload = { fullName, email, password };
    let { isValid, invalidKey } = validatePayload(payload);
    if (isValid) {
      email = email.toLowerCase();
      payload["email"] = email.toLowerCase();
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return new ExistsException(Responses.user_exists).get(res);
      }
      const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
      // console.log(hashedPassword);
      const savedUser = await createUser({
        ...payload,
        password: hashedPassword,
      });
      if (savedUser) {
        const accessToken = generateToken({ email, password }, ACCESS_TOKEN);
        const refreshToken = generateToken({ email, password }, REFRESH_TOKEN);
        res.cookie(ACCESS_TOKEN, accessToken, {
          httpOnly: true,
          maxAge: ACCESS_TOKEN_EXP_IN_MS,
        });
        res.cookie(REFRESH_TOKEN, refreshToken, {
          httpOnly: true,
          maxAge: REFRESH_TOKEN_EXP_IN_MS,
        });
        res.status(StatusCodes.OK).json({
          status: true,
          message: Responses.user_create_success,
          data: { accessToken, userData: savedUser },
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.enter_valid} ${invalidKey}`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let payload = { email, password };
    let { isValid, invalidKey } = validatePayload(payload);
    if (isValid) {
      email = email.toLowerCase();
      payload["email"] = email.toLowerCase();
      let loginUser = await getUserByEmail(email);
      if (Boolean(loginUser)) {
        const { _id } = loginUser;
        if (loginUser?.password) {
          const isPasswordMatched = await bcrypt.compare(
            password,
            loginUser.password
          );
          if (isPasswordMatched) {
            const accessToken = generateToken(payload, ACCESS_TOKEN);
            const refreshToken = generateToken(payload, REFRESH_TOKEN);
            res.cookie(ACCESS_TOKEN, accessToken, {
              httpOnly: true,
              maxAge: ACCESS_TOKEN_EXP_IN_MS,
            });
            res.cookie(REFRESH_TOKEN, refreshToken, {
              httpOnly: true,
              maxAge: REFRESH_TOKEN_EXP_IN_MS,
            });
            res.status(StatusCodes.OK).json({
              status: true,
              message: Responses.user_login_success,
              data: { accessToken, userData: loginUser },
            });
          } else {
            res.status(StatusCodes.NOT_FOUND).json({
              status: false,
              message: `${Responses.invalid_password}`,
            });
          }
        } else {
          return new ServerException(Errors.internal_error).get(res);
        }
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `User ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.enter_valid} ${invalidKey}`,
      });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    let payload = { email };
    let { isValid, invalidKey } = validatePayload(payload);
    if (isValid) {
      email = email.toLowerCase();
      payload["email"] = email.toLowerCase();
      let loginUser = await getUserByEmail(email);
      if (Boolean(loginUser)) {
        if (loginUser && loginUser._id && loginUser.email) {
          payload["id"] = loginUser._id;
          const token = generateToken(payload, RESET_TOKEN);
          const link = `${process.env.CLIENT_BASE_URL}resetPassword/${loginUser._id}/${token}`;
          var transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
          });

          var mailOptions = {
            from: {
              name: "Taskfolio",
              address:process.env.USER
            },
            to: email,
            subject: "Link to reset your Password",
            // text: link,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="x-apple-disable-message-reformatting" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta name="color-scheme" content="light dark" />
                <meta name="supported-color-schemes" content="light dark" />
                <title></title>
                <style type="text/css" rel="stylesheet" media="all">
                  /* Base ------------------------------ */
            
                  @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
                  body {
                    width: 100% !important;
                    height: 100%;
                    margin: 0;
                    -webkit-text-size-adjust: none;
                  }
            
                  a {
                    color: #3869d4;
                  }
            
                  a img {
                    border: none;
                  }
            
                  td {
                    word-break: break-word;
                  }
            
                  .preheader {
                    display: none !important;
                    visibility: hidden;
                    mso-hide: all;
                    font-size: 1px;
                    line-height: 1px;
                    max-height: 0;
                    max-width: 0;
                    opacity: 0;
                    overflow: hidden;
                  }
                  /* Type ------------------------------ */
            
                  body,
                  td,
                  th {
                    font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
                  }
            
                  h1 {
                    margin-top: 0;
                    color: #333333;
                    font-size: 22px;
                    font-weight: bold;
                    text-align: left;
                  }
            
                  h2 {
                    margin-top: 0;
                    color: #333333;
                    font-size: 16px;
                    font-weight: bold;
                    text-align: left;
                  }
            
                  h3 {
                    margin-top: 0;
                    color: #333333;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: left;
                  }
            
                  td,
                  th {
                    font-size: 16px;
                  }
            
                  p,
                  ul,
                  ol,
                  blockquote {
                    margin: 0.4em 0 1.1875em;
                    font-size: 16px;
                    line-height: 1.625;
                  }
            
                  p.sub {
                    font-size: 13px;
                  }
                  /* Utilities ------------------------------ */
            
                  .align-right {
                    text-align: right;
                  }
            
                  .align-left {
                    text-align: left;
                  }
            
                  .align-center {
                    text-align: center;
                  }
            
                  .u-margin-bottom-none {
                    margin-bottom: 0;
                  }
                  /* Buttons ------------------------------ */
            
                  .button {
                    background-color: #3869d4;
                    border-top: 10px solid #3869d4;
                    border-right: 18px solid #3869d4;
                    border-bottom: 10px solid #3869d4;
                    border-left: 18px solid #3869d4;
                    display: inline-block;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 3px;
                    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
                    -webkit-text-size-adjust: none;
                    box-sizing: border-box;
                  }
            
                  .button--green {
                    background-color: #0045f6;
                    border-top: 10px solid #0045f6;
                    border-right: 18px solid #0045f6;
                    border-bottom: 10px solid #0045f6;
                    border-left: 18px solid #0045f6;
                  }
            
                  @media only screen and (max-width: 500px) {
                    .button {
                      width: 100% !important;
                      text-align: center !important;
                    }
                  }
            
                  /* Data table ------------------------------ */
            
                  body {
                    background-color: #f2f4f6;
                    color: #51545e;
                  }
            
                  p {
                    color: #51545e;
                  }
            
                  .email-wrapper {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    -premailer-width: 100%;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                    background-color: #f2f4f6;
                  }
            
                  .email-content {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    -premailer-width: 100%;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                  }
                  /* Masthead ----------------------- */
            
                  .email-masthead {
                    padding: 25px 0;
                    text-align: center;
                  }
            
                  .email-masthead_logo {
                    width: 94px;
                  }
            
                  .email-masthead_name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #a8aaaf;
                    text-decoration: none;
                    text-shadow: 0 1px 0 white;
                  }
                  /* Body ------------------------------ */
            
                  .email-body {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    -premailer-width: 100%;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                  }
            
                  .email-body_inner {
                    width: 570px;
                    margin: 0 auto;
                    padding: 0;
                    -premailer-width: 570px;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                    background-color: #ffffff;
                  }
            
                  .email-footer {
                    width: 570px;
                    margin: 0 auto;
                    padding: 0;
                    -premailer-width: 570px;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                    text-align: center;
                  }
            
                  .email-footer p {
                    color: #a8aaaf;
                  }
            
                  .body-action {
                    width: 100%;
                    margin: 30px auto;
                    padding: 0;
                    -premailer-width: 100%;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                    text-align: center;
                  }
            
                  .body-sub {
                    margin-top: 25px;
                    padding-top: 25px;
                    border-top: 1px solid #eaeaec;
                  }
            
                  .content-cell {
                    padding: 45px;
                  }
                  /*Media Queries ------------------------------ */
            
                  @media only screen and (max-width: 600px) {
                    .email-body_inner,
                    .email-footer {
                      width: 100% !important;
                    }
                  }
            
                  @media (prefers-color-scheme: dark) {
                    body,
                    .email-body,
                    .email-body_inner,
                    .email-content,
                    .email-wrapper,
                    .email-masthead,
                    .email-footer {
                      background-color: #333333 !important;
                      color: #fff !important;
                    }
                    p,
                    ul,
                    ol,
                    blockquote,
                    h1,
                    h2,
                    h3,
                    span {
                      color: #fff !important;
                    }
                    .discount {
                      background-color: #222 !important;
                    }
                    .email-masthead_name {
                      text-shadow: none !important;
                    }
                  }
            
                  :root {
                    color-scheme: light dark;
                    supported-color-schemes: light dark;
                  }
                </style>
                <!--[if mso]>
                  <style type="text/css">
                    .f-fallback {
                      font-family: Arial, sans-serif;
                    }
                  </style>
                <![endif]-->
              </head>
              <body>
                <span class="preheader"
                  >Use this link to reset your password. The link is only valid for 5
                  minutes.</span
                >
                <table
                  class="email-wrapper"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                >
                  <tr>
                    <td align="center">
                      <table
                        class="email-content"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                      >
                        <tr>
                          <td class="email-masthead">
                            <a
                              href="https://ael-taskfolio.netlify.app/"
                              class="f-fallback email-masthead_name"
                            >
                              Takskfolio
                            </a>
                          </td>
                        </tr>
                        <!-- Email Body -->
                        <tr>
                          <td
                            class="email-body"
                            width="570"
                            cellpadding="0"
                            cellspacing="0"
                          >
                            <table
                              class="email-body_inner"
                              align="center"
                              width="570"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                            >
                              <!-- Body content -->
                              <tr>
                                <td class="content-cell">
                                  <div class="f-fallback">
                                    <h1>Hi ${loginUser.fullName},</h1>
                                    <p>
                                      You recently requested to reset your password for your
                                      Taskfolio account. Use the button below to reset it.
                                      <strong
                                        >This password reset is only valid for the next 5
                                        mins.</strong
                                      >
                                    </p>
                                    <!-- Action -->
                                    <table
                                      class="body-action"
                                      align="center"
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tr>
                                        <td align="center">
                                          <!-- Border based button
                       https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                                          <table
                                            width="100%"
                                            border="0"
                                            cellspacing="0"
                                            cellpadding="0"
                                            role="presentation"
                                          >
                                            <tr>
                                              <td align="center">
                                                <a
                                                  href="${link}"
                                                  class="f-fallback button button--green"
                                                  target="_blank"
                                                  style="color: white; text-decoration: none;"
                                                  >Reset your password</a
                                                >
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                    <p>
                                      If you did not request a password reset, please ignore
                                      this email or
                                      <a href="mailto:${process.env.user}">contact support</a> if
                                      you have questions.
                                    </p>
                                    <p>Thanks, <br />Team Taskfolio</p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              class="email-footer"
                              align="center"
                              width="570"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                            >
                              <tr>
                                <td class="content-cell" align="center">
                                  <p class="f-fallback sub align-center">
                                    Taksfolio
                                    <br />Aurora e-labs private limited.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            `,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              // console.log(error);
              return new ServerException(Errors.internal_error).get(res);
            } else {
              res.status(StatusCodes.OK).json({
                status: true,
                message: Responses.reset_link_success,
              });
            }
          });
        } else {
          return new ServerException(Errors.internal_error).get(res);
        }
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `User ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.enter_valid} ${invalidKey}`,
      });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const verifyLink = async (req, res) => {
  try {
    const { id, token } = req.params;
    if (id && token) {
      let loginUser = await getUserById(id);
      if (Boolean(loginUser)) {
        const secretkey = process.env.SECRET_KEY;
        jwt.verify(token, secretkey, { complete: true }, (err, decode) => {
          if (err) {
            res
              .status(StatusCodes.BAD_REQUEST)
              .json({
                status: false,
                message: `Link to reset password is expired`,
              });
          } else {
            res.status(StatusCodes.OK).json({
              status: true,
              message: "Valid link",
              data: {
                fullName: loginUser.fullName,
              },
            });
          }
        });
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `User ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `Pass valid user id and token`,
      });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    if (id && token && password) {
      let loginUser = await getUserById(id);
      if (Boolean(loginUser)) {
        const secretkey = process.env.SECRET_KEY;
        jwt.verify(
          token,
          secretkey,
          { complete: true },
          async (err, decode) => {
            if (err) {
              res
                .status(StatusCodes.BAD_REQUEST)
                .json({ status: false, message: `Link is expired` });
            } else {
              let filter = { _id: id };
              const hashedPassword = await bcrypt.hash(
                password,
                PASSWORD_HASH_ROUNDS
              );
              const savedUser = await updateUser(filter, {
                password: hashedPassword,
              });
              if (savedUser) {
                res.status(StatusCodes.OK).json({
                  status: true,
                  message: Responses.user_update_success,
                });
              }
            }
          }
        );
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `User ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `Pass valid user id and token`,
      });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const getUserDetails = async (req, res) => {
  try {
    let { id } = req.params;
    let { isValid, invalidKey } = validatePayload(id);
    if (isValid) {
      let loginUser = await getUserById(id);
      const { _id } = loginUser;
      if (_id) {
        res.status(StatusCodes.OK).json({
          status: true,
          data: loginUser,
        });
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `User ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.enter_valid} ${invalidKey}`,
      });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const getAllUsers = async (req, res) => {
  let { fullName = "" } = req.query;
  let filter = { fullName: { $regex: fullName, $options: "i" } };
  try {
    let users = await getUsers(filter);
    if (users && users.length > 0) {
      res.status(StatusCodes.OK).json({
        status: true,
        data: users.map((user) => {
          let { _id, fullName, email } = user;
          return {
            _id,
            fullName,
            email,
          };
        }),
      });
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: `Users ${Responses.not_found}` });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};

export const logout = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error loggingout user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: Errors.internal_error });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { isValid, invalidKey } = validatePayload(payload);
    let filter = { _id: id };
    if (isValid) {
      const user = await getUserById(id);
      if (user && user["_id"]) {
        const savedUser = await updateUser(filter, payload);
        if (savedUser) {
          res.status(StatusCodes.OK).json({
            status: true,
            message: Responses.user_update_success,
            data: savedUser,
          });
        }
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `User ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Invalid request",
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
