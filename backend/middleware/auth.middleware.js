import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";

const veriftToken = asyncHandler(async (req, res, next) => {
  const token =
    req.body.token ||
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies.accessToken;

  if (!token) {
    throw new ApiError(400, "Access denied. No token provided");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SCERETE);

  if (!decodedToken) {
    throw new ApiError(400, "Invalid Token Found");
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    throw new ApiError(400, "User Not Found. Invalid Token Found");
  }

  req.user = user;
  next();
});

export { veriftToken };
