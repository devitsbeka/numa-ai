"use client";

import { ActivityHeart, Star01, CheckCircle, AlertCircle, Droplets01 } from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { cx } from "@/utils/cx";
import type { DietaryPreference } from "@/types/cooking-mode";

interface PreferenceIconsProps {
  preferences: DietaryPreference[];
  size?: "small" | "medium" | "large";
  className?: string;
}

const PREFERENCE_CONFIG: Record<
  DietaryPreference,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string; emoji?: string }
> = {
  none: { icon: CheckCircle, color: "text-primary-foreground/40", label: "None", emoji: "○" },
  vegan: { icon: ActivityHeart, color: "text-utility-success-500", label: "Vegan", emoji: "🌱" },
  vegetarian: { icon: Star01, color: "text-utility-success-500", label: "Vegetarian", emoji: "🥬" },
  "gluten-free": { icon: AlertCircle, color: "text-utility-warning-500", label: "Gluten-Free", emoji: "🌾" },
  keto: { icon: Star01, color: "text-purple-500", label: "Keto", emoji: "🔥" },
  "dairy-free": { icon: Droplets01, color: "text-blue-500", label: "Dairy-Free", emoji: "🥛" },
};

const SIZE_CLASSES = {
  small: "size-3",
  medium: "size-4",
  large: "size-5",
};

export function PreferenceIcons({
  preferences,
  size = "medium",
  className,
}: PreferenceIconsProps) {
  const activePreferences = preferences.filter((p) => p !== "none");

  if (activePreferences.length === 0) {
    return null;
  }

  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className={cx("flex items-center gap-1", className)}>
      {activePreferences.map((preference) => {
        const config = PREFERENCE_CONFIG[preference];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <Tooltip key={preference} title={config.label}>
            <TooltipTrigger elementType="div">
              <div
                className={cx(
                  "rounded-full flex items-center justify-center transition-colors",
                  sizeClass,
                  config.color
                )}
                aria-label={config.label}
                title={config.label}
              >
                {config.emoji ? (
                  <span className="text-xs leading-none">{config.emoji}</span>
                ) : (
                  <Icon className={cx("w-full h-full", config.color)} />
                )}
              </div>
            </TooltipTrigger>
          </Tooltip>
        );
      })}
    </div>
  );
}

