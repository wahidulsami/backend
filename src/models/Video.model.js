import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new mongoose.Schema({

    videoFile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
        duration: {
        type: Number,
        required: true,
    },
        views: {
        type: Number,
        default: 0,
    },
        isPublished: {
        type: Boolean,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

} , {timestamps: true});

VideoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model('Video', VideoSchema);