import { User } from "../models/User.model.js";
import { Tweet } from "../models/Tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(404, "User not found");
  }
  if (!content.trim()) {
    throw new ApiError(400, "Content field is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "tweet created successfully...", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(404, "user not found");
  }

  const tweet = await Tweet.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "tweetsDetails",
      },
    },
    {
      $unwind: "$tweetsDetails",
    },
    {
      $project: {
        username: "$tweetsDetails.username",
        createdAt: 1,
        updatedAt: 1,
        content: 1,
      },
    },
  ]);

  if (!tweet) {
    throw new ApiError(404 ,"user not found")
  }

  return res
  .status(200)
  .json(new ApiResponse(200 , "tweet fethed sucessfully" , tweet))
});

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

   const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "updated tweet successfully...", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const {tweetId} = req.params

    if (!userId) {
    throw new ApiError(404, "User not found");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

  if (!deleteTweet) {
     throw new ApiError(
      404,
      "Oops! We couldn't find the tweet you're looking for..."
    );
  }

    return res
    .status(200)
    .json(new ApiResponse(200, "tweet deleted successfully...", deleteTweet));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
