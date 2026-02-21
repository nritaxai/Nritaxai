import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Bot, Send, Languages, Sparkles } from "lucide-react";



const API = import.meta.env.VITE_API_URL ;

console.log("Loaded API URL:", API);

export function Chat() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("english");
  const [model, setModel] = useState("gpt-4o-mini");
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    {
      role: "ai",
      content: "Hello! I'm powered by GPT-4o-mini and ready to help you with DTAA regulations, NRI tax queries, and tax planning. How can I assist you today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!question.trim()) return;

  const userMessage = question;

  setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
  setQuestion("");
  setIsTyping(true);

  try {
    const response = await axios.post(`${API}/api/chat`, {
      message: userMessage,
    });

    setMessages((prev) => [
      ...prev,
      { role: "ai", content: response.data.reply },
    ]);

  } catch (error: any) {
    console.error("Chat Error:", error.response?.data || error.message);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content: "AI service unavailable. Please try again.",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
};

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!question.trim()) return;

  //   setMessages(prev => [...prev, { role: "user", content: question }]);
  //   setQuestion("");
  //   setIsTyping(true);

  //   setTimeout(() => {
  //     const aiResponses = [
  //       "Based on current DTAA regulations between India and your country of residence, you may be eligible for tax relief. To provide specific guidance, I'll need to know: 1) Your country of residence, 2) Type of income (salary/capital gains/rental), and 3) Whether you have a Tax Residency Certificate.",
  //       "For the India-Singapore DTAA, the recent amendment effective April 1, 2025, reduces royalty withholding tax from 15% to 10%. This applies to payments made from April 1, 2025 onwards. You'll need to submit Form 10F along with your Tax Residency Certificate to claim treaty benefits.",
  //       "NRIs must file ITR if their total income in India exceeds ₹2.5 lakh (basic exemption limit). Common scenarios include: rental income, capital gains from property/shares sold in India, interest on NRO accounts, or business income. DTAA provisions can help reduce your tax liability.",
  //       "To claim DTAA benefits, you need: 1) Valid Tax Residency Certificate (TRC) from your country, 2) Form 10F submission, 3) PAN card, and 4) Documentation of income source. The TRC must be from the financial year for which you're claiming benefits.",
  //       "For NRO (Non-Resident Ordinary) accounts, interest earned is taxable at 30% (plus applicable surcharge and cess). However, you can claim DTAA benefits to reduce this rate. NRE (Non-Resident External) account interest is tax-free in India.",
  //       "Long-term capital gains (LTCG) on equity shares and equity mutual funds exceeding ₹1.25 lakh are taxed at 12.5%. Short-term capital gains (STCG) are taxed at 20%. Remember to check DTAA provisions for your country of residence."
  //     ];
      
  //     const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
  //     setMessages(prev => [...prev, { role: "ai", content: randomResponse }]);
  //     setIsTyping(false);
  //   }, 1500);
  // };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Sparkles className="size-4" />
            <span className="text-sm">Powered by GPT-4o-mini</span>
          </div>
          <h1 className="text-3xl sm:text-4xl mb-4">AI Tax Chat</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant, intelligent answers to all your NRI tax questions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bot className="size-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>AI Tax Assistant</CardTitle>
                      <CardDescription>Ask anything about NRI taxes and DTAA</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <span className="size-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Languages className="size-4 text-gray-500" />
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिन्दी</SelectItem>
                      <SelectItem value="tamil">தமிழ்</SelectItem>
                      <SelectItem value="gujarati">ગુજરાતી</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-40 ml-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border text-gray-900"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <span className="size-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-shrink-0">
                <form onSubmit={handleSubmit} className="w-full flex gap-2">
                  <Textarea
                    placeholder="Ask about DTAA, NRI taxes, tax planning, ITR filing..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                  <Button type="submit" size="icon" className="flex-shrink-0 h-auto">
                    <Send className="size-5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar with starter questions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Starter Questions</CardTitle>
                <CardDescription>Click to ask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "What is DTAA and how does it help NRIs?",
                  "Do I need to file ITR as an NRI?",
                  "How to claim India-USA DTAA benefits?",
                  "What's the difference between NRO and NRE accounts?",
                  "How is rental income taxed for NRIs?",
                  "What documents do I need for Tax Residency Certificate?"
                ].map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-2 px-3"
                    onClick={() => setQuestion(q)}
                  >
                    <span className="text-sm">{q}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
