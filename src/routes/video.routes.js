import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.get("/getAllVideos", getAllVideos);
router.get("/:videoId", getVideoById);


// Protect routes below with JWT verification middleware
router.use(verifyJWT);

router.post(
  "/upload-video",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router.patch("/update-video/:videoId", upload.single("thumbnail"), updateVideo);
router.delete("/deleteVideo/:videoId", deleteVideo);
router.patch("/:videoId/toggle-publish", togglePublishStatus);

export default router;
