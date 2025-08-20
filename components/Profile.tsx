import { useState, useEffect, useCallback } from "react";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import Link from "next/link";

type DBUser = {
  email: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
};

const ProfileSettings = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const [mounted, setMounted] = useState(false);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    preferredDay: "",
    preferredTime: "",
    recordingLanguage: "English (US)",
    aiOutputLanguage: "Same as recording",
  });
  const [selectedTheme, setSelectedTheme] = useState("system");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchUserFromDB = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true);

      const res = await fetch("/api/user/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user || null);
      }
    } catch (error) {
      console.error("Error fetching user from DB:", error);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (mounted && isClerkLoaded) {
      fetchUserFromDB();
    }
  }, [mounted, isClerkLoaded, fetchUserFromDB]);

  if (!mounted || !isClerkLoaded) {
    return (
      <div className="h-[63px] w-full bg-gray-50 border-b border-gray-200" />
    );
  }

  const userPlan = dbUser?.subscriptionPlan || "Free";
  const userEmail = dbUser?.email || "";
  const userImage = clerkUser?.imageUrl || "/default-avatar.png";

  const themeOptions = [
    { key: "light", label: "Light", icon: "☀️" },
    { key: "dark", label: "Dark", icon: "🌙" },
    { key: "system", label: "System", icon: "💻" },
  ];

  const handleSettingsChange = (e: any) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeOptions = [
    "Morning (6-10 AM)",
    "Late Morning (10 AM-12 PM)",
    "Afternoon (12-3 PM)",
    "Late Afternoon (3-6 PM)",
    "Evening (6-9 PM)",
    "Night (9 PM-12 AM)",
  ];

  const languages = [
    "English (US)",
    "English (UK)",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Russian",
    "Chinese (Mandarin)",
    "Japanese",
    "Korean",
  ];

  const integrations = [
    {
      name: "Notion",
      description: "Send transformations directly to your workspace",
      icon: "📝",
    },
    {
      name: "Google Docs",
      description: "Auto-create documents from your recordings",
      icon: "📄",
    },
    {
      name: "Slack",
      description: "Share insights with your team instantly",
      icon: "💬",
    },
    {
      name: "Zapier",
      description: "Connect RMBL to 5000+ apps",
      icon: "⚡",
    },
    {
      name: "Obsidian",
      description: "Build your knowledge graph from voice notes",
      icon: "🔗",
    },
    {
      name: "Linear",
      description: "Create tasks from your action items",
      icon: "📋",
    },
  ];

  const description: any = {
    free: "1-minute recordings, basic features",
    lifetime: "Unlimited recordings, AI transformations",
  };

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">
            Profile & Settings
          </h1>
          <p className="text-gray-500 mt-2">Manage your RMBL experience</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8  ">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  <img
                    src={userImage}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {clerkUser?.firstName} {clerkUser?.lastName}
                  </h2>
                  <p className="text-gray-500">{userEmail}</p>
                  <Badge variant="default" className="text-xs">
                    {userPlan.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 focus:outline-none">
                    {clerkUser?.firstName} {clerkUser?.lastName}
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 focus:outline-none">
                    {userEmail}{" "}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">⭐</span>Subscription
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-gray-800">
                    {userPlan.toUpperCase()}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {description[userPlan.toLowerCase()] || "Unknown plan"}
                  </p>
                </div>
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Current
                </span>
              </div>
              {userPlan.toLowerCase() === "free" ? (
                <div className="bg-green-500 text-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-lg">Upgrade to Pro</h4>
                      <p className="text-sm opacity-90">
                        Unlimited recordings, AI transformations
                      </p>
                    </div>
                    <div className="text-3xl font-bold">$19/mo</div>
                  </div>
                  <Link href="/main/pricing">
                    <button className="w-full bg-white text-green-500 font-bold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
                      Upgrade Now
                    </button>
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Appearance Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">🎨</span>Appearance
              </h3>
              <p className="text-gray-500 mb-6">
                Choose your preferred theme or sync with system
              </p>
              <div className="flex space-x-2">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => setSelectedTheme(theme.key)}
                    className={`flex-1 flex items-center justify-center py-2 px-4 border rounded-md transition-colors ${
                      selectedTheme === theme.key
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-2 text-base">{theme.icon}</span>
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📊</span>Your Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <span className="text-gray-400 mr-3">📅</span>
                  <span>Member since</span>
                  <span className="ml-auto font-medium text-gray-800">
                    January 2024
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✅</span>
                  <span>Total recordings</span>
                  <span className="ml-auto font-medium text-gray-800">12</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">⏱️</span>
                  <span>Total time</span>
                  <span className="ml-auto font-medium text-gray-800">45m</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-gray-400 mr-3">🕒</span>
                  <span>This month</span>
                  <span className="ml-auto font-medium text-gray-800">
                    8 recordings
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="mr-2">🔴</span>
                  New Recording
                </button>
                <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="mr-2">📈</span>
                  View Dashboard
                </button>
                <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="mr-2">💾</span>
                  Export Data
                </button>
              </div>
            </div>

            {/* Weekly Check-in Schedule Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <span className="text-gray-500 mr-3">📅</span>
                <h2 className="text-xl font-semibold text-gray-800">
                  Weekly Check-in Schedule
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="preferred-day"
                  >
                    Preferred Day
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Choose the day you'd like to do your weekly accountability
                    check in
                  </p>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      id="preferred-day"
                      name="preferredDay"
                      value={settings.preferredDay}
                      onChange={handleSettingsChange}
                    >
                      <option value="">Select a day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <span>▼</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="preferred-time"
                  >
                    Preferred Time
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Best time of day for your reflection session
                  </p>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      id="preferred-time"
                      name="preferredTime"
                      value={settings.preferredTime}
                      onChange={handleSettingsChange}
                    >
                      <option value="">Select a time</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <span>▼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Settings Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <span className="text-gray-500 mr-3">🌐</span>
                <h2 className="text-xl font-semibold text-gray-800">
                  Language Settings
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="recording-language"
                  >
                    Recording Language
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Language for voice recognition and transcription
                  </p>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      id="recording-language"
                      name="recordingLanguage"
                      value={settings.recordingLanguage}
                      onChange={handleSettingsChange}
                    >
                      {languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <span>▼</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="ai-output-language"
                  >
                    AI Output Language
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Language for email/blog transformations
                  </p>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      id="ai-output-language"
                      name="aiOutputLanguage"
                      value={settings.aiOutputLanguage}
                      onChange={handleSettingsChange}
                    >
                      <option value="Same as recording">
                        Same as recording
                      </option>
                      {languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <span>▼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-gray-500 mr-3">🔌</span>
                <h2 className="text-xl font-semibold text-gray-800">
                  Integrations
                </h2>
                <span className="ml-2 bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Connect RMBL to your favorite tools and automate your workflow
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      {integration.icon}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800">
                          {integration.name}
                        </h3>
                        <span className="ml-2 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                          Soon
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
