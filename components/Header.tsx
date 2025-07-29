"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ModalCustomApiKey } from "./hooks/ModalCustomApiKey";
import { toast } from "sonner";
import { useTogetherApiKey } from "./TogetherApiKeyProvider";
import { useLimits } from "./hooks/useLimits";
import { useUser } from "@clerk/nextjs";

interface User {
  id?: string;
  name?: string;
  avatar?: string;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const { apiKey } = useTogetherApiKey();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const isBYOK = !!apiKey;
  const { transformationsData, isLoading } = useLimits();

  useEffect(() => {
    setMounted(true);
    // Initialize auth state here
    // const authStatus = checkAuthStatus();
    // setIsLoggedIn(authStatus.isAuthenticated);
    // setUser(authStatus.user);
  }, []);

  const handleLogin = (): void => {
    // Implement login logic
    // await login();
    router.push("/auth/login");
    setIsLoggedIn(true);
    setUser({ id: "user-id", name: "User Name", avatar: "/avatar.png" });
  };

  const handleSignUp = (): void => {
    // Implement signup logic
    // await signUp();
    router.push("/auth/sign-up");
    setIsLoggedIn(true);
    setUser({ id: "user-id", name: "User Name", avatar: "/avatar.png" });
  };

  const handleLogout = (): void => {
    // Implement logout logic
    // await logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  const isSingleWhisperPage: boolean =
    pathname.startsWith("/whispers/") && pathname.length > 11;

  if (!mounted) {
    return (
      <div className="h-[63px] w-full bg-gray-50 border-b border-gray-200" />
    );
  }

  return (
    <header className="min-h-[63px] flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
      {isSingleWhisperPage ? (
        <Link href="/whispers/" className="flex items-center gap-2">
          <img
            src="/back.svg"
            className="min-w-[14px] min-h-[14px] size-[14px]"
            alt="Back"
          />
          <span className="text-base font-medium text-[#4A5565]">My Ideas</span>
        </Link>
      ) : (
        <Link
          href={isLoggedIn ? "/whispers/" : "/"}
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
            className="w-[71px] min-h-[25px] h-[25px]"
          />
        </Link>
      )}
      <div className="flex items-center gap-2">
        {!isLoggedIn ? (
          <>
            <Button variant="ghost" onClick={handleLogin}>
              Login
            </Button>
            <Button className="font-medium" onClick={handleSignUp}>
              Sign up
            </Button>
          </>
        ) : (
          <>
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  className="size-8 rounded-[8px]"
                  alt="User avatar"
                />
              ) : (
                <div className="size-8 rounded-[8px] bg-gray-200 flex items-center justify-center">
                  <span className="text-sm">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="absolute right-0 bottom-0 bg-white rounded-full p-1 shadow-sm">
                <button onClick={handleLogout}>
                  <img src="/logout.svg" className="size-3" alt="Logout" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <ModalCustomApiKey />
    </header>
  );
}
