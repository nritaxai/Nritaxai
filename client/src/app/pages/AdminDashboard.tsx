import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "AI Conversations",
      value: "18,392",
      change: "+23.1%",
      icon: MessageSquare,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Revenue (USD)",
      value: "$82,450",
      change: "+18.2%",
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "Active Subscriptions",
      value: "1,234",
      change: "+8.7%",
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100"
    }
  ];

  const recentActivity = [
    { user: "john@example.com", action: "Subscribed to Pro", time: "2 min ago", status: "success" },
    { user: "sarah@example.com", action: "Started AI chat", time: "5 min ago", status: "info" },
    { user: "mike@example.com", action: "Booked CPA consultation", time: "12 min ago", status: "success" },
    { user: "emma@example.com", action: "Used tax calculator", time: "18 min ago", status: "info" },
    { user: "alex@example.com", action: "Upgraded to Enterprise", time: "24 min ago", status: "success" }
  ];

  const topCountries = [
    { name: "United States", flag: "🇺🇸", users: 842, percentage: 29.6 },
    { name: "United Kingdom", flag: "🇬🇧", users: 567, percentage: 19.9 },
    { name: "UAE", flag: "🇦🇪", users: 423, percentage: 14.9 },
    { name: "Singapore", flag: "🇸🇬", users: 398, percentage: 14.0 },
    { name: "Canada", flag: "🇨🇦", users: 312, percentage: 11.0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform performance and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-gray-600">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl mb-1">{stat.value}</div>
                  <p className="text-xs text-green-600">{stat.change} from last month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest user actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm">{activity.user}</p>
                      <p className="text-xs text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.status === "success" ? "default" : "secondary"} className="mb-1">
                        {activity.status === "success" ? <CheckCircle className="size-3 mr-1" /> : null}
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>User distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCountries.map((country, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{country.flag}</span>
                        <span className="text-sm">{country.name}</span>
                      </div>
                      <span className="text-sm">{country.users} users</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Stats */}
        <Card>
          <CardHeader>
            <CardTitle>AI Chat Performance</CardTitle>
            <CardDescription>GPT-4o-mini usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
                <p className="text-2xl">18,392</p>
                <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Avg. Messages/Chat</p>
                <p className="text-2xl">8.4</p>
                <p className="text-xs text-gray-600 mt-1">+12% from last month</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">User Satisfaction</p>
                <p className="text-2xl">94%</p>
                <p className="text-xs text-gray-600 mt-1">Based on ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
