import { User } from "../models/User.model.js";
import { Tweet } from "../models/Tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!content?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }


  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  return res
    .status(201)
    .json({
      success:true,
      message:"tweet created successfully...",
      data:tweet
    })
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const tweets = await Tweet.aggregate([
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



    if (!tweets || tweets.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No tweets found for this user",
    });
  }
  

  return res
  .status(200)
  .json({
    success:true,
    message:"tweet fethed sucessfully",
    data:tweets
  })
});

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const { content } = req.body;

   if (!content) {
    return res.status(400).json({
      success: false,
      message: "Content field is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tweet ID",
    });
  }

   const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

 if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  return res
    .status(200)
    .json({
      success:true,
      message:"updated tweet successfully...",
      data:tweet
    });
});

const deleteTweet = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const {tweetId} = req.params

     if (!userId) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tweet ID",
    });
  }
  const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

  if (!deleteTweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found or already deleted",
    });
  }

    return res
    .status(200)
    .json({
      success:true,
      message: "tweet deleted successfully...",
        data: deleteTweet
    });
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
