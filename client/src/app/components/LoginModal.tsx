import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { X, Eye, EyeOff } from "lucide-react";
import { loginUser, signupUser, googleLoginUser } from "../../utils/api";
import { AuthPopup } from "./AuthPopup";

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ================= LOGIN =================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const response = await loginUser(loginData);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));


      setPopup({
        message: `Welcome back, ${response.user.name}!`,
        type: "success",
      });

      setTimeout(() => {
        setPopup(null);
        onClose();
      }, 2000);

      window.dispatchEvent(new Event("storage"));

    } catch (err: any) {
      setPopup({
        message: err.response?.data?.message || "Login failed",
        type: "error",
      });

      setTimeout(() => setPopup(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await signupUser(signupData);


      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      setPopup({
        message: `Account created successfully! Welcome ${response.data.name}`,
        type: "success",
      });

      setTimeout(() => {
        setPopup(null);
        onClose();
      }, 2000);


      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      setPopup({
        message: err.response?.data?.message || "Signup failed",
        type: "error",
      });

      setTimeout(() => setPopup(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Welcome to NRITAX.AI</CardTitle>
              <CardDescription>
                Login or create an account to continue
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* ================= LOGIN TAB ================= */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label>Password</Label>
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(!showLoginPassword)
                    }
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Login"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <GoogleLogin
                   text="signin_with"
                    onSuccess={async (credentialResponse) => {
                      try {
                        const response = await googleLoginUser(
                          credentialResponse.credential!
                        );

                        localStorage.setItem("token", response.token);
                        localStorage.setItem("user", JSON.stringify(response.user));

                        setPopup({
                          message: `Welcome ${response.user.name}!`,
                          type: "success",
                        });

                        setTimeout(() => {
                          setPopup(null);
                          onClose();
                        }, 2000);

                        window.dispatchEvent(new Event("storage"));
                      } catch (err: any) {
                        setPopup({
                          message: err.response?.data?.message || "Google login failed",
                          type: "error",
                        });
                        setTimeout(() => setPopup(null), 2000);
                      }
                    }}
                    onError={() => {
                      setPopup({
                        message: "Google Sign-In failed",
                        type: "error",
                      });
                      setTimeout(() => setPopup(null), 2000);
                    }}
                  />
                </div>

              </form>
            </TabsContent>

            {/* ================= SIGNUP TAB ================= */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    required
                    value={signupData.name}
                    placeholder="Your full name"
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label>Password</Label>
                  <Input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        password: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowSignupPassword(!showSignupPassword)
                    }
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showSignupPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <div className="space-y-2 relative">
                  <Label>Confirm Password</Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {signupError && (
                  <p className="text-red-500 text-sm">{signupError}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" /> </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <GoogleLogin
                    text="signup_with"
                    onSuccess={async (credentialResponse) => {
                      try {
                        const response = await googleLoginUser(
                          credentialResponse.credential!
                        );

                        localStorage.setItem("token", response.token);
                        localStorage.setItem("user", JSON.stringify(response.user));

                        setPopup({
                          message: `Account created successfully! Welcome ${response.user.name}`,
                          type: "success",
                        });

                        setTimeout(() => {
                          setPopup(null);
                          onClose();
                        }, 2000);

                        window.dispatchEvent(new Event("storage"));
                      } catch (err: any) {
                        setPopup({
                          message: err.response?.data?.message || "Google signup failed",
                          type: "error",
                        });

                        setTimeout(() => setPopup(null), 2000);
                      }
                    }}
                    onError={() => {
                      setPopup({
                        message: "Google Sign-Up failed",
                        type: "error",
                      });

                      setTimeout(() => setPopup(null), 2000);
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {popup && <AuthPopup message={popup.message} type={popup.type} />}

    </div>
  );
}
