import { Router } from 'express';
import {
    getSubscribedChannelsData,
    getUserChannelsubscribersCount,
    toggleSubscription,
    getChannelSubscribers,
    checkSubscriptionStatus 
    
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Protect all routes




router.post("/c/:channelId", toggleSubscription);


router.get("/u/:subscriberId", getSubscribedChannelsData);


router.get("/channel/:channelId/subscribers", getChannelSubscribers);

// user er subscribed channel gulo dekhabe
router.get("/subscribers/:channelId", getUserChannelsubscribersCount);


router.get("/status/:channelId", checkSubscriptionStatus);
// ata dia subscribe count kore 


export default router;
