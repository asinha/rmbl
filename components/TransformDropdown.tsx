import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RECORDING_TYPES } from "@/lib/utils";
import { useLimits } from "./hooks/useLimits";
import { cn } from "@/lib/utils";

export function TransformDropdown({
  onTransform,
  isStreaming = false,
}: {
  onTransform: (type: string) => void;
  isStreaming?: boolean;
}) {
  const { isLoading, transformationsData } = useLimits();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        asChild
        disabled={
          isStreaming || isLoading || transformationsData?.remaining === 0
        }
      >
        <button
          className={cn(
            "w-full md:max-w-[322px] max-w-md py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all",
            "shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]",
            isStreaming || isLoading || transformationsData?.remaining === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          )}
        >
          <img
            src="/sparkFull.svg"
            className={cn(
              "size-5 min-w-5 min-h-5",
              isStreaming || isLoading || transformationsData?.remaining === 0
                ? "opacity-50"
                : "filter brightness-0 invert"
            )}
          />
          <span>
            {isStreaming
              ? "Processing..."
              : isLoading
              ? "Loading..."
              : transformationsData?.remaining === 0
              ? "No transformations left"
              : "Transform"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="!p-0 border border-green-200 rounded-xl shadow-xl overflow-hidden"
        align="start"
      >
        {RECORDING_TYPES.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onSelect={() => onTransform(type.value)}
            className={cn(
              "flex items-center gap-3 cursor-pointer h-[56px] px-4 py-3",
              "border-b border-green-100 last:border-b-0",
              "hover:bg-green-50 transition-colors",
              "min-w-[322px] max-w-full"
            )}
          >
            <img
              src={`/recordings/${type.value}.svg`}
              className="size-5 min-w-5 text-green-500"
            />
            <span className="text-gray-800 font-medium">{type.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
