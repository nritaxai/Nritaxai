import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Bot, Download, Languages, Send, Shield } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TaxReportPDF } from "./TaxReportPDF";

const API = import.meta.env.VITE_API_URL;

interface AIChatProps {
  onRequireLogin: () => void;
}

export function AIChat({ onRequireLogin }: AIChatProps) {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("english");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    {
      role: "ai",
      content: "Welcome to NRITAX AI.\n\nHow can I assist you today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatContentRef.current) return;
    const node = chatContentRef.current;
    const id = requestAnimationFrame(() => {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, isTyping]);

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Please sign in to use AI Chat." },
      ]);
      onRequireLogin();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      onRequireLogin();
      return;
    }

    const userMessage = question;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setQuestion("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API}/api/chat`,
        {
          message: userMessage,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiReply = response.data.reply;
      setMessages((prev) => [...prev, { role: "ai", content: aiReply }]);
    } catch (error: any) {
      if (error.response?.status === 401) {
        onRequireLogin();
      }
      const errorMessage =
        error.response?.status === 401
          ? "Please sign in again to continue."
          : error.response?.data?.error || "Something went wrong. Please try again.";

      setMessages((prev) => [...prev, { role: "ai", content: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  const latestAIMessage = messages.filter((m) => m.role === "ai").slice(-1)[0]?.content || "";
  const reportData = [
    { label: "Language Selected", value: language },
    { label: "User Query", value: messages.slice(-2)[0]?.content || "-" },
    { label: "AI Response Summary", value: latestAIMessage.substring(0, 300) },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">AI-Powered</Badge>
          <h2 className="text-3xl sm:text-4xl mb-4">Chat with AI Tax Assistant</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant answers to your NRI tax queries in multiple languages
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-blue-100">
              <Bot className="size-7 text-blue-600" />
            </div>
            <h3 className="text-2xl mb-2">Login to continue chat</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to use the AI assistant and receive personalized responses.
            </p>
            <Button onClick={onRequireLogin}>Login / Sign Up</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge className="mb-4" variant="outline">AI-Powered</Badge>
        <h2 className="text-3xl sm:text-4xl mb-4">Chat with AI Tax Assistant</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get instant answers to your NRI tax queries in multiple languages
        </p>
      </div>

      <Card className="max-w-4xl mx-auto h-[640px] flex flex-col border border-slate-200 shadow-lg overflow-hidden">
        <CardHeader className="flex-shrink-0 border-b border-slate-200 bg-slate-50/70 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                <Bot className="size-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>AI Tax Assistant</CardTitle>
                <CardDescription>Secure, structured tax guidance for NRIs</CardDescription>
              </div>
            </div>

            <PDFDownloadLink
              document={<TaxReportPDF userName="NRITAX User" reportData={reportData} />}
              fileName="nritax-report.pdf"
            >
              {({ loading }) => (
                <Button size="sm" variant="outline" disabled={!isAuthenticated}>
                  <Download className="size-4 mr-2" />
                  {loading ? "Generating..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Languages className="size-4 text-slate-500" />
            <span className="text-sm text-slate-600">Language</span>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-44 bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="gujarati">Gujarati</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent
          ref={chatContentRef}
          className="flex-1 overflow-y-auto space-y-5 p-6 bg-gradient-to-b from-slate-50 to-white"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white border border-blue-500"
                    : "bg-white text-slate-900 border border-slate-200 prose prose-sm max-w-none"
                }`}
              >
                <p className={`mb-1 text-[11px] uppercase tracking-wide ${message.role === "user" ? "text-blue-100" : "text-slate-500"}`}>
                  {message.role === "user" ? "You" : "NRITAX AI"}
                </p>
                {message.role === "ai" ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">NRITAX AI</p>
                <div className="flex gap-1">
                  <span className="size-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-shrink-0 border-t border-slate-200 bg-white p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <Textarea
              placeholder="Ask about DTAA, NRI taxes, tax planning..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[56px] border-0 bg-transparent focus-visible:ring-0"
              rows={1}
            />
            <Button type="submit" size="icon" className="flex-shrink-0 h-10 w-10 rounded-full">
              <Send className="size-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-sm text-gray-600 leading-relaxed">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="size-4 text-gray-700" />
            <p className="font-semibold text-gray-800">Privacy and Data Protection Notice</p>
          </div>
          <p>
            This chatbot values your privacy and is designed to protect your personal information.
            Any data shared during interactions is used solely to provide accurate and relevant responses.
          </p>
          <p className="mt-2">
            The chatbot does not store, share, or sell personal data to third parties.
            Conversations may be monitored anonymously to improve performance.
          </p>
          <p className="mt-2">
            Please do not share sensitive information such as passwords, financial details, or identification numbers.
          </p>
        </div>
      </div>
    </div>
  );
}
