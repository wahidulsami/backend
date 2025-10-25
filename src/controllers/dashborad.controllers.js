import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  if (!channelId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not found",
    });
  }

  const channelStats = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalVideos: { $size: { $ifNull: ["$videos", []] } },
        totalLikes: {
          $sum: {
            $map: {
              input: { $ifNull: ["$videos", []] },
              as: "video",
              in: { $size: { $ifNull: ["$$video.likes", []] } },
            },
          },
        },
        totalSubscribers: { $size: { $ifNull: ["$subscribers", []] } },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  if (!channelStats.length) {
    return res.status(404).json({
      success: false,
      message: "Channel not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Channel stats fetched successfully",
    data: channelStats[0],
  });
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  if (!channelId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not found",
    });
  }

  const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

  if (!videos.length) {
    return res.status(404).json({
      success: false,
      message: "No videos found",
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: "Channel videos fetched successfully",
    data: videos,
  });
});

export { getChannelStats, getChannelVideos };
