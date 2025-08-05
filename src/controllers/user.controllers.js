import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
console.log("Access token:", accessToken);
console.log("Refresh token:", refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};
const registerUser = asyncHandler(async (req, res) => { 
  // get user details from frontend
  // validation not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields is required");
  }

  const existUSER = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUSER) {
    throw new ApiError(409, "User already exists with this username or email");
  }

  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadCloudinary(avatarLocalpath);
  const coverImage = await uploadCloudinary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage ? coverImage.url : "",
    email,
    password,
    username: username.trim().toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body >>> data
  // username or email
  // check if user exists
  // validate email and password
  // access token and refresh token generate
  // send cokies

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Email and username are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const ispasswordvalidate = await user.ispasswordCorrect(password);
  if (!ispasswordvalidate) {
    throw new ApiError(401, "Invalid User credentials");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id
  );

  const logeedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cokiesOptions = {
    httpOnly: true,
  secure: false, // ⛔️ local এ false, production এ true

  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cokiesOptions)
    .cookie("refreshToken", refreshToken, cokiesOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: logeedUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const cokiesOptions = {
    httpOnly: true,
  secure: false, // ⛔️ local এ false, production এ true

  };

res
  .status(200)
  .clearCookie("accessToken", cokiesOptions)
  .clearCookie("refreshToken", cokiesOptions)
  .json(new ApiResponse(200, null, "User logged out successfully"));

});

export { registerUser, loginUser, logoutUser };
