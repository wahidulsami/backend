import { Playlist } from "../models/Playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Playlist name is required");
  }

  if (!req.user?._id) {
    throw new ApiError(404, "Unauthorized: Please login to create a playlist");
  }
  const existingPlaylist = await Playlist.findOne({
    owner: req.user?._id,
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existingPlaylist) {
    throw new ApiError(404, "you have a alaerdy this name plalist");
  }

  const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id

  });

  return res
    .status(200)
    .json(new ApiResponse(200, "playlsit create successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  if(!userId || !mongoose.Types.ObjectId.isValid(userId))
  {
    throw new ApiError(404 , "Invalid user Id..")
  }

  const playlists = await Playlist.find({owner: userId})

  if (!playlists) {
    throw new ApiError(404 ,"no playlists found")
}

  return res
  .status(200)
  .json(new ApiResponse(200 ,"playlists fetched successfully" , playlists))

});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  
  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(404 , "Invalid palylist Id..")
  }

  const  playlists = await Playlist.findById(playlistId)
  if (!playlists) {
    throw new ApiError(200, "plalist id not found")
  }

  return res
  .status(200)
  .json(new ApiResponse(200 , "playlistId fetched successfully" , playlists))

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
