import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  MessageSquare, 
  Users, 
  FileText, 
  TrendingUp, 
  Globe2, 
  Clock 
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI-Powered Assistance",
      description: "Get instant answers to complex tax queries using advanced AI trained on DTAA regulations and NRI tax laws.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Users,
      title: "Expert CPA Support",
      description: "Connect with certified CPAs specializing in NRI taxation for personalized tax planning and compliance.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Globe2,
      title: "Multi-Language Support",
      description: "Access our platform in English, हिन्दी, தமிழ், and ગુજરાતી for seamless communication.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: FileText,
      title: "DTAA Expertise",
      description: "Navigate Double Taxation Avoidance Agreements between India and 90+ countries with confidence.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Tax Planning",
      description: "Optimize your tax liability with strategic planning tailored to your specific NRI situation.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access AI assistance anytime, anywhere with average response time under 2 minutes.",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl mb-4">Why Choose NRITAX.AI?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive tax solutions designed specifically for Non-Resident Indians
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`inline-flex w-12 h-12 items-center justify-center rounded-lg ${feature.color} mb-4`}>
                  <Icon className="size-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
