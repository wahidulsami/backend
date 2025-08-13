import mongoose from "mongoose";
import { Comment } from "../models/Comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req , res) => {
    const {videoId} = req.params
    const {page = 1 , limit =10} = req.query
    // if valid video id
    if(!videoId ||  !mongoose.Types.ObjectId.isValid(videoId) ){
        throw new ApiError( 400 , "invalid  video Id")
    }

    const commentQuery = Comment.aggregate([
        {
            $match: { video: videoId }
        },{
            $sort: {createdAt: -1}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {$project:
                         {username: 1 , avatar:1 , _id:1}
                    }
                ]
            }
        },{
            $unwind:'$owner'
        }
    ])
    const paginate = await Comment.aggregatePaginate(commentQuery ,{
        page: parseInt(page),
        limit: parseInt(limit)
    })
return res
.status(200)
.json(new ApiResponse 
    (200 ,
        paginate,
        "Comments fetched successfully"
    )
)


})

const addComment = asyncHandler(async (req , res)=> {
    const {videoId} = req.params;
    const {content} = req.body;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400 , "Invalid video ID" )
    }
    if(!content){
        throw new ApiError(200 , "all feild is required")
    }

    const newComment = await Comment.create(
       { content,
        video:videoId ,
        owner:req.user._id
    }
    )
    if (!newComment) {
    throw new ApiError(200 , "failed creted comment" );
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, newComment , "NEW Comment fetched successfully" ))
})

const  updateComment = asyncHandler(async (req , res) => {
    const {commentId} = req.params
    const {content} = req.body

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid coment Id")
    }

    const existComment = await Comment.findById(commentId)
    
    if (!existComment) {
        throw new ApiError(404 , "commnet not found")
    }
    if(existComment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403, 
            "you are not authrozied "
        )
    }

    const newComment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new : true}
    )
    if (!newComment) {
        throw new ApiError(500 , "new comment creted failed ")
    }

    return res 
    .status(200)
    .json( new ApiResponse(200 ,"updete comment successfully" , newComment ))

})

const deleteComments = asyncHandler(async (req , res )=> {
    const {commentId} = req.params;
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(404 ,"Invalid comment id " )
    }

    const existComment = await Comment.findById(commentId)

    if (!existComment) {
        throw new ApiError(404 , 
            "comment not found"
        )
    }

    if (existComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 
            "you are not authorized to delete this comment"
        )
    }
  
    const deleteComment = await  Comment.findByIdAndDelete(commentId)
      if (!deleteComment) {
    throw new ApiError(400, "comment deleted unscessfully");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "comment deleted successfully", {}));
})



export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComments
}