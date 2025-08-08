"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ModalCustomApiKey } from "./hooks/ModalCustomApiKey";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

type DBUser = {
  email: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
};

export function AuthHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const [mounted, setMounted] = useState(false);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Refresh DB data after payment success
  useEffect(() => {
    if (pathname.includes("/payment-success")) {
      fetchUserFromDB(true);
    }
  }, [pathname, fetchUserFromDB]);

  // Auto-refresh user data every 30 seconds when component is visible
  useEffect(() => {
    if (!mounted || !isClerkLoaded) return;

    const interval = setInterval(() => {
      // Only auto-refresh if user is on main pages and not currently refreshing
      if (pathname.startsWith("/main") && !isRefreshing) {
        fetchUserFromDB();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [mounted, isClerkLoaded, pathname, isRefreshing, fetchUserFromDB]);

  // Listen for page visibility changes to refresh when user comes back to tab
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

  // Listen for storage events (useful for multi-tab scenarios)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "subscription_updated") {
        fetchUserFromDB(true);
        // Clear the flag
        localStorage.removeItem("subscription_updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUserFromDB]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  const isSingleWhisperPage =
    pathname.startsWith("/main/ideas/") && pathname.length > 11;

  if (!mounted || !isClerkLoaded) {
    return (
      <div className="h-[63px] w-full bg-gray-50 border-b border-gray-200" />
    );
  }

  const userPlan = dbUser?.subscriptionPlan || "Free";
  const userEmail = dbUser?.email || "";
  const userImage = clerkUser?.imageUrl || "/default-avatar.png";

  return (
    <header className="sticky top-0 z-50 min-h-[63px] flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
      {isSingleWhisperPage ? (
        <Link href="/main/ideas/" className="flex items-center gap-2">
          <img
            src="/back.svg"
            className="min-w-[14px] size-[14px]"
            alt="Back"
          />
          <span className="text-base font-medium text-[#4A5565]">My Ideas</span>
        </Link>
      ) : (
        <Link
          href={dbUser ? "/main/ideas/" : "/"}
          className="flex items-center gap-2"
        >
          <img
            src="/LOGO RMBL-ICON.svg"
            className="min-w-5 min-h-9 size-5"
            alt="Logo"
          />
          <img
            src="/LOGO RMBL-NAME.svg"
            alt="Logo"
            className="w-[71px] h-[25px]"
          />
        </Link>
      )}

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 rounded-full">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: { img: "rounded-[8px]" },
                    userButtonTrigger: { "&:focus": { boxShadow: "none" } },
                  },
                }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent cursor-default">
              {dbUser && (
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    <img
                      src={userImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userEmail}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        {userPlan}
                      </Badge>
                      {isRefreshing && (
                        <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/main/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/main/pricing")}>
              Upgrade Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ModalCustomApiKey />
    </header>
  );
}
