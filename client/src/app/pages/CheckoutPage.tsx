import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CheckCircle2, CreditCard, Lock, ReceiptText, ShieldCheck, Sparkles } from "lucide-react";

type BillingType = "monthly" | "yearly";
type PlanType = "pro" | "enterprise";
type PromoCode = {
  code: string;
  discountPercent: number;
  description: string;
};
type UserPayload = {
  name?: string;
  email?: string;
};

const PROMO_CODES: PromoCode[] = [
  { code: "SANDBOX10", discountPercent: 10, description: "10% off on any plan (test only)" },
  { code: "SANDBOX20", discountPercent: 20, description: "20% off on any plan (test only)" },
  { code: "SANDBOXY25", discountPercent: 25, description: "25% off on yearly billing (test only)" },
  { code: "SANDBOX15", discountPercent: 15, description: "15% off on any plan (test only)" },
];

const PLAN_META: Record<
  PlanType,
  { label: string; monthlyPrice: number; yearlyPrice: number; badge?: string }
> = {
  pro: {
    label: "Professional Plan",
    monthlyPrice: 29,
    yearlyPrice: 319,
    badge: "MOST POPULAR",
  },
  enterprise: {
    label: "Enterprise Plan",
    monthlyPrice: 99,
    yearlyPrice: 1089,
  },
};

const normalizePlan = (value: string | null): PlanType => {
  if (value === "enterprise") return "enterprise";
  return "pro";
};

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
  const [searchParams] = useSearchParams();
  const API = import.meta.env.VITE_API_URL;
  const isSandboxPromoMode =
    import.meta.env.DEV || import.meta.env.VITE_PROMO_MODE === "sandbox";

  const [plan, setPlan] = useState<PlanType>(normalizePlan(searchParams.get("plan")));
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
  const [hasPrefilledUser, setHasPrefilledUser] = useState(false);

  const selectedPlan = PLAN_META[plan];
  const price = billing === "monthly" ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
  const discountAmount = appliedPromo
    ? Number(((price * appliedPromo.discountPercent) / 100).toFixed(2))
    : 0;
  const finalTotal = Number((price - discountAmount).toFixed(2));

  React.useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  React.useEffect(() => {
    setPlan(normalizePlan(searchParams.get("plan")));
  }, [searchParams]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setHasPrefilledUser(false);
      return;
    }
    if (hasPrefilledUser) return;

    const storedUserRaw = localStorage.getItem("user");
    if (!storedUserRaw) return;

    try {
      const storedUser = JSON.parse(storedUserRaw) as UserPayload;
      setFullName((prev) => prev || storedUser.name || "");
      setEmail((prev) => prev || storedUser.email || "");
      setHasPrefilledUser(true);
    } catch {
      // Ignore malformed localStorage payload.
    }
  }, [isAuthenticated, hasPrefilledUser]);

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
        { plan },
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
        description: `${selectedPlan.label} (${billing})${appliedPromo ? ` - ${appliedPromo.code}` : ""}`,
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_35%,_#ffffff_100%)] py-16 px-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-xl p-8 text-center">
          <div className="mx-auto mb-4 size-14 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
            <Lock className="size-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Login Required</h1>
          <p className="text-slate-600 mb-6">
            Please login to continue with secure subscription checkout.
          </p>
          <Button onClick={onRequireLogin} className="w-full h-11 text-base">
            Login / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_35%,_#ffffff_100%)] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">Secure Checkout</Badge>
          <h1 className="text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">Complete Your Subscription</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Confirm your plan, enter billing details, and continue to secure Razorpay payment.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-start">
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 sm:p-7 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ReceiptText className="size-5 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Order Summary</p>
                <h2 className="text-lg font-semibold text-slate-900">{selectedPlan.label}</h2>
              </div>
              {selectedPlan.badge && (
                <Badge className="ml-auto bg-blue-600 text-white">{selectedPlan.badge}</Badge>
              )}
            </div>

            <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  billing === "monthly" ? "bg-white text-slate-900 shadow" : "text-slate-600"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  billing === "yearly" ? "bg-white text-slate-900 shadow" : "text-slate-600"
                }`}
              >
                Yearly
              </button>
            </div>

            <div className="space-y-3 border-y border-slate-200 py-5">
              <div className="flex items-center justify-between text-slate-600">
                <span>{billing === "monthly" ? "Monthly Subscription" : "Yearly Subscription"}</span>
                <span className="text-slate-900 font-medium">${price}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>- ${discountAmount}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-blue-600">${finalTotal}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" /> Instant plan activation after payment</p>
              <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /> Encrypted and secure checkout flow</p>
              <p className="flex items-center gap-2"><CreditCard className="size-4 text-emerald-600" /> Powered by Razorpay</p>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                <Sparkles className="size-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Billing Information</h2>
                <p className="text-sm text-slate-500">You can edit pre-filled details before payment.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleProceedToPayment}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 border border-slate-300 rounded-lg px-3.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-11 border border-slate-300 rounded-lg px-3.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full h-11 border border-slate-300 rounded-lg px-3.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company (optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    className="w-full h-11 border border-slate-300 rounded-lg px-3.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="ENTER PROMO CODE"
                    className="flex-1 h-11 border border-slate-300 rounded-lg px-3.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <Button type="button" onClick={handleApplyPromo} className="h-11 px-5">
                    Apply
                  </Button>
                </div>

                {promoMessage && <p className="text-sm text-emerald-700 mt-2">{promoMessage}</p>}
                {promoError && <p className="text-sm text-red-600 mt-2">{promoError}</p>}

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">Sandbox promo codes (test only)</p>
                  <p>SANDBOX10, SANDBOX20, SANDBOXY25, SANDBOX15</p>
                  {!isSandboxPromoMode && (
                    <p className="text-amber-700">
                      Disabled in live mode. Set `VITE_PROMO_MODE=sandbox` to enable.
                    </p>
                  )}
                </div>
              </div>

              {checkoutError && (
                <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 p-3">
                  {checkoutError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full h-12 text-base"
              >
                {isProcessingPayment ? "Starting Payment..." : `Pay $${finalTotal} Securely`}
              </Button>

              <p className="text-xs text-center text-slate-500">
                You will be redirected to secure Razorpay checkout.
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
