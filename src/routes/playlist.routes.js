import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.post("/createPlaylist", createPlaylist);

router.get("/user/:userId", getUserPlaylists);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.patch("/:playlistId/addPlaylistVideo/:videoId", addVideoToPlaylist);
router.patch("/:playlistId/removePlaylistVideo/:videoId", removeVideoFromPlaylist);

export default router;
