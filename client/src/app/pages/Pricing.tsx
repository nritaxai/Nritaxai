import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with basic tax queries",
      features: [
        "5 AI chat messages per day",
        "Basic DTAA information",
        "Tax calculators",
        "Email support",
        "Access to tax updates"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "pro",
      price: "$29",
      period: "per month",
      description: "For NRIs with regular tax planning needs",
      features: [
        "Unlimited AI chat",
        "Advanced DTAA guidance",
        "All tax calculators",
        "Priority email support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "enterprise",
      price: "$99",
      period: "per month",
      description: "Complete tax solution",
      features: [
        "Everything in Pro",
        "Unlimited CPA consultations",
        "Dedicated advisor"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const handleSelect = (planName: string) => {
    if (planName === "free") {
      navigate("/");
    } else {
      navigate(`/checkout?plan=${planName}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular ? "border-blue-600 border-2 shadow-xl" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="capitalize">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl">{plan.price}</span>
                  <span className="ml-2 text-gray-600">
                    / {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="size-5 text-green-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelect(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
