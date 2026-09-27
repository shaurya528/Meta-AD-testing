import express from "express";
import { WebhookGet,WebhookPost } from "../Controller/MetaWebhook.js";
const router=express.Router();

router.get('/webhook',WebhookGet);
router.post('/webhook',WebhookPost);

export default router