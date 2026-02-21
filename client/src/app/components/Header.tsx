import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Globe, Menu, LogIn, LogOut, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


interface HeaderProps {
  onAskAI: () => void;
  onLogin: () => void;
}

interface User {
  name: string;
  email: string;
}

export function Header({ onAskAI, onLogin }: HeaderProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
          } else {
      setUser(null);
    }
  };

  // Run once on mount
  loadUser();

  // Listen for login/logout changes
  window.addEventListener("storage", loadUser);
  window.addEventListener("auth-changed", loadUser);

  return () => {
    window.removeEventListener("storage", loadUser);
    window.removeEventListener("auth-changed", loadUser);
  };
}, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("auth-changed"));
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Globe className="size-8 text-blue-600" />
            <span className="text-xl">
              NRITAX<span className="text-blue-600">.AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/#features"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>

            <Link
              to="/#updates"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Tax Updates
            </Link>

            <Link
              to="/#ai-chat"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              AI Chat
            </Link>
            {/* Pricing */}
            <Link
              to="/pricing"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/#compliance"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Compliance
            </Link>

            {/* Tax Calculator */}
            <Link
              to="/calculators"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Calculator className="size-4" />
              Tax Calculator
            </Link>

            {/* Language Select */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
                <SelectItem value="gu">ગુજરાતી</SelectItem>
              </SelectContent>
            </Select>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Hello, {user.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={onLogin}>
                <LogIn className="size-4 mr-2" />
                Login / Sign Up
              </Button>
            )}
          </nav>


          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="size-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">

            <Link
              to="/#features"
              className="block text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>

            <Link
              to="/#updates"
              className="block text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tax Updates
            </Link>

            <Link
              to="/#ai-chat"
              className="block text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Chat
            </Link>

            <Link
              to="/pricing"
              className="block text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>

            <Link
              to="/#compliance"
              className="block text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compliance
            </Link>

            <Link
              to="/calculators"
              className="block text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tax Calculator
            </Link>

            <div className="pt-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="ta">தமிழ்</SelectItem>
                  <SelectItem value="gu">ગુજરાતી</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {user ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogin();
                }}
                className="w-full"
              >
                <LogIn className="size-4 mr-2" />
                Login / Sign Up
              </Button>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
