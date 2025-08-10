import router from "./user.routes";
import {
     addComment ,
     updateComment,
     getVideoComments,
     deleteComments
 } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = router()
router.use(verifyJWT)

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComments).patch(updateComment);


export default router