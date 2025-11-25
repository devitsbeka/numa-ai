"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CookingModePhase, TimerState } from "@/types/cooking-mode";

export interface CookingModeHookState {
  phase: CookingModePhase;
  currentStep: number;
  completedSteps: Set<number>;
  checkedIngredients: Set<string>;
  timer: TimerState | null;
  isWakeLockActive: boolean;
  prepSteps: string[]; // Store AI-generated prep steps
}

const STORAGE_KEY_PREFIX = "cooking-mode-v2-";

export function useCookingMode(recipeId: string, totalSteps: number) {
  const storageKey = `${STORAGE_KEY_PREFIX}${recipeId}`;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  // Use ref to track current totalSteps so callbacks always have latest value
  const totalStepsRef = useRef<number>(totalSteps);

  const [state, setState] = useState<CookingModeHookState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            completedSteps: new Set(parsed.completedSteps || []),
            checkedIngredients: new Set(parsed.checkedIngredients || []),
            timer: parsed.timer,
            prepSteps: parsed.prepSteps || [],
          };
        }
      } catch (error) {
        console.error("Error loading cooking mode state:", error);
      }
    }
    return {
      phase: "ingredients",
      currentStep: 0,
      completedSteps: new Set<number>(),
      checkedIngredients: new Set<string>(),
      timer: null,
      isWakeLockActive: false,
      prepSteps: [],
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const toSave = {
          ...state,
          completedSteps: Array.from(state.completedSteps),
          checkedIngredients: Array.from(state.checkedIngredients),
        };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch (error) {
        console.error("Error saving cooking mode state:", error);
      }
    }
  }, [state, storageKey]);

  const setPrepSteps = useCallback((steps: string[]) => {
    setState(prev => ({ ...prev, prepSteps: steps }));
  }, []);

  // Update totalSteps ref when it changes
  useEffect(() => {
    totalStepsRef.current = totalSteps;
  }, [totalSteps]);

  // Function to update totalSteps from outside
  const setTotalSteps = useCallback((newTotalSteps: number) => {
    totalStepsRef.current = newTotalSteps;
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (state.timer && state.timer.isRunning && state.timer.remainingTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev.timer || prev.timer.remainingTime <= 0) {
            return prev;
          }
          return {
            ...prev,
            timer: {
              ...prev.timer,
              remainingTime: Math.max(0, prev.timer.remainingTime - 1),
            },
          };
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [state.timer?.isRunning, state.timer?.remainingTime]);

  // Wake Lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator && state.isWakeLockActive) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          wakeLockRef.current.addEventListener("release", () => {
            setState((prev) => ({ ...prev, isWakeLockActive: false }));
          });
        } catch (err) {
          console.error("Wake Lock error:", err);
          setState((prev) => ({ ...prev, isWakeLockActive: false }));
        }
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    if (state.isWakeLockActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => releaseWakeLock();
  }, [state.isWakeLockActive]);

  const startCooking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "cooking",
      isWakeLockActive: true,
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number, maxSteps?: number) => {
    setState((prev) => {
      // Use provided maxSteps or current totalSteps from ref
      const currentTotalSteps = totalStepsRef.current;
      const effectiveMax = maxSteps !== undefined ? maxSteps : (currentTotalSteps > 0 ? currentTotalSteps - 1 : 9999);
      const newStep = Math.max(0, Math.min(stepIndex, effectiveMax));
      
      // Only update if step actually changes
      if (prev.currentStep === newStep) {
        return prev;
      }
      return {
        ...prev,
        currentStep: newStep,
        timer: null, // Reset timer when jumping to a step
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentTotalSteps = totalStepsRef.current;
      const newStep = Math.min(currentTotalSteps - 1, prev.currentStep + 1);
      
      // Mark current step as completed
      const newCompletedSteps = new Set(prev.completedSteps);
      newCompletedSteps.add(prev.currentStep);

      // Check if we've completed all steps
      if (newStep >= currentTotalSteps - 1 && newCompletedSteps.size >= currentTotalSteps) {
        return {
          ...prev,
          phase: "completed",
          currentStep: newStep,
          completedSteps: newCompletedSteps,
          timer: null,
        };
      }

      return {
        ...prev,
        currentStep: newStep,
        completedSteps: newCompletedSteps,
        timer: null, // Reset timer for next step
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      timer: null, // Reset timer when going back
    }));
  }, []);

  const completeStep = useCallback(() => {
    setState((prev) => {
      const currentTotalSteps = totalStepsRef.current;
      const newCompletedSteps = new Set(prev.completedSteps);
      newCompletedSteps.add(prev.currentStep);
      
      const nextStepIndex = prev.currentStep + 1;
      
      // Check if all steps are completed
      if (nextStepIndex >= currentTotalSteps) {
        return {
          ...prev,
          phase: "completed",
          completedSteps: newCompletedSteps,
          timer: null,
        };
      }

      return {
        ...prev,
        currentStep: nextStepIndex,
        completedSteps: newCompletedSteps,
        timer: null, // Reset timer for next step
      };
    });
  }, []);

  const skipStep = useCallback(() => {
    setState((prev) => {
      const currentTotalSteps = totalStepsRef.current;
      const nextStepIndex = prev.currentStep + 1;
      
      if (nextStepIndex >= currentTotalSteps) {
        return {
          ...prev,
          phase: "completed",
          timer: null,
        };
      }

      return {
        ...prev,
        currentStep: nextStepIndex,
        timer: null,
      };
    });
  }, []);

  const startTimer = useCallback((seconds: number) => {
    setState((prev) => ({
      ...prev,
      timer: {
        remainingTime: seconds,
        totalTime: seconds,
        isRunning: true,
        isPaused: false,
      },
    }));
  }, []);

  const addTime = useCallback((seconds: number) => {
    setState((prev) => {
      if (!prev.timer) return prev;
      return {
        ...prev,
        timer: {
          ...prev.timer,
          remainingTime: prev.timer.remainingTime + seconds,
          totalTime: prev.timer.totalTime + seconds,
        },
      };
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setState((prev) => {
      if (!prev.timer) return prev;
      return {
        ...prev,
        timer: {
          ...prev.timer,
          isRunning: false,
          isPaused: true,
        },
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setState((prev) => {
      if (!prev.timer) return prev;
      return {
        ...prev,
        timer: {
          ...prev.timer,
          isRunning: true,
          isPaused: false,
        },
      };
    });
  }, []);

  const toggleIngredient = useCallback((ingredientName: string) => {
    setState((prev) => {
      const newChecked = new Set(prev.checkedIngredients);
      if (newChecked.has(ingredientName)) {
        newChecked.delete(ingredientName);
      } else {
        newChecked.add(ingredientName);
      }
      return { ...prev, checkedIngredients: newChecked };
    });
  }, []);

  const toggleWakeLock = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isWakeLockActive: !prev.isWakeLockActive,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: "ingredients",
      currentStep: 0,
      completedSteps: new Set<number>(),
      checkedIngredients: new Set<string>(),
      timer: null,
      isWakeLockActive: false,
      prepSteps: [],
    });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Error clearing cooking mode state:", error);
      }
    }
  }, [storageKey]);

  return {
    state,
    startCooking,
    goToStep,
    nextStep,
    previousStep,
    completeStep,
    skipStep,
    startTimer,
    addTime,
    pauseTimer,
    resumeTimer,
    toggleIngredient,
    toggleWakeLock,
    reset,
    setPrepSteps,
    setTotalSteps,
  };
}
