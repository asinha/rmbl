"use client";

import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatWhisperTimestamp, RECORDING_TYPES } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TransformDropdown } from "@/components/TransformDropdown";
import { toast } from "sonner";
import { AutosizeTextarea } from "@/components/ui/AutoSizeTextArea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LoadingSection } from "@/components/whisper-page/LoadingSection";
import { CustomMarkdown } from "@/components/CustomMarkdown";
import { useTogetherApiKey } from "@/components/TogetherApiKeyProvider";
import { useLimits } from "@/components/hooks/useLimits";
import { X, Plus, Tag, ChevronDown, ArrowLeft } from "lucide-react";

const DELAY_SAVE = 10000; // 10 seconds

// Type definitions
interface WhisperTransformation {
  id: string;
  typeName: string;
  text: string;
  isGenerating: boolean;
  createdAt: string;
}

interface WhisperTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface WhisperData {
  id: string;
  fullTranscription?: string;
  title?: string;
  transformations?: WhisperTransformation[];
  tags?: WhisperTag[];
}

interface LabeledTransformation extends WhisperTransformation {
  label: string;
}

interface TranscriptionPageClientProps {
  id: string;
}

// Predefined tag options with colors
const PREDEFINED_TAGS = [
  { name: "Work", color: "#3b82f6" }, // blue
  { name: "Personal", color: "#22c55e" }, // green
  { name: "Meeting", color: "#f97316" }, // orange
  { name: "Idea", color: "#8b5cf6" }, // violet
];

export default function TranscriptionPageClient({
  id,
}: TranscriptionPageClientProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedTransformationId, setSelectedTransformationId] = useState<
    string | null
  >(null);

  const {
    data: whisper,
    isLoading,
    error,
    refetch,
  } = useQuery(trpc.whisper.getWhisperWithTracks.queryOptions({ id }));

  const [editableTranscription, setEditableTranscription] =
    useState<string>("");
  const [editableTitle, setEditableTitle] = useState<string>("");
  const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);

  // New state for optimistic tag updates
  const [optimisticTags, setOptimisticTags] = useState<WhisperTag[]>([]);
  const [tagOperations, setTagOperations] = useState<{
    adding: Set<string>;
    removing: Set<string>;
  }>({
    adding: new Set(),
    removing: new Set(),
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const titleDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const trpcMutation = useMutation(
    trpc.whisper.updateFullTranscription.mutationOptions()
  );
  const titleMutation = useMutation(trpc.whisper.updateTitle.mutationOptions());
  const addTagMutation = useMutation(trpc.whisper.addTag.mutationOptions());
  const removeTagMutation = useMutation(
    trpc.whisper.removeTag.mutationOptions()
  );

  const { apiKey } = useTogetherApiKey();
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { transformationsData, isLoading: isLimitsLoading } = useLimits();

  // Sync optimistic tags with server data
  useEffect(() => {
    if (whisper?.tags) {
      setOptimisticTags(whisper.tags);
    }
  }, [whisper?.tags]);

  // Helper: get all transformations from server only
  const getAllTransformations = (): WhisperTransformation[] => {
    return whisper?.transformations || [];
  };

  // Helper: get display name for a transformation type
  const getTypeDisplayName = (typeName: string): string => {
    const found = RECORDING_TYPES.find((t) => t.value === typeName);
    return found ? found.name : typeName;
  };

  // Helper: group and label transformations by type (with display names)
  const getLabeledTransformations = (): LabeledTransformation[] => {
    const all = getAllTransformations();
    const grouped: Record<string, WhisperTransformation[]> = {};

    all.forEach((t) => {
      if (!grouped[t.typeName]) grouped[t.typeName] = [];
      grouped[t.typeName].push(t);
    });

    // Sort each group by createdAt (oldest first)
    Object.values(grouped).forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );

    // Assign labels using display name
    const labeled: LabeledTransformation[] = [];
    Object.entries(grouped).forEach(([type, arr]) => {
      const displayName = getTypeDisplayName(type);
      arr.forEach((t, idx) => {
        labeled.push({
          ...t,
          label: arr.length > 1 ? `${displayName} ${idx + 1}` : displayName,
        });
      });
    });

    return labeled;
  };

  // Helper: get available tags (predefined tags not already added) - now uses optimisticTags
  const getAvailableTags = () => {
    const existingTagNames = optimisticTags.map((tag) =>
      tag.name.toLowerCase()
    );
    return PREDEFINED_TAGS.filter(
      (tag) => !existingTagNames.includes(tag.name.toLowerCase())
    );
  };

  // When whisper loads, set base transcription and title
  useEffect(() => {
    if (whisper?.fullTranscription) {
      setEditableTranscription(whisper.fullTranscription);
    }
    if (whisper?.title) {
      setEditableTitle(whisper.title);
    }
    // Default selection: base
    if (!selectedTransformationId) setSelectedTransformationId("base");
  }, [whisper?.fullTranscription, whisper?.title, selectedTransformationId]);

  // When a transformation is selected, update the text shown
  const getSelectedTransformation = (): string => {
    if (selectedTransformationId === "base")
      return whisper?.fullTranscription || "";
    const all = getAllTransformations();
    const t = all.find((t) => t.id === selectedTransformationId);
    return t ? t.text : whisper?.fullTranscription || "";
  };

  // Improved handler for adding a predefined tag with optimistic updates
  const handleAddPredefinedTag = async (tagName: string, color: string) => {
    // Create optimistic tag with temporary ID
    const optimisticTag: WhisperTag = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: tagName,
      color: color,
      createdAt: new Date().toISOString(),
    };

    // Update states immediately
    setOptimisticTags((prev) => [...prev, optimisticTag]);
    setTagOperations((prev) => ({
      ...prev,
      adding: new Set([...prev.adding, tagName]),
    }));
    setShowTagDropdown(false);

    try {
      await addTagMutation.mutateAsync({
        whisperId: id,
        tagName,
        color,
      });

      toast.success("Tag added!");
      // Let the useEffect handle syncing real data when refetch happens
      await refetch();
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTags((prev) =>
        prev.filter((tag) => tag.id !== optimisticTag.id)
      );
      toast.error("Failed to add tag");
    } finally {
      // Clean up loading state
      setTagOperations((prev) => {
        const newAdding = new Set(prev.adding);
        newAdding.delete(tagName);
        return {
          ...prev,
          adding: newAdding,
        };
      });
    }
  };

  // Improved handler for removing a tag with optimistic updates
  const handleRemoveTag = async (tagId: string) => {
    const tagToRemove = optimisticTags.find((tag) => tag.id === tagId);
    if (!tagToRemove) return;

    // Update states immediately
    setOptimisticTags((prev) => prev.filter((tag) => tag.id !== tagId));
    setTagOperations((prev) => ({
      ...prev,
      removing: new Set([...prev.removing, tagId]),
    }));

    try {
      await removeTagMutation.mutateAsync({
        whisperId: id,
        tagId,
      });

      toast.success("Tag removed!");
      await refetch();
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTags((prev) => [...prev, tagToRemove]);
      toast.error("Failed to remove tag");
    } finally {
      // Clean up loading state
      setTagOperations((prev) => {
        const newRemoving = new Set(prev.removing);
        newRemoving.delete(tagId);
        return {
          ...prev,
          removing: newRemoving,
        };
      });
    }
  };

  // Handler for creating a transformation (streaming)
  const handleTransform = async (typeName: string) => {
    setIsStreaming(true);
    setStreamingText("");
    let newId: string | null = null;

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { TogetherAPIToken: apiKey } : {}),
        },
        body: JSON.stringify({ whisperId: id, typeName }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      let buffer = "";
      let gotId = false;
      let text = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        // First line is the id JSON
        if (!gotId) {
          const newlineIdx = buffer.indexOf("\n");
          if (newlineIdx !== -1) {
            const idLine = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            try {
              const parsed = JSON.parse(idLine);
              newId = parsed.id;
              setSelectedTransformationId(newId);
              // Invalidate transformation limits
              await queryClient.invalidateQueries({
                queryKey: trpc.limit.getTransformationsLeft.queryKey(),
              });
            } catch (e) {
              // ignore parsing error
              console.warn("Failed to parse transformation ID:", e);
            }
            gotId = true;
          } else {
            continue;
          }
        }

        // The rest is streamed text
        text += buffer;
        setStreamingText(text);
        buffer = "";
      }

      setIsStreaming(false);
      setStreamingText("");
      // Refetch to get the final transformation from DB
      await refetch();
    } catch (err) {
      setIsStreaming(false);
      setStreamingText("");
      toast.error("Failed to generate transformation");
      console.error("Transformation error:", err);
    }
  };

  // UI: loader for isGenerating or streaming
  const renderTranscription = () => {
    if (isStreaming) {
      return (
        <>
          {streamingText.length === 0 && <LoadingSection />}
          <div className="mt-2 whitespace-pre-line rounded p-2 min-h-[120px] w-full bg-white text-slate-800 flex flex-col gap-0.5 animate-pulse">
            <CustomMarkdown>{streamingText}</CustomMarkdown>
          </div>
        </>
      );
    }

    if (selectedTransformationId === "base") {
      return (
        <AutosizeTextarea
          className="whitespace-pre-line rounded p-2 min-h-[120px] w-full focus:outline-none resize-vertical"
          value={editableTranscription}
          onChange={(e) => {
            const value = e.target.value;
            setEditableTranscription(value);

            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            debounceTimeout.current = setTimeout(() => {
              trpcMutation.mutate(
                { id, fullTranscription: value },
                {
                  onSuccess: () => {
                    toast.success("Transcription saved!", {
                      id: "transcription-save",
                    });
                  },
                  onError: () => {
                    toast.error("Failed to save transcription.", {
                      id: "transcription-save",
                    });
                  },
                }
              );
            }, DELAY_SAVE);
          }}
          spellCheck={true}
          aria-label="Edit transcription"
          disabled={trpcMutation.status === "pending"}
        />
      );
    }

    // Find transformation
    const all = getAllTransformations();
    const t = all.find((t) => t.id === selectedTransformationId);
    if (!t) return null;

    if (t.isGenerating) {
      return <LoadingSection />;
    }

    return (
      <div className="whitespace-pre-line rounded p-2 min-h-[120px] w-full bg-white text-slate-800 flex flex-col gap-0.5">
        <CustomMarkdown>{t.text}</CustomMarkdown>
      </div>
    );
  };

  // Updated render tags section with improved UX
  const renderTags = () => {
    const tags = optimisticTags;
    const availableTags = getAvailableTags();

    return (
      <div className="mb-6 mx-8">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Tags</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag) => {
            const isRemoving = tagOperations.removing.has(tag.id);
            const isOptimistic = tag.id.startsWith("temp-");

            return (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white transition-all duration-200 ${
                  isRemoving ? "opacity-50 scale-95" : "opacity-100 scale-100"
                } ${isOptimistic ? "animate-pulse" : ""}`}
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className={`ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors ${
                    isRemoving ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  disabled={isRemoving}
                  aria-label={`Remove ${tag.name} tag`}
                >
                  {isRemoving ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-white/50 border-t-white" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </span>
            );
          })}

          {availableTags.length > 0 && (
            <DropdownMenu
              open={showTagDropdown}
              onOpenChange={setShowTagDropdown}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs text-slate-600 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    addTagMutation.status === "pending" ||
                    tagOperations.adding.size > 0
                  }
                >
                  <Plus className="w-3 h-3" />
                  Add tag
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {availableTags.map((tag) => {
                  const isAdding = tagOperations.adding.has(tag.name);

                  return (
                    <DropdownMenuItem
                      key={tag.name}
                      onSelect={() =>
                        handleAddPredefinedTag(tag.name, tag.color)
                      }
                      disabled={isAdding}
                      className={`flex items-center gap-2 ${
                        isAdding ? "opacity-50" : ""
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      {isAdding && (
                        <div className="ml-auto w-3 h-3 animate-spin rounded-full border border-slate-400 border-t-transparent" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  // Dropdown for selecting transformation
  const labeledTransformations = getLabeledTransformations();
  const isCurrentGenerating =
    selectedTransformationId !== "base" &&
    labeledTransformations.find((t) => t.id === selectedTransformationId)
      ?.isGenerating;

  // Polling logic: refetch if selected transformation is generating
  useEffect(() => {
    let attempts = 0;
    let timer: NodeJS.Timeout | null = null;

    const poll = async () => {
      const t = labeledTransformations.find(
        (t) => t.id === selectedTransformationId
      );
      if (
        selectedTransformationId !== "base" &&
        t &&
        t.isGenerating &&
        attempts < 5
      ) {
        attempts++;
        await refetch();
        timer = setTimeout(poll, 5000);
      }
    };

    // Start polling if needed
    const t = labeledTransformations.find(
      (t) => t.id === selectedTransformationId
    );
    if (selectedTransformationId !== "base" && t && t.isGenerating) {
      poll();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [selectedTransformationId, labeledTransformations, refetch]);

  if (error || (!whisper && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">RMBL not found</h1>
          <button
            onClick={() => router.push("/main/dashboard")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to RMBLs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white">
      <header className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="mx-auto max-w-[688px] w-full flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => router.push("/main/dashboard")}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>

          {/* Title input */}
          <input
            className="text-xl font-semibold bg-transparent border-none outline-none w-full"
            value={editableTitle}
            onChange={(e) => {
              const value = e.target.value;
              setEditableTitle(value);
              if (titleDebounceTimeout.current)
                clearTimeout(titleDebounceTimeout.current);
              titleDebounceTimeout.current = setTimeout(() => {
                titleMutation.mutate(
                  { id, title: value },
                  {
                    onSuccess: () => {
                      toast.success("Title saved!", { id: "title-save" });
                    },
                    onError: () => {
                      toast.error("Failed to save title.", {
                        id: "title-save",
                      });
                    },
                  }
                );
              }, DELAY_SAVE);
            }}
            aria-label="Edit title"
            spellCheck={true}
            disabled={titleMutation.status === "pending"}
          />

          {/* Transform dropdown - keep existing code */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              asChild
              disabled={isStreaming || isCurrentGenerating}
            >
              <button
                className={`flex justify-between items-center relative overflow-hidden gap-2 px-3 py-[5px] rounded-lg border-[0.5px] border-[#d1d5dc] min-h-[34px] min-w-[100px] max-w-[120px] w-full text-sm font-medium ${
                  isStreaming || isCurrentGenerating
                    ? "bg-slate-100 text-slate-400"
                    : "bg-white text-[#364153]"
                }`}
                disabled={isStreaming || isLoading}
                type="button"
              >
                <span className="text-sm text-left w-full">
                  {isStreaming || isCurrentGenerating
                    ? "Generating..."
                    : (() => {
                        if (selectedTransformationId === "base")
                          return "Transcript";
                        const t = labeledTransformations.find(
                          (t) => t.id === selectedTransformationId
                        );
                        return t ? t.label : "Transcript";
                      })()}
                </span>
                <span className="ml-2 flex items-center">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.70628 2.92973C8.94592 3.16937 8.94592 3.5579 8.70628 3.79754L5.43355 7.07027C5.19391 7.30991 4.80538 7.30991 4.56574 7.07027L1.29301 3.79754C1.05337 3.5579 1.05337 3.16937 1.29301 2.92973C1.53265 2.69009 1.92118 2.69009 2.16082 2.92973L4.99964 5.76855L7.83847 2.92973C8.07811 2.69009 8.46664 2.69009 8.70628 2.92973Z"
                      fill="#D1D5DC"
                    />
                  </svg>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[120px]">
              <DropdownMenuItem
                onSelect={() => setSelectedTransformationId("base")}
                disabled={isStreaming || isCurrentGenerating}
                className="text-sm"
              >
                Transcript
              </DropdownMenuItem>
              {labeledTransformations.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onSelect={() => setSelectedTransformationId(t.id)}
                  disabled={isStreaming || isCurrentGenerating}
                  className="text-sm flex items-center gap-2"
                >
                  {t.label}
                  {t.isGenerating && (
                    <span className="ml-2 animate-pulse text-xs text-slate-400">
                      ...
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="py-8 mx-auto max-w-[688px] w-full">
        {isLoading ? (
          <div className="px-8">
            <LoadingSection />
          </div>
        ) : (
          <>
            {renderTags()}
            <div className="mb-6 mx-8">{renderTranscription()}</div>
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full md:left-1/2 md:-translate-x-1/2 bg-white border-t md:border md:rounded-2xl border-slate-200 px-4 py-3 flex flex-col md:flex-row items-center z-50 max-w-[730px] gap-2 justify-center md:mb-4">
        <TransformDropdown
          onTransform={handleTransform}
          isStreaming={isStreaming}
        />
        <div className="flex gap-2 w-full md:flex-row max-w-md md:max-w-auto justify-between items-center">
          <button
            className="flex-1 py-2 cursor-pointer rounded-lg border border-slate-200 bg-white text-[#364153] font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isStreaming || isCurrentGenerating}
            onClick={async () => {
              if (isStreaming || isCurrentGenerating) return;
              // just copy the transcript to clipboard
              await navigator.clipboard.writeText(getSelectedTransformation());
              toast.success("Copied to clipboard!", {
                id: "copy-to-clipboard",
              });
            }}
          >
            <img
              src="/copy.svg"
              className="size-5 min-w-5 min-h-5"
              alt="Copy"
            />
            <span>Copy</span>
          </button>
          <Link
            href="/main/dashboard"
            className="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-[#364153] font-medium flex items-center justify-center gap-2"
          >
            <img src="/new.svg" className="size-5 min-w-5 min-h-5" alt="New" />
            <span>New</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
