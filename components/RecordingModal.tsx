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
        className="!max-w-full sm:!max-w-[650px] !p-0 border border-green-200 rounded-2xl bg-white overflow-hidden shadow-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 max-h-[95vh] overflow-y-hidden w-[95vw] sm:w-auto"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Recording Modal</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Main content area - now with constrained height */}
          <div className="flex-1 max-h-[60vh] overflow-hidden">
            {isProcessing !== "idle" ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-green-500">
                <div className="relative">
                  <div className="w-12 h-12 bg-green-100 rounded-full animate-pulse"></div>
                  <img
                    src="/loading.svg"
                    alt="Loading"
                    className="absolute inset-0 w-12 h-12 animate-spin p-3 text-green-500"
                  />
                </div>
                <p className="text-base font-medium opacity-90">
                  {isProcessing === "uploading"
                    ? "Uploading your recording"
                    : "Transcribing your thoughts..."}
                </p>
                <p className="text-xs text-green-400">
                  This usually takes just a few seconds
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full p-4 sm:p-5">
                <h1 className="text-xl sm:text-2xl font-bold mb-3 text-center">
                  Ready to <span className="text-green-500">RMBL?</span>
                </h1>

                {maxDuration && maxDuration < 60 && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200 mb-3">
                    Upload limited to {maxDuration} seconds (free plan)
                  </div>
                )}

                {!recording ? (
                  <RecordingBasics
                    language={language}
                    setLanguage={setLanguage}
                    disabled={isProcessing !== "idle"}
                    //compactMode={true}
                  />
                ) : (
                  <div className="flex flex-col items-center w-full gap-3">
                    {/* Timer & waveform */}
                    <div className="flex flex-col gap-1 items-center w-full max-w-[350px]">
                      <div className="flex items-center gap-1">
                        <span className="text-base font-mono font-medium text-gray-900">
                          {formatTime(duration)}
                        </span>
                        {maxDuration && (
                          <span className="text-xs text-gray-400">
                            / {formatTime(maxDuration)}
                          </span>
                        )}
                      </div>
                      <div className="w-full">
                        <AudioWaveform
                          analyserNode={analyserNode}
                          isPaused={paused}
                          //height={40}
                        />
                      </div>
                      {maxDuration &&
                        duration >= maxDuration - 10 &&
                        duration < maxDuration && (
                          <p className="text-xs text-red-500 font-medium animate-pulse">
                            {maxDuration - duration}s remaining
                          </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3 items-center justify-center w-full">
                      {/* Reset recording */}
                      <button
                        className="size-9 bg-white border border-gray-200 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                        onClick={resetRecording}
                        type="button"
                        aria-label="Reset recording"
                      >
                        <img src="/X.svg" className="size-4 text-gray-600" />
                      </button>

                      {/* Pause/Resume */}
                      <button
                        className={cn(
                          "size-9 p-2 rounded-lg transition-all shadow-sm",
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
                          className="size-4 filter brightness-0 invert"
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Main record button - made smaller */}
                <div className="my-4">
                  <Button
                    className={cn(
                      recording
                        ? "bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse"
                        : "bg-green-500 hover:bg-green-600 shadow-green-200",
                      "rounded-full w-20 h-20 flex items-center justify-center",
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
                        className="w-6 h-6 filter brightness-0 invert"
                      />
                    ) : (
                      <img
                        src="/microphone.svg"
                        className="w-6 h-6 filter brightness-0 invert"
                      />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer/CTA section - made more compact */}
          <div className="bg-gradient-to-b from-green-500 to-green-600 rounded-b-xl text-white p-4 sm:p-5">
            <div className="max-w-md mx-auto text-center">
              <div className="inline-flex items-center justify-center bg-white/10 p-2 rounded-full mb-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.68 13.69L12 11.93l2.32 1.76-.88-2.85L15.75 9h-2.84L12 6.19 11.09 9H8.25l2.31 1.84-.88 2.85zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-2">
                Want unlimited recording?
              </h3>
              <p className="text-white/90 mb-3 text-xs sm:text-sm">
                Upgrade to our mobile apps for unlimited recording time and full
                AI features.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-2 mb-3">
                <a
                  href="#"
                  className="bg-white text-green-500 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-all shadow-sm text-xs sm:text-sm"
                >
                  <img alt="Apple logo" className="w-4 h-4" src="/apple.svg" />
                  <span>iOS App</span>
                </a>
                <a
                  href="#"
                  className="bg-white text-green-500 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-all shadow-sm text-xs sm:text-sm"
                >
                  <img
                    alt="Android logo"
                    className="w-4 h-4"
                    src="/android-logo.svg"
                  />
                  <span>Android App</span>
                </a>
              </div>

              <a
                href="#"
                className="inline-flex items-center justify-center bg-white text-green-500 font-bold py-2 px-4 rounded-lg space-x-2 hover:bg-gray-50 transition-all shadow-md text-xs"
              >
                <span>Get Lifetime Access</span>
                <svg
                  className="w-3 h-3"
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
