import { User } from "../models/User.model.js";
import { Video } from "../models/Video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400 , "Invalid user Id")
    }
    const aggregate =  Video.aggregate([
        {
            $sort:{
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        }
    ])

    const fetchedVideos = await Video.aggregatePaginate(aggregate , {
        limit:parseInt(limit),
        page:parseInt(page)
    } )

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        fetchedVideos,
        "videos fetch successfully"
    ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description , thumbnail} = req.body

    const isUser = req.user._id
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}