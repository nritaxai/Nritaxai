import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Calculator, TrendingDown, Home, Coins } from "lucide-react";
import {
  calculateCapitalGainsTax,
  calculateIncomeTax,
  calculateRentalIncomeTax,
} from "../../utils/api";

interface CalculatorsProps {
  onRequireLogin: () => void;
}

export function Calculators({ onRequireLogin }: CalculatorsProps) {
  const [taxCalc, setTaxCalc] = useState({
    income: "",
    country: "usa",
    incomeType: "salary"
  });

  const [capitalGains, setCapitalGains] = useState({
    purchasePrice: "",
    salePrice: "",
    period: "long-term"
  });

  const [rentalIncome, setRentalIncome] = useState({
    monthlyRent: "",
    expenses: ""
  });

  const [incomeTaxResult, setIncomeTaxResult] = useState("0.00");
  const [capitalGainsResult, setCapitalGainsResult] = useState({
    gain: "0.00",
    tax: "0.00"
  });
  const [rentalTaxResult, setRentalTaxResult] = useState({
    annualRent: "0.00",
    tax: "0.00"
  });
  const [incomeTaxError, setIncomeTaxError] = useState("");
  const [capitalGainsError, setCapitalGainsError] = useState("");
  const [rentalTaxError, setRentalTaxError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIncomeTaxResult("0.00");
      setIncomeTaxError("Please sign in to use the calculator.");
      return;
    }

    let active = true;

    const fetchIncomeTax = async () => {
      try {
        const response = await calculateIncomeTax(taxCalc);
        if (!active) return;
        const tax = Number(response?.result?.tax || 0);
        setIncomeTaxResult(tax.toFixed(2));
        setIncomeTaxError("");
      } catch {
        if (!active) return;
        setIncomeTaxResult("0.00");
        setIncomeTaxError("Unable to fetch income tax result. Check server/API URL.");
        onRequireLogin();
      }
    };

    fetchIncomeTax();
    return () => {
      active = false;
    };
  }, [taxCalc, isAuthenticated, onRequireLogin]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCapitalGainsResult({ gain: "0.00", tax: "0.00" });
      setCapitalGainsError("Please sign in to use the calculator.");
      return;
    }

    let active = true;

    const fetchCapitalGainsTax = async () => {
      try {
        const response = await calculateCapitalGainsTax(capitalGains);
        if (!active) return;
        const gain = Number(response?.result?.gain || 0);
        const tax = Number(response?.result?.tax || 0);
        setCapitalGainsResult({
          gain: gain.toFixed(2),
          tax: tax.toFixed(2)
        });
        setCapitalGainsError("");
      } catch {
        if (!active) return;
        setCapitalGainsResult({ gain: "0.00", tax: "0.00" });
        setCapitalGainsError("Unable to fetch capital gains result. Check server/API URL.");
        onRequireLogin();
      }
    };

    fetchCapitalGainsTax();
    return () => {
      active = false;
    };
  }, [capitalGains, isAuthenticated, onRequireLogin]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRentalTaxResult({ annualRent: "0.00", tax: "0.00" });
      setRentalTaxError("Please sign in to use the calculator.");
      return;
    }

    let active = true;

    const fetchRentalTax = async () => {
      try {
        const response = await calculateRentalIncomeTax(rentalIncome);
        if (!active) return;
        const annualRent = Number(response?.result?.annualRent || 0);
        const tax = Number(response?.result?.tax || 0);
        setRentalTaxResult({
          annualRent: annualRent.toFixed(2),
          tax: tax.toFixed(2)
        });
        setRentalTaxError("");
      } catch {
        if (!active) return;
        setRentalTaxResult({ annualRent: "0.00", tax: "0.00" });
        setRentalTaxError("Unable to fetch rental income result. Check server/API URL.");
        onRequireLogin();
      }
    };

    fetchRentalTax();
    return () => {
      active = false;
    };
  }, [rentalIncome, isAuthenticated, onRequireLogin]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="rounded-2xl border border-slate-200 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-blue-100 border border-blue-200">
                <Calculator className="size-7 text-blue-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl text-slate-900 mb-3">Login to continue calculation</h1>
              <p className="text-slate-600 max-w-2xl mx-auto mb-7">
                Please sign in to access income tax, capital gains, and rental income calculators.
              </p>
              <Button onClick={onRequireLogin}>Login / Sign Up</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Calculator className="size-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl mb-4">Tax Calculators</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estimate your tax liability with our NRI-specific calculators
          </p>
        </div>

        <Tabs defaultValue="income" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income">Income Tax</TabsTrigger>
            <TabsTrigger value="capital-gains">Capital Gains</TabsTrigger>
            <TabsTrigger value="rental">Rental Income</TabsTrigger>
          </TabsList>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Coins className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Income Tax Calculator</CardTitle>
                    <CardDescription>Calculate your NRI income tax liability</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {incomeTaxError && (
                  <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {incomeTaxError}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (Rs)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="1000000"
                    value={taxCalc.income}
                    onChange={(e) => setTaxCalc({ ...taxCalc, income: e.target.value })}
                    disabled={!isAuthenticated}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country of Residence</Label>
                  <Select value={taxCalc.country} onValueChange={(value) => setTaxCalc({ ...taxCalc, country: value })} disabled={!isAuthenticated}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uae">United Arab Emirates</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="singapore">Singapore</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income-type">Income Type</Label>
                  <Select value={taxCalc.incomeType} onValueChange={(value) => setTaxCalc({ ...taxCalc, incomeType: value })} disabled={!isAuthenticated}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="business">Business Income</SelectItem>
                      <SelectItem value="other">Other Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estimated Tax Liability</p>
                      <p className="text-3xl mt-1">Rs {incomeTaxResult}</p>
                    </div>
                    <TrendingDown className="size-12 text-blue-600" />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  * This is an estimate based on standard tax slabs. Actual tax may vary based on deductions and DTAA provisions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capital-gains">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="size-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Capital Gains Tax Calculator</CardTitle>
                    <CardDescription>Calculate tax on sale of property or investments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {capitalGainsError && (
                  <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {capitalGainsError}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="purchase">Purchase Price (Rs)</Label>
                  <Input
                    id="purchase"
                    type="number"
                    placeholder="5000000"
                    value={capitalGains.purchasePrice}
                    onChange={(e) => setCapitalGains({ ...capitalGains, purchasePrice: e.target.value })}
                    disabled={!isAuthenticated}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale">Sale Price (Rs)</Label>
                  <Input
                    id="sale"
                    type="number"
                    placeholder="7000000"
                    value={capitalGains.salePrice}
                    onChange={(e) => setCapitalGains({ ...capitalGains, salePrice: e.target.value })}
                    disabled={!isAuthenticated}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Holding Period</Label>
                  <Select value={capitalGains.period} onValueChange={(value) => setCapitalGains({ ...capitalGains, period: value })} disabled={!isAuthenticated}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long-term">Long-term (&gt;24 months) - 12.5%</SelectItem>
                      <SelectItem value="short-term">Short-term (&lt;24 months) - 20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Capital Gains</p>
                      <p className="text-2xl mt-1">Rs {capitalGainsResult.gain}</p>
                      <p className="text-sm text-gray-600 mt-2">Estimated Tax</p>
                      <p className="text-3xl mt-1">Rs {capitalGainsResult.tax}</p>
                    </div>
                    <TrendingDown className="size-12 text-green-600" />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  * Tax rates as per latest regulations. Indexation benefits may apply for long-term gains.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rental">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Home className="size-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Rental Income Tax Calculator</CardTitle>
                    <CardDescription>Calculate tax on rental income from property in India</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {rentalTaxError && (
                  <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {rentalTaxError}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="rent">Monthly Rental Income (Rs)</Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="50000"
                    value={rentalIncome.monthlyRent}
                    onChange={(e) => setRentalIncome({ ...rentalIncome, monthlyRent: e.target.value })}
                    disabled={!isAuthenticated}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenses">Annual Expenses and Deductions (Rs)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    placeholder="100000"
                    value={rentalIncome.expenses}
                    onChange={(e) => setRentalIncome({ ...rentalIncome, expenses: e.target.value })}
                    disabled={!isAuthenticated}
                  />
                  <p className="text-xs text-gray-500">
                    Includes municipal taxes, repairs, standard deduction (30% of rent)
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Annual Rental Income</p>
                      <p className="text-2xl mt-1">Rs {rentalTaxResult.annualRent}</p>
                      <p className="text-sm text-gray-600 mt-2">Estimated Tax (30% for NRI)</p>
                      <p className="text-3xl mt-1">Rs {rentalTaxResult.tax}</p>
                    </div>
                    <Home className="size-12 text-orange-600" />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  * NRIs are taxed at 30% (plus surcharge and cess) on rental income. DTAA benefits may apply.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Need Personalized Tax Planning?</CardTitle>
            <CardDescription>
              These calculators provide estimates. For accurate tax planning and filing assistance, consult with our certified CPAs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Book CPA Consultation</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
