import { Shield, Lock, FileCheck, Award } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function ComplianceStandards() {
  const standards = [
    {
      icon: Lock,
      title: "256-bit SSL Encryption",
      description: "Bank-grade security for all data transmission"
    },
    {
      icon: Award,
      title: "ICAI Registered",
      description: "Institute of Chartered Accountants of India certified"
    },
    {
      icon: FileCheck,
      title: "DTAA Compliant",
      description: "Full compliance with Double Taxation Avoidance Agreements"
    },
    {
      icon: Shield,
      title: "SOC 2 Standards",
      description: "Audited security and data protection protocols"
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl mb-4">Compliance & Security</h2>
          <p className="text-lg text-gray-600">
            Your data and privacy protected with industry-leading standards
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {standards.map((standard, index) => {
            const Icon = standard.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="size-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg mb-2">{standard.title}</h3>
                  <p className="text-sm text-gray-600">{standard.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
