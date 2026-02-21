import React, { useState } from "react";
import axios from "axios";

type BillingType = "monthly" | "yearly";
type PromoCode = {
  code: string;
  discountPercent: number;
  description: string;
};

const PROMO_CODES: PromoCode[] = [
  { code: "SANDBOX10", discountPercent: 10, description: "10% off on any plan (test only)" },
  { code: "SANDBOX20", discountPercent: 20, description: "20% off on any plan (test only)" },
  { code: "SANDBOXY25", discountPercent: 25, description: "25% off on yearly billing (test only)" },
  { code: "SANDBOX15", discountPercent: 15, description: "15% off on any plan (test only)" },
];

const loadRazorpayScript = async () => {
  if ((window as any).Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface CheckoutPageProps {
  onRequireLogin: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onRequireLogin }) => {
  const API = import.meta.env.VITE_API_URL;
  const isSandboxPromoMode =
    import.meta.env.DEV || import.meta.env.VITE_PROMO_MODE === "sandbox";
  const [billing, setBilling] = useState<BillingType>("monthly");
  const [promo, setPromo] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoMessage, setPromoMessage] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const price = billing === "monthly" ? 25 : 276;
  const discountAmount = appliedPromo
    ? Number(((price * appliedPromo.discountPercent) / 100).toFixed(2))
    : 0;
  const finalTotal = Number((price - discountAmount).toFixed(2));

  React.useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  React.useEffect(() => {
    if (appliedPromo?.code === "SANDBOXY25" && billing !== "yearly") {
      setAppliedPromo(null);
      setPromoMessage("");
      setPromoError("SANDBOXY25 was removed because billing is not yearly.");
    }
  }, [billing, appliedPromo]);

  const handleApplyPromo = () => {
    if (!isSandboxPromoMode) {
      setPromoError("Promo codes are disabled in live mode. Sandbox only.");
      setPromoMessage("");
      setAppliedPromo(null);
      return;
    }

    const normalized = promo.trim().toUpperCase();
    if (!normalized) {
      setPromoError("Please enter a promo code.");
      setPromoMessage("");
      setAppliedPromo(null);
      return;
    }

    const found = PROMO_CODES.find((item) => item.code === normalized);
    if (!found) {
      setPromoError("Invalid promo code.");
      setPromoMessage("");
      setAppliedPromo(null);
      return;
    }

    if (found.code === "SANDBOXY25" && billing !== "yearly") {
      setPromoError("SANDBOXY25 is valid only for yearly billing.");
      setPromoMessage("");
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
    setPromoError("");
    setPromoMessage(`${found.code} applied: ${found.discountPercent}% off.`);
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!email.trim() || !fullName.trim() || !phone.trim()) {
      setCheckoutError("Please fill Email, Full Name, and Phone to continue.");
      return;
    }

    if (promo.trim() && !appliedPromo) {
      setCheckoutError("Please apply a valid promo code before continuing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      onRequireLogin();
      return;
    }

    setIsProcessingPayment(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setCheckoutError("Unable to load payment SDK. Please try again.");
        return;
      }

      const { data } = await axios.post(
        `${API}/api/subscription/create-subscription`,
        { plan: "pro" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key: data.razorpayKey || import.meta.env.VITE_RAZORPAY_KEY,
        subscription_id: data.id,
        name: "NRITAX.AI",
        description: `Professional Plan (${billing})${appliedPromo ? ` - ${appliedPromo.code}` : ""}`,
        prefill: {
          name: fullName,
          email,
          contact: phone,
        },
        handler: async (response: any) => {
          try {
            await axios.post(
              `${API}/api/subscription/verify-subscription`,
              response,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            alert("Subscription activated successfully!");
          } catch (verifyError: any) {
            console.error(verifyError.response?.data || verifyError);
            setCheckoutError(
              verifyError.response?.data?.message || "Payment verification failed."
            );
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error.response?.data || error);
      setCheckoutError(error.response?.data?.message || "Unable to start payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl bg-white shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-3">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please login to continue with subscription checkout.
          </p>
          <button
            onClick={onRequireLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-10">
          Complete Your Purchase
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ================= ORDER SUMMARY ================= */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-blue-600 font-semibold">
                Professional Plan
              </span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            {/* Billing Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit mb-6">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  billing === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  billing === "yearly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Yearly
              </button>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>
                  {billing === "monthly"
                    ? "Monthly Subscription"
                    : "Yearly Subscription"}
                </span>
                <span>${price}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>- ${discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-blue-600">${finalTotal}</span>
              </div>

              <p className="text-xs text-gray-400">
                *Per month, billed {billing}
              </p>
              <p className="text-xs text-gray-400">
                Sales tax may apply based on your location
              </p>
            </div>
          </div>

          {/* ================= USER INFO ================= */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-lg font-semibold mb-6">Your Information</h2>

            <form className="space-y-5" onSubmit={handleProceedToPayment}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Company (optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company name"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Promo Code */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Promo Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="ENTER PROMO CODE"
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className="text-sm text-green-700 mt-2">{promoMessage}</p>
                )}
                {promoError && (
                  <p className="text-sm text-red-600 mt-2">{promoError}</p>
                )}
                <div className="mt-3 rounded-lg bg-gray-50 border p-3 text-xs text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Sandbox promo codes (test only)</p>
                  <p>SANDBOX10: 10% off on any plan</p>
                  <p>SANDBOX20: 20% off on any plan</p>
                  <p>SANDBOXY25: 25% off on yearly billing</p>
                  <p>SANDBOX15: 15% off on any plan</p>
                  {!isSandboxPromoMode && (
                    <p className="mt-2 text-amber-700">
                      Disabled in live mode. Set `VITE_PROMO_MODE=sandbox` to enable.
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                {isProcessingPayment ? "Starting Payment..." : "Continue to Payment"}
              </button>

              {checkoutError && (
                <p className="text-sm text-red-600 text-center">{checkoutError}</p>
              )}

              <p className="text-xs text-gray-400 text-center">
                You will be redirected to secure Razorpay checkout.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
