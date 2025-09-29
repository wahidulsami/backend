import mongoose, { Schema } from "mongoose";

const likeSchma = new mongoose.Schema({

    video: {
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    comment: {
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps: true})

likeSchma.index({ video: 1, likedBy: 1 }, { unique: true });
likeSchma.index({ comment: 1, likedBy: 1 }, { unique: true });
likeSchma.index({ tweet: 1, likedBy: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchma )