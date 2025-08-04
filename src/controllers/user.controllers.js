import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import {uploadCloudinary} from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async (req, res) => {
  

  // get user details from frontend
  // validation not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res 


   const {fullname , email , username , password} = req.body;


   if(
    [fullname , email, username, password].some((field) => 
     field?.trim() === "")
   ){

    throw new ApiError(400, "all fields is required");
   }

    const existUSER  = await User.findOne({
    $or: [
      { username},
      { email }
    ]
   })

    if(existUSER){
      throw new ApiError(409, "User already exists with this username or email");
    } 

const avatarLocalpath = req.files?.avatar?.[0]?.path;
const coverImageLocalpath = req.files?.coverImage?.[0]?.path;


    if(!avatarLocalpath){
      throw new ApiError(400, "Avatar is required");
    }

   const avatar =  await uploadCloudinary(avatarLocalpath)
const coverImage  =  await uploadCloudinary(coverImageLocalpath);
 
if (!avatar) {
  throw new ApiError(500, "Failed to upload avatar to Cloudinary");
}

 
const user = await User.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage ? coverImage.url : "",
  email,
  password,
  username: username.trim().toLowerCase(),

})

const createdUser = await User.findById(user._id).select("-password -refreshToken");

if (!createdUser ){
  throw new ApiError(500, "Failed to create user");
}


return res.status(201).json(
  new ApiResponse(200 , createdUser , "User created successfully")
)

});

export { registerUser };
