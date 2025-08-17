"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  Loader2,
  Plus,
  Upload,
  Mic,
  LayoutDashboard,
  Archive,
  TrendingUp,
  User,
  FileText,
  Mail,
  Edit,
  List,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UploadModal } from "@/components/UploadModal";
import { LimitReachedModal } from "@/components/UpgradeModal";
import { formatWhisperTimestamp } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RecordingModal } from "@/components/RecordingModal";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

interface Transcription {
  id: string;
  title: string;
  preview: string;
  content: string;
  timestamp: string;
  date?: string;
  time?: string;
  duration?: string;
  tags?: string[];
  transforms?: string[];
}

interface UsageData {
  plan: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
}

interface DBUser {
  email: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
}

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <img
        src="/spinner.svg"
        alt="Loading..."
        className="w-8 h-8 animate-spin"
      />
    </div>
  );
}

const RMBLArchive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const { signOut } = useClerk();
  const pathname = usePathname();

  const trpc = useTRPC();
  const deleteMutation = useMutation(
    trpc.whisper.deleteWhisper.mutationOptions()
  );

  const { data: transcriptions = [], isLoading } = useQuery(
    trpc.whisper.listWhispers.queryOptions(undefined, {
      enabled: !!user?.id,
    })
  );

  const [localTranscriptions, setLocalTranscriptions] = useState<
    Transcription[]
  >([]);

  useEffect(() => {
    if (transcriptions) {
      setLocalTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userPlan = dbUser?.subscriptionPlan || "Free";
  const userEmail = dbUser?.email || "";
  const userImage = user?.imageUrl || "/default-avatar.png";

  useEffect(() => {
    if (user === null) {
      router.push("/auth/sign-up?redirectUrl=/main/ideas");
    }
  }, [user, router]);

  const filteredTranscriptions = localTranscriptions.filter((transcription) => {
    const matchesSearch = searchQuery
      ? transcription.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transcription.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesFilter =
      activeFilter === "All"
        ? true
        : transcription.tags?.includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  const displayedTranscriptions = filteredTranscriptions.slice(0, displayCount);
  const hasMoreToShow = filteredTranscriptions.length > displayCount;

  const isLimitExceeded = usage?.plan === "free" && usage?.remainingToday <= 0;

  const filters = ["All", "Work", "Personal", "Meeting", "Idea"];

  // Usage management functions
  const debugUsage = (label: string, data: any) => {
    console.log(`[${label}] Usage data:`, {
      ...data,
      dailyLimitMinutes: data.dailyLimit
        ? (data.dailyLimit / 60).toFixed(1)
        : "unknown",
      usedTodayMinutes: data.usedToday
        ? (data.usedToday / 60).toFixed(1)
        : "unknown",
      remainingTodayMinutes: data.remainingToday
        ? (data.remainingToday / 60).toFixed(1)
        : "unknown",
    });
  };

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/subscription/usage");
        const data = await res.json();

        console.log("Raw API response:", data);

        if (data.success) {
          const plan = data.usage.plan || "free";
          const dailyLimit =
            plan === "free" ? data.usage.dailyLimit || 60 : Infinity;
          const usedToday = data.usage.usedToday || 0;
          const remainingToday =
            plan === "free" ? Math.max(0, dailyLimit - usedToday) : Infinity;

          const usageData = {
            plan,
            dailyLimit,
            usedToday,
            remainingToday,
          };

          debugUsage("Fetch", usageData);
          setUsage(usageData);

          if (usageData.remainingToday <= 0 && usageData.plan === "free") {
            setShowLimitModal(true);
          }
        } else {
          console.error("API returned error:", data.error);
          const defaultUsage = {
            plan: "free",
            dailyLimit: 60,
            usedToday: 0,
            remainingToday: 60,
          };
          debugUsage("Default (API error)", defaultUsage);
          setUsage(defaultUsage);
        }
      } catch (err) {
        console.error("Failed to fetch usage", err);
        const defaultUsage = {
          plan: "free",
          dailyLimit: 60,
          usedToday: 0,
          remainingToday: 60,
        };
        debugUsage("Default (Network error)", defaultUsage);
        setUsage(defaultUsage);
      }
    };

    fetchUsage();
  }, []);

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

  useEffect(() => {
    if (mounted && isLoaded) {
      fetchUserFromDB();
    }
  }, [mounted, isLoaded, fetchUserFromDB]);

  useEffect(() => {
    if (!mounted || !isLoaded) return;

    const interval = setInterval(() => {
      if (pathname.startsWith("/main") && !isRefreshing) {
        fetchUserFromDB();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [mounted, isLoaded, pathname, isRefreshing, fetchUserFromDB]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && pathname.startsWith("/main")) {
        fetchUserFromDB();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pathname, fetchUserFromDB]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "subscription_updated") {
        fetchUserFromDB(true);
        localStorage.removeItem("subscription_updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUserFromDB]);

  const incrementUsage = async (durationSeconds: number) => {
    console.log("Incrementing usage by:", durationSeconds, "seconds");

    try {
      const res = await fetch("/api/subscription/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds }),
      });

      const data = await res.json();
      console.log("Usage update response:", data);

      if (data.success) {
        const plan = data.usage.plan || "free";
        const dailyLimit =
          plan === "free" ? data.usage.dailyLimit || 60 : Infinity;
        const usedToday = data.usage.usedToday || 0;
        const remainingToday =
          plan === "free" ? Math.max(0, dailyLimit - usedToday) : Infinity;

        const updatedUsage = {
          plan,
          dailyLimit,
          usedToday,
          remainingToday,
        };

        debugUsage("After increment", updatedUsage);
        setUsage(updatedUsage);

        if (updatedUsage.remainingToday <= 0 && updatedUsage.plan === "free") {
          setTimeout(() => setShowLimitModal(true), 500);
        }
      } else {
        console.error("Failed to update usage:", data.error);
        if (usage) {
          const optimisticUsage = {
            ...usage,
            usedToday: usage.usedToday + durationSeconds,
            remainingToday:
              usage.plan === "free"
                ? Math.max(0, usage.remainingToday - durationSeconds)
                : Infinity,
          };
          debugUsage("Optimistic update", optimisticUsage);
          setUsage(optimisticUsage);
        }
      }
    } catch (err) {
      console.error("Failed to update usage", err);
      if (usage) {
        const optimisticUsage = {
          ...usage,
          usedToday: usage.usedToday + durationSeconds,
          remainingToday:
            usage.plan === "free"
              ? Math.max(0, usage.remainingToday - durationSeconds)
              : Infinity,
        };
        debugUsage("Optimistic update (error)", optimisticUsage);
        setUsage(optimisticUsage);
      }
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDisplayCount((prev) => prev + 5);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    setDisplayCount(5);
  }, [searchQuery, activeFilter]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RMBL?")) return;

    setDeletingIds((prev) => new Set([...prev, id]));

    try {
      await deleteMutation.mutateAsync({ id });
      setLocalTranscriptions((prev) => prev.filter((t) => t.id !== id));
      console.log("RMBL deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        "Failed to delete. You may not own this RMBL or there was a network error."
      );
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleNewWhisper = () => {
    console.log(
      "New whisper clicked. Is limit exceeded?",
      isLimitExceeded,
      "Usage:",
      usage
    );
    if (isLimitExceeded) {
      console.log("Showing limit modal");
      return setShowLimitModal(true);
    }
    setShowRecordingModal(true);
  };

  const handleUploadVoiceNote = () => {
    console.log(
      "Upload clicked. Is limit exceeded?",
      isLimitExceeded,
      "Usage:",
      usage
    );
    if (isLimitExceeded) {
      console.log("Showing limit modal");
      return setShowLimitModal(true);
    }
    setShowUploadModal(true);
  };

  const handleRecordingComplete = (durationSeconds: number) => {
    console.log("Recording completed with duration:", durationSeconds);
    incrementUsage(durationSeconds);
  };

  const handleUploadComplete = (durationSeconds: number) => {
    console.log("Upload completed with duration:", durationSeconds);
    incrementUsage(durationSeconds);
  };
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.metaKey &&
        e.shiftKey &&
        (e.code === "Space" || e.key === " " || e.key === "Spacebar")
      ) {
        e.preventDefault();
        handleNewWhisper();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [usage]);

  const getTagColor = (tag: string) => {
    const colors = {
      Work: "bg-blue-100 text-blue-800",
      Meeting: "bg-purple-100 text-purple-800",
      Idea: "bg-green-100 text-green-800",
      Personal: "bg-pink-100 text-pink-800",
    };
    return colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      active: true,
      href: "/main/dashboard",
    },
    //{ name: "Record", icon: Mic, active: false },
    { name: "Weekly Check-in", icon: Archive, active: false },
    { name: "Progress", icon: TrendingUp, active: false },
    { name: "Profile", icon: User, active: false },
  ];

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="h-screen inset-y-0 left-0 w-64 bg-white p-4 overflow-y-auto">
            <div className="fixed flex top-0 pt-5 pb-3 bg-white w-1/2 justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">Menu</span>
              </div>
              <button onClick={() => setIsDrawerOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2 overflow-y-auto mt-12 mb-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    item.active
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Recent Ideas Section */}
            {!isSidebarCollapsed && localTranscriptions.length > 0 && (
              <div className="mt-8 px-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Recent Ideas
                </h3>
                <div className="space-y-3">
                  {localTranscriptions.slice(0, 3).map((idea, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {idea.title}
                        </h4>
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatWhisperTimestamp(idea.timestamp)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {idea.preview}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="#"
                  className="flex items-center justify-between mt-4 text-sm font-medium text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
                >
                  <span>View All Ideas</span>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            )}

            {/* User Profile Section for Mobile */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>

              {usage && (
                <div className="mb-4">
                  <Badge
                    variant={usage.plan === "free" ? "secondary" : "default"}
                    className="mb-2"
                  >
                    {usage.plan.toUpperCase()} PLAN
                  </Badge>
                  {usage.plan === "free" && (
                    <div className="text-xs text-gray-600">
                      {Math.floor(usage.remainingToday / 60)}m{" "}
                      {usage.remainingToday % 60}s remaining today
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full bg-green-500 text-white hover:bg-green-600"
                onClick={() => router.push("/main/pricing")}
              >
                Go Pro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden h-full lg:flex flex-col bg-white border-r transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 flex items-center justify-between flex-shrink-0">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">Menu</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href || "#"}
              className={`flex items-center p-3 rounded-lg mb-1 ${
                item.active
                  ? "bg-green-50 text-green-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={isSidebarCollapsed ? item.name : ""}
            >
              <item.icon className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}

          {/* Recent Ideas Section */}
          {!isSidebarCollapsed && localTranscriptions.length > 0 && (
            <div className="mt-8 px-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Recent Ideas
              </h3>
              <div className="space-y-3">
                {localTranscriptions.slice(0, 3).map((idea, index) => (
                  <div key={index} className="p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {idea.title}
                      </h4>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatWhisperTimestamp(idea.timestamp)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {idea.preview}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="#"
                className="flex items-center justify-between mt-4 text-sm font-medium text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
              >
                <span>View All Ideas</span>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile Section */}

        <div className="border-t p-4 flex-shrink-0">
          <div className="flex items-center justify-center">
            <img
              src={userImage}
              alt="Profile"
              className={`rounded-full object-cover ${
                isSidebarCollapsed ? "w-8 h-8" : "w-10 h-10"
              }`}
            />
            {!isSidebarCollapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && usage && (
            <div className="flex flex-row justify-between mb-4 mt-3">
              <div
                className={`text-xs px-2 py-1 rounded-full font-semibold text-center mb-2 ${
                  usage.plan === "free"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {usage.plan.toUpperCase()} PLAN
                {usage.plan === "free" && (
                  <div className="mt-1">
                    {Math.floor(usage.remainingToday / 60)}m{" "}
                    {usage.remainingToday % 60}s remaining
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-xs mb-2">
                <button
                  onClick={handleLogout}
                  className="text-red-600 font-semibold cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {!isSidebarCollapsed && (
            <Button
              className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600"
              onClick={() => router.push("/main/pricing")}
            >
              Go Pro
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Fixed Title Bar */}
        <header className="flex-shrink-0 bg-white border-b py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">RMBL</h1>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-row justify-between mb-5">
                <h1 className="text-xl font-bold">My RMBLs</h1>
                <div className="hidden lg:flex items-center space-x-4">
                  <Button
                    onClick={handleUploadVoiceNote}
                    disabled={isLimitExceeded}
                    variant="outline"
                    className={
                      isLimitExceeded
                        ? "bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isLimitExceeded
                      ? "Upgrade to Upload"
                      : "Upload Voice Note"}
                  </Button>
                  <Button
                    onClick={handleNewWhisper}
                    disabled={isLimitExceeded}
                    className={
                      isLimitExceeded
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isLimitExceeded ? "Upgrade to Record" : "New Recording"}
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mb-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search your thoughts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                        activeFilter === filter
                          ? "bg-gray-200 text-gray-800"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage Warning */}
              {usage &&
                usage.plan === "free" &&
                usage.remainingToday <= 30 &&
                usage.remainingToday > 0 && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg mb-6">
                    <p className="text-sm">
                      Warning: Only {Math.floor(usage.remainingToday / 60)}m{" "}
                      {usage.remainingToday % 60}s of recording time remaining
                      today!
                    </p>
                  </div>
                )}

              {/* Content */}
              {filteredTranscriptions.length === 0 ? (
                <div className="text-center py-16">
                  <h2 className="text-xl font-medium mb-2">Welcome, RMBLer!</h2>
                  <p className="text-gray-600 mb-8">
                    {isLimitExceeded
                      ? "You've used your free recording time for today. Upgrade to continue recording."
                      : "Start by creating a new RMBL or uploading a voice note"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedTranscriptions.map((entry) => {
                    const isDeleting = deletingIds.has(entry.id);
                    return (
                      <div
                        key={entry.id}
                        className={`bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 ${
                          isDeleting ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800 truncate">
                                {entry.title}
                              </h3>
                              <span className="text-xs text-gray-500 mt-1 lg:mt-0 flex-shrink-0">
                                {entry.date ||
                                  formatWhisperTimestamp(entry.timestamp)}
                                {entry.time && ` • ${entry.time}`}
                                {entry.duration && ` • ${entry.duration}`}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-3 lg:line-clamp-2 mb-3">
                              {entry.preview}
                            </p>

                            {/* Tags */}
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {entry.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getTagColor(
                                      tag
                                    )}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Transforms */}
                            {entry.transforms &&
                              entry.transforms.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:justify-start sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                                  <span className="text-gray-500">
                                    Transformed:
                                  </span>
                                  <div className="flex flex-wrap gap-3">
                                    {entry.transforms.map(
                                      (transform, transformIndex) => (
                                        <button
                                          key={transformIndex}
                                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                        >
                                          {transform === "Email" ? (
                                            <Mail className="w-4 h-4" />
                                          ) : transform === "Blog" ? (
                                            <Edit className="w-4 h-4" />
                                          ) : (
                                            <List className="w-4 h-4" />
                                          )}
                                          <span>{transform}</span>
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          <button
                            className="ml-4 flex-shrink-0 p-2 rounded-md hover:bg-gray-100"
                            onClick={() => handleDelete(entry.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Load More Button */}
                  {hasMoreToShow && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        variant="outline"
                        className="bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>
                              Load More (
                              {filteredTranscriptions.length - displayCount}{" "}
                              remaining)
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Action Buttons - positioned to account for scrolling */}
          <div className="lg:hidden sticky bottom-0 bg-white border-t p-4 flex justify-center space-x-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleUploadVoiceNote}
              disabled={isLimitExceeded}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLimitExceeded ? "Upgrade to Upload" : "Upload"}
            </Button>
            <Button
              onClick={handleNewWhisper}
              disabled={isLimitExceeded}
              className={
                isLimitExceeded
                  ? "flex-1 bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "flex-1 bg-green-500 text-white hover:bg-green-600"
              }
            >
              <Mic className="w-4 h-4 mr-2" />
              {isLimitExceeded ? "Upgrade to Record" : "New Recording"}
            </Button>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showRecordingModal && (
        <RecordingModal
          onClose={() => setShowRecordingModal(false)}
          onRecordingComplete={handleRecordingComplete}
          maxDuration={
            usage?.plan === "free" ? usage.remainingToday : undefined
          }
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onRecordingComplete={handleUploadComplete}
          maxDuration={
            usage?.plan === "free" ? usage.remainingToday : undefined
          }
        />
      )}

      {showLimitModal && (
        <LimitReachedModal
          onClose={() => setShowLimitModal(false)}
          limitMessage={`You've reached your daily limit of ${
            usage ? usage.dailyLimit : 300
          } seconds of recording time.`}
        />
      )}
    </div>
  );
};

export default RMBLArchive;
