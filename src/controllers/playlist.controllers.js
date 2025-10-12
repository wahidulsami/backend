import { Playlist } from "../models/Playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Playlist name is required",
    });
  }

  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please login to create a playlist",
    });
  }

  const existingPlaylist = await Playlist.findOne({
    owner: req.user._id,
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existingPlaylist) {
    return res.status(400).json({
      success: false,
      message: "You already have a playlist with this name",
    });
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim() || "",
    owner: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Playlist created successfully",
   data:playlist,
  });
});


const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const playlists = await Playlist.find({ owner: userId });

  if (playlists.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No playlists found for this user",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Playlists fetched successfully",
    playlists,
  });
});


const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid playlist ID",
    });
  }

  const playlist = await Playlist.findById(playlistId).populate("videos");

  if (!playlist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Playlist fetched successfully",
    playlist,
  });
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    return res.status(404).json({
      success:true,
      message:"playlist not found..."
    })
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(404).json({
      success:true,
      message:"Invalid video ID"
    })
    
  
  }

  const addvideoPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true }
  );

  return res
    .status(200)
    .json({
      success:true,
        message:"add video playlist fethed successfully",
        addvideoPlaylist
      }
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid playlist ID",
    });
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid video ID",
    });
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: new mongoose.Types.ObjectId(videoId) } },
    { new: true }
  ).populate("videos");

  if (!updatedPlaylist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Video removed from playlist successfully",
    playlist: updatedPlaylist,
  });
});


const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid playlist ID",
    });
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Playlist deleted successfully",
  });
});


const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid playlist ID",
    });
  }

  if (!name?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Playlist name is required",
    });
  }

  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please login to update a playlist",
    });
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name.trim(),
        description: description?.trim() || "",
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Playlist updated successfully",
    playlist: updatedPlaylist,
  });
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
