import crypto from "crypto";
import User from "../Models/userModel.js";
import razorpay from "../Config/razorpay.js";

const PLAN_ALIAS = {
  pro: "PRO",
  premium: "PREMIUM",
  enterprise: "PREMIUM",
};

const EVENT_STATUS_MAP = {
  "subscription.authenticated": "inactive",
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.pending": "inactive",
  "subscription.halted": "inactive",
  "subscription.paused": "inactive",
  "subscription.resumed": "active",
  "subscription.cancelled": "cancelled",
  "subscription.completed": "expired",
  "subscription.expired": "expired",
};

const mapPlanFromRazorpayPlanId = (planId) => {
  if (planId === process.env.RAZORPAY_PRO_PLAN_ID) return "PRO";
  if (planId === process.env.RAZORPAY_PREMIUM_PLAN_ID) return "PREMIUM";
  return "FREE";
};

const resolvePlanMeta = ({ plan, planId }) => {
  if (planId) {
    return { planId, planName: mapPlanFromRazorpayPlanId(planId) };
  }

  if (!plan) return null;
  const normalizedPlan = String(plan).toLowerCase();
  const mappedPlan = PLAN_ALIAS[normalizedPlan];
  if (!mappedPlan) return null;

  const mappedPlanId =
    mappedPlan === "PRO"
      ? process.env.RAZORPAY_PRO_PLAN_ID
      : process.env.RAZORPAY_PREMIUM_PLAN_ID;

  if (!mappedPlanId) return null;
  return { planId: mappedPlanId, planName: mappedPlan };
};

const hmacSha256 = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const toDateOrNull = (epochSeconds) =>
  epochSeconds ? new Date(epochSeconds * 1000) : null;

export const createSubscription = async (req, res) => {
  try {
    const meta = resolvePlanMeta(req.body || {});
    if (!meta) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Provide `plan` or `planId` with valid values.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: meta.planId,
      total_count: 12,
      customer_notify: 1,
      notes: {
        userId: String(user._id),
        plan: meta.planName,
      },
    });

    user.subscription.subscriptionId = subscription.id;
    user.subscription.provider = "razorpay";
    user.subscription.plan = meta.planName;
    user.subscription.status = "inactive";
    await user.save();

    return res.status(200).json({
      success: true,
      id: subscription.id,
      subscriptionId: subscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      plan: meta.planName,
      status: subscription.status,
    });
  } catch (error) {
    console.error("createSubscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Subscription creation failed",
      error: error.message,
    });
  }
};

export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id: paymentId,
      razorpay_subscription_id: subscriptionId,
      razorpay_signature: signature,
    } = req.body || {};

    if (!paymentId || !subscriptionId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification fields",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key secret is not configured",
      });
    }

    const expectedSignature = hmacSha256(
      `${paymentId}|${subscriptionId}`,
      secret
    );
    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.subscription.subscriptionId = subscriptionId;
    user.subscription.status = "active";
    if (!user.subscription.currentPeriodStart) {
      user.subscription.currentPeriodStart = new Date();
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Subscription verified successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("verifySubscriptionPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { subscriptionId } = user.subscription;
    if (!subscriptionId) {
      return res
        .status(400)
        .json({ success: false, message: "No active subscription found" });
    }

    const cancelAtCycleEnd = Boolean(req.body?.cancelAtCycleEnd ?? true);
    const cancelled = await razorpay.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd
    );

    user.subscription.status = cancelAtCycleEnd ? "active" : "cancelled";
    await user.save();

    return res.status(200).json({
      success: true,
      message: cancelAtCycleEnd
        ? "Subscription will be cancelled at cycle end"
        : "Subscription cancelled immediately",
      razorpay: cancelled,
    });
  } catch (error) {
    console.error("cancelSubscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("subscription");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("getSubscriptionStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription status",
      error: error.message,
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, message: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expected = hmacSha256(rawBody, secret);

    if (!signature || expected !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body?.event;
    const subscriptionEntity = req.body?.payload?.subscription?.entity;
    const paymentEntity = req.body?.payload?.payment?.entity;

    if (!event) {
      return res.status(200).json({ status: "ignored", reason: "missing_event" });
    }

    console.log("Razorpay webhook event received:", {
      event,
      subscriptionId: subscriptionEntity?.id || paymentEntity?.subscription_id || null,
      paymentId: paymentEntity?.id || null,
    });

    // Handle one-time/recurring payment capture events
    if (event === "payment.captured" && paymentEntity) {
      const userIdFromNotes = paymentEntity?.notes?.userId;
      const subscriptionIdFromPayment = paymentEntity?.subscription_id;

      let user = null;
      if (userIdFromNotes) {
        user = await User.findById(userIdFromNotes);
      }
      if (!user && subscriptionIdFromPayment) {
        user = await User.findOne({
          "subscription.subscriptionId": subscriptionIdFromPayment,
        });
      }

      if (!user) {
        return res.status(200).json({ status: "user_not_found_for_payment" });
      }

      user.subscription.status = "active";
      if (!user.subscription.currentPeriodStart) {
        user.subscription.currentPeriodStart = new Date();
      }
      await user.save();

      return res.status(200).json({ status: "ok", handledEvent: event });
    }

    // Handle subscription lifecycle events (including subscription.charged)
    if (!subscriptionEntity?.id) {
      return res.status(200).json({ status: "ignored", reason: "missing_subscription_entity" });
    }

    const user = await User.findOne({
      "subscription.subscriptionId": subscriptionEntity.id,
    });
    if (!user) {
      return res.status(200).json({ status: "user_not_found_for_subscription" });
    }

    const nextStatus = EVENT_STATUS_MAP[event];
    if (nextStatus) {
      user.subscription.status = nextStatus;
    }
    if (event === "subscription.charged") {
      user.subscription.status = "active";
    }

    if (subscriptionEntity.plan_id) {
      user.subscription.plan = mapPlanFromRazorpayPlanId(subscriptionEntity.plan_id);
    }

    user.subscription.currentPeriodStart = toDateOrNull(subscriptionEntity.current_start);
    user.subscription.currentPeriodEnd = toDateOrNull(subscriptionEntity.current_end);
    await user.save();

    return res.status(200).json({ status: "ok", handledEvent: event });
  } catch (error) {
    console.error("razorpayWebhook error:", error);
    return res.status(500).json({ success: false, message: "Webhook handling failed" });
  }
};
