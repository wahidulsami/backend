import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json({ success: false, message: "mising details register" });
  }

  const existUSER = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUSER) {
   return res.status(409).json({ success:
     false,
      message: "User already exists with this username or email" });
  }

  const avatarLocalpath =  req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

 


   let avatar = null;
  if (avatarLocalpath) {
    avatar = await uploadCloudinary(avatarLocalpath);
    if (!avatar) {
     return res.status(500).json({
       success: false,
       message: "Failed to upload avatar to Cloudinary" });
    }
  }

  // Upload cover image if provided
  let coverImage = null;
  if (coverImageLocalpath) {
    coverImage = await uploadCloudinary(coverImageLocalpath);
    if (!coverImage) {
           return res.status(500).json({
       success: false,
       message: "Failed to upload cover to Cloudinary" });
    }
    }
  
  
  //  if (!avatarLocalpath) {
  //     return res.status(400).json({ success: false, message: "Avatar is required" });
  // }

  // if (!avatar) {
  //   throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  // }

  const user = await User.create({
    fullname,
    avatar: avatar ? avatar.url : "",
    coverImage: coverImage ? coverImage.url : "",
    email,
    password,
    username: username.trim().toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
    const cokiesOptions = {
    httpOnly: true,
    secure: false,
  };
  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id);

  if (!createdUser) {
         return res.status(500).json({
       success: false,
       message: "Failed to createdUser user" });
    }
  

  return res
   .status(201)
    .cookie("accessToken", accessToken, cokiesOptions)
    .cookie("refreshToken", refreshToken, cokiesOptions)
    .json({
      success: true,
      message: "User registered successfully",
      data: {
        user: createdUser,
        accessToken,
        refreshToken,
      },
    });
});


const loginUser = asyncHandler(async (req, res) => {

  const { email, username, password } = req.body;

  if (!username && !email) {
       return res.status(400).json({ success:
     false,
      message: "Email and username are required" });
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
           return res.status(404).json({ success:
     false,
      message: "User not found" });
  }
  const ispasswordvalidate = await user.ispasswordCorrect(password);
  if (!ispasswordvalidate) {
           return res.status(401).json({ success:
     false,
      message: "Password is incorrect"});
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id
  );

  const logeedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cokiesOptions = {
    httpOnly: true,
    secure: false,
  };

  return res
   .status(201)
    .cookie("accessToken", accessToken, cokiesOptions)
    .cookie("refreshToken", refreshToken, cokiesOptions)
    .json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: logeedUser,
        accessToken,
        refreshToken,
      },
    });
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
    secure: false,
  };

 return res
    .status(200)
    .clearCookie("accessToken", cokiesOptions)
    .clearCookie("refreshToken", cokiesOptions)
    .json({
      success: true,
    
      message: "User logout in successfully",
    });;
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const cokiesOptions = {
      httpOnly: true,
      secure: false, // ⛔️ local এ false, production এ true
    };

    const { accessToken, newRefreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cokiesOptions)
      .cookie("refreshToken", newRefreshToken, cokiesOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Tokens refreshed successfully"
        )
      );
  } catch (error) {
    return next(new ApiError(401, error?.message || "Invalid refresh token"));
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const ispasswordCorrect = await user.ispasswordCorrect(oldPassword);

  if (!ispasswordCorrect) {
    throw new ApiError(400, " password  is  incorrect");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccoutDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
// TODO >>
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;

// TODO delte old avatar from cloudinary

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadCloudinary(avatarLocalpath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;

  // TODO delte old coverImage from cloudinary

  if (!coverImageLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }
  const coverImage = await uploadCloudinary(coverImageLocalpath);
  if (!coverImage) {
    throw new ApiError(500, "Failed to upload cover to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"));
});

// todo end

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req.params;
  if (!username) {
    throw new ApiError(400, "username is required");
  }
  const channel =   await User.aggregate([
    {
      $match: {
        username: username.trim().toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      }
    }, 
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribedTo",
      }
    }, {
      $addFields: {
        SubscriberCount: { $size: "$subscribers" },
        channelSubscribedToCount: { $size: "$subscribedTo" },
      } ,
      isSubscribed: {
        $cond: {
          if:{$in: [req.user?._id, "$subscribers.subscriber"]},
          then: true,
          else: false,
        }
      }
    }, 
    {
      $project: {
        fullname: 1 ,
        username: 1,
        SubscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar:1,
        coverImage:1
      }
    }
  ])
  console.log(channel);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, channel[0], "Current channel fetched successfully"));
})

const getWatchhistory = asyncHandler(async (req, res) => {

  const user = await  User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },{
              $addFields:{
                owner:{
                  $first: "$owner"
                }
              }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
    200,
    user[0].watchHistory,
    "Watch history fetched successfully"));
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchhistory
};
