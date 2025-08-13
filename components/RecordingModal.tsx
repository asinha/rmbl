// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { cn } from "@/lib/utils";
// import { RecordingBasics } from "./RecordingBasics";
// import { useTRPC } from "@/trpc/client";
// import { RecordingMinutesLeft } from "./RecordingMinutesLeft";
// import { useTogetherApiKey } from "./TogetherApiKeyProvider";
// import useLocalStorage from "./hooks/useLocalStorage";
// import { AudioWaveform } from "./AudioWaveform";
// import { useAudioRecording } from "./hooks/useAudioRecording";
// import { useS3Upload } from "next-s3-upload";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useLimits } from "./hooks/useLimits";

// interface RecordingModalProps {
//   onClose: () => void;
//   title?: string;
//   maxDuration?: number;
//   onRecordingComplete?: (duration: number) => void;
// }

// // Extend the Window interface
// declare global {
//   interface Window {
//     currentMediaRecorder: MediaRecorder | undefined;
//     currentStream: MediaStream | undefined;
//   }
// }

// export function RecordingModal({
//   onClose,
//   onRecordingComplete,
//   maxDuration,
// }: RecordingModalProps) {
//   const [language, setLanguage] = useLocalStorage("language", "en");
//   const [showMaxDurationWarning, setShowMaxDurationWarning] = useState(false);

//   const { uploadToS3 } = useS3Upload();

//   const {
//     recording,
//     paused,
//     audioBlob,
//     analyserNode,
//     duration,
//     startRecording,
//     stopRecording,
//     pauseRecording,
//     resumeRecording,
//     resetRecording,
//   } = useAudioRecording();

//   const trpc = useTRPC();
//   const { apiKey } = useTogetherApiKey();
//   const isBYOK = !!apiKey;

//   const { isLoading, minutesData } = useLimits();

//   const router = useRouter();
//   const transcribeMutation = useMutation(
//     trpc.whisper.transcribeFromS3.mutationOptions()
//   );

//   const queryClient = useQueryClient();

//   const [isProcessing, setIsProcessing] = useState<
//     "idle" | "uploading" | "transcribing"
//   >("idle");
//   const [pendingSave, setPendingSave] = useState(false);

//   // Auto-stop recording when maxDuration is reached
//   useEffect(() => {
//     if (recording && maxDuration && duration >= maxDuration) {
//       toast.warning(`Recording stopped: ${maxDuration} second limit reached`);
//       stopRecording();
//       setPendingSave(true);
//     }
//   }, [recording, duration, maxDuration, stopRecording]);

//   // Show warning when approaching max duration
//   useEffect(() => {
//     if (
//       recording &&
//       maxDuration &&
//       duration >= maxDuration - 10 &&
//       duration < maxDuration
//     ) {
//       if (!showMaxDurationWarning) {
//         setShowMaxDurationWarning(true);
//         toast.warning(`Warning: ${maxDuration - duration} seconds remaining`);
//       }
//     }
//   }, [recording, duration, maxDuration, showMaxDurationWarning]);

//   // Check microphone permission on mount
//   useEffect(() => {
//     if (typeof window !== "undefined" && navigator.permissions) {
//       navigator.permissions
//         .query({ name: "microphone" as PermissionName })
//         .then((result) => {
//           result.onchange = () => {};
//         });
//     }
//   }, []);

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const handleSaveRecording = async () => {
//     if (!audioBlob) {
//       toast.error("No audio to save. Please record something first.");
//       return;
//     }

//     setIsProcessing("uploading");
//     try {
//       // Upload to S3
//       const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
//         type: "audio/webm",
//       });
//       const { url } = await uploadToS3(file);

//       setIsProcessing("transcribing");

//       const { id } = await transcribeMutation.mutateAsync({
//         audioUrl: url,
//         language,
//         durationSeconds: duration,
//       });

//       // Call the callback to update daily usage
//       if (onRecordingComplete) {
//         onRecordingComplete(duration);
//       }

//       // Invalidate dashboard query
//       await queryClient.invalidateQueries({
//         queryKey: trpc.whisper.listWhispers.queryKey(),
//       });

//       // Redirect to whisper page
//       router.push(`/main/ideas/${id}`);
//     } catch (err) {
//       toast.error("Failed to transcribe audio. Please try again.");
//       setIsProcessing("idle");
//     }
//   };

//   // Wait for audioBlob to be set after stopping before saving
//   useEffect(() => {
//     if (pendingSave && audioBlob) {
//       setPendingSave(false);
//       handleSaveRecording();
//     }
//   }, [pendingSave, audioBlob]);

//   const handleStartRecording = () => {
//     if (maxDuration && maxDuration <= 0) {
//       toast.error(
//         "No recording time remaining today. Please upgrade your plan."
//       );
//       onClose();
//       return;
//     }

//     setShowMaxDurationWarning(false);
//     startRecording();
//   };

//   return (
//     <Dialog open onOpenChange={onClose}>
//       <DialogContent
//         showCloseButton={false}
//         className="!max-w-[392px] !p-0 border border-gray-200 rounded-tl-xl rounded-tr-xl bg-white overflow-hidden gap-0"
//       >
//         <DialogHeader className="p-0">
//           <DialogTitle className="sr-only">Recording Modal</DialogTitle>
//         </DialogHeader>

//         {isProcessing !== "idle" ? (
//           <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
//             <img
//               src="/loading.svg"
//               alt="Loading"
//               className="w-8 h-8 animate-spin"
//             />
//             <p className="text-gray-500">
//               {isProcessing === "uploading"
//                 ? "Uploading audio recording"
//                 : "Transcribing audio..."}
//               <span className="animate-pulse">...</span>
//             </p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center w-full bg-white">
//             {!recording ? (
//               <>
//                 <RecordingBasics
//                   language={language}
//                   setLanguage={setLanguage}
//                 />
//                 {maxDuration && maxDuration < 60 && (
//                   <div className="px-5 py-2 bg-yellow-50 border-t border-yellow-200 w-full">
//                     <p className="text-sm text-yellow-800 text-center">
//                       Recording limited to {maxDuration} seconds (free plan)
//                     </p>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="flex flex-row gap-8 mt-8">
//                 {/* X Button: Reset recording */}
//                 <button
//                   className="size-10 bg-[#FFEEEE] p-2.5 rounded-xl cursor-pointer"
//                   onClick={resetRecording}
//                   type="button"
//                   aria-label="Reset recording"
//                 >
//                   <img src="/X.svg" className="size-5 min-w-5" />
//                 </button>

//                 <div className="flex flex-col gap-1">
//                   <p className="text-base text-center text-[#364153]">
//                     {formatTime(duration)}
//                     {maxDuration && ` / ${formatTime(maxDuration)}`}
//                   </p>
//                   <AudioWaveform
//                     analyserNode={analyserNode}
//                     isPaused={paused}
//                   />
//                   {maxDuration &&
//                     duration >= maxDuration - 10 &&
//                     duration < maxDuration && (
//                       <p className="text-xs text-red-600 text-center mt-1">
//                         {maxDuration - duration}s remaining
//                       </p>
//                     )}
//                 </div>

//                 {/* Pause/Resume Button */}
//                 {paused ? (
//                   <button
//                     className="size-10 bg-[#1E2939] p-2.5 rounded-xl cursor-pointer"
//                     onClick={resumeRecording}
//                     type="button"
//                     aria-label="Resume recording"
//                   >
//                     <img src="/microphone.svg" className="size-5 min-w-5" />
//                   </button>
//                 ) : (
//                   <button
//                     className="size-10 bg-[#1E2939] p-2.5 rounded-xl cursor-pointer"
//                     onClick={pauseRecording}
//                     type="button"
//                     aria-label="Pause recording"
//                   >
//                     <img src="/pause.svg" className="size-5 min-w-5" />
//                   </button>
//                 )}
//               </div>
//             )}

//             <Button
//               className={cn(
//                 recording ? "bg-[#6D1414]" : "bg-[#101828]",
//                 "w-[352px] h-[86px] rounded-xl flex flex-row gap-3 items-center justify-center my-5"
//               )}
//               onClick={async () => {
//                 if (recording) {
//                   stopRecording();
//                   setPendingSave(true);
//                 } else {
//                   handleStartRecording();
//                 }
//               }}
//               disabled={isProcessing !== "idle"}
//             >
//               {recording ? (
//                 <>
//                   <img
//                     src="/stop.svg"
//                     className="min-w-7 min-h-7 size-7 text-white"
//                   />
//                   <p>Stop Recording</p>
//                 </>
//               ) : (
//                 <img
//                   src="/microphone.svg"
//                   className="min-w-9 min-h-9 size-9 text-white"
//                 />
//               )}
//             </Button>

//             {/* {!recording && (
//               <div className="w-full flex flex-col py-3 px-5 border-t border-gray-200">
//                 {isLoading ? (
//                   <span className="text-sm text-[#4a5565]">Loading...</span>
//                 ) : (
//                   <RecordingMinutesLeft
//                     minutesLeft={
//                       isBYOK ? Infinity : minutesData?.remaining ?? 0
//                     }
//                   />
//                 )}
//               </div>
//             )} */}
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useS3Upload } from "next-s3-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useLimits } from "./hooks/useLimits";
import { useTogetherApiKey } from "./TogetherApiKeyProvider";
import { AudioWaveform } from "./AudioWaveform";
import { RecordingBasics } from "./RecordingBasics";
import useLocalStorage from "./hooks/useLocalStorage";

interface RecordingModalProps {
  onClose: () => void;
  maxDuration?: number;
  onRecordingComplete?: (duration: number) => void;
}

export function RecordingModal({
  onClose,
  maxDuration = 60,
}: RecordingModalProps) {
  const [language, setLanguage] = useLocalStorage("language", "en");
  const [pendingSave, setPendingSave] = useState(false);
  const [isProcessing, setIsProcessing] = useState<
    "idle" | "uploading" | "transcribing"
  >("idle");

  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { uploadToS3 } = useS3Upload();
  const { apiKey } = useTogetherApiKey();
  const { minutesData } = useLimits();

  const {
    recording,
    paused,
    audioBlob,
    analyserNode,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecording();

  const transcribeMutation = useMutation(
    trpc.whisper.transcribeFromS3.mutationOptions()
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-stop at limit
  useEffect(() => {
    if (recording && maxDuration && duration >= maxDuration) {
      toast.warning(`Recording stopped: ${maxDuration}s limit reached`);
      stopRecording();
      setPendingSave(true);
    }
  }, [recording, duration, maxDuration, stopRecording]);

  // Near-limit warning
  useEffect(() => {
    if (
      recording &&
      maxDuration &&
      duration >= maxDuration - 10 &&
      duration < maxDuration
    ) {
      toast.warning(`Warning: ${maxDuration - duration} seconds remaining`);
    }
  }, [recording, duration, maxDuration]);

  // Save/upload after stop
  useEffect(() => {
    if (pendingSave && audioBlob) {
      setPendingSave(false);
      handleSaveRecording();
    }
  }, [pendingSave, audioBlob]);

  const handleSaveRecording = async () => {
    if (!audioBlob) {
      toast.error("No audio to save.");
      return;
    }
    try {
      setIsProcessing("uploading");
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      const { url } = await uploadToS3(file);

      setIsProcessing("transcribing");
      const { id } = await transcribeMutation.mutateAsync({
        audioUrl: url,
        language: "en",
        durationSeconds: duration,
      });

      await queryClient.invalidateQueries({
        queryKey: trpc.whisper.listWhispers.queryKey(),
      });

      router.push(`/main/ideas/${id}`);
    } catch (err) {
      toast.error("Failed to transcribe. Try again.");
      setIsProcessing("idle");
    }
  };

  const handleStartRecording = () => {
    if (maxDuration && maxDuration <= 0) {
      toast.error("No recording time remaining today. Please upgrade.");
      onClose();
      return;
    }
    startRecording();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-full sm:!max-w-[480px] !p-0 border border-green-200 rounded-2xl bg-white overflow-hidden shadow-xl"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Recording Modal</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Main content area */}
          <div className="flex-1">
            {isProcessing !== "idle" ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-green-500">
                <div className="relative">
                  <div className="w-16 h-16 bg-green-100 rounded-full animate-pulse"></div>
                  <img
                    src="/loading.svg"
                    alt="Loading"
                    className="absolute inset-0 w-16 h-16 animate-spin p-4 text-green-500"
                  />
                </div>
                <p className="text-lg font-medium opacity-90">
                  {isProcessing === "uploading"
                    ? "Uploading your recording"
                    : "Transcribing your thoughts..."}
                </p>
                <p className="text-sm text-green-400">
                  This usually takes just a few seconds
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full p-6 sm:p-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 px-4">
                  Ready to <span className="text-green-500">RMBL?</span>
                </h1>

                {maxDuration && maxDuration < 60 && (
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200 mb-4">
                    Upload limited to {maxDuration} seconds (free plan)
                  </div>
                )}
                {!recording ? (
                  <RecordingBasics
                    language={language}
                    setLanguage={setLanguage}
                    disabled={isProcessing !== "idle"}
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 items-center justify-center w-full">
                    {/* Reset recording */}
                    <button
                      className="size-12 bg-white border border-gray-200 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                      onClick={resetRecording}
                      type="button"
                      aria-label="Reset recording"
                    >
                      <img src="/X.svg" className="size-5 text-gray-600" />
                    </button>

                    {/* Timer & waveform */}
                    <div className="flex flex-col gap-2 items-center w-full max-w-[220px]">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-mono font-medium text-gray-900">
                          {formatTime(duration)}
                        </span>
                        {maxDuration && (
                          <span className="text-sm text-gray-400">
                            / {formatTime(maxDuration)}
                          </span>
                        )}
                      </div>
                      <AudioWaveform
                        analyserNode={analyserNode}
                        isPaused={paused}
                      />
                      {maxDuration &&
                        duration >= maxDuration - 10 &&
                        duration < maxDuration && (
                          <p className="text-xs text-red-500 font-medium mt-1 animate-pulse">
                            {maxDuration - duration}s remaining
                          </p>
                        )}
                    </div>

                    {/* Pause/Resume */}
                    <button
                      className={cn(
                        "size-12 p-3 rounded-xl transition-all shadow-sm",
                        paused
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-white border border-gray-200 hover:bg-gray-50"
                      )}
                      onClick={paused ? resumeRecording : pauseRecording}
                      aria-label={
                        paused ? "Resume recording" : "Pause recording"
                      }
                    >
                      <img
                        src={paused ? "/microphone.svg" : "/pause.svg"}
                        className="size-5 filter brightness-0 invert"
                      />
                    </button>
                  </div>
                )}

                {/* Main record button */}
                <Button
                  className={cn(
                    recording
                      ? "bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse"
                      : "bg-green-500 hover:bg-green-600 shadow-green-200",
                    "rounded-full w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center my-6 text-white",
                    "transition-all duration-300 transform hover:scale-105 active:scale-95",
                    "shadow-lg border-0"
                  )}
                  onClick={() => {
                    if (recording) {
                      stopRecording();
                      setPendingSave(true);
                    } else {
                      handleStartRecording();
                    }
                  }}
                  disabled={isProcessing !== "idle"}
                >
                  {recording ? (
                    <img
                      src="/stop.svg"
                      className="w-12 h-12 sm:w-16 sm:h-16 filter brightness-0 invert"
                    />
                  ) : (
                    <img
                      src="/microphone.svg"
                      className="w-12 h-12 sm:w-16 sm:h-16 filter brightness-0 invert"
                    />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Footer/CTA section */}
          <div className="bg-gradient-to-b from-green-500 to-green-600 rounded-xl text-white p-6 sm:p-8 mx-auto mb-6 ">
            <div className="max-w-xs mx-auto text-center">
              <div className="inline-flex items-center justify-center bg-white/10 p-3 rounded-full mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.68 13.69L12 11.93l2.32 1.76-.88-2.85L15.75 9h-2.84L12 6.19 11.09 9H8.25l2.31 1.84-.88 2.85zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">
                Want unlimited recording?
              </h3>
              <p className="text-white/90 mb-6 text-sm">
                Upgrade to our mobile apps for unlimited recording time and full
                AI features.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
                <a
                  href="#"
                  className="bg-white text-green-500 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-all"
                >
                  <img alt="Apple logo" className="w-5 h-5" src="/apple.svg" />
                  <span>iOS App</span>
                </a>
                <a
                  href="#"
                  className="bg-white text-green-500 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-all"
                >
                  <img
                    alt="Android logo"
                    className="w-5 h-5"
                    src="/android-logo.svg"
                  />
                  <span>Android App</span>
                </a>
              </div>

              <a
                href="#"
                className="inline-flex items-center justify-center bg-white text-green-500 font-bold py-3 px-6 rounded-lg space-x-2 hover:bg-gray-50 transition-all shadow-md text-sm"
              >
                <span>Get Lifetime Access</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
