"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ModalCustomApiKey } from "./hooks/ModalCustomApiKey";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AuthHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback: still redirect even if signOut fails
      router.push("/");
    }
  };

  const isSingleWhisperPage =
    pathname.startsWith("/main/ideas/") && pathname.length > 11;

  if (!mounted || !isLoaded) {
    return (
      <div className="h-[63px] w-full bg-gray-50 border-b border-gray-200" />
    );
  }

  return (
    <header className="min-h-[63px] flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
      {isSingleWhisperPage ? (
        <Link href="/main/ideas/" className="flex items-center gap-2">
          <img
            src="/back.svg"
            className="min-w-[14px] min-h-[14px] size-[14px]"
            alt="Back"
          />
          <span className="text-base font-medium text-[#4A5565]">My Ideas</span>
        </Link>
      ) : (
        <Link
          href={user?.id ? "/main/ideas/" : "/"}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 rounded-full">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      img: "rounded-[8px]",
                    },
                    userButtonTrigger: {
                      "&:focus": {
                        boxShadow: "none",
                      },
                    },
                  },
                }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/main/profile")}>
              Profile
            </DropdownMenuItem>
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
