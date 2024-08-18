import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateTokens = async (id) => {
  try {
    const user = await User.findById(id);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Unable to genrate refresh token" });
  }
};

// register User
const registerUser = asyncHandler(async (req, res) => {
  let { name, email, password, phone, role } = req.body;

  if (
    [name, email, password, phone, role].some(
      (field) => (field = !field || field.trim() === "")
    )
  ) {
    throw new ApiError(400, "Mandatory Fields Missing");
  }

  const isUserExist = await User.findOne({
    $or: [{ email: email }, { phone: phone }],
  });
  if (isUserExist) {
    throw new ApiError(400, "User Already Exists, Please Login");
  }

  const createdUser = await User.create({ name, email, password, phone, role });
  if (!createdUser) {
    throw new ApiError(400, "User Not Created. Please Try After Sometime");
  }

  const filterUser = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  res.status(200).json(new ApiResponse(200, filterUser));
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  if (!email && !phone) {
    throw new ApiError(400, "Mandatory Feilds Missing");
  }

  if (!password) {
    throw new ApiError(400, "Password Cannot be Empty");
  }

  const user = await User.findOne({
    $or: [{ email: email }, { phone: phone }],
  });
  if (!user) {
    throw new ApiError(400, "User Not Found!");
  }

  const isPasswordCorrect = await user.verifyPassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "User Details or Password Wrong");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const filterUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { filterUser, accessToken, refreshToken },
        "User LoggedIn Successfully"
      )
    );
});

//logout User
const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findOne(_id);

  if (user) {
    await User.updateOne({ _id }, { $set: { refreshToken: null } });
  } else {
    throw new ApiError(500, "Cannot Logout, Something Went Wrong");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout Successfully"));
});

// refresh Token
const refrehIncomingToken = asyncHandler(async (req, res) => {
  const token =
    req.body.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    throw new ApiError(400, "Refresh Token Required");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SCERETE);

    if (!decodedToken) {
      throw new ApiError(
        500,
        "Something Went Wrong while decoding refresh token"
      );
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(400, "Invalid Refresh Token");
    }

    if (user.refreshToken !== token) {
      throw new ApiError(400, "Un-Authorization Token");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    if (!accessToken || !refreshToken) {
      throw new ApiError(400, "Unable to Generate Tokens");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Tokens Generated Successfully"
        )
      );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        400,
        "Refresh Token got Expired. Please Refreshed Token or Login Again"
      );
    } else {
      throw new ApiError(400, "Invalid Refresh Token");
    }
  }
});

export { registerUser, loginUser, logoutUser, refrehIncomingToken };
