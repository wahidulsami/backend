import mongoose, { startSession } from "mongoose";
import { Like } from "../models/Like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/Comment.model.js";
import { Video } from "../models/Video.model.js";
import { Tweet } from "../models/Tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid video Id" });
  }

  const videoExists = await Video.findById(videoId).select("_id likesCount");
  if (!videoExists) {
    return res.status(404).json({ success: false, message: "Video not found" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    }).session(session);
    let liked, updated;

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id }, { session });
      updated = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likesCount: -1 } },
        { new: true, session, projection: { likesCount: 1 } }
      );
      liked = false;
    } else {
      await Like.create([{ video: videoId, likedBy: userId }], { session });
      updated = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likesCount: 1 } },
        { new: true, session, projection: { likesCount: 1 } }
      );
      liked = true;
    }

    if (updated.likesCount < 0) {
      updated.likesCount = 0;
      await updated.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: liked
        ? "Video liked successfully"
        : "Video unliked successfully",
      data: { videoId, liked, likesCount: updated.likesCount },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Like toggle failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid comment Id... " });
  }

  const commentExists =
    await Comment.findById(commentId).select("_id likesCount");
  if (!commentExists) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    }).session(session);
    let liked, updated;

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id }, { session });
      updated = await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { likesCount: -1 } },
        { new: true, session, projection: { likesCount: 1 } }
      );
      liked = true;
    } else {
      await Like.create([{ comment: commentId, likedBy: userId }], { session });
      updated = await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { likesCount: 1 } },
        { new: true, session, projection: { likesCount: 1 } }
      );
      liked = true;
    }

    if (updated.likesCount < 0) {
      updated.likesCount = 0;
      await updated.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: liked
        ? "Comment liked successfully"
        : "Comment unliked successfully",
      data: { commentId, liked, likesCount: updated.likesCount },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Comment like toggle failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tweet Id",
    });
  }

  const tweetExists = await Tweet.findById(tweetId).select("_id likesCount");
  if (!tweetExists) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existLike = await Tweet.findOne({
      tweet: tweetId,
      likedBy: userId,
    }).session(session);

    let liked, updated;

    if (existLike) {
      await Like.deleteOne({ _id: existLike._id }, { session });

      updated = await Tweet.findByIdAndUpdate(
        tweetId,
        { $inc: { likesCount: -1 } },
        { new: true, session, projection: { likesCount: 1 } }
      );

      liked = false;
    } else {
      await Like.create([{ tweet: tweetId, likedBy: userId }], { session });
      updated = await Tweet.findByIdAndUpdate(
        tweetId,
        { $inc: { likesCount: 1 } }, // likesCount +1
        { new: true, session, projection: { likesCount: 1 } }
      );

      liked = true;
    }

    if (updated.likesCount < 0) {
      updated.likesCount = 0;
      await updated.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: liked
        ? "Tweet liked successfully"
        : "Tweet unliked successfully",
      data: {
        tweetId,
        liked,
        likesCount: updated.likesCount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Tweet like toggle failed:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
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

  return res.status(200).json({
    success: true,
    message: "fetched liked videos successfully",
    LikedvideosDetails,
  });
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
