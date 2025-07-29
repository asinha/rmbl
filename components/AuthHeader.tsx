"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ModalCustomApiKey } from "./hooks/ModalCustomApiKey";
import { UserButton, useUser } from "@clerk/nextjs";

export function AuthHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <UserButton
          appearance={{
            elements: {
              avatarBox: {
                img: "rounded-[8px]",
              },
            },
          }}
        />
      </div>
      <ModalCustomApiKey />
    </header>
  );
}

function KeyButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("customKey", "true");
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.push(newUrl);
  };

  return (
    <Button
      variant="ghost"
      className="p-[7px] size-[30px] min-w-[30px] min-h-[30px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
      onClick={handleClick}
    >
      <img src="/key.svg" className="min-w-4 min-h-4 size-4" alt="Key" />
    </Button>
  );
}
