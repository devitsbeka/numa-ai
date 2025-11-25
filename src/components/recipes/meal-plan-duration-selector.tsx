"use client";

import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface MealPlanDurationSelectorProps {
  selectedDuration: 7 | 14 | 31;
  onDurationChange: (duration: 7 | 14 | 31) => void;
}

const DURATIONS = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 31, label: "31 Days" },
] as const;

export function MealPlanDurationSelector({
  selectedDuration,
  onDurationChange,
}: MealPlanDurationSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {DURATIONS.map((duration) => (
        <Button
          key={duration.value}
          color={selectedDuration === duration.value ? "primary" : "secondary"}
          size="md"
          onClick={() => onDurationChange(duration.value as 7 | 14 | 31)}
          className={cx(
            "transition-all",
            selectedDuration === duration.value && "ring-2 ring-brand"
          )}
        >
          {duration.label}
        </Button>
      ))}
    </div>
  );
}


