import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowRight, Briefcase, Check, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Plan = {
  name: "free" | "pro" | "enterprise";
  label: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: "sparkles" | "shield" | "briefcase";
  note: string;
};

const iconMap = {
  sparkles: Sparkles,
  shield: ShieldCheck,
  briefcase: Briefcase,
};

export function Pricing() {
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      name: "free",
      label: "Starter",
      price: "$0",
      period: "forever",
      description: "Start with essential NRI tax tools and updates.",
      features: [
        "5 AI chat messages per day",
        "Basic DTAA information",
        "Tax calculators",
        "Email support",
        "Access to tax updates",
      ],
      cta: "Get Started",
      popular: false,
      icon: "sparkles",
      note: "Best for first-time users",
    },
    {
      name: "pro",
      label: "Professional",
      price: "$29",
      period: "per month",
      description: "For NRIs who need ongoing planning and faster support.",
      features: [
        "Unlimited AI chat",
        "Advanced DTAA guidance",
        "All tax calculators",
        "Priority email support",
        "Personalized tax insights",
      ],
      cta: "Choose Pro",
      popular: true,
      icon: "shield",
      note: "Most selected",
    },
    {
      name: "enterprise",
      label: "Enterprise",
      price: "$99",
      period: "per month",
      description: "Complete solution for high-touch tax and compliance needs.",
      features: [
        "Everything in Professional",
        "Unlimited CPA consultations",
        "Dedicated advisor",
        "Priority response SLA",
        "Quarterly planning review",
      ],
      cta: "Choose Enterprise",
      popular: false,
      icon: "briefcase",
      note: "For complex tax portfolios",
    },
  ];

  const handleSelect = (planName: Plan["name"]) => {
    if (planName === "free") {
      navigate("/");
      return;
    }

    navigate(`/checkout?plan=${planName}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_40%,_#ffffff_100%)] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">Pricing Plans</Badge>
          <h1 className="text-4xl sm:text-5xl tracking-tight text-slate-900 mb-4">
            Pick the right plan for your NRI tax workflow
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Transparent pricing with practical features, from quick guidance to full-service support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const Icon = iconMap[plan.icon];
            return (
              <Card
                key={plan.name}
                className={`relative h-full flex flex-col rounded-2xl border transition-all duration-200 ${
                  plan.popular
                    ? "border-blue-500 shadow-[0_12px_40px_rgba(37,99,235,0.18)] bg-white"
                    : "border-slate-200 bg-white/90 hover:border-slate-300 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                      <Icon className="size-5 text-slate-700" />
                    </div>
                    <span className="text-xs text-slate-500">{plan.note}</span>
                  </div>

                  <CardTitle className="text-2xl text-slate-900">{plan.label}</CardTitle>
                  <CardDescription className="text-slate-600 min-h-[44px]">{plan.description}</CardDescription>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 mb-1">/ {plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 pt-0">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-slate-700">
                        <Check className="size-4 mt-1 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-7"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelect(plan.name)}
                  >
                    {plan.cta}
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Need a custom solution? Contact support for annual and team pricing.
        </p>
      </div>
    </div>
  );
}
