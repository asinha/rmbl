"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search } from "lucide-react";
import { RecordingModal } from "@/components/RecordingModal";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import type { Transcription } from "@/app/page";
import { formatWhisperTimestamp } from "@/lib/utils";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

import { UploadModal } from "./UploadModal";
import { useRouter } from "next/navigation";
import { LimitReachedModal } from "./UpgradeModal";

interface DashboardProps {
  transcriptions: Transcription[];
}

interface UserSubscription {
  plan: "free" | "monthly" | "annual" | "lifetime";
  recordingLimit: number; // Daily limit in seconds
  transformationsAllowed: boolean;
  couponEligible: boolean;
}

interface DailyUsage {
  date: string;
  usedSeconds: number;
}

export function Dashboard({ transcriptions }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [localTranscriptions, setLocalTranscriptions] =
    useState(transcriptions);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    date: "",
    usedSeconds: 0,
  });
  const router = useRouter();

  const trpc = useTRPC();
  const deleteMutation = useMutation(
    trpc.whisper.deleteWhisper.mutationOptions()
  );
  const { user } = useUser();

  const [userSubscription, setUserSubscription] = useState<UserSubscription>({
    plan: "free",
    recordingLimit: 60, // 60 seconds = 1 minute daily limit
    transformationsAllowed: false,
    couponEligible: false,
  });

  // Desktop detection
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Calculate remaining recording time for free users
  const getRemainingTime = () => {
    if (userSubscription.plan !== "free") {
      return Infinity; // Unlimited for paid plans
    }
    return Math.max(
      0,
      userSubscription.recordingLimit - dailyUsage.usedSeconds
    );
  };

  // Check if user has exceeded their daily limit
  const hasExceededLimit = () => {
    if (userSubscription.plan !== "free") {
      return false; // Paid users have no limits
    }
    return dailyUsage.usedSeconds >= userSubscription.recordingLimit;
  };

  // Load daily usage from localStorage
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const today = getTodayString();
    const storedUsage = localStorage.getItem("dailyRecordingUsage");

    if (storedUsage) {
      const usage: DailyUsage = JSON.parse(storedUsage);

      // Reset usage if it's a new day
      if (usage.date !== today) {
        const newUsage = { date: today, usedSeconds: 0 };
        setDailyUsage(newUsage);
        localStorage.setItem("dailyRecordingUsage", JSON.stringify(newUsage));
      } else {
        setDailyUsage(usage);
      }
    } else {
      const newUsage = { date: today, usedSeconds: 0 };
      setDailyUsage(newUsage);
      localStorage.setItem("dailyRecordingUsage", JSON.stringify(newUsage));
    }
  }, []);

  // Separate effect for checking limit exceeded to avoid infinite redirects
  useEffect(() => {
    if (dailyUsage.date && hasExceededLimit()) {
      setShowLimitModal(true);
    }
  }, [dailyUsage, userSubscription, router]);

  // Update daily usage when recording is completed
  const handleRecordingComplete = (durationSeconds: number) => {
    if (userSubscription.plan === "free") {
      const today = getTodayString();
      const newUsage = {
        date: today,
        usedSeconds: dailyUsage.usedSeconds + durationSeconds,
      };

      setDailyUsage(newUsage);
      if (typeof window !== "undefined") {
        localStorage.setItem("dailyRecordingUsage", JSON.stringify(newUsage));
      }
    }
  };

  const filteredTranscriptions = searchQuery
    ? localTranscriptions.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : localTranscriptions;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RMBL?")) return;
    setLocalTranscriptions((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (err) {
      setLocalTranscriptions(transcriptions);
      alert(
        "Failed to delete. You may not own this Whisper or there was a network error."
      );
    }
  };

  const handleNewWhisper = () => {
    if (hasExceededLimit()) {
      router.push("/main/pricing");
      return;
    }
    setShowRecordingModal(true);
  };

  const handleUploadVoiceNote = () => {
    if (hasExceededLimit()) {
      router.push("/main/pricing");
      return;
    }
    setShowUploadModal(true);
  };

  // Close recording modal handler
  const handleCloseRecordingModal = () => {
    setShowRecordingModal(false);
    // Check if limit was exceeded after closing
    setTimeout(() => {
      if (hasExceededLimit()) {
        setShowLimitModal(true);
      }
    }, 100);
  };

  // Close upload modal handler
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    // Check if limit was exceeded after closing
    setTimeout(() => {
      if (hasExceededLimit()) {
        setShowLimitModal(true);
      }
    }, 100);
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
  }, [dailyUsage, userSubscription]);

  // Debug effect to track when limit is exceeded
  useEffect(() => {
    if (userSubscription.plan === "free" && dailyUsage.usedSeconds > 0) {
      console.log("Daily usage updated:", {
        usedSeconds: dailyUsage.usedSeconds,
        limit: userSubscription.recordingLimit,
        hasExceeded: hasExceededLimit(),
        remainingTime: getRemainingTime(),
      });
    }
  }, [dailyUsage, userSubscription]);

  const remainingTime = getRemainingTime();
  const isLimitExceeded = hasExceededLimit();

  return (
    <>
      <div className="flex-1 h-full mx-auto w-full">
        <div className="mb-8">
          <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border-b-[0.7px] md:border-[0.7px] border-gray-200 md:border-[#d1d5dc] px-6 py-5 flex flex-col gap-3 md:my-4 ">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-left text-[#101828]">
                Your RMBLs
              </h1>
              <Badge
                variant={
                  userSubscription.plan === "free" ? "secondary" : "default"
                }
              >
                {userSubscription.plan.toUpperCase()} PLAN
                {userSubscription.plan === "free" && (
                  <span className="ml-2">
                    ({remainingTime}s remaining today)
                  </span>
                )}
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredTranscriptions.length === 0 && searchQuery === "" ? (
            <div className="text-center py-16 flex flex-col items-center">
              <h2 className="text-xl font-medium text-left text-black mb-2">
                Welcome, RMBLer!
              </h2>
              <p className="max-w-[264px] text-base text-center text-[#364153] mb-8">
                {isLimitExceeded ? (
                  "You've used your free recording time for today. Upgrade to continue recording."
                ) : (
                  <>
                    Start by creating a new RMBL, or
                    <br />
                    upload a voice note for
                    <br />
                    transcription
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-start items-start relative space-y-4 mx-auto max-w-[727px]">
              {filteredTranscriptions.map((transcription) =>
                isDesktop ? (
                  <div key={transcription.id} className="relative w-full">
                    <Link
                      href={`/main/ideas/${transcription.id}`}
                      className="self-stretch flex-grow-0 flex-shrink-0 h-[121px] overflow-hidden group border-t-0 border-r-0 border-b-[0.7px] border-l-0 border-gray-200 md:border-[0.7px] md:border-transparent md:rounded-xl focus-within:bg-gray-50 focus-within:border-[#d1d5dc] hover:bg-gray-50 hover:border-[#d1d5dc] transition-all flex flex-col justify-between px-6 py-4 pr-14"
                      tabIndex={0}
                    >
                      <p className="text-base font-medium text-left text-[#101828] mb-2">
                        {transcription.title}
                      </p>
                      <p className="text-sm text-left text-[#4a5565] mb-4 line-clamp-2">
                        {transcription.preview}
                      </p>
                      <p className="text-xs text-left text-[#99a1af] mt-auto">
                        {formatWhisperTimestamp(transcription.timestamp)}
                      </p>
                    </Link>
                    <div className="absolute top-4 right-6 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 cursor-pointer rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            aria-label="More actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(transcription.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/main/ideas/${transcription.id}`}
                    key={transcription.id}
                    className="self-stretch flex-grow-0 flex-shrink-0 h-[121px] overflow-hidden group border-t-0 border-r-0 border-b-[0.7px] border-l-0 border-gray-200 md:border-[0.7px] md:border-transparent md:rounded-xl focus-within:bg-gray-50 focus-within:border-[#d1d5dc] hover:bg-gray-50 hover:border-[#d1d5dc] transition-all flex flex-col justify-between px-6 py-4"
                    tabIndex={0}
                  >
                    <p className="text-base font-medium text-left text-[#101828] mb-2">
                      {transcription.title}
                    </p>
                    <p className="text-sm text-left text-[#4a5565] mb-4 line-clamp-2">
                      {transcription.preview}
                    </p>
                    <p className="text-xs text-left text-[#99a1af] mt-auto">
                      {formatWhisperTimestamp(transcription.timestamp)}
                    </p>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[688px] flex justify-center items-center px-6 pb-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3 w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={handleUploadVoiceNote}
              className="w-full rounded-lg bg-gray-100 border border-[#d1d5dc] text-base h-[42px]"
              disabled={isLimitExceeded}
            >
              <img src="/upload.svg" className="w-5 h-5 size-5" />
              {isLimitExceeded ? "Upgrade to Upload" : "Upload Voice Note"}
            </Button>
            <Button
              size="lg"
              onClick={handleNewWhisper}
              className="w-full bg-[#101828] text-base text-left text-white rounded-lg h-[42px]"
              disabled={isLimitExceeded}
            >
              <img src="/microphone.svg" className="w-5 h-5 size-5" />
              {isLimitExceeded ? "Upgrade to Record" : "New RMBL"}
            </Button>
          </div>
        </div>

        {/* Usage Warning for Free Users */}
        {userSubscription.plan === "free" &&
          remainingTime <= 10 &&
          remainingTime > 0 && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
              <p className="text-sm">
                Warning: Only {remainingTime} seconds of recording time
                remaining today!
              </p>
            </div>
          )}
      </div>

      {/* Modals */}
      {showRecordingModal && (
        <RecordingModal
          onClose={handleCloseRecordingModal}
          onRecordingComplete={handleRecordingComplete}
          maxDuration={
            userSubscription.plan === "free" ? remainingTime : undefined
          }
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={handleCloseUploadModal}
          onRecordingComplete={handleRecordingComplete}
          maxDuration={
            userSubscription.plan === "free" ? remainingTime : undefined
          }
        />
      )}

      {showLimitModal && (
        <LimitReachedModal
          onClose={() => setShowLimitModal(false)}
          limitMessage="You've reached your daily limit of 5 minutes of recording time."
        />
      )}
    </>
  );
}
