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
        // Check duration before uploading
        const duration = await getDuration(file);
        const roundedDuration = Math.ceil(duration);

        // Check if file exceeds the maximum allowed duration
        if (maxDuration && roundedDuration > maxDuration) {
          toast.error(
            `File is too long. Free users can only upload files up to ${maxDuration} seconds. Your file is ${roundedDuration} seconds.`
          );
          return;
        }

        // Validate file duration is reasonable (not 0 or too short)
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

        // Update daily usage for free users
        if (onRecordingComplete) {
          onRecordingComplete(roundedDuration);
        }

        await queryClient.invalidateQueries({
          queryKey: trpc.whisper.listWhispers.queryKey(),
        });
        router.push(`/main/ideas/${id}`);
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

  // Calculate max file size based on duration (rough estimate: 1KB per second)
  const maxFileSizeBytes = maxDuration ? maxDuration * 1024 * 100 : undefined; // 100KB per second estimate

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[392px] !p-0 border border-gray-200 rounded-tl-xl rounded-tr-xl bg-white overflow-hidden gap-0"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Upload Voice Audio</DialogTitle>
        </DialogHeader>

        {isProcessing !== "idle" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <img
              src="/loading.svg"
              alt="Loading"
              className="w-8 h-8 animate-spin"
            />
            <p className="text-gray-500">
              {isProcessing === "uploading"
                ? "Uploading audio recording"
                : "Transcribing audio..."}
              <span className="animate-pulse">...</span>
            </p>
          </div>
        ) : (
          <>
            <RecordingBasics
              language={language}
              setLanguage={setLanguage}
              disabled={isProcessing !== "idle"}
            />

            {maxDuration && maxDuration < 60 && (
              <div className="px-5 py-2 bg-yellow-50 border-t border-yellow-200 w-full">
                <p className="text-sm text-yellow-800 text-center">
                  Upload limited to {maxDuration} seconds (free plan)
                </p>
              </div>
            )}

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
              onDropRejected={(rejectedFiles) => {
                setIsDragActive(false);
                if (rejectedFiles.length > 0) {
                  const file = rejectedFiles[0];
                  if (
                    file.errors.some((error) => error.code === "file-too-large")
                  ) {
                    toast.error(
                      "File is too large. Please select a smaller audio file."
                    );
                  } else if (
                    file.errors.some(
                      (error) => error.code === "file-invalid-type"
                    )
                  ) {
                    toast.error(
                      "Invalid file type. Please select an audio file (MP3, WAV, M4A, WebM, OGG)."
                    );
                  } else {
                    toast.error(
                      "File rejected. Please try a different audio file."
                    );
                  }
                }
              }}
              maxSize={maxFileSizeBytes}
              disabled={isProcessing !== "idle"}
            >
              {({ getRootProps, getInputProps, fileRejections }) => (
                <div
                  {...getRootProps()}
                  className="flex flex-col justify-start items-start relative overflow-hidden bg-white cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <div className="relative bg-white p-5 w-full">
                    <div
                      className={`relative overflow-hidden rounded-xl bg-gray-100 border-2 border-dashed min-h-[86px] flex justify-center items-center flex-col gap-1 transition-colors ${
                        isDragActive
                          ? "border-blue-400 bg-blue-50"
                          : "border-[#d1d5dc]"
                      } ${
                        isProcessing !== "idle"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="flex justify-center items-center relative gap-2.5 px-3 py-2 rounded-lg bg-[#101828]">
                        <img
                          src="/uploadWhite.svg"
                          className="size-[18px] min-w-[18px]"
                        />
                        <p className="text-base font-semibold text-left text-white">
                          Upload a Recording
                        </p>
                      </div>
                      <p className="text-xs text-center text-[#4a5565]">
                        Or drag‑and‑drop here
                      </p>
                      <p className="text-xs text-center text-[#4a5565]">
                        Supports MP3, WAV, M4A, WebM, OGG
                      </p>
                      {maxDuration && (
                        <p className="text-xs text-center text-[#4a5565] mt-1 font-medium">
                          Max duration: {maxDuration} seconds
                        </p>
                      )}
                      {fileRejections.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          {fileRejections[0].errors[0].message}
                        </p>
                      )}
                      {isDragActive && (
                        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center z-10 pointer-events-none rounded-xl">
                          <span className="text-blue-700 font-semibold">
                            Drop audio file here
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative overflow-hidden px-5 py-3 w-full border-t border-gray-200">
                    {isLoading ? (
                      <span className="text-sm text-[#4a5565]">Loading...</span>
                    ) : (
                      <RecordingMinutesLeft
                        minutesLeft={
                          isBYOK ? Infinity : minutesData?.remaining ?? 0
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </Dropzone>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
