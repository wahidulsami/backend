import mongoose, { mongo }  from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/Subcripation.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   
    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError( 404 , "Invalid channel  Id...")
    }
  if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to your own channel.");
    }
  const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    });

  if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res.status(200).json(
            new ApiResponse(200, "Unsubscribed successfully")
        );
    }

    const newSubscription = await Subscription.create({
        subscriber:req.user?._id,
        channel: channelId
    })

    if (!newSubscription) {
        throw new ApiError(500 ,"Error while toggle subscription...")
    }
    return res
    .status(200)
    .json(new ApiResponse(200 , "subscriber successfully"))
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

        if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError( 404 , "Invalid channel  Id...")
    }
   
    const Subscribed = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count:"subscriberCount"
        }
    ]) 
 return res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers count  fetched successfully...", Subscribed)
    );
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId before using it
    if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(404, "Invalid subscriber Id...");
    }

    const subscribed = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
           $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as:"channelDetails"
           }
        },{
            $unwind:"$channelDetails"
        },{
            $project:{
                            _id: 0,
            channelId: "$channelDetails._id",
            name: "$channelDetails.name",
            email: "$channelDetails.email",
            avatar: "$channelDetails.avatar"
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Subscriber to channels fetched successfully...",
            subscribed
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}