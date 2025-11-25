import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext,
}: StepNavigationProps) {
  const progress = (currentStep / totalSteps) * 100;
  const canGoPrevious = currentStep > 1;

  return (
    <div className="w-full bg-secondary backdrop-blur-sm border-t border-secondary p-6">
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        {/* Previous Button */}
        <Button
          size="lg"
          iconLeading={ChevronLeft}
          onClick={onPrevious}
          isDisabled={!canGoPrevious}
          className={cx(
            "shrink-0 bg-secondary_alt hover:bg-secondary text-primary-foreground font-semibold rounded-xl transition-all duration-200 border border-secondary",
            !canGoPrevious && "opacity-30 cursor-not-allowed"
          )}
        >
          Previous
        </Button>

        {/* Progress Section */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Step Counter */}
          <div className="text-center">
            <span className="text-lg font-semibold text-primary-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-secondary_alt rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-utility-success-600 to-utility-success-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Dots (for small step counts) */}
          {totalSteps <= 12 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (stepNum) => (
                  <div
                    key={stepNum}
                    className={cx(
                      "size-2 rounded-full transition-all duration-300",
                      stepNum < currentStep
                        ? "bg-utility-success-500"
                        : stepNum === currentStep
                        ? "bg-primary-foreground scale-150"
                        : "bg-secondary"
                    )}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Next Button */}
        <Button
          size="lg"
          iconTrailing={ChevronRight}
          onClick={onNext}
          isDisabled={!canGoNext}
          className={cx(
            "shrink-0 bg-secondary_alt hover:bg-secondary text-primary-foreground font-semibold rounded-xl transition-all duration-200 border border-secondary",
            !canGoNext && "opacity-30 cursor-not-allowed"
          )}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

