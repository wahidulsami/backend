import mongoose from "mongoose";
import { Like } from "../models/Like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
   return res.status(400).json({ success: false, message: "Invalid video Id" });
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
   return res.status(200).json({
  success: true,
  message: "Video unliked successfully",
  data: existingLike,
});

  }

  const newLike = await Like.create({ video: videoId, likedBy: userId });
return res.status(200).json({
  success: true,
  message: "Tweet liked successfully",
  data: newLike,
});
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
   
    return res
      .status(404)
      .json({success:false , message:"Invalid comment Id... "})
  }

  const commentVideo = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (commentVideo) {
    await Like.findByIdAndDelete(commentVideo._id);
    return res
      .status(200)
     
      .json({success:true  , message: "comment unliked successfully"});
  }

  const newLike = await Like.create({
    comment: commentId,
    likedBy: userId,
  });

  return res
    .status(200)   
    .json({success:true , message:"comment like successfully"  , newLike});

});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
  return res
    .status(404)
      .json({success:false , message:"Invaild tweet Id"})
  }
  const existtweetLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existtweetLike) {
    await Like.findByIdAndDelete(existtweetLike._id);
    return res
      .status(200)
      .json({
        success:true , 
        message:"tweet unliked successfully..."
      });
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
  }
  return res.status(200).json({
    success:true , message: "tweet liked successfully"
  });
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const LikedvideosDetails = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "LikedvideosData",
      },
    },
    {
      $unwind: "$LikedvideosData",
    },
    {
      $project: {
        _id: 0,
        video: "$LikedvideosData",
      },
    },
  ]);

  console.log("liked videos", LikedvideosDetails);

  return res
    .status(200)
    .json(
  {
    success:true ,
    message:  "fetched liked videos successfully",
  LikedvideosDetails
  }
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
