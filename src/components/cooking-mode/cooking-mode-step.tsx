"use client";

import { CheckCircle } from "@untitledui/icons";
import { TextHighlighter } from "@/components/learn/text-highlighter";
import { cx } from "@/utils/cx";

interface CookingModeStepProps {
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  isCompleted: boolean;
  onComplete?: () => void;
}

export function CookingModeStep({
  stepNumber,
  totalSteps,
  instruction,
  isCompleted,
  onComplete,
}: CookingModeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto px-4 md:px-8">
      {/* Step Number and Progress */}
      <div className="mb-8 text-center">
        <p className="text-xl md:text-2xl text-primary-foreground/70 mb-2">
          Step {stepNumber} of {totalSteps}
        </p>
        {/* Progress Bar */}
        <div className="w-64 md:w-96 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-utility-success-500 transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Instruction Card */}
      <div
        className={cx(
          "w-full p-8 md:p-12 rounded-2xl transition-all duration-300",
          isCompleted
            ? "bg-utility-success-500/20 border-2 border-utility-success-500"
            : "bg-secondary_alt border-2 border-secondary"
        )}
      >
        {/* Completion Indicator */}
        {isCompleted && (
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="size-12 text-utility-success-500" />
          </div>
        )}

        {/* Instruction Text */}
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground leading-relaxed text-center">
          <TextHighlighter text={instruction} />
        </p>

        {/* Complete Button */}
        {!isCompleted && onComplete && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onComplete}
              className="px-8 py-4 bg-utility-success-600 hover:bg-utility-success-700 text-white text-lg md:text-xl font-semibold rounded-lg transition-colors"
            >
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

