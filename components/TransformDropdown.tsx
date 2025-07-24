import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RECORDING_TYPES } from "@/lib/utils";
import { useLimits } from "./hooks/useLimits";

export function TransformDropdown({
  onTransform,
  isStreaming = false,
}: {
  onTransform: (type: string, customPrompt?: string) => void;
  isStreaming?: boolean;
}) {
  const { isLoading, transformationsData } = useLimits();
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const handleCustomTransform = () => {
    if (customPrompt.trim()) {
      onTransform("custom", customPrompt);
      setIsCustomDialogOpen(false);
      setCustomPrompt("");
    }
  };

  const handleMenuItemSelect = (type: string) => {
    if (type === "custom") {
      setIsCustomDialogOpen(true);
    } else {
      onTransform(type);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          asChild
          disabled={
            isStreaming || isLoading || transformationsData?.remaining === 0
          }
        >
          <button
            className={`w-full md:max-w-[322px] max-w-md py-2 rounded-lg font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors
              ${
                isStreaming
                  ? "bg-slate-100 text-slate-400"
                  : "bg-slate-900 text-white"
              }
            `}
          >
            <img src="/sparkFull.svg" className="size-5 min-w-5 min-h-5" />
            <span>{isStreaming ? "Streaming ..." : "Transform"}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="!p-0">
          {RECORDING_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onSelect={() => handleMenuItemSelect(type.value)}
              className="flex items-center gap-2 cursor-pointer h-[51px] p-3 border-b border-slate-200 hover:bg-slate-50 min-w-[322px] max-w-full"
            >
              <img
                src={`/recordings/${type.value}.svg`}
                className="size-[18px] min-w-[18px]"
              />
              <span>{type.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Custom Transform Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter your custom prompt here..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCustomDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomTransform}
                disabled={!customPrompt.trim()}
              >
                Transform
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
