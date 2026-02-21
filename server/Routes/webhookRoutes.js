import express from "express";
import { razorpayWebhook } from "../Controllers/subscriptionController.js";

const router = express.Router();

// Public Razorpay webhook endpoint
router.post("/webhook", razorpayWebhook);

export default router;
