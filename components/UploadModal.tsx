"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Dropzone from "react-dropzone";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useS3Upload } from "next-s3-upload";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RecordingBasics } from "./RecordingBasics";
import { RecordingMinutesLeft } from "./RecordingMinutesLeft";
import { useTogetherApiKey } from "./TogetherApiKeyProvider";
import useLocalStorage from "./hooks/useLocalStorage";
import { useLimits } from "./hooks/useLimits";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  onClose: () => void;
  maxDuration?: number;
  onRecordingComplete?: (duration: number) => void;
}

const getDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => reject("Failed to load audio");
    audio.src = URL.createObjectURL(file);
  });

export function UploadModal({
  onClose,
  maxDuration,
  onRecordingComplete,
}: UploadModalProps) {
  const [language, setLanguage] = useLocalStorage("language", "en");
  const [isProcessing, setIsProcessing] = useState<
    "idle" | "uploading" | "transcribing"
  >("idle");
  const [isDragActive, setIsDragActive] = useState(false);
  const { uploadToS3 } = useS3Upload();
  const router = useRouter();
  const trpc = useTRPC();
  const { apiKey } = useTogetherApiKey();
  const isBYOK = !!apiKey;
  const transcribeMutation = useMutation(
    trpc.whisper.transcribeFromS3.mutationOptions()
  );
  const queryClient = useQueryClient();
  const { minutesData, isLoading } = useLimits();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        toast.error("Invalid file selected. Please select a valid audio file.");
        return;
      }

      try {
        const duration = await getDuration(file);
        const roundedDuration = Math.ceil(duration);

        if (maxDuration && roundedDuration > maxDuration) {
          toast.error(
            `File is too long. Free users can only upload files up to ${maxDuration} seconds. Your file is ${roundedDuration} seconds.`
          );
          return;
        }

        if (roundedDuration < 1) {
          toast.error("File appears to be too short or invalid.");
          return;
        }

        setIsProcessing("uploading");
        const { url } = await uploadToS3(file);

        setIsProcessing("transcribing");
        const { id } = await transcribeMutation.mutateAsync({
          audioUrl: url,
          language,
          durationSeconds: roundedDuration,
        });

        if (onRecordingComplete) {
          onRecordingComplete(roundedDuration);
        }

        await queryClient.invalidateQueries({
          queryKey: trpc.whisper.listWhispers.queryKey(),
        });
        router.push(`/main/dashboard/${id}`);
      } catch (err) {
        console.error("Upload error:", err);
        if (err instanceof Error) {
          toast.error(`Failed to process audio: ${err.message}`);
        } else {
          toast.error("Failed to process audio. Please try again.");
        }
      } finally {
        setIsProcessing("idle");
      }
    },
    [
      uploadToS3,
      transcribeMutation,
      router,
      maxDuration,
      language,
      onRecordingComplete,
    ]
  );

  const maxFileSizeBytes = maxDuration ? maxDuration * 1024 * 100 : undefined;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-full sm:!max-w-[650px] !p-0 border border-green-200 rounded-2xl bg-white overflow-hidden shadow-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-[95vw] sm:w-auto"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Upload Voice Audio</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Main content area - adjusted for perfect fit */}
          <div className="flex-1">
            {isProcessing !== "idle" ? (
              <div className="flex flex-col items-center justify-center py-8 px-6 text-green-500">
                <div className="relative">
                  <div className="w-12 h-12 bg-green-100 rounded-full animate-pulse"></div>
                  <img
                    src="/loading.svg"
                    alt="Loading"
                    className="absolute inset-0 w-12 h-12 animate-spin p-3 text-green-500"
                  />
                </div>
                <p className="text-base font-medium opacity-90 mt-3">
                  {isProcessing === "uploading"
                    ? "Uploading your recording"
                    : "Transcribing your thoughts..."}
                </p>
                <p className="text-xs text-green-400 mt-1">
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

                <div className="w-full mb-3 px-2">
                  <RecordingBasics
                    language={language}
                    setLanguage={setLanguage}
                    disabled={isProcessing !== "idle"}
                    //compact
                  />
                </div>

                <Dropzone
                  multiple={false}
                  accept={{
                    "audio/mpeg3": [".mp3"],
                    "audio/x-mpeg-3": [".mp3"],
                    "audio/wav": [".wav"],
                    "audio/x-wav": [".wav"],
                    "audio/wave": [".wav"],
                    "audio/x-pn-wav": [".wav"],
                    "audio/mp4": [".m4a"],
                    "audio/m4a": [".m4a"],
                    "audio/x-m4a": [".m4a"],
                    "audio/webm": [".webm"],
                    "audio/ogg": [".ogg"],
                  }}
                  onDrop={handleDrop}
                  onDragEnter={() => setIsDragActive(true)}
                  onDragLeave={() => setIsDragActive(false)}
                  onDropAccepted={() => setIsDragActive(false)}
                  maxSize={maxFileSizeBytes}
                  disabled={isProcessing !== "idle"}
                >
                  {({ getRootProps, getInputProps, fileRejections }) => (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "w-full rounded-xl bg-gray-100 border-2 border-dashed min-h-[140px] flex flex-col justify-center items-center gap-2 p-4",
                        isDragActive
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200",
                        isProcessing !== "idle" &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input {...getInputProps()} />
                      <div className="flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-green-500">
                        <img
                          src="/uploadWhite.svg"
                          className="w-4 h-4 filter brightness-0 invert"
                        />
                        <p className="text-sm font-semibold text-white">
                          Upload a Recording
                        </p>
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        Or drag and drop here
                      </p>
                      <p className="text-xs text-center text-gray-500">
                        Supports MP3, WAV, M4A, WebM, OGG
                      </p>
                      {maxDuration && (
                        <p className="text-xs text-center text-gray-500 mt-1 font-medium">
                          Max duration: {maxDuration} seconds
                        </p>
                      )}
                    </div>
                  )}
                </Dropzone>
              </div>
            )}
          </div>

          {/* Compact Footer/CTA section */}
          <div className="bg-gradient-to-b from-green-500 to-green-600 rounded-b-xl text-white p-4 sm:p-5">
            <div className="max-w-md mx-auto text-center">
              <div className="inline-flex items-center justify-center bg-white/10 p-1.5 rounded-full mb-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.68 13.69L12 11.93l2.32 1.76-.88-2.85L15.75 9h-2.84L12 6.19 11.09 9H8.25l2.31 1.84-.88 2.85zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1">
                Want unlimited recording?
              </h3>
              <p className="text-white/90 mb-3 text-xs">
                Upgrade to our mobile apps for unlimited recording time and full
                AI features.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-2 mb-3">
                <a
                  href="#"
                  className="bg-white text-green-500 font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-100 transition-all text-xs"
                >
                  <img alt="Apple logo" className="w-3 h-3" src="/apple.svg" />
                  <span>iOS App</span>
                </a>
                <a
                  href="#"
                  className="bg-white text-green-500 font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-100 transition-all text-xs"
                >
                  <img
                    alt="Android logo"
                    className="w-3 h-3"
                    src="/android-logo.svg"
                  />
                  <span>Android App</span>
                </a>
              </div>

              <a
                href="#"
                className="inline-flex items-center justify-center bg-white text-green-500 font-bold py-1.5 px-3 rounded-lg space-x-1 hover:bg-gray-50 transition-all shadow-sm text-xs"
              >
                <span>Get Lifetime Access</span>
                <svg
                  className="w-2.5 h-2.5"
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
