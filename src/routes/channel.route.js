
import { getChannelByusername } from "../controllers/channel.controllers.js";

import { Router } from "express";


const router = Router();

// Public routes


router.get("/:username", getChannelByusername);

export default router;
