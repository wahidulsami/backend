import { User } from "../models/User.model.js";
import { Video } from "../models/Video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
 const { 
    page = 1, 
    limit = 10, 
    query = "", 
    sortBy = "createdAt", 
    sortType = "desc", 
    userId 
  } = req.query;

   const match = {};
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }
  const aggregate = Video.aggregate([
    {$match:match},
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


  const Filevideopath = req.files?.video?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

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
    .json(new ApiResponse(200,  "video fetched successfully..." , video ));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {title , description }= req.body



  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404 , 
      "invalid video id ")
  }

let thumbnailURL;
if (req.file?.path) {
  const uploadedThumbnail = await uploadCloudinary(req.file.path);
  thumbnailURL = uploadedThumbnail.secure_url
}


  
  const updateVideo = await Video.findByIdAndUpdate( 
      videoId,
    {
      title: title?.trim(),
      description: description?.trim(),
      ...(thumbnailURL && { thumbnail: thumbnailURL }) 
    },
    { new: true }
  )

  if (!updateVideo) {
    throw new ApiError(
      404, 
      "failed to update video"
    )
  }

  return res 
  .status(200)
  .json( new ApiResponse(200, "Video details updated successfully", updateVideo))


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
