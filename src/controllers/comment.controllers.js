import mongoose from "mongoose";
import { Comment } from "../models/Comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req , res) => {
    const {videoId} = req.params
    const {page = 1 , limit =10} = req.query
    // if valid video id
    if(!mongoose.Types.ObjectId.isValid(videoId) ){
        throw new ApiError( 400 , "invalid  video Id")
    }

    // convert page 
    const pageNum = parseInt(page)
    const LimNum = parseInt(limit)

    

})
