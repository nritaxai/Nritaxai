import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Globe2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CountrySelection() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countries = [
    {
      code: "us",
      name: "United States",
      flag: "🇺🇸",
      dtaa: true,
      taxRate: "Varies",
      description: "Comprehensive DTAA coverage for all income types"
    },
    {
      code: "ae",
      name: "United Arab Emirates",
      flag: "🇦🇪",
      dtaa: true,
      taxRate: "0-10%",
      description: "Recent clarifications on Tax Residency Certificate requirements"
    },
    {
      code: "uk",
      name: "United Kingdom",
      flag: "🇬🇧",
      dtaa: true,
      taxRate: "Varies",
      description: "Strong DTAA provisions for pension and employment income"
    },
    {
      code: "sg",
      name: "Singapore",
      flag: "🇸🇬",
      dtaa: true,
      taxRate: "10-15%",
      description: "Reduced royalty rates effective April 1, 2025"
    },
    {
      code: "ca",
      name: "Canada",
      flag: "🇨🇦",
      dtaa: true,
      taxRate: "Varies",
      description: "Bilateral tax relief on employment and business income"
    },
    {
      code: "au",
      name: "Australia",
      flag: "🇦🇺",
      dtaa: true,
      taxRate: "Varies",
      description: "DTAA benefits for superannuation and capital gains"
    },
    {
      code: "de",
      name: "Germany",
      flag: "🇩🇪",
      dtaa: true,
      taxRate: "Varies",
      description: "Comprehensive tax treaty with India"
    },
    {
      code: "jp",
      name: "Japan",
      flag: "🇯🇵",
      dtaa: true,
      taxRate: "Varies",
      description: "DTAA for employment, business, and pension income"
    },
    {
      code: "fr",
      name: "France",
      flag: "🇫🇷",
      dtaa: true,
      taxRate: "Varies",
      description: "Tax relief on dividends, interest, and royalties"
    },
    {
      code: "nl",
      name: "Netherlands",
      flag: "🇳🇱",
      dtaa: true,
      taxRate: "Varies",
      description: "Beneficial DTAA rates for various income types"
    },
    {
      code: "ch",
      name: "Switzerland",
      flag: "🇨🇭",
      dtaa: true,
      taxRate: "Varies",
      description: "Tax treaty covering employment and business income"
    },
    {
      code: "other",
      name: "Other Country",
      flag: "🌍",
      dtaa: false,
      taxRate: "N/A",
      description: "Check if DTAA exists with your country"
    }
  ];

  const handleContinue = () => {
    if (selectedCountry) {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Globe2 className="size-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl mb-4">Select Your Country of Residence</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'll customize tax guidance based on DTAA provisions for your country
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {countries.map((country) => (
            <Card
              key={country.code}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCountry === country.code ? 'border-blue-600 border-2' : ''
              }`}
              onClick={() => setSelectedCountry(country.code)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{country.flag}</span>
                  {country.dtaa && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      DTAA Available
                    </Badge>
                  )}
                </div>
                <CardTitle>{country.name}</CardTitle>
                <CardDescription>Tax Rate: {country.taxRate}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{country.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCountry && (
          <div className="flex justify-center">
            <Button size="lg" onClick={handleContinue} className="px-8">
              Continue to Chat
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Info Card */}
        <Card className="max-w-3xl mx-auto mt-12">
          <CardHeader>
            <CardTitle>What is DTAA?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Double Taxation Avoidance Agreement (DTAA) is a tax treaty signed between two countries 
              to help taxpayers avoid paying double taxes on the same income.
            </p>
            <p className="text-gray-600">
              India has comprehensive DTAA agreements with over 90 countries, providing relief through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Exemption method - Income taxed in one country is exempt in another</li>
              <li>Credit method - Tax paid in one country can be claimed as credit in another</li>
              <li>Reduced withholding tax rates on dividends, interest, and royalties</li>
              <li>Clear rules on tax residency and permanent establishment</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
