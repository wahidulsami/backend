import { User } from "../models/User.model.js";
import { Video } from "../models/Video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user Id");
  }
  const aggregate = Video.aggregate([
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
  ]);

  const fetchedVideos = await Video.aggregatePaginate(aggregate, {
    limit: parseInt(limit),
    page: parseInt(page),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedVideos, "videos fetch successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const isUser = req.user._id;
  if (!isUser) {
    throw new ApiError(404, "user not found");
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const Filevideopath = req.file?.path;
  if (!Filevideopath) {
    throw new ApiError(404, "video is required");
  }

  const uploadVideo = await uploadCloudinary(Filevideopath);
  const duration_video = uploadVideo.duration.toFixed(0);
  const video = await Video.create({
    title,
    description,
    videoFile: uploadVideo.url,
    owner: user._id,
    duration: duration_video,
  });

  if (!video) {
    throw new ApiError(404, "failed to publish");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "publish video successfully", video));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "user not found");
  }

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $project: {
        username: "$userDetails.username",
        thumbnail: 1,
        description: 1,
        title: 1,
        views: 1,
        duration: 1,
        videoFile: 1,
      },
    },
  ]);
  if (!video) {
    throw new ApiError(
        404,
        "video not found"
    )
  }
    return res
    .status(200)
    .json(new ApiResponse(200, "video fetched successfully...", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //    console.log(videoId);

});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {title, description , thumbnail} = req.body

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404 , "user not found")
  }

});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
