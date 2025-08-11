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
  
if (!title || !description) {
  throw new ApiError(400, "Title and description are required");
}

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "user not found");
  }
console.log('Request body:', req.body);
console.log('Request files:', req.files);

  const Filevideopath = req.files?.video?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  console.log("Files received:", req.files);
  if (!Filevideopath) {
    throw new ApiError(404, "video is required");
  }
  if (!thumbnailPath) {
    throw new ApiError(404, "thumbnail is required");
  }

  const uploadVideo = await uploadCloudinary(Filevideopath);
  const uploadThumbnail = await uploadCloudinary(thumbnailPath);

  const duration_video = uploadVideo.duration.toFixed(0);

  const video = await Video.create({
    title,
    description,
    videoFile: uploadVideo.url,
    thumbnail: uploadThumbnail.url,
    owner: user._id,
    duration: duration_video,
    isPublished: false,
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

  // If you are uploading a file for thumbnail
  const thumbnailPath = req.file?.path || req.body.thumbnail;

  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim() || !thumbnailPath?.trim()) {
    throw new ApiError(400, "All fields are required");
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid video ID");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { title, description, thumbnail: thumbnailPath },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Failed to update video");
  }

  return res.status(200).json(
    new ApiResponse(200, "Video details updated successfully", updatedVideo)
  );
});


const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Video not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership before deletion
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await video.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Video deleted successfully",
    video,
  });
});


const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "video not found");
  }

  const video = await Video.findById(videoId)
  if (!videoId) {
     throw new ApiError(404, " video not found");
  }

    video.isPublished = !video.isPublished;

    await video.save()
     return res.status(200).json({
    success: true,
    message: `Video is now ${video.isPublished ? "published" : "unpublished"}`,
    video,})
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
