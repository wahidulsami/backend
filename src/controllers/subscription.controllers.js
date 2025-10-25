import mongoose, { mongo }  from "mongoose";
import { Subscription } from "../models/Subcripation.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    return res.status(400).json({ success: false, message: "Invalid channel Id" });
  }

  if (userId.toString() === channelId) {
    return res.status(400).json({ success: false, message: "You cannot subscribe to yourself" });
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  let subscribed;
  let updatedChannel;

  if (existingSubscription) {
    // Unsubscribe
    await Subscription.findByIdAndDelete(existingSubscription._id);

    updatedChannel = await User.findByIdAndUpdate(
      channelId,
      { $inc: { subscribersCount: -1 } },
      { new: true, projection: { subscribersCount: 1 } }
    );

    subscribed = false;
  } else {
    // Subscribe
    await Subscription.create({ subscriber: userId, channel: channelId });

    updatedChannel = await User.findByIdAndUpdate(
      channelId,
      { $inc: { subscribersCount: 1 } },
      { new: true, projection: { subscribersCount: 1 } }
    );

    subscribed = true;
  }

  // Prevent negative subscribersCount
  if (updatedChannel && updatedChannel.subscribersCount < 0) {
    updatedChannel.subscribersCount = 0;
    await updatedChannel.save();
  }

  return res.status(200).json({
    success: true,
    message: subscribed ? "Subscribed successfully" : "Unsubscribed successfully",
    data: {
      channelId,
      subscribed,
      subscribersCount: updatedChannel?.subscribersCount || 0,
    },
  });
});


const getUserChannelsubscribersCount = asyncHandler(async (req, res) => {
    const {channelId} = req.params

        if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
       return res.status(400)
       .json({ success: false, message: "Invalid channel Id" });
    }
   const channel = await User.findById(channelId).select("subscribersCount");
    if(!channel){
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

 return res
    .status(200)
    .json(
      {
        success: true,
        message: "Channel subscribers count fetched successfully",
        data:{subscribersCount: channel.subscribersCount || 0,}
      
    }
    );
})


const getSubscribedChannelsData = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId before using it
    if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) {
        return res.status(400).json({ success: false, message: "Invalid subscriber Id" });
    }

    const subscribed = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    { $unwind: "$channelDetails" },
    {
      $project: {
        _id: 0,
        channelId: "$channelDetails._id",
        fullname: "$channelDetails.fullname",
        username: "$channelDetails.username",
        email: "$channelDetails.email",
        avatar: "$channelDetails.avatar",
        subscribersCount: "$channelDetails.subscribersCount",
      },
    },
  ]);

    return res.status(200).json(
      {success: true,
      message: "Subscribed channels fetched successfully",
      data: subscribed,
    }
    );
});


const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    return res.status(400).json({ success: false, message: "Invalid channel Id" });
  }

  const subscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    { $unwind: "$subscriberDetails" },
    {
      $project: {
        _id: 0,
        userId: "$subscriberDetails._id",
        fullname: "$subscriberDetails.fullname",
        username: "$subscriberDetails.username",
        avatar: "$subscriberDetails.avatar",
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    message: "Channel subscribers fetched successfully",
    data: subscribers,
  });
});
const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return res.status(400).json({ success: false, message: "Invalid channel ID" });
  }

  const existing = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  return res.status(200).json({
    success: true,
    subscribed: !!existing,
  });
});


export {
    toggleSubscription,
    getUserChannelsubscribersCount,
    getSubscribedChannelsData,
    getChannelSubscribers,
    checkSubscriptionStatus
}