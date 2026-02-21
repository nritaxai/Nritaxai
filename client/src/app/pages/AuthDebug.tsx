import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function AuthDebug() {
  const authStatus = {
    isAuthenticated: true,
    user: {
      email: "user@example.com",
      name: "John Doe",
      plan: "Pro",
      joinedDate: "2025-01-15"
    },
    session: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      expiresAt: "2025-02-12 18:30:00",
      isValid: true
    },
    permissions: {
      chat: true,
      calculators: true,
      cpaConsult: true,
      adminDashboard: false
    },
    features: {
      gpt4oMini: true,
      gpt4o: false,
      unlimitedChat: true,
      monthlyConsultations: 1
    }
  };

  const debugLogs = [
    { time: "18:25:12", level: "INFO", message: "User authenticated successfully" },
    { time: "18:25:15", level: "SUCCESS", message: "Session token generated" },
    { time: "18:25:18", level: "INFO", message: "Chat feature enabled for user" },
    { time: "18:25:20", level: "SUCCESS", message: "GPT-4o-mini API connection established" },
    { time: "18:25:22", level: "INFO", message: "User permissions loaded" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl">Authentication Debug</h1>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle2 className="size-3 mr-1" />
              Active
            </Badge>
          </div>
          <p className="text-gray-600">Debug authentication status and permissions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current user session information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Authenticated</span>
                <Badge variant={authStatus.isAuthenticated ? "default" : "secondary"}>
                  {authStatus.isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">User Email</span>
                <span className="text-sm">{authStatus.user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Name</span>
                <span className="text-sm">{authStatus.user.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Plan</span>
                <Badge>{authStatus.user.plan}</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm">{authStatus.user.joinedDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Token and expiry details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-2 border-b">
                <span className="text-sm text-gray-600 block mb-1">Session Token</span>
                <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                  {authStatus.session.token}
                </code>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Expires At</span>
                <span className="text-sm">{authStatus.session.expiresAt}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Valid</span>
                {authStatus.session.isValid ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <XCircle className="size-5 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>Feature access rights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(authStatus.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {value ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : (
                    <XCircle className="size-5 text-red-600" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enabled features for current plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(authStatus.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {typeof value === 'boolean' ? (
                    value ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <XCircle className="size-5 text-red-600" />
                    )
                  ) : (
                    <Badge variant="secondary">{value}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <CardDescription>Recent authentication events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg font-mono text-sm"
                >
                  <span className="text-gray-500">{log.time}</span>
                  <Badge
                    variant={log.level === "SUCCESS" ? "default" : "secondary"}
                    className={
                      log.level === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : log.level === "ERROR"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {log.level === "SUCCESS" && <CheckCircle2 className="size-3 mr-1" />}
                    {log.level === "ERROR" && <XCircle className="size-3 mr-1" />}
                    {log.level === "INFO" && <AlertCircle className="size-3 mr-1" />}
                    {log.level}
                  </Badge>
                  <span className="text-gray-700">{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
