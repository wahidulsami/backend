import mongoose from "mongoose";
import { Like } from "../models/Like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {userId} = req.user._id
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404,  "Invalid video Id...")
    }

    const existingLike = await Like.findOne({
        video:videoId,
        likeby:userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200 , "video unliked" , existingLike))
    }

    const newLike = await Like.create(
        {video:videoId,
            likeby:userId
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200, "video liked" , newLike))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {userId} = req.user._id

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}