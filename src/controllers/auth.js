import bcrypt from "bcrypt";
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
      console.log(hashedPassword);
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
            data: savedUser
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
