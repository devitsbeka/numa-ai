import { useEffect, useRef } from "react";
import { Clock } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface StepTimerProps {
  totalTime: number; // in seconds
  remainingTime: number; // in seconds
  isRunning: boolean;
  onTimeUp?: () => void;
}

export function StepTimer({
  totalTime,
  remainingTime,
  isRunning,
  onTimeUp,
}: StepTimerProps) {
  const prevRemainingTime = useRef(remainingTime);

  useEffect(() => {
    // Check if timer just hit zero
    if (prevRemainingTime.current > 0 && remainingTime === 0 && onTimeUp) {
      onTimeUp();
    }
    prevRemainingTime.current = remainingTime;
  }, [remainingTime, onTimeUp]);

  const progress = totalTime > 0 ? (remainingTime / totalTime) * 100 : 0;
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Calculate stroke properties for the progress ring
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine color based on remaining time
  let colorClass = "text-utility-success-500";
  if (remainingTime === 0) {
    colorClass = "text-utility-error-500";
  } else if (remainingTime <= 60) {
    colorClass = "text-utility-warning-500";
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Circular Progress Timer */}
      <div className="relative">
        <svg
          className="transform -rotate-90"
          width="200"
          height="200"
          viewBox="0 0 200 200"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-primary-foreground/10"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cx(
              "transition-all duration-1000 ease-linear",
              colorClass,
              remainingTime === 0 && "animate-pulse"
            )}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <Clock className={cx("size-6 md:size-8 mb-1 md:mb-2 shrink-0", colorClass)} />
          <span
            className={cx(
              "font-bold tabular-nums text-center leading-none",
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
              "max-w-full overflow-hidden text-ellipsis",
              colorClass === "text-utility-success-500"
                ? "text-primary-foreground"
                : colorClass
            )}
            style={{
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
            }}
          >
            {timeString}
          </span>
          <span className="text-xs md:text-sm text-primary-foreground/60 mt-1 shrink-0">
            {isRunning ? "remaining" : "paused"}
          </span>
        </div>
      </div>

      {/* Time Up Indicator */}
      {remainingTime === 0 && (
        <div className="mt-6 px-6 py-3 bg-utility-error-500/20 border border-utility-error-500/50 rounded-lg animate-in fade-in slide-in-from-bottom-2">
          <p className="text-lg font-semibold text-utility-error-400 text-center">
            Time's up! Check your food
          </p>
        </div>
      )}
    </div>
  );
}

