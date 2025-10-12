import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  video: {
    type: String,
    required: true
  },
 owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
      parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null, 
  },
}, { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
