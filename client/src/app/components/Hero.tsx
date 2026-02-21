import { Button } from "./ui/button";
import { Globe, MessageSquare } from "lucide-react";

interface HeroProps {
  onAskAI: () => void;
  onContactCPA: () => void;
}

export function Hero({ onAskAI, onContactCPA }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Removed background pattern */}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Globe className="size-10 text-blue-600" />
            <h1 className="text-4xl sm:text-6xl tracking-tight text-gray-900">
              NRITAX<span className="text-blue-600">.AI</span>
            </h1>
          </div>
          
          <p className="mt-6 text-xl sm:text-2xl max-w-3xl mx-auto text-gray-800">
            AI-Powered Tax Solutions for Non-Resident Indians
          </p>
          
          <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto text-gray-600">
            Navigate global tax complexities and DTAA regulations with instant AI answers in 4 languages, backed by certified CPA expertise.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onAskAI}
              className="bg-blue-600 text-white hover:bg-blue-700 text-base sm:text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <MessageSquare className="size-5 mr-2" />
              Ask AI Instantly
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={onContactCPA}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-8 py-6 rounded-full"
            >
              Consult a CPA
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl text-gray-900">₹2.5 Cr+</div>
              <div className="text-sm text-gray-600 mt-1">Tax Savings</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl text-gray-900">24/7</div>
              <div className="text-sm text-gray-600 mt-1">AI Availability</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl text-gray-900">&lt;2 min</div>
              <div className="text-sm text-gray-600 mt-1">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}