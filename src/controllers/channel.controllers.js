import { User } from "../models/User.model.js";
import { Video } from "../models/Video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const getChannelByusername =  asyncHandler(async (req , res) => {
    const {username} = req.params;

    if(!username){
        return res.status(400).json({success: false , message: "Username is required"});
    }

    const user = await User.findOne({username}).select
    ("-password -refreshToken -resetOtp -resetOtpExpireAt -isOtpVerified -email");
    if(!user){
        return res.status(404).json({success: false , message: "User not found"});
    }

     // Get published videos owned by user
     const videos = await Video.find({owner: user._id})
    .sort({ createdAt: -1 })
      .limit(10)
      .lean();


         return res.status(200).json({
      success: true,
      message: "Channel fetched successfully",
      data: {
        user,
        videos,
      },
    });
})