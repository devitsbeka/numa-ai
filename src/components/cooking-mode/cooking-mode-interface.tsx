"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Lightbulb01, CheckCircle } from "@untitledui/icons";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/base/buttons/button";
import { useCookingMode } from "@/hooks/use-cooking-mode";
import { IngredientReviewScreen } from "./ingredient-review-screen";
import { IngredientSidebar } from "./ingredient-sidebar";
import { CookingStepDisplay } from "./cooking-step-display";
import { StepNavigation } from "./step-navigation";
import { VoiceControl } from "./voice-control";
import { useVoiceControl } from "@/hooks/use-voice-control";
import { categorizeIngredient, getCategoryInfo, getCategoryOrder } from "@/utils/ingredient-categorizer";
import { cx } from "@/utils/cx";
import { toTitleCase } from "@/utils/title-case";
import type {
  CategorizedIngredient,
  IngredientCategory,
  CookingStep,
  IngredientImportance,
  Diner,
  NutritionFacts,
  IngredientReplacementDetails,
} from "@/types/cooking-mode";

interface BaseIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  image?: string;
  displayQuantity?: string;
}

interface CookingModeInterfaceProps {
  recipeId: string;
  recipeName: string;
  ingredients: BaseIngredient[];
  instructions: string[];
  kitchenItems?: string[]; // Names of ingredients in user's kitchen
  servings?: number;
  readyInMinutes?: number;
  difficulty?: string;
  onExit?: () => void;
  nutritionFacts?: NutritionFacts;
  recipeImage?: string;
}

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Helper to determine category index for a step
const getStepCategoryIndex = (step: string, ingredients: CategorizedIngredient[], order: string[]) => {
  // Find matching ingredients in the step using strict word boundary matching
  const matches = ingredients.filter(ing => 
    new RegExp(`\\b${escapeRegExp(ing.name)}\\b`, 'i').test(step)
  );
  
  if (matches.length === 0) return 999; // Unknown/General step, put at end
  
  // Find lowest category index among matches (priority order)
  const indices = matches.map(ing => order.indexOf(ing.category));
  return Math.min(...indices);
};

// Helper to sort prep steps by category order
const sortStepsByCategory = (steps: string[], ingredients: CategorizedIngredient[]) => {
  const categoryOrder = getCategoryOrder(); // ['needs-prep', 'needs-cooking', ...]
  
  return [...steps].sort((a, b) => {
    const catIndexA = getStepCategoryIndex(a, ingredients, categoryOrder);
    const catIndexB = getStepCategoryIndex(b, ingredients, categoryOrder);
    return catIndexA - catIndexB;
  });
};

// Helper to classify ingredient importance
const classifyIngredientImportance = (ingredient: BaseIngredient & { category: string }): IngredientImportance => {
  const name = ingredient.name.toLowerCase();
  
  // Protein keywords that are typically crucial
  const proteinKeywords = [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck',
    'fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'crab', 'lobster',
    'egg', 'eggs', 'tofu', 'tempeh', 'seitan'
  ];
  
  // Check if it's a protein
  const isProtein = proteinKeywords.some(keyword => name.includes(keyword));
  
  // Ingredients in "needs-cooking" category are often crucial
  const isCookingCategory = ingredient.category === 'needs-cooking';
  
  // Large quantities might indicate crucial ingredients
  const isLargeQuantity = ingredient.amount > 2;
  
  // Spices, herbs, and condiments are usually replaceable
  const replaceableKeywords = [
    'salt', 'pepper', 'garlic', 'onion', 'herb', 'spice', 'seasoning',
    'oil', 'vinegar', 'sauce', 'butter', 'margarine', 'sugar', 'honey',
    'lemon', 'lime', 'parsley', 'basil', 'oregano', 'thyme', 'rosemary'
  ];
  const isReplaceable = replaceableKeywords.some(keyword => name.includes(keyword));
  
  // Classify as crucial if it's a protein, in cooking category, or large quantity
  // But not if it's clearly a replaceable item
  if (isReplaceable && !isProtein) {
    return 'replaceable';
  }
  
  if (isProtein || isCookingCategory || isLargeQuantity) {
    return 'crucial';
  }
  
  // Default to replaceable for spices, small amounts, etc.
  return 'replaceable';
};

export function CookingModeInterface({
  recipeId,
  recipeName,
  ingredients,
  instructions,
  kitchenItems = [],
  servings,
  readyInMinutes,
  difficulty,
  onExit,
  nutritionFacts,
  recipeImage,
}: CookingModeInterfaceProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [localPrepSteps, setLocalPrepSteps] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ingredientReplacements, setIngredientReplacements] = useState<Record<string, IngredientReplacementDetails>>({});
  // Always default to 1 person on dining table
  const [diners, setDiners] = useState<Diner[]>(() => {
    return Array.from({ length: 1 }, (_, i) => ({
      id: `diner-${i + 1}`,
      name: `Person ${i + 1}`,
      dietaryPreferences: [],
      allergies: [],
      customSubstitutions: {},
    }));
  });
  const [localKitchenItems, setLocalKitchenItems] = useState<string[]>(kitchenItems);

  const {
    state,
    startCooking,
    completeStep,
    skipStep,
    addTime,
    startTimer,
    toggleIngredient,
    toggleWakeLock,
    nextStep: hookNextStep,
    previousStep: hookPreviousStep,
    goToStep: hookGoToStep,
    reset,
    setPrepSteps,
    setTotalSteps,
  } = useCookingMode(recipeId, 0); // Initial totalSteps, updated later

  // Combine prep steps and instructions
  const allSteps = useMemo(() => {
    return [...localPrepSteps, ...instructions];
  }, [localPrepSteps, instructions]);

  const totalSteps = allSteps.length;

  // Update totalSteps in hook when it changes - this ensures goToStep has correct bounds
  useEffect(() => {
    if (totalSteps > 0) {
      setTotalSteps(totalSteps);
    }
  }, [totalSteps, setTotalSteps]);

  // Handle ingredient replacement
  const handleIngredientReplace = (originalId: string, replacement: IngredientReplacementDetails) => {
    setIngredientReplacements((prev) => ({
      ...prev,
      [originalId]: replacement,
    }));
  };

  // Handle toggle in kitchen status
  const handleToggleInKitchen = (ingredientName: string) => {
    setLocalKitchenItems((prev) => {
      const lowerName = ingredientName.toLowerCase();
      const isInKitchen = prev.some(
        (item) => item.toLowerCase().includes(lowerName) || lowerName.includes(item.toLowerCase())
      );
      
      if (isInKitchen) {
        // Remove from kitchen
        return prev.filter(
          (item) => !item.toLowerCase().includes(lowerName) && !lowerName.includes(item.toLowerCase())
        );
      } else {
        // Add to kitchen
        return [...prev, ingredientName];
      }
    });
  };

  // Calculate total servings from diners
  const totalServings = useMemo(() => {
    return diners.length || 1;
  }, [diners.length]);

  // Calculate scaling factor based on diners vs original servings
  const scalingFactor = useMemo(() => {
    if (!servings || servings === 0) return 1;
    return totalServings / servings;
  }, [totalServings, servings]);

  // Categorize ingredients with kitchen status and importance
  // MOVED UP so it can be used in useEffect for sorting
  const categorizedIngredients: CategorizedIngredient[] = useMemo(() => {
    return ingredients.map((ing) => {
      const replacement = ingredientReplacements[ing.id];
      const displayName = replacement?.name || ing.name;
      const baseAmount =
        typeof replacement?.amount === "number" && !Number.isNaN(replacement.amount)
          ? replacement.amount
          : ing.amount;
      const baseUnit = replacement?.unit || ing.unit;
      const category = categorizeIngredient(displayName);
      const ingredientWithCategory = {
        ...ing,
        name: displayName,
        category,
        amount: baseAmount,
        unit: baseUnit,
        image: replacement?.image || ing.image,
        displayQuantity: replacement?.displayQuantity || ing.displayQuantity,
      };

      const scaledAmount = baseAmount * scalingFactor;
      
      // Clear displayQuantity when scaling changes so it gets recalculated from scaled amount
      // Only preserve displayQuantity if scaling factor is 1 (no scaling)
      const shouldPreserveDisplayQuantity = scalingFactor === 1 && ingredientWithCategory.displayQuantity;
      
      return {
        ...ingredientWithCategory,
        name: displayName, // Use replaced name if available
        amount: scaledAmount, // Apply scaling
        category,
        displayQuantity: shouldPreserveDisplayQuantity ? ingredientWithCategory.displayQuantity : undefined,
        inKitchen: localKitchenItems.some((kitchenItem) =>
          kitchenItem.toLowerCase().includes(displayName.toLowerCase()) ||
          displayName.toLowerCase().includes(kitchenItem.toLowerCase())
        ),
        checked: state.checkedIngredients.has(displayName),
        importance: classifyIngredientImportance(ingredientWithCategory),
      };
    });
  }, [ingredients, localKitchenItems, state.checkedIngredients, ingredientReplacements, scalingFactor]);

  // Fetch and Sort prep steps on mount
  useEffect(() => {
    // Skip if we already have prep steps in state (from localStorage)
    if (state.prepSteps.length > 0) {
      setLocalPrepSteps(state.prepSteps);
      return;
    }
    
    if (isAnalyzing || localPrepSteps.length > 0) return;

    const fetchPrepSteps = async () => {
      try {
        setIsAnalyzing(true);
        const response = await fetch("/api/recipes/analyze-prep-steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredients: ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`),
            instructions
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.prepSteps && Array.isArray(data.prepSteps) && data.prepSteps.length > 0) {
            // Sort prep steps to match sidebar category order
            const sortedSteps = sortStepsByCategory(data.prepSteps, categorizedIngredients);
            setLocalPrepSteps(sortedSteps);
            setPrepSteps(sortedSteps);
          }
        }
      } catch (error) {
        console.error("Failed to fetch prep steps:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchPrepSteps();
  }, [ingredients, instructions, isAnalyzing, localPrepSteps.length, state.prepSteps, setPrepSteps, categorizedIngredients]);

  // Update totalSteps in hook when it changes - this ensures goToStep has correct bounds
  // Note: The hook's goToStep callback will be recreated when totalSteps changes

  // Group ingredients by category
  const ingredientCategories: IngredientCategory[] = useMemo(() => {
    const categoryMap = new Map<string, CategorizedIngredient[]>();

    // Initialize all categories
    getCategoryOrder().forEach((catType) => {
      categoryMap.set(catType, []);
    });

    // Group ingredients
    categorizedIngredients.forEach((ing) => {
      const catIngredients = categoryMap.get(ing.category) || [];
      catIngredients.push(ing);
      categoryMap.set(ing.category, catIngredients);
    });

    // Convert to array
    return getCategoryOrder().map((catType) => {
      const info = getCategoryInfo(catType);
      return {
        type: catType,
        name: info.name,
        icon: info.icon,
        ingredients: categoryMap.get(catType) || [],
      };
    });
  }, [categorizedIngredients]);

  // Parse cooking steps with estimated times
  const cookingSteps: CookingStep[] = useMemo(() => {
    return allSteps.map((instruction, index) => {
      // Check if it's a prep step
      const isPrepStep = index < localPrepSteps.length;

      // Extract time from instruction
      const timeMatch = instruction.match(/(\d+)\s*(minute|min|second|sec|hour|hr)/i);
      let estimatedTime = 0;

      if (timeMatch) {
        const value = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        if (unit.startsWith("hour") || unit === "hr") {
          estimatedTime = value * 60 * 60;
        } else if (unit.startsWith("minute") || unit === "min") {
          estimatedTime = value * 60;
        } else if (unit.startsWith("second") || unit === "sec") {
          estimatedTime = value;
        }
      }

      // Identify ingredients using STRICT matching to prevent jumping
      const ingredientsNeeded = categorizedIngredients
        .filter((ing) =>
          new RegExp(`\\b${escapeRegExp(ing.name)}\\b`, 'i').test(instruction)
        )
        .map((ing) => ing.name);

      return {
        number: index + 1,
        instruction,
        estimatedTime: estimatedTime > 0 ? estimatedTime : undefined,
        ingredientsNeeded,
        completed: state.completedSteps.has(index),
        isPrepStep,
      };
    });
  }, [allSteps, localPrepSteps.length, categorizedIngredients, state.completedSteps]);

  const currentStep = cookingSteps[state.currentStep];

  // Start timer when moving to a new step with estimated time
  useEffect(() => {
    if (
      state.phase === "cooking" &&
      currentStep &&
      currentStep.estimatedTime &&
      !state.timer
    ) {
      startTimer(currentStep.estimatedTime);
    }
  }, [state.currentStep, state.phase, currentStep?.estimatedTime, startTimer, state.timer]);

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      router.back();
    }
  };

  const handleComplete = () => {
    completeStep();
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (state.phase !== "cooking") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        hookNextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        hookPreviousStep();
      } else if (e.key === " ") {
        e.preventDefault();
        handleComplete();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state.phase, hookNextStep, hookPreviousStep, handleExit, handleComplete]);

  const handleAddTime = () => {
    addTime(120); // Add 2 minutes
  };

  const handleSkip = () => {
    skipStep();
  };

  // Voice commands - theme commands work in all phases, others only in cooking
  const voiceCommands = useMemo(() => {
    const commands: Array<{ command: string; action: () => void }> = [];
    
    // Theme commands work in all phases - simple single words
    commands.push(
      {
        command: 'light',
        action: () => {
          console.log('🎨 Changing theme to light');
          setTheme('light');
        },
      },
      {
        command: 'dark',
        action: () => {
          console.log('🎨 Changing theme to dark');
          setTheme('dark');
        },
      }
    );
    
    // Cooking commands only work in cooking phase
    if (state.phase === 'cooking') {
      commands.push(
      {
        command: 'next',
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: 'go forward',
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: 'proceed',
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: 'alright',
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: 'got it',
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: "what's next",
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: 'continue',
        action: () => {
          const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
          hookGoToStep(nextStepIndex);
        },
      },
      {
        command: 'previous',
        action: () => {
          const prevStepIndex = Math.max(0, state.currentStep - 1);
          hookGoToStep(prevStepIndex);
        },
      },
      {
        command: 'back',
        action: () => {
          const prevStepIndex = Math.max(0, state.currentStep - 1);
          hookGoToStep(prevStepIndex);
        },
      },
      {
        command: 'complete',
        action: () => {
          // Mark all steps as completed and finish the recipe immediately
          if (state.currentStep < totalSteps - 1) {
            // Jump to last step and complete it
            hookGoToStep(totalSteps - 1);
            setTimeout(() => {
              completeStep();
            }, 50);
          } else {
            // Already at last step, just complete it
            completeStep();
          }
        },
      },
      {
        command: 'done',
        action: () => {
          // Same as complete - finish the recipe
          if (state.currentStep < totalSteps - 1) {
            hookGoToStep(totalSteps - 1);
            setTimeout(() => {
              completeStep();
            }, 50);
          } else {
            completeStep();
          }
        },
      },
      {
        command: 'finished',
        action: () => {
          // Same as complete - finish the recipe
          if (state.currentStep < totalSteps - 1) {
            hookGoToStep(totalSteps - 1);
            setTimeout(() => {
              completeStep();
            }, 50);
          } else {
            completeStep();
          }
        },
      },
      {
        command: 'start over',
        action: () => {
          // Reset to beginning of cooking phase (step 0, clear completed steps)
          // But stay in cooking phase, don't go back to ingredients
          hookGoToStep(0);
          // Clear completed steps by resetting and then starting cooking again
          reset();
          // Small delay to ensure reset completes, then start cooking
          setTimeout(() => {
            startCooking();
          }, 100);
        },
      },
      {
        command: 'restart',
        action: () => {
          // Same as start over
          hookGoToStep(0);
          reset();
          setTimeout(() => {
            startCooking();
          }, 100);
        },
      },
      {
        command: 'skip',
        action: () => {
          handleSkip();
        },
      }
      );
    }
    
    return commands;
  }, [state.phase, state.currentStep, totalSteps, hookGoToStep, completeStep, reset, startCooking, handleSkip, setTheme]);

  // Voice control enabled in cooking phase OR when we have theme commands
  const voiceEnabled = state.phase === 'cooking' || voiceCommands.length > 0;
  const voice = useVoiceControl(voiceCommands, voiceEnabled);


  // Handle no instructions
  if (instructions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-8 overflow-hidden">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {toTitleCase(recipeName)}
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/70 mb-8">
            No cooking instructions available for this recipe.
          </p>
          <Button
            size="xl"
            onClick={handleExit}
            className="px-8 py-4 bg-utility-success-600 hover:bg-utility-success-700 text-white text-xl font-semibold rounded-lg"
          >
            Exit Cooking Mode
          </Button>
        </div>
      </div>
    );
  }

  // Phase 1: Ingredient Review
  if (state.phase === "ingredients") {
    return (
      <div className="animate-in fade-in duration-500">
        <IngredientReviewScreen
          ingredients={categorizedIngredients}
          recipeName={recipeName}
          servings={servings}
          readyInMinutes={readyInMinutes}
          difficulty={difficulty}
          kitchenItems={kitchenItems}
          instructions={instructions}
          onStartCooking={startCooking}
          onIngredientReplace={handleIngredientReplace}
          onToggleInKitchen={handleToggleInKitchen}
          onExit={handleExit}
          diners={diners}
          onDinersChange={setDiners}
          originalServings={servings}
          nutritionFacts={nutritionFacts}
          recipeImage={recipeImage}
        />
      </div>
    );
  }

  // Phase 3: Completed
  if (state.phase === "completed") {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-8 overflow-hidden">
        <div className="text-center max-w-2xl animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle className="size-32 text-utility-success-500 mx-auto mb-8" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
            Meal Complete!
          </h1>
          <p className="text-2xl text-primary-foreground/70 mb-12">
            Enjoy your delicious {recipeName}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              onClick={handleExit}
              className="px-8 py-4 bg-utility-success-600 hover:bg-utility-success-700 text-white text-xl font-semibold rounded-lg"
            >
              Finish & Exit
            </Button>
            <Button
              size="xl"
              onClick={reset}
              className="px-8 py-4 bg-secondary hover:bg-secondary_alt text-primary-foreground text-xl font-semibold rounded-lg border border-secondary"
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Active Cooking
  return (
    <div className="fixed inset-0 z-50 bg-primary flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-secondary bg-primary/80 backdrop-blur-sm">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground truncate">
            {toTitleCase(recipeName)}
          </h1>
          {servings && (
            <p className="text-sm text-primary-foreground/60">
              Cooking for {servings} servings
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <VoiceControl
            isSupported={voice.isSupported}
            isListening={voice.isListening}
            transcript={voice.transcript}
            lastCommand={voice.lastCommand}
            onToggle={voice.toggleListening}
          />
          <Button
            size="md"
            iconLeading={Lightbulb01}
            onClick={toggleWakeLock}
            className={cx(
              "text-primary-foreground shrink-0",
              state.isWakeLockActive
                ? "bg-utility-warning-600 hover:bg-utility-warning-700"
                : "bg-secondary hover:bg-secondary_alt"
            )}
          >
            {state.isWakeLockActive ? "Screen On" : "Keep Awake"}
          </Button>
          <Button
            size="md"
            iconLeading={X}
            onClick={handleExit}
            className="bg-secondary hover:bg-secondary_alt text-primary-foreground shrink-0"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Ingredients */}
        <div className="w-[30%] min-w-[320px] max-w-[400px] shrink-0 animate-in slide-in-from-left duration-600 delay-100">
          <IngredientSidebar
            categories={ingredientCategories}
            currentStepIngredients={currentStep?.ingredientsNeeded || []}
            checkedIngredients={state.checkedIngredients}
            onToggleIngredient={toggleIngredient}
          />
        </div>

        {/* Main Work Area - Current Step */}
        <div className="flex-1 overflow-hidden animate-in fade-in duration-500 delay-200">
          {currentStep && (
            <CookingStepDisplay
              step={currentStep}
              totalSteps={totalSteps}
              timer={state.timer}
              onComplete={handleComplete}
              onNext={() => {
                const nextStepIndex = Math.min(totalSteps - 1, state.currentStep + 1);
                hookGoToStep(nextStepIndex);
              }}
              onAddTime={handleAddTime}
              onSkip={handleSkip}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 animate-in slide-in-from-bottom duration-500 delay-300">
        <StepNavigation
          currentStep={state.currentStep + 1}
          totalSteps={totalSteps}
          onPrevious={hookPreviousStep}
          onNext={hookNextStep}
          canGoNext={state.currentStep < totalSteps - 1}
        />
      </div>
    </div>
  );
}
