import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { CheckCircle2, CreditCard, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscribeProps {
  selectedPlan?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function Subscribe({ selectedPlan: initialPlan }: SubscribeProps) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || "pro");
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const plans = {
    pro: { name: "Pro", price: 29 },
    enterprise: { name: "Enterprise", price: 99 }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      // Create order on backend
      const orderResp = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, email })
      }).then(res => res.json());

      const options = {
        key: orderResp.key, // Razorpay Key from backend
        amount: orderResp.amount,
        currency: orderResp.currency,
        name: "NRITAX.AI",
        description: `${plans[selectedPlan as keyof typeof plans].name} Plan`,
        order_id: orderResp.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResp = await fetch("/api/verify-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              plan: selectedPlan,
              email
            })
          }).then(res => res.json());

          if (verifyResp.success) setSubscribed(true);
          else alert("Payment verification failed");
        },
        prefill: { email },
        theme: { color: "#2563EB" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed, try again.");
    }
  };

  if (subscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
            <CardDescription>
              Welcome to NRITAX.AI {plans[selectedPlan as keyof typeof plans].name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/chat')} className="w-full">
              Start Using AI Chat
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl mb-4">Complete Your Subscription</h1>
          <p className="text-xl text-gray-600">Start your subscription today</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-1 space-y-4">
            {Object.entries(plans).map(([key, plan]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${selectedPlan === key ? 'border-blue-600 border-2' : ''}`}
                onClick={() => setSelectedPlan(key)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {key === "pro" && <Badge>Popular</Badge>}
                  </CardTitle>
                  <CardDescription>${plan.price}/month</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>Enter your email to proceed</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={handlePayment}
                  >
                    Pay ${plans[selectedPlan as keyof typeof plans].price}
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Lock className="size-4" />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
