"use client";

import { Microphone01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface VoiceControlProps {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  lastCommand: string;
  onToggle: () => void;
}

export function VoiceControl({
  isSupported,
  isListening,
  transcript,
  lastCommand,
  onToggle,
}: VoiceControlProps) {
  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="md"
        iconLeading={Microphone01}
        onClick={onToggle}
        className={cx(
          "text-primary-foreground shrink-0 transition-all",
          isListening
            ? "bg-utility-success-600 hover:bg-utility-success-700"
            : "bg-secondary hover:bg-secondary_alt"
        )}
      >
        {isListening ? (
          <span className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-primary-foreground"></span>
            </span>
            Listening
          </span>
        ) : (
          "Voice"
        )}
      </Button>
      
      {isListening && (
        <div className="px-3 py-2 bg-utility-success-500/20 rounded-lg border border-utility-success-500/50 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-2 rounded-full bg-utility-success-400 animate-pulse" />
            <span className="text-xs font-medium text-utility-success-400">Active</span>
          </div>
          {transcript && (
            <p className="text-xs text-primary-foreground/90 truncate">"{transcript}"</p>
          )}
          {lastCommand && (
            <p className="text-xs font-semibold text-utility-success-400 mt-1">
              ✓ {lastCommand}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

