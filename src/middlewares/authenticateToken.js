import jwt from "jsonwebtoken";
import { Responses } from "../Responses/response.js";
import { CONSTANTS } from "../services/constants.js";
import { StatusCodes, generateToken } from "../services/index.js";

const { kindly_provide, invalid_tokens, invalid_token } = Responses;
const { ACCESS_TOKEN } = CONSTANTS;
// this function will verifies the token present in request headers
const authenticateToken = (req, res, next) => {
  const accessToken = req.headers.authorization;
  const refreshToken = req.headers["x-refresh-token"];
  if (!Boolean(accessToken)) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: false, message: `${kindly_provide} token` });
    return;
  }
  const secretkey = process.env.SECRET_KEY;
  const options = {
    complete: true,
  };
  jwt.verify(accessToken, secretkey, options, (err, decoded) => {
    if (err) {
      if (refreshToken) {
        jwt.verify(
          refreshToken,
          secretkey,
          options,
          (refreshErr, refreshDecoded) => {
            if (refreshErr) {
              res.status(StatusCodes.UNAUTHORIZED).json({
                status: false,
                message: invalid_tokens,
              });
            } else {
              let newAccessToken = generateToken(
                { ...refreshDecoded },
                ACCESS_TOKEN
              );
              req.headers.authorization = newAccessToken;
              next();
            }
          }
        );
      }
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: false, message: invalid_token });
      return;
    }
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
    }
    next();
  });
};

export default authenticateToken;
