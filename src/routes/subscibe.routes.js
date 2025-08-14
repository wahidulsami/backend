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


router.post("/c/:channelId", toggleSubscription);


router.get("/subscribers/:channelId", getUserChannelSubscribers);

export default router;
