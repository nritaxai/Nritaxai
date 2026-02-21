import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingDown, FileText, Calendar } from "lucide-react";

export function TaxUpdates() {
  const updates = [
    {
      id: 1,
      title: "India-Singapore DTAA Royalty Rate Reduction",
      description: "Royalty rates reduced from 15% to 10%, effective April 1, 2025",
      date: "April 1, 2025",
      impact: "Beneficial",
      details: "This significant reduction in DTAA royalty rates benefits NRIs receiving royalty income from Singapore, potentially saving thousands in tax liability.",
      icon: TrendingDown,
      color: "text-green-600 bg-green-50"
    },
    {
      id: 2,
      title: "India-UAE DTAA Tax Residency Certificate Clarification",
      description: "New requirements clarified for FY 2024-25 Tax Residency Certificate",
      date: "FY 2024-25",
      impact: "Compliance",
      details: "Updated guidelines on obtaining and submitting Tax Residency Certificates for UAE-India DTAA benefits. Ensure timely compliance to avoid withholding tax complications.",
      icon: FileText,
      color: "text-blue-600 bg-blue-50"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge className="mb-4" variant="outline">Latest Updates</Badge>
        <h2 className="text-3xl sm:text-4xl mb-4">Recent Tax Updates</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed about the latest DTAA changes and tax regulations affecting NRIs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {updates.map((update) => {
          const Icon = update.icon;
          return (
            <Card key={update.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${update.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <Badge variant="secondary">{update.impact}</Badge>
                </div>
                <CardTitle className="text-xl">{update.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="size-4" />
                  {update.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base mb-3">{update.description}</p>
                <p className="text-sm text-gray-600">{update.details}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
