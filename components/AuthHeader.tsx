"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch latest user data from the database
  const fetchUserFromDB = async () => {
    try {
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
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUserFromDB();
  }, []);

  // Refresh DB data after payment success
  useEffect(() => {
    if (pathname.includes("/payment-success")) {
      fetchUserFromDB();
    }
  }, [pathname]);

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
                    <div className="mt-1">
                      <Badge variant="default" className="text-xs">
                        {userPlan}
                      </Badge>
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
