import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
   subscriber: {
    type: Schema.Types.ObjectId,
    ref: "User",
   } , 
   channel: {
    type: Schema.Types.ObjectId,
    ref: "User",
   }
} , {timestamps: true});


subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
export  const Subscription =
 mongoose.model("Subscription", subscriptionSchema);