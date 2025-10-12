import { Router } from "express";
import {
  addComment,
  updateComment,
  getVideoComments,
  deleteComments
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId")
  .get(getVideoComments)
  .post(addComment);

router.route("/c/:commentId")
  .patch(updateComment)
  .delete(deleteComments);

export default router;
