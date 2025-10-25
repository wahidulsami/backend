import { Router } from "express";
import { 
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,

    toggleTweetLike
 } from "../controllers/Like.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.post("/toggle/c/:commentId", toggleCommentLike);

router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);


export default router