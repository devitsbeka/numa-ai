import { Check, Clock, ChevronRight, ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { StepTimer } from "./step-timer";
import { TextHighlighter } from "@/components/learn/text-highlighter";
import { cx } from "@/utils/cx";
import type { CookingStep, TimerState } from "@/types/cooking-mode";

interface CookingStepDisplayProps {
  step: CookingStep;
  totalSteps: number;
  timer: TimerState | null;
  onComplete: () => void;
  onNext: () => void;
  onAddTime: () => void;
  onSkip: () => void;
}

export function CookingStepDisplay({
  step,
  totalSteps,
  timer,
  onComplete,
  onNext,
  onAddTime,
  onSkip,
}: CookingStepDisplayProps) {
  const hasTimer = timer !== null && timer.totalTime > 0;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 md:p-12">
      {/* Step Number */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-secondary rounded-full border border-secondary">
          {step.isPrepStep && (
            <span className="text-lg font-bold text-utility-warning-400 uppercase tracking-wider">
              🔪 Prep
            </span>
          )}
          <span className="text-2xl font-bold text-primary-foreground">
            Step {step.number}
          </span>
          <span className="text-lg text-primary-foreground/60">of {totalSteps}</span>
        </div>
      </div>

      {/* Main Instruction */}
      <div className="flex-1 flex items-center justify-center max-w-4xl w-full mb-8 px-4">
        <p 
          className="font-medium text-primary-foreground text-center leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 2.5rem)',
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
        >
          <TextHighlighter text={step.instruction} />
        </p>
      </div>

      {/* Timer (if applicable) */}
      {hasTimer && timer && (
        <div className="mb-8 animate-in fade-in zoom-in-95 duration-500 delay-200">
          <StepTimer
            totalTime={timer.totalTime}
            remainingTime={timer.remainingTime}
            isRunning={timer.isRunning}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {/* Primary Action - Complete on last step, Next otherwise */}
        {step.number === totalSteps ? (
          <Button
            size="xl"
            iconLeading={Check}
            onClick={onComplete}
            className={cx(
              "w-full py-6 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105",
              "bg-utility-success-600 hover:bg-utility-success-700 text-white"
            )}
          >
            Complete
          </Button>
        ) : (
          <Button
            size="xl"
            iconTrailing={ArrowRight}
            onClick={onNext}
            className={cx(
              "w-full py-6 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105",
              "bg-utility-success-600 hover:bg-utility-success-700 text-white"
            )}
          >
            Next
          </Button>
        )}

        {/* Secondary Actions */}
        <div className="flex gap-4">
          {/* Add Time Button (only if timer exists) */}
          {hasTimer && (
            <Button
              size="lg"
              iconLeading={Clock}
              onClick={onAddTime}
              className="flex-1 py-4 bg-utility-warning-600 hover:bg-utility-warning-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              +2 Minutes
            </Button>
          )}

          {/* Skip Step Button */}
          <Button
            size="lg"
            iconTrailing={ChevronRight}
            onClick={onSkip}
            className={cx(
              "py-4 bg-secondary hover:bg-secondary_alt text-primary-foreground font-semibold rounded-xl transition-all duration-200 border border-secondary",
              hasTimer ? "flex-1" : "w-full"
            )}
          >
            Skip Step
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      {hasTimer && timer && timer.remainingTime > 0 && (
        <p className="mt-6 text-sm text-primary-foreground/50 text-center">
          Need more time? Add 2 minutes or complete when ready
        </p>
      )}
    </div>
  );
}

