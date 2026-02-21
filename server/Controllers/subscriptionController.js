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

const RAZORPAY_LIFECYCLE_STATUS_TO_LOCAL = {
  created: "inactive",
  authenticated: "inactive",
  active: "active",
  pending: "inactive",
  halted: "inactive",
  paused: "inactive",
  cancelled: "cancelled",
  completed: "expired",
  expired: "expired",
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

const getRazorpayStatus = (status) =>
  RAZORPAY_LIFECYCLE_STATUS_TO_LOCAL[String(status || "").toLowerCase()] || "inactive";

const getHeaderValue = (value) => {
  if (Array.isArray(value)) return value[0] || "";
  return typeof value === "string" ? value : "";
};

const maskValue = (value, keepStart = 4, keepEnd = 3) => {
  if (!value) return null;
  const str = String(value);
  if (str.length <= keepStart + keepEnd) return "*".repeat(str.length);
  return `${str.slice(0, keepStart)}${"*".repeat(str.length - keepStart - keepEnd)}${str.slice(-keepEnd)}`;
};

const ensureRequiredEnv = (...keys) => {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return `Missing required env vars: ${missing.join(", ")}`;
  }
  return null;
};

export const getRazorpayDebugConfig = async (_req, res) => {
  try {
    const required = [
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "RAZORPAY_WEBHOOK_SECRET",
      "RAZORPAY_PRO_PLAN_ID",
      "RAZORPAY_PREMIUM_PLAN_ID",
    ];

    const missing = required.filter((key) => !process.env[key]);

    return res.status(200).json({
      success: true,
      razorpay: {
        ready: missing.length === 0,
        missing,
        keyIdMasked: maskValue(process.env.RAZORPAY_KEY_ID),
        keySecretMasked: maskValue(process.env.RAZORPAY_KEY_SECRET),
        webhookSecretMasked: maskValue(process.env.RAZORPAY_WEBHOOK_SECRET),
        proPlanIdMasked: maskValue(process.env.RAZORPAY_PRO_PLAN_ID),
        premiumPlanIdMasked: maskValue(process.env.RAZORPAY_PREMIUM_PLAN_ID),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load Razorpay debug config",
      error: error.message,
    });
  }
};

const syncUserSubscriptionFromRazorpayEntity = (user, subscriptionEntity) => {
  if (!subscriptionEntity) return;

  if (subscriptionEntity.id) {
    user.subscription.subscriptionId = subscriptionEntity.id;
  }

  if (subscriptionEntity.status) {
    user.subscription.status = getRazorpayStatus(subscriptionEntity.status);
  }

  if (subscriptionEntity.plan_id) {
    user.subscription.plan = mapPlanFromRazorpayPlanId(subscriptionEntity.plan_id);
  }

  user.subscription.currentPeriodStart = toDateOrNull(subscriptionEntity.current_start);
  user.subscription.currentPeriodEnd = toDateOrNull(subscriptionEntity.current_end);
};

export const createSubscription = async (req, res) => {
  try {
    const envError = ensureRequiredEnv(
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "RAZORPAY_PRO_PLAN_ID",
      "RAZORPAY_PREMIUM_PLAN_ID"
    );
    if (envError) {
      return res.status(500).json({ success: false, message: envError });
    }

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

    // Reuse an existing active/authenticated Razorpay subscription if it already exists.
    const existingSubscriptionId = user.subscription?.subscriptionId;
    if (existingSubscriptionId) {
      try {
        const existing = await razorpay.subscriptions.fetch(existingSubscriptionId);
        const existingStatus = getRazorpayStatus(existing?.status);
        const existingPlan = mapPlanFromRazorpayPlanId(existing?.plan_id);

        if (existingStatus === "active" || existingStatus === "inactive") {
          if (existingPlan !== "FREE") {
            syncUserSubscriptionFromRazorpayEntity(user, existing);
            await user.save();
            return res.status(200).json({
              success: true,
              id: existing.id,
              subscriptionId: existing.id,
              razorpayKey: process.env.RAZORPAY_KEY_ID,
              plan: user.subscription.plan,
              status: existing.status,
              reused: true,
            });
          }
        }
      } catch (fetchError) {
        // If existing subscription cannot be fetched, create a new one.
        console.warn("Unable to fetch existing subscription:", fetchError?.message || fetchError);
      }
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: meta.planId,
      total_count: 12,
      customer_notify: 1,
      notes: {
        userId: String(user._id),
        userEmail: user.email,
        plan: meta.planName,
      },
    });

    user.subscription.subscriptionId = subscription.id;
    user.subscription.provider = "razorpay";
    user.subscription.plan = meta.planName;
    user.subscription.status = getRazorpayStatus(subscription.status);
    user.subscription.currentPeriodStart = toDateOrNull(subscription.current_start);
    user.subscription.currentPeriodEnd = toDateOrNull(subscription.current_end);
    await user.save();

    return res.status(200).json({
      success: true,
      id: subscription.id,
      subscriptionId: subscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      plan: meta.planName,
      status: subscription.status,
      reused: false,
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

    const envError = ensureRequiredEnv("RAZORPAY_KEY_SECRET");
    if (envError) {
      return res.status(500).json({ success: false, message: envError });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = hmacSha256(`${paymentId}|${subscriptionId}`, secret);

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

    if (user.subscription.subscriptionId && user.subscription.subscriptionId !== subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription mismatch for this user",
      });
    }

    let fetchedSubscription = null;
    try {
      fetchedSubscription = await razorpay.subscriptions.fetch(subscriptionId);
    } catch (fetchError) {
      console.warn("verifySubscriptionPayment: unable to fetch subscription:", fetchError?.message || fetchError);
    }

    user.subscription.subscriptionId = subscriptionId;
    user.subscription.status = fetchedSubscription
      ? getRazorpayStatus(fetchedSubscription.status)
      : "active";

    if (fetchedSubscription?.plan_id) {
      user.subscription.plan = mapPlanFromRazorpayPlanId(fetchedSubscription.plan_id);
    }

    if (fetchedSubscription) {
      user.subscription.currentPeriodStart = toDateOrNull(fetchedSubscription.current_start);
      user.subscription.currentPeriodEnd = toDateOrNull(fetchedSubscription.current_end);
    } else if (!user.subscription.currentPeriodStart) {
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
    user.subscription.currentPeriodEnd = toDateOrNull(cancelled?.current_end) || user.subscription.currentPeriodEnd;
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

    const subscriptionId = user.subscription?.subscriptionId;
    if (subscriptionId) {
      try {
        const subscription = await razorpay.subscriptions.fetch(subscriptionId);
        syncUserSubscriptionFromRazorpayEntity(user, subscription);
        await user.save();
      } catch (error) {
        console.warn("getSubscriptionStatus: failed to sync from Razorpay:", error?.message || error);
      }
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
    const envError = ensureRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
    if (envError) {
      return res
        .status(500)
        .json({ success: false, message: envError });
    }

    const signature = getHeaderValue(req.headers["x-razorpay-signature"]);
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expected = hmacSha256(rawBody, process.env.RAZORPAY_WEBHOOK_SECRET);

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

    if (!subscriptionEntity?.id) {
      return res.status(200).json({ status: "ignored", reason: "missing_subscription_entity" });
    }

    let user = await User.findOne({
      "subscription.subscriptionId": subscriptionEntity.id,
    });

    if (!user && subscriptionEntity?.notes?.userId) {
      user = await User.findById(subscriptionEntity.notes.userId);
      if (user) {
        user.subscription.subscriptionId = subscriptionEntity.id;
      }
    }

    if (!user) {
      return res.status(200).json({ status: "user_not_found_for_subscription" });
    }

    const nextStatus = EVENT_STATUS_MAP[event];
    if (nextStatus) {
      user.subscription.status = nextStatus;
    } else if (subscriptionEntity.status) {
      user.subscription.status = getRazorpayStatus(subscriptionEntity.status);
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
