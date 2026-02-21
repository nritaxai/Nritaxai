import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  cancelSubscription,
  createSubscription,
  getRazorpayDebugConfig,
  getSubscriptionStatus,
  razorpayWebhook,
  verifySubscriptionPayment,
} from "../Controllers/subscriptionController.js";

const router = express.Router();

// Create subscription (protected route)
router.post("/create-subscription", protect, createSubscription);
router.post("/verify-subscription", protect, verifySubscriptionPayment);
router.get("/status", protect, getSubscriptionStatus);
router.post("/cancel", protect, cancelSubscription);
router.get("/debug-config", protect, getRazorpayDebugConfig);

// Razorpay webhook (public route, called by Razorpay)
router.post("/razorpay-webhook", razorpayWebhook);

export default router;
