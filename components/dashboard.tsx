// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { MoreHorizontal, Search } from "lucide-react";
// import { RecordingModal } from "@/components/RecordingModal";
// import { useUser } from "@clerk/nextjs";
// import { Badge } from "@/components/ui/badge";
// import type { Transcription } from "@/app/page";
// import { formatWhisperTimestamp } from "@/lib/utils";
// import Link from "next/link";
// import { Trash2 } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { useTRPC } from "@/trpc/client";
// import { useMutation } from "@tanstack/react-query";

// import { UploadModal } from "./UploadModal";
// import { useRouter } from "next/navigation";
// import { LimitReachedModal } from "./UpgradeModal";

// interface DashboardProps {
//   transcriptions: Transcription[];
// }

// interface UserSubscription {
//   plan: "free" | "monthly" | "annual" | "lifetime";
//   recordingLimit: number; // Daily limit in seconds
//   transformationsAllowed: boolean;
//   couponEligible: boolean;
// }

// interface DailyUsage {
//   date: string;
//   usedSeconds: number;
// }

// export function Dashboard({ transcriptions }: DashboardProps) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showRecordingModal, setShowRecordingModal] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [showLimitModal, setShowLimitModal] = useState(false);
//   const [localTranscriptions, setLocalTranscriptions] =
//     useState(transcriptions);
//   const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
//     date: "",
//     usedSeconds: 0,
//   });
//   const router = useRouter();

//   const trpc = useTRPC();
//   const deleteMutation = useMutation(
//     trpc.whisper.deleteWhisper.mutationOptions()
//   );
//   const { user } = useUser();

//   const [userSubscription, setUserSubscription] = useState<UserSubscription>({
//     plan: "free",
//     recordingLimit: 60, // 60 seconds = 1 minute daily limit
//     transformationsAllowed: false,
//     couponEligible: false,
//   });

//   // Desktop detection
//   const [isDesktop, setIsDesktop] = useState(false);
//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   // Get today's date in YYYY-MM-DD format
//   const getTodayString = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   // Calculate remaining recording time for free users
//   const getRemainingTime = () => {
//     if (userSubscription.plan !== "free") {
//       return Infinity; // Unlimited for paid plans
//     }
//     return Math.max(
//       0,
//       userSubscription.recordingLimit - dailyUsage.usedSeconds
//     );
//   };

//   // Check if user has exceeded their daily limit
//   const hasExceededLimit = () => {
//     if (userSubscription.plan !== "free") {
//       return false; // Paid users have no limits
//     }
//     return dailyUsage.usedSeconds >= userSubscription.recordingLimit;
//   };

//   // Load daily usage from localStorage
//   useEffect(() => {
//     // Only run on client side
//     if (typeof window === "undefined") return;

//     const today = getTodayString();
//     const storedUsage = localStorage.getItem("dailyRecordingUsage");

//     if (storedUsage) {
//       const usage: DailyUsage = JSON.parse(storedUsage);

//       // Reset usage if it's a new day
//       if (usage.date !== today) {
//         const newUsage = { date: today, usedSeconds: 0 };
//         setDailyUsage(newUsage);
//         localStorage.setItem("dailyRecordingUsage", JSON.stringify(newUsage));
//       } else {
//         setDailyUsage(usage);
//       }
//     } else {
//       const newUsage = { date: today, usedSeconds: 0 };
//       setDailyUsage(newUsage);
//       localStorage.setItem("dailyRecordingUsage", JSON.stringify(newUsage));
//     }
//   }, []);

//   // Separate effect for checking limit exceeded to avoid infinite redirects
//   useEffect(() => {
//     if (dailyUsage.date && hasExceededLimit()) {
//       setShowLimitModal(true);
//     }
//   }, [dailyUsage, userSubscription, router]);

//   // Update daily usage when recording is completed
//   const handleRecordingComplete = (durationSeconds: number) => {
//     if (userSubscription.plan === "free") {
//       const today = getTodayString();
//       const newUsage = {
//         date: today,
//         usedSeconds: dailyUsage.usedSeconds + durationSeconds,
//       };

//       setDailyUsage(newUsage);
//       if (typeof window !== "undefined") {
//         localStorage.setItem("dailyRecordingUsage", JSON.stringify(newUsage));
//       }
//     }
//   };

//   const filteredTranscriptions = searchQuery
//     ? localTranscriptions.filter(
//         (t) =>
//           t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           t.content.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : localTranscriptions;

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this RMBL?")) return;
//     setLocalTranscriptions((prev) => prev.filter((t) => t.id !== id));
//     try {
//       await deleteMutation.mutateAsync({ id });
//     } catch (err) {
//       setLocalTranscriptions(transcriptions);
//       alert(
//         "Failed to delete. You may not own this Whisper or there was a network error."
//       );
//     }
//   };

//   const handleNewWhisper = () => {
//     if (hasExceededLimit()) {
//       router.push("/main/pricing");
//       return;
//     }
//     setShowRecordingModal(true);
//   };

//   const handleUploadVoiceNote = () => {
//     if (hasExceededLimit()) {
//       router.push("/main/pricing");
//       return;
//     }
//     setShowUploadModal(true);
//   };

//   // Close recording modal handler
//   const handleCloseRecordingModal = () => {
//     setShowRecordingModal(false);
//     // Check if limit was exceeded after closing
//     setTimeout(() => {
//       if (hasExceededLimit()) {
//         setShowLimitModal(true);
//       }
//     }, 100);
//   };

//   // Close upload modal handler
//   const handleCloseUploadModal = () => {
//     setShowUploadModal(false);
//     // Check if limit was exceeded after closing
//     setTimeout(() => {
//       if (hasExceededLimit()) {
//         setShowLimitModal(true);
//       }
//     }, 100);
//   };

//   // Keyboard shortcut
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (
//         e.metaKey &&
//         e.shiftKey &&
//         (e.code === "Space" || e.key === " " || e.key === "Spacebar")
//       ) {
//         e.preventDefault();
//         handleNewWhisper();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [dailyUsage, userSubscription]);

//   // Debug effect to track when limit is exceeded
//   useEffect(() => {
//     if (userSubscription.plan === "free" && dailyUsage.usedSeconds > 0) {
//       console.log("Daily usage updated:", {
//         usedSeconds: dailyUsage.usedSeconds,
//         limit: userSubscription.recordingLimit,
//         hasExceeded: hasExceededLimit(),
//         remainingTime: getRemainingTime(),
//       });
//     }
//   }, [dailyUsage, userSubscription]);

//   const remainingTime = getRemainingTime();
//   const isLimitExceeded = hasExceededLimit();

//   return (
//     <>
//       <div className="flex-1 h-full mx-auto w-full">
//         <div className="mb-8">
//           <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border-b-[0.7px] md:border-[0.7px] border-gray-200 md:border-[#d1d5dc] px-6 py-5 flex flex-col gap-3 md:my-4 ">
//             <div className="flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-left text-[#101828]">
//                 Your RMBLs
//               </h1>
//               <Badge
//                 variant={
//                   userSubscription.plan === "free" ? "secondary" : "default"
//                 }
//               >
//                 {userSubscription.plan.toUpperCase()} PLAN
//                 {userSubscription.plan === "free" && (
//                   <span className="ml-2">
//                     ({remainingTime}s remaining today)
//                   </span>
//                 )}
//               </Badge>
//             </div>

//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {filteredTranscriptions.length === 0 && searchQuery === "" ? (
//             <div className="text-center py-16 flex flex-col items-center">
//               <h2 className="text-xl font-medium text-left text-black mb-2">
//                 Welcome, RMBLer!
//               </h2>
//               <p className="max-w-[264px] text-base text-center text-[#364153] mb-8">
//                 {isLimitExceeded ? (
//                   "You've used your free recording time for today. Upgrade to continue recording."
//                 ) : (
//                   <>
//                     Start by creating a new RMBL, or
//                     <br />
//                     upload a voice note for
//                     <br />
//                     transcription
//                   </>
//                 )}
//               </p>
//             </div>
//           ) : (
//             <div className="flex flex-col justify-start items-start relative space-y-4 mx-auto max-w-[727px]">
//               {filteredTranscriptions.map((transcription) =>
//                 isDesktop ? (
//                   <div key={transcription.id} className="relative w-full">
//                     <Link
//                       href={`/main/ideas/${transcription.id}`}
//                       className="self-stretch flex-grow-0 flex-shrink-0 h-[121px] overflow-hidden group border-t-0 border-r-0 border-b-[0.7px] border-l-0 border-gray-200 md:border-[0.7px] md:border-transparent md:rounded-xl focus-within:bg-gray-50 focus-within:border-[#d1d5dc] hover:bg-gray-50 hover:border-[#d1d5dc] transition-all flex flex-col justify-between px-6 py-4 pr-14"
//                       tabIndex={0}
//                     >
//                       <p className="text-base font-medium text-left text-[#101828] mb-2">
//                         {transcription.title}
//                       </p>
//                       <p className="text-sm text-left text-[#4a5565] mb-4 line-clamp-2">
//                         {transcription.preview}
//                       </p>
//                       <p className="text-xs text-left text-[#99a1af] mt-auto">
//                         {formatWhisperTimestamp(transcription.timestamp)}
//                       </p>
//                     </Link>
//                     <div className="absolute top-4 right-6 z-10">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <button
//                             className="p-2 cursor-pointer rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
//                             aria-label="More actions"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <MoreHorizontal className="w-5 h-5 text-gray-500" />
//                           </button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem
//                             variant="destructive"
//                             onClick={() => handleDelete(transcription.id)}
//                           >
//                             <Trash2 className="w-4 h-4 text-red-600" />
//                             <span>Delete</span>
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>
//                 ) : (
//                   <Link
//                     href={`/main/ideas/${transcription.id}`}
//                     key={transcription.id}
//                     className="self-stretch flex-grow-0 flex-shrink-0 h-[121px] overflow-hidden group border-t-0 border-r-0 border-b-[0.7px] border-l-0 border-gray-200 md:border-[0.7px] md:border-transparent md:rounded-xl focus-within:bg-gray-50 focus-within:border-[#d1d5dc] hover:bg-gray-50 hover:border-[#d1d5dc] transition-all flex flex-col justify-between px-6 py-4"
//                     tabIndex={0}
//                   >
//                     <p className="text-base font-medium text-left text-[#101828] mb-2">
//                       {transcription.title}
//                     </p>
//                     <p className="text-sm text-left text-[#4a5565] mb-4 line-clamp-2">
//                       {transcription.preview}
//                     </p>
//                     <p className="text-xs text-left text-[#99a1af] mt-auto">
//                       {formatWhisperTimestamp(transcription.timestamp)}
//                     </p>
//                   </Link>
//                 )
//               )}
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[688px] flex justify-center items-center px-6 pb-4">
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3 w-full">
//             <Button
//               variant="outline"
//               size="lg"
//               onClick={handleUploadVoiceNote}
//               className="w-full rounded-lg bg-gray-100 border border-[#d1d5dc] text-base h-[42px]"
//               disabled={isLimitExceeded}
//             >
//               <img src="/upload.svg" className="w-5 h-5 size-5" />
//               {isLimitExceeded ? "Upgrade to Upload" : "Upload Voice Note"}
//             </Button>
//             <Button
//               size="lg"
//               onClick={handleNewWhisper}
//               className="w-full bg-[#101828] text-base text-left text-white rounded-lg h-[42px]"
//               disabled={isLimitExceeded}
//             >
//               <img src="/microphone.svg" className="w-5 h-5 size-5" />
//               {isLimitExceeded ? "Upgrade to Record" : "New RMBL"}
//             </Button>
//           </div>
//         </div>

//         {/* Usage Warning for Free Users */}
//         {userSubscription.plan === "free" &&
//           remainingTime <= 10 &&
//           remainingTime > 0 && (
//             <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
//               <p className="text-sm">
//                 Warning: Only {remainingTime} seconds of recording time
//                 remaining today!
//               </p>
//             </div>
//           )}
//       </div>

//       {/* Modals */}
//       {showRecordingModal && (
//         <RecordingModal
//           onClose={handleCloseRecordingModal}
//           onRecordingComplete={handleRecordingComplete}
//           maxDuration={
//             userSubscription.plan === "free" ? remainingTime : undefined
//           }
//         />
//       )}

//       {showUploadModal && (
//         <UploadModal
//           onClose={handleCloseUploadModal}
//           onRecordingComplete={handleRecordingComplete}
//           maxDuration={
//             userSubscription.plan === "free" ? remainingTime : undefined
//           }
//         />
//       )}

//       {showLimitModal && (
//         <LimitReachedModal
//           onClose={() => setShowLimitModal(false)}
//           limitMessage="You've reached your daily limit of 5 minutes of recording time."
//         />
//       )}
//     </>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { MoreHorizontal, Search } from "lucide-react";
// import { RecordingModal } from "@/components/RecordingModal";
// import { useUser } from "@clerk/nextjs";
// import { Badge } from "@/components/ui/badge";
// import type { Transcription } from "@/app/page";
// import { formatWhisperTimestamp } from "@/lib/utils";
// import Link from "next/link";
// import { Trash2 } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { useTRPC } from "@/trpc/client";
// import { useMutation, useQuery } from "@tanstack/react-query";

// import { UploadModal } from "./UploadModal";
// import { useRouter } from "next/navigation";
// import { LimitReachedModal } from "./UpgradeModal";

// interface DashboardProps {
//   transcriptions: Transcription[];
// }

// interface UserSubscription {
//   id: string;
//   userId: string;
//   plan: "free" | "monthly" | "annual" | "lifetime";
//   recordingLimit: number; // Daily limit in seconds
//   transformationsAllowed: boolean;
//   couponEligible: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface DailyUsage {
//   id: string;
//   userId: string;
//   date: string; // YYYY-MM-DD format
//   usedSeconds: number;
//   recordingCount: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export function Dashboard({ transcriptions }: DashboardProps) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showRecordingModal, setShowRecordingModal] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [showLimitModal, setShowLimitModal] = useState(false);
//   const [localTranscriptions, setLocalTranscriptions] =
//     useState(transcriptions);
//   const router = useRouter();

//   const trpc = useTRPC();
//   const deleteMutation = useMutation(
//     trpc.whisper.deleteWhisper.mutationOptions()
//   );
//   const { user } = useUser();

//   // Fetch user subscription from database
//   const { data: userSubscription, isLoading: subscriptionLoading } = useQuery({
//     queryKey: ["userSubscription", user?.id],
//     queryFn: async () => {
//       if (!user?.id) return null;
//       const response = await fetch(`/api/subscription`);
//       if (!response.ok) throw new Error("Failed to fetch subscription");
//       console.log(response);
//       return response.json();
//     },
//     enabled: !!user?.id,
//   });

//   // Fetch today's usage from database
//   const {
//     data: dailyUsage,
//     isLoading: usageLoading,
//     refetch: refetchUsage,
//   } = useQuery({
//     queryKey: ["dailyUsage", user?.id],
//     queryFn: async () => {
//       if (!user?.id) return null;
//       const today = getTodayString();
//       const response = await fetch(`/api/usage/${user.id}?date=${today}`);
//       console.log(response);
//       if (!response.ok) throw new Error("Failed to fetch usage");
//       return response.json();
//     },
//     enabled: !!user?.id,
//   });

//   // Mutation to update usage
//   const updateUsageMutation = useMutation({
//     mutationFn: async ({ durationSeconds }: { durationSeconds: number }) => {
//       if (!user?.id) throw new Error("User not authenticated");
//       const response = await fetch("/api/usage", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: user.id,
//           durationSeconds,
//           date: getTodayString(),
//         }),
//       });
//       if (!response.ok) throw new Error("Failed to update usage");
//       return response.json();
//     },
//     onSuccess: () => {
//       refetchUsage();
//     },
//   });

//   // Desktop detection
//   const [isDesktop, setIsDesktop] = useState(false);
//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   // Get today's date in YYYY-MM-DD format
//   const getTodayString = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   // Calculate remaining recording time for free users
//   const getRemainingTime = () => {
//     if (!userSubscription || !dailyUsage) return 0;
//     if (userSubscription.plan !== "free") {
//       return Infinity; // Unlimited for paid plans
//     }
//     return Math.max(
//       0,
//       userSubscription.recordingLimit - dailyUsage.usedSeconds
//     );
//   };

//   // Check if user has exceeded their daily limit
//   const hasExceededLimit = () => {
//     if (!userSubscription || !dailyUsage) return false;
//     if (userSubscription.plan !== "free") {
//       return false; // Paid users have no limits
//     }
//     return dailyUsage.usedSeconds >= userSubscription.recordingLimit;
//   };

//   // Check if limit was exceeded after recording
//   useEffect(() => {
//     if (dailyUsage && userSubscription && hasExceededLimit()) {
//       setShowLimitModal(true);
//     }
//   }, [dailyUsage, userSubscription]);

//   // Update daily usage when recording is completed (server-side)
//   const handleRecordingComplete = async (durationSeconds: number) => {
//     if (userSubscription?.plan === "free") {
//       try {
//         await updateUsageMutation.mutateAsync({ durationSeconds });
//       } catch (error) {
//         console.error("Failed to update usage:", error);
//         // Handle error - maybe show a toast notification
//       }
//     }
//   };

//   const filteredTranscriptions = searchQuery
//     ? localTranscriptions.filter(
//         (t) =>
//           t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           t.content.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : localTranscriptions;

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this RMBL?")) return;
//     setLocalTranscriptions((prev) => prev.filter((t) => t.id !== id));
//     try {
//       await deleteMutation.mutateAsync({ id });
//     } catch (err) {
//       setLocalTranscriptions(transcriptions);
//       alert(
//         "Failed to delete. You may not own this Whisper or there was a network error."
//       );
//     }
//   };

//   const handleNewWhisper = () => {
//     if (hasExceededLimit()) {
//       router.push("/main/pricing");
//       return;
//     }
//     setShowRecordingModal(true);
//   };

//   const handleUploadVoiceNote = () => {
//     if (hasExceededLimit()) {
//       router.push("/main/pricing");
//       return;
//     }
//     setShowUploadModal(true);
//   };

//   // Close recording modal handler
//   const handleCloseRecordingModal = () => {
//     setShowRecordingModal(false);
//     // Refetch usage after modal closes to check for limit
//     setTimeout(() => {
//       refetchUsage();
//     }, 100);
//   };

//   // Close upload modal handler
//   const handleCloseUploadModal = () => {
//     setShowUploadModal(false);
//     // Refetch usage after modal closes to check for limit
//     setTimeout(() => {
//       refetchUsage();
//     }, 100);
//   };

//   // Keyboard shortcut
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (
//         e.metaKey &&
//         e.shiftKey &&
//         (e.code === "Space" || e.key === " " || e.key === "Spacebar")
//       ) {
//         e.preventDefault();
//         handleNewWhisper();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [dailyUsage, userSubscription]);

//   // Show loading state while fetching user data
//   if (subscriptionLoading || usageLoading) {
//     return (
//       <div className="flex-1 h-full mx-auto w-full">
//         <div className="mb-8">
//           <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border-b-[0.7px] md:border-[0.7px] border-gray-200 md:border-[#d1d5dc] px-6 py-5 flex flex-col gap-3 md:my-4">
//             <div className="flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-left text-[#101828]">
//                 Loading...
//               </h1>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!userSubscription || !dailyUsage) {
//     return (
//       <div className="flex-1 h-full mx-auto w-full">
//         <div className="mb-8">
//           <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border-b-[0.7px] md:border-[0.7px] border-gray-200 md:border-[#d1d5dc] px-6 py-5 flex flex-col gap-3 md:my-4">
//             <div className="flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-left text-[#101828]">
//                 Error loading user data
//               </h1>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const remainingTime = getRemainingTime();
//   const isLimitExceeded = hasExceededLimit();

//   return (
//     <>
//       <div className="flex-1 h-full mx-auto w-full">
//         <div className="mb-8">
//           <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border-b-[0.7px] md:border-[0.7px] border-gray-200 md:border-[#d1d5dc] px-6 py-5 flex flex-col gap-3 md:my-4 ">
//             <div className="flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-left text-[#101828]">
//                 Your RMBLs
//               </h1>
//               <Badge
//                 variant={
//                   userSubscription.plan === "free" ? "secondary" : "default"
//                 }
//               >
//                 {userSubscription?.plan?.toUpperCase() || "FREE"} PLAN
//                 {userSubscription?.plan === "free" && (
//                   <span className="ml-2">
//                     ({remainingTime === Infinity ? "∞" : `${remainingTime}s`}{" "}
//                     remaining today)
//                   </span>
//                 )}
//               </Badge>
//             </div>

//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {filteredTranscriptions.length === 0 && searchQuery === "" ? (
//             <div className="text-center py-16 flex flex-col items-center">
//               <h2 className="text-xl font-medium text-left text-black mb-2">
//                 Welcome, RMBLer!
//               </h2>
//               <p className="max-w-[264px] text-base text-center text-[#364153] mb-8">
//                 {isLimitExceeded ? (
//                   "You've used your free recording time for today. Upgrade to continue recording."
//                 ) : (
//                   <>
//                     Start by creating a new RMBL, or
//                     <br />
//                     upload a voice note for
//                     <br />
//                     transcription
//                   </>
//                 )}
//               </p>
//             </div>
//           ) : (
//             <div className="flex flex-col justify-start items-start relative space-y-4 mx-auto max-w-[727px]">
//               {filteredTranscriptions.map((transcription) =>
//                 isDesktop ? (
//                   <div key={transcription.id} className="relative w-full">
//                     <Link
//                       href={`/main/ideas/${transcription.id}`}
//                       className="self-stretch flex-grow-0 flex-shrink-0 h-[121px] overflow-hidden group border-t-0 border-r-0 border-b-[0.7px] border-l-0 border-gray-200 md:border-[0.7px] md:border-transparent md:rounded-xl focus-within:bg-gray-50 focus-within:border-[#d1d5dc] hover:bg-gray-50 hover:border-[#d1d5dc] transition-all flex flex-col justify-between px-6 py-4 pr-14"
//                       tabIndex={0}
//                     >
//                       <p className="text-base font-medium text-left text-[#101828] mb-2">
//                         {transcription.title}
//                       </p>
//                       <p className="text-sm text-left text-[#4a5565] mb-4 line-clamp-2">
//                         {transcription.preview}
//                       </p>
//                       <p className="text-xs text-left text-[#99a1af] mt-auto">
//                         {formatWhisperTimestamp(transcription.timestamp)}
//                       </p>
//                     </Link>
//                     <div className="absolute top-4 right-6 z-10">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <button
//                             className="p-2 cursor-pointer rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
//                             aria-label="More actions"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <MoreHorizontal className="w-5 h-5 text-gray-500" />
//                           </button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem
//                             variant="destructive"
//                             onClick={() => handleDelete(transcription.id)}
//                           >
//                             <Trash2 className="w-4 h-4 text-red-600" />
//                             <span>Delete</span>
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>
//                 ) : (
//                   <Link
//                     href={`/main/ideas/${transcription.id}`}
//                     key={transcription.id}
//                     className="self-stretch flex-grow-0 flex-shrink-0 h-[121px] overflow-hidden group border-t-0 border-r-0 border-b-[0.7px] border-l-0 border-gray-200 md:border-[0.7px] md:border-transparent md:rounded-xl focus-within:bg-gray-50 focus-within:border-[#d1d5dc] hover:bg-gray-50 hover:border-[#d1d5dc] transition-all flex flex-col justify-between px-6 py-4"
//                     tabIndex={0}
//                   >
//                     <p className="text-base font-medium text-left text-[#101828] mb-2">
//                       {transcription.title}
//                     </p>
//                     <p className="text-sm text-left text-[#4a5565] mb-4 line-clamp-2">
//                       {transcription.preview}
//                     </p>
//                     <p className="text-xs text-left text-[#99a1af] mt-auto">
//                       {formatWhisperTimestamp(transcription.timestamp)}
//                     </p>
//                   </Link>
//                 )
//               )}
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[688px] flex justify-center items-center px-6 pb-4">
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3 w-full">
//             <Button
//               variant="outline"
//               size="lg"
//               onClick={handleUploadVoiceNote}
//               className="w-full rounded-lg bg-gray-100 border border-[#d1d5dc] text-base h-[42px]"
//               disabled={isLimitExceeded}
//             >
//               <img src="/upload.svg" className="w-5 h-5 size-5" />
//               {isLimitExceeded ? "Upgrade to Upload" : "Upload Voice Note"}
//             </Button>
//             <Button
//               size="lg"
//               onClick={handleNewWhisper}
//               className="w-full bg-[#101828] text-base text-left text-white rounded-lg h-[42px]"
//               disabled={isLimitExceeded}
//             >
//               <img src="/microphone.svg" className="w-5 h-5 size-5" />
//               {isLimitExceeded ? "Upgrade to Record" : "New RMBL"}
//             </Button>
//           </div>
//         </div>

//         {/* Usage Warning for Free Users */}
//         {userSubscription.plan === "free" &&
//           remainingTime !== Infinity &&
//           remainingTime <= 10 &&
//           remainingTime > 0 && (
//             <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
//               <p className="text-sm">
//                 Warning: Only {remainingTime} seconds of recording time
//                 remaining today!
//               </p>
//             </div>
//           )}
//       </div>

//       {/* Modals */}
//       {showRecordingModal && (
//         <RecordingModal
//           onClose={handleCloseRecordingModal}
//           onRecordingComplete={handleRecordingComplete}
//           maxDuration={
//             userSubscription.plan === "free" && remainingTime !== Infinity
//               ? remainingTime
//               : undefined
//           }
//         />
//       )}

//       {showUploadModal && (
//         <UploadModal
//           onClose={handleCloseUploadModal}
//           onRecordingComplete={handleRecordingComplete}
//           maxDuration={
//             userSubscription.plan === "free" && remainingTime !== Infinity
//               ? remainingTime
//               : undefined
//           }
//         />
//       )}

//       {showLimitModal && (
//         <LimitReachedModal
//           onClose={() => setShowLimitModal(false)}
//           limitMessage="You've reached your daily limit of recording time."
//         />
//       )}
//     </>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Search, MoreHorizontal, Trash2 } from "lucide-react";
// import Link from "next/link";
// import { RecordingModal } from "@/components/RecordingModal";
// import { UploadModal } from "@/components/UploadModal";
// import { LimitReachedModal } from "@/components/UpgradeModal";
// import { formatWhisperTimestamp } from "@/lib/utils";
// // Add these missing imports
// import { useTRPC } from "@/trpc/client";
// import { useMutation } from "@tanstack/react-query";

// interface Transcription {
//   id: string;
//   title: string;
//   preview: string;
//   content: string;
//   timestamp: string;
// }

// interface UsageData {
//   plan: string;
//   dailyLimit: number;
//   usedToday: number;
//   remainingToday: number;
// }

// export function Dashboard({
//   transcriptions,
// }: {
//   transcriptions: Transcription[];
// }) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [localTranscriptions, setLocalTranscriptions] =
//     useState(transcriptions);
//   const [showRecordingModal, setShowRecordingModal] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [showLimitModal, setShowLimitModal] = useState(false);
//   const [usage, setUsage] = useState<UsageData | null>(null);

//   // Add tRPC and delete mutation setup
//   const trpc = useTRPC();
//   const deleteMutation = useMutation(
//     trpc.whisper.deleteWhisper.mutationOptions()
//   );

//   const filteredTranscriptions = searchQuery
//     ? localTranscriptions.filter(
//         (t) =>
//           t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           t.content.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : localTranscriptions;

//   const isLimitExceeded = usage ? usage.remainingToday <= 0 : false;

//   // Fetch usage on mount
//   useEffect(() => {
//     const fetchUsage = async () => {
//       try {
//         const res = await fetch("/api/subscription/usage");
//         const data = await res.json();
//         if (data.success) {
//           setUsage({
//             plan: data.usage.plan || "free",
//             dailyLimit: data.usage.dailyLimit,
//             usedToday: data.usage.usedToday,
//             remainingToday: data.usage.remainingToday,
//           });

//           if (data.usage.remainingToday <= 0) {
//             setShowLimitModal(true);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch usage", err);
//       }
//     };

//     fetchUsage();
//   }, []);

//   const incrementUsage = async (durationSeconds: number) => {
//     try {
//       await fetch("/api/subscription/usage", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ durationSeconds }),
//       });

//       // Refresh usage after update
//       const res = await fetch("/api/subscription/usage");
//       const data = await res.json();
//       if (data.success) {
//         setUsage({
//           plan: data.usage.plan || "free",
//           dailyLimit: data.usage.dailyLimit,
//           usedToday: data.usage.usedToday,
//           remainingToday: data.usage.remainingToday,
//         });

//         if (data.usage.remainingToday <= 0) {
//           setShowLimitModal(true);
//         }
//       }
//     } catch (err) {
//       console.error("Failed to update usage", err);
//     }
//   };

//   const handleRecordingComplete = (durationSeconds: number) => {
//     incrementUsage(durationSeconds);
//   };

//   const handleUploadComplete = (durationSeconds: number) => {
//     incrementUsage(durationSeconds);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this RMBL?")) return;

//     try {
//       // First, call the API to delete from backend
//       await deleteMutation.mutateAsync({ id });

//       // Only update local state if API call succeeds
//       setLocalTranscriptions((prev) => prev.filter((t) => t.id !== id));

//       // Optional: Show success message
//       console.log("RMBL deleted successfully");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert(
//         "Failed to delete. You may not own this Whisper or there was a network error."
//       );
//       // Don't update local state if API call fails
//     }
//   };

//   const handleNewWhisper = () => {
//     if (isLimitExceeded) return setShowLimitModal(true);
//     setShowRecordingModal(true);
//   };

//   const handleUploadVoiceNote = () => {
//     if (isLimitExceeded) return setShowLimitModal(true);
//     setShowUploadModal(true);
//   };

//   return (
//     <>
//       <div className="flex-1 h-full mx-auto w-full">
//         <div className="mb-8">
//           <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border px-6 py-5 flex flex-col gap-3 md:my-4">
//             <div className="flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-left text-[#101828]">
//                 Your RMBLs
//               </h1>
//               {usage && (
//                 <Badge
//                   variant={usage.plan === "free" ? "secondary" : "default"}
//                 >
//                   {usage.plan.toUpperCase()} PLAN
//                   {usage.plan === "free" && (
//                     <span className="ml-2">
//                       ({usage.remainingToday}s remaining today)
//                     </span>
//                   )}
//                 </Badge>
//               )}
//             </div>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {filteredTranscriptions.length === 0 && searchQuery === "" ? (
//             <div className="text-center py-16 flex flex-col items-center">
//               <h2 className="text-xl font-medium text-black mb-2">
//                 Welcome, RMBLer!
//               </h2>
//               <p className="max-w-[264px] text-base text-center text-[#364153] mb-8">
//                 {isLimitExceeded
//                   ? "You've used your free recording time for today. Upgrade to continue recording."
//                   : "Start by creating a new RMBL, or upload a voice note for transcription"}
//               </p>
//             </div>
//           ) : (
//             <div className="flex flex-col justify-start items-start space-y-4 mx-auto max-w-[727px]">
//               {filteredTranscriptions.map((t) => (
//                 <div
//                   key={t.id}
//                   className="relative w-full border rounded-md p-4 hover:bg-gray-50"
//                 >
//                   <Link href={`/main/ideas/${t.id}`}>
//                     <p className="text-base font-medium text-[#101828] mb-2">
//                       {t.title}
//                     </p>
//                     <p className="text-sm text-[#4a5565] mb-4 line-clamp-2">
//                       {t.preview}
//                     </p>
//                     <p className="text-xs text-[#99a1af]">
//                       {formatWhisperTimestamp(t.timestamp)}
//                     </p>
//                   </Link>
//                   <button
//                     className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
//                     onClick={() => handleDelete(t.id)}
//                   >
//                     <Trash2 className="w-4 h-4 text-red-600" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[688px] flex justify-center items-center px-6 pb-4">
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 w-full">
//             <Button
//               variant="outline"
//               size="lg"
//               onClick={handleUploadVoiceNote}
//               className="w-full"
//               disabled={isLimitExceeded}
//             >
//               Upload Voice Note
//             </Button>
//             <Button
//               size="lg"
//               onClick={handleNewWhisper}
//               className="w-full bg-[#101828] text-white"
//               disabled={isLimitExceeded}
//             >
//               New RMBL
//             </Button>
//           </div>
//         </div>

//         {/* Warning for low time */}
//         {usage &&
//           usage.plan === "free" &&
//           usage.remainingToday <= 10 &&
//           usage.remainingToday > 0 && (
//             <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
//               <p className="text-sm">
//                 Warning: Only {usage.remainingToday} seconds of recording time
//                 remaining today!
//               </p>
//             </div>
//           )}
//       </div>

//       {/* Modals */}
//       {showRecordingModal && (
//         <RecordingModal
//           onClose={() => setShowRecordingModal(false)}
//           onRecordingComplete={handleRecordingComplete}
//           maxDuration={
//             usage?.plan === "free" ? usage.remainingToday : undefined
//           }
//         />
//       )}
//       {showUploadModal && (
//         <UploadModal
//           onClose={() => setShowUploadModal(false)}
//           onRecordingComplete={handleUploadComplete}
//           maxDuration={
//             usage?.plan === "free" ? usage.remainingToday : undefined
//           }
//         />
//       )}
//       {showLimitModal && (
//         <LimitReachedModal
//           onClose={() => setShowLimitModal(false)}
//           limitMessage="You've reached your daily limit of free recording time."
//         />
//       )}
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { RecordingModal } from "@/components/RecordingModal";
import { UploadModal } from "@/components/UploadModal";
import { LimitReachedModal } from "@/components/UpgradeModal";
import { formatWhisperTimestamp } from "@/lib/utils";
// Add these missing imports
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface Transcription {
  id: string;
  title: string;
  preview: string;
  content: string;
  timestamp: string;
}

interface UsageData {
  plan: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
}

export function Dashboard({
  transcriptions,
}: {
  transcriptions: Transcription[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localTranscriptions, setLocalTranscriptions] =
    useState(transcriptions);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Add tRPC and delete mutation setup
  const trpc = useTRPC();
  const deleteMutation = useMutation(
    trpc.whisper.deleteWhisper.mutationOptions()
  );

  const filteredTranscriptions = searchQuery
    ? localTranscriptions.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : localTranscriptions;

  const isLimitExceeded = usage ? usage.remainingToday <= 0 : false;

  // Fetch usage on mount
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/subscription/usage");
        const data = await res.json();
        if (data.success) {
          setUsage({
            plan: data.usage.plan || "free",
            dailyLimit: data.usage.dailyLimit,
            usedToday: data.usage.usedToday,
            remainingToday: data.usage.remainingToday,
          });

          if (data.usage.remainingToday <= 0) {
            setShowLimitModal(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch usage", err);
      }
    };

    fetchUsage();
  }, []);

  const incrementUsage = async (durationSeconds: number) => {
    try {
      await fetch("/api/subscription/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds }),
      });

      // Refresh usage after update
      const res = await fetch("/api/subscription/usage");
      const data = await res.json();
      if (data.success) {
        setUsage({
          plan: data.usage.plan || "free",
          dailyLimit: data.usage.dailyLimit,
          usedToday: data.usage.usedToday,
          remainingToday: data.usage.remainingToday,
        });

        if (data.usage.remainingToday <= 0) {
          setShowLimitModal(true);
        }
      }
    } catch (err) {
      console.error("Failed to update usage", err);
    }
  };

  const handleRecordingComplete = (durationSeconds: number) => {
    incrementUsage(durationSeconds);
  };

  const handleUploadComplete = (durationSeconds: number) => {
    incrementUsage(durationSeconds);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RMBL?")) return;

    // Add the id to the deleting set to show loader
    setDeletingIds((prev) => new Set([...prev, id]));

    try {
      // First, call the API to delete from backend
      await deleteMutation.mutateAsync({ id });

      // Only update local state if API call succeeds
      setLocalTranscriptions((prev) => prev.filter((t) => t.id !== id));

      // Optional: Show success message
      console.log("RMBL deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        "Failed to delete. You may not own this RMBL or there was a network error."
      );
      // Don't update local state if API call fails
    } finally {
      // Remove the id from the deleting set regardless of success/failure
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleNewWhisper = () => {
    if (isLimitExceeded) return setShowLimitModal(true);
    setShowRecordingModal(true);
  };

  const handleUploadVoiceNote = () => {
    if (isLimitExceeded) return setShowLimitModal(true);
    setShowUploadModal(true);
  };

  return (
    <>
      <div className="flex-1 h-full mx-auto w-full">
        <div className="mb-8">
          <div className="mx-auto max-w-[729px] w-full md:rounded-xl bg-white border px-6 py-5 flex flex-col gap-3 md:my-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-left text-[#101828]">
                Your RMBLs
              </h1>
              {usage && (
                <Badge
                  variant={usage.plan === "free" ? "secondary" : "default"}
                >
                  {usage.plan.toUpperCase()} PLAN
                  {usage.plan === "free" && (
                    <span className="ml-2">
                      ({usage.remainingToday}s remaining today)
                    </span>
                  )}
                </Badge>
              )}
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
              <h2 className="text-xl font-medium text-black mb-2">
                Welcome, RMBLer!
              </h2>
              <p className="max-w-[264px] text-base text-center text-[#364153] mb-8">
                {isLimitExceeded
                  ? "You've used your free recording time for today. Upgrade to continue recording."
                  : "Start by creating a new RMBL, or upload a voice note for transcription"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-start items-start space-y-4 mx-auto max-w-[727px]">
              {filteredTranscriptions.map((t) => {
                const isDeleting = deletingIds.has(t.id);
                return (
                  <div
                    key={t.id}
                    className={`relative w-full border rounded-md p-4 hover:bg-gray-50 ${
                      isDeleting ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <Link href={`/main/ideas/${t.id}`}>
                      <p className="text-base font-medium text-[#101828] mb-2">
                        {t.title}
                      </p>
                      <p className="text-sm text-[#4a5565] mb-4 line-clamp-2">
                        {t.preview}
                      </p>
                      <p className="text-xs text-[#99a1af]">
                        {formatWhisperTimestamp(t.timestamp)}
                      </p>
                    </Link>
                    <button
                      className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
                      onClick={() => handleDelete(t.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[688px] flex justify-center items-center px-6 pb-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={handleUploadVoiceNote}
              className="w-full"
              disabled={isLimitExceeded}
            >
              Upload Voice Note
            </Button>
            <Button
              size="lg"
              onClick={handleNewWhisper}
              className="w-full bg-[#101828] text-white"
              disabled={isLimitExceeded}
            >
              New RMBL
            </Button>
          </div>
        </div>

        {/* Warning for low time */}
        {usage &&
          usage.plan === "free" &&
          usage.remainingToday <= 10 &&
          usage.remainingToday > 0 && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
              <p className="text-sm">
                Warning: Only {usage.remainingToday} seconds of recording time
                remaining today!
              </p>
            </div>
          )}
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
          limitMessage="You've reached your daily limit of free recording time."
        />
      )}
    </>
  );
}
