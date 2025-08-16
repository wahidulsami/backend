import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Protect all routes


router.get("/u/:subscriberId", getSubscribedChannels);
// ata user koita subscibe chnnel korsa  

router.post("/c/:channelId", toggleSubscription); 
// ata dia sucbre kore 


router.get("/subscribers/:channelId", getUserChannelSubscribers);
// ata dia subscribe count kore 
export default router;
