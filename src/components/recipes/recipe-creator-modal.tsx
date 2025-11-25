"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Link01, Image01, VideoRecorder, Edit01, CheckCircle } from "@untitledui/icons";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import { useCustomRecipes } from "@/hooks/use-custom-recipes";
import { calculateNutrition } from "@/utils/nutrition-calculator";
import type { CustomRecipe, CustomRecipeIngredient } from "@/types/custom-recipe";
import { cx } from "@/utils/cx";

interface RecipeCreatorModalProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const CUISINES = [
  { id: "italian", label: "Italian" },
  { id: "mexican", label: "Mexican" },
  { id: "spanish", label: "Spanish" },
  { id: "asian", label: "Asian" },
  { id: "american", label: "American" },
  { id: "french", label: "French" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "indian", label: "Indian" },
];

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
  { id: "dessert", label: "Dessert" },
];

const UNITS = [
  { id: "g", label: "g (grams)" },
  { id: "kg", label: "kg" },
  { id: "oz", label: "oz (ounces)" },
  { id: "lb", label: "lb (pounds)" },
  { id: "cup", label: "cup" },
  { id: "tbsp", label: "tbsp" },
  { id: "tsp", label: "tsp" },
  { id: "ml", label: "ml" },
  { id: "l", label: "l (liters)" },
  { id: "floz", label: "fl oz" },
];

type ImportMethod = "url" | "image" | "video" | "manual" | null;

export function RecipeCreatorModal({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: RecipeCreatorModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [importMethod, setImportMethod] = useState<ImportMethod>(null);
  const { addCustomRecipe } = useCustomRecipes();
  const [isSaving, setIsSaving] = useState(false);
  const [reviewTab, setReviewTab] = useState<"overview" | "ingredients" | "instructions" | "nutrition">("overview");
  const [kitchenItems, setKitchenItems] = useState<Array<{ id: string; name: string; icon?: string; image?: string }>>([]);
  
  // Import states
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<Partial<CustomRecipe> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen;

  // Load kitchen items from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedKitchen = localStorage.getItem('kitchenItems');
      if (savedKitchen) {
        const parsed = JSON.parse(savedKitchen);
        setKitchenItems(parsed);
      }
    } catch (error) {
      console.error('Error loading kitchen items:', error);
    }
  }, []);

  // Helper function to check if ingredient is in stock
  const isIngredientInStock = (ingredientName: string): boolean => {
    const nameLower = ingredientName.toLowerCase().trim();
    return kitchenItems.some(item => 
      item.name.toLowerCase().trim() === nameLower ||
      nameLower.includes(item.name.toLowerCase().trim()) ||
      item.name.toLowerCase().trim().includes(nameLower)
    );
  };

  // Helper to get enriched ingredient data (with image/icon)
  const getEnrichedIngredient = (ingredient: CustomRecipeIngredient) => {
    return ingredient;
  };

  // Step 1: Basic Information
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string>("dinner");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("4");
  const [image, setImage] = useState("");
  
  // Populate form from imported data
  useEffect(() => {
    if (importedData) {
      if (importedData.name) setName(importedData.name);
      if (importedData.description) setDescription(importedData.description);
      if (importedData.cuisine) setCuisine(importedData.cuisine);
      if (importedData.mealType) setMealType(importedData.mealType);
      if (importedData.prepTime !== undefined) setPrepTime(importedData.prepTime.toString());
      if (importedData.cookTime !== undefined) setCookTime(importedData.cookTime.toString());
      if (importedData.servings !== undefined) setServings(importedData.servings.toString());
      if (importedData.image) setImage(importedData.image);
      if (importedData.ingredients) setIngredients(importedData.ingredients);
      if (importedData.instructions) setInstructions(importedData.instructions);
      if (importedData.nutrition) setNutrition(importedData.nutrition);
      // Jump to review step after import
      setCurrentStep(4);
      setImportedData(null);
    }
  }, [importedData]);

  // Step 2: Ingredients
  const [ingredients, setIngredients] = useState<CustomRecipeIngredient[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientAmount, setNewIngredientAmount] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("g");

  // Step 3: Instructions
  const [instructions, setInstructions] = useState<string[]>([""]);

  // Step 4: Nutrition (calculated)
  const [nutrition, setNutrition] = useState<CustomRecipe["nutrition"] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate nutrition when ingredients change
  useEffect(() => {
    if (ingredients.length > 0 && currentStep >= 2) {
      setIsCalculating(true);
      calculateNutrition(ingredients)
        .then((calculated) => {
          setNutrition(calculated);
          setIsCalculating(false);
        })
        .catch((error) => {
          console.error("Error calculating nutrition:", error);
          setIsCalculating(false);
        });
    }
  }, [ingredients, currentStep]);

  const handleAddIngredient = () => {
    if (!newIngredientName || !newIngredientAmount) return;

    setIngredients([
      ...ingredients,
      {
        name: newIngredientName,
        amount: parseFloat(newIngredientAmount),
        unit: newIngredientUnit,
      },
    ]);

    setNewIngredientName("");
    setNewIngredientAmount("");
    setNewIngredientUnit("g");
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleMethodSelect = (method: ImportMethod) => {
    setImportMethod(method);
    if (method === "manual") {
      setCurrentStep(1);
    } else {
      setCurrentStep(0.1); // Sub-step for import input
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      setImportError("Please enter a recipe URL");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const response = await fetch("/api/recipes/import-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to import recipe from URL");
      }

      setImportedData(result.data);
      setImportUrl("");
    } catch (error) {
      console.error("Error importing from URL:", error);
      setImportError(error instanceof Error ? error.message : "Failed to import recipe");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImageImport = async () => {
    if (!selectedImage) {
      setImportError("Please select an image file");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/recipes/import-from-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to import recipe from image");
      }

      setImportedData(result.data);
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error importing from image:", error);
      setImportError(error instanceof Error ? error.message : "Failed to import recipe");
    } finally {
      setIsImporting(false);
    }
  };

  const handleVideoImport = async () => {
    if (!selectedVideo && !videoUrl.trim()) {
      setImportError("Please select a video file or enter a video URL");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const formData = new FormData();
      if (selectedVideo) {
        formData.append("video", selectedVideo);
      } else {
        formData.append("videoUrl", videoUrl);
      }

      const response = await fetch("/api/recipes/import-from-video", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to import recipe from video");
      }

      setImportedData(result.data);
      setSelectedVideo(null);
      setVideoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error importing from video:", error);
      setImportError(error instanceof Error ? error.message : "Failed to import recipe");
    } finally {
      setIsImporting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!name || !mealType) {
        alert("Please fill in required fields (Name and Meal Type)");
        return;
      }
    }
    if (currentStep === 2) {
      if (ingredients.length === 0) {
        alert("Please add at least one ingredient");
        return;
      }
    }
    if (currentStep === 3) {
      const validInstructions = instructions.filter((i) => i.trim().length > 0);
      if (validInstructions.length === 0) {
        alert("Please add at least one instruction");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 0.1) {
      // Go back to method selection
      setCurrentStep(0);
      setImportMethod(null);
      setImportError(null);
    } else if (currentStep === 1 && importMethod) {
      // If came from import, go back to import step
      setCurrentStep(0.1);
    } else {
    setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!nutrition) {
      alert("Nutrition calculation failed. Please check your ingredients.");
      return;
    }

    setIsSaving(true);
    try {
      const validInstructions = instructions.filter((i) => i.trim().length > 0);

      addCustomRecipe({
        name,
        description: description || undefined,
        cuisine: cuisine || undefined,
        mealType: mealType as CustomRecipe["mealType"],
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 4,
        image: image || undefined,
        ingredients,
        instructions: validInstructions,
        nutrition,
      });

      // Reset form
      setName("");
      setDescription("");
      setCuisine(null);
      setMealType("dinner");
      setPrepTime("");
      setCookTime("");
      setServings("4");
      setImage("");
      setIngredients([]);
      setInstructions([""]);
      setNutrition(null);
      setCurrentStep(0);
      setImportMethod(null);
      setReviewTab("overview");

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after a delay to allow modal close animation
    setTimeout(() => {
      setCurrentStep(0);
      setImportMethod(null);
      setImportUrl("");
      setSelectedImage(null);
      setSelectedVideo(null);
      setVideoUrl("");
      setImportError(null);
      setImportedData(null);
      setReviewTab("overview");
      setName("");
      setDescription("");
      setCuisine(null);
      setMealType("dinner");
      setPrepTime("");
      setCookTime("");
      setServings("4");
      setImage("");
      setIngredients([]);
      setInstructions([""]);
      setNutrition(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 300);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <ModalOverlay isDismissable>
        <Modal className="max-w-2xl max-h-[90vh]">
          <Dialog className="flex flex-col rounded-lg border border-secondary bg-primary shadow-lg">
            {/* Close Button - Top Right */}
              <button
                type="button"
                onClick={handleClose}
              className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary_hover transition-colors"
                aria-label="Close"
              >
                <X className="size-5 text-tertiary" />
              </button>

            {/* Progress Indicator */}
            {currentStep > 0 && (
            <div className="px-6 pt-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={cx(
                      "h-1 flex-1 rounded-full transition-colors",
                        step <= Math.ceil(currentStep)
                        ? "bg-utility-brand-600"
                        : "bg-utility-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-12">
              {/* Step 0: Method Selection */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-primary mb-2">
                      How would you like to add your recipe?
                    </h3>
                    <p className="text-sm text-tertiary">
                      Choose the method that works best for you
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* From URL */}
                    <button
                      type="button"
                      onClick={() => handleMethodSelect("url")}
                      className={cx(
                        "flex flex-col items-center justify-center gap-3",
                        "p-6 rounded-lg border-2 border-dashed",
                        "border-utility-gray-300 hover:border-utility-brand-600",
                        "bg-transparent hover:bg-utility-gray-50/30",
                        "transition-all cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-center size-12 rounded-full bg-utility-brand-50">
                        <Link01 className="size-6 text-utility-brand-600" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-semibold text-primary">From URL</h4>
                        <p className="text-xs text-tertiary mt-1">
                          Import from recipe website
                        </p>
                      </div>
                    </button>

                    {/* From Image */}
                    <button
                      type="button"
                      onClick={() => handleMethodSelect("image")}
                      className={cx(
                        "flex flex-col items-center justify-center gap-3",
                        "p-6 rounded-lg border-2 border-dashed",
                        "border-utility-gray-300 hover:border-utility-brand-600",
                        "bg-transparent hover:bg-utility-gray-50/30",
                        "transition-all cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-center size-12 rounded-full bg-utility-brand-50">
                        <Image01 className="size-6 text-utility-brand-600" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-semibold text-primary">From Image</h4>
                        <p className="text-xs text-tertiary mt-1">
                          Upload photo of recipe
                        </p>
                      </div>
                    </button>

                    {/* From Video */}
                    <button
                      type="button"
                      onClick={() => handleMethodSelect("video")}
                      className={cx(
                        "flex flex-col items-center justify-center gap-3",
                        "p-6 rounded-lg border-2 border-dashed",
                        "border-utility-gray-300 hover:border-utility-brand-600",
                        "bg-transparent hover:bg-utility-gray-50/30",
                        "transition-all cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-center size-12 rounded-full bg-utility-brand-50">
                        <VideoRecorder className="size-6 text-utility-brand-600" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-semibold text-primary">From Video</h4>
                        <p className="text-xs text-tertiary mt-1">
                          Upload cooking video
                        </p>
                      </div>
                    </button>

                    {/* Manual Entry */}
                    <button
                      type="button"
                      onClick={() => handleMethodSelect("manual")}
                      className={cx(
                        "flex flex-col items-center justify-center gap-3",
                        "p-6 rounded-lg border-2 border-dashed",
                        "border-utility-gray-300 hover:border-utility-brand-600",
                        "bg-transparent hover:bg-utility-gray-50/30",
                        "transition-all cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-center size-12 rounded-full bg-utility-brand-50">
                        <Edit01 className="size-6 text-utility-brand-600" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-semibold text-primary">Manual Entry</h4>
                        <p className="text-xs text-tertiary mt-1">
                          Enter details yourself
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 0.1: Import Input */}
              {currentStep === 0.1 && (
                <div className="space-y-4">
                  {importMethod === "url" && (
                    <>
                      <div>
                        <h3 className="text-base font-semibold text-primary mb-2">
                          Import from URL
                        </h3>
                        <p className="text-sm text-tertiary mb-4">
                          Enter the URL of a recipe website to automatically import the recipe
                        </p>
                      </div>
                      <Input
                        label="Recipe URL"
                        placeholder="https://example.com/recipe"
                        value={importUrl}
                        onChange={setImportUrl}
                      />
                      {importError && (
                        <div className="p-3 rounded-lg bg-utility-error-50 border border-utility-error-200">
                          <p className="text-sm text-utility-error-600">{importError}</p>
                        </div>
                      )}
                      <Button
                        color="primary"
                        size="md"
                        onClick={handleUrlImport}
                        disabled={isImporting || !importUrl.trim()}
                        className="w-full"
                      >
                        {isImporting ? "Importing..." : "Import Recipe"}
                      </Button>
                    </>
                  )}

                  {importMethod === "image" && (
                    <>
                      <div>
                        <h3 className="text-base font-semibold text-primary mb-2">
                          Import from Image
                        </h3>
                        <p className="text-sm text-tertiary mb-4">
                          Upload a photo of a recipe to extract the details
                        </p>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedImage(file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={cx(
                            "w-full p-8 rounded-lg border-2 border-dashed",
                            "border-utility-gray-300 hover:border-utility-brand-600",
                            "bg-transparent hover:bg-utility-gray-50/30",
                            "transition-all cursor-pointer flex flex-col items-center gap-2"
                          )}
                        >
                          <Image01 className="size-8 text-tertiary" />
                          <span className="text-sm text-primary">
                            {selectedImage ? selectedImage.name : "Click to select image"}
                          </span>
                        </button>
                      </div>
                      {importError && (
                        <div className="p-3 rounded-lg bg-utility-error-50 border border-utility-error-200">
                          <p className="text-sm text-utility-error-600">{importError}</p>
                        </div>
                      )}
                      <Button
                        color="primary"
                        size="md"
                        onClick={handleImageImport}
                        disabled={isImporting || !selectedImage}
                        className="w-full"
                      >
                        {isImporting ? "Processing..." : "Import Recipe"}
                      </Button>
                    </>
                  )}

                  {importMethod === "video" && (
                    <>
                      <div>
                        <h3 className="text-base font-semibold text-primary mb-2">
                          Import from Video
                        </h3>
                        <p className="text-sm text-tertiary mb-4">
                          Upload a video file or enter a video URL to extract recipe details
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedVideo(file);
                                setVideoUrl("");
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cx(
                              "w-full p-8 rounded-lg border-2 border-dashed",
                              "border-utility-gray-300 hover:border-utility-brand-600",
                              "bg-transparent hover:bg-utility-gray-50/30",
                              "transition-all cursor-pointer flex flex-col items-center gap-2"
                            )}
                          >
                            <VideoRecorder className="size-8 text-tertiary" />
                            <span className="text-sm text-primary">
                              {selectedVideo ? selectedVideo.name : "Click to select video file"}
                            </span>
                          </button>
                        </div>
                        <div className="text-center text-sm text-tertiary">or</div>
                        <Input
                          label="Video URL (YouTube, etc.)"
                          placeholder="https://youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(value) => {
                            setVideoUrl(value);
                            setSelectedVideo(null);
                          }}
                        />
                      </div>
                      {importError && (
                        <div className="p-3 rounded-lg bg-utility-error-50 border border-utility-error-200">
                          <p className="text-sm text-utility-error-600">{importError}</p>
                        </div>
                      )}
                      <Button
                        color="primary"
                        size="md"
                        onClick={handleVideoImport}
                        disabled={isImporting || (!selectedVideo && !videoUrl.trim())}
                        className="w-full"
                      >
                        {isImporting ? "Processing..." : "Import Recipe"}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Recipe Name *"
                    placeholder="e.g., My Special Pasta"
                    value={name}
                    onChange={setName}
                    isRequired
                  />

                  <TextArea
                    label="Description"
                    placeholder="A brief description of your recipe"
                    value={description}
                    onChange={setDescription}
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      placeholder="Select cuisine"
                      label="Cuisine"
                      size="sm"
                      selectedKey={cuisine}
                      onSelectionChange={(key) => setCuisine(key as string)}
                      items={CUISINES}
                    >
                      {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>

                    <Select
                      placeholder="Select meal type"
                      label="Meal Type *"
                      size="sm"
                      selectedKey={mealType}
                      onSelectionChange={(key) => setMealType(key as string)}
                      items={MEAL_TYPES}
                    >
                      {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Prep Time (min)"
                      type="number"
                      placeholder="15"
                      value={prepTime}
                      onChange={setPrepTime}
                    />
                    <Input
                      label="Cook Time (min)"
                      type="number"
                      placeholder="30"
                      value={cookTime}
                      onChange={setCookTime}
                    />
                    <Input
                      label="Servings"
                      type="number"
                      placeholder="4"
                      value={servings}
                      onChange={setServings}
                    />
                  </div>

                  <Input
                    label="Image URL (optional)"
                    placeholder="https://example.com/image.jpg"
                    value={image}
                    onChange={setImage}
                  />
                </div>
              )}

              {/* Step 2: Ingredients */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-3">Ingredients</h3>
                    <div className="space-y-2 mb-4">
                      {ingredients.map((ingredient, index) => {
                        const enriched = getEnrichedIngredient(ingredient);
                        const inStock = isIngredientInStock(ingredient.name);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border border-secondary bg-secondary"
                          >
                            {/* Ingredient Image/Icon */}
                            {enriched.image ? (
                              <img 
                                src={enriched.image} 
                                alt={ingredient.name}
                                className="size-10 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : enriched.icon ? (
                              <div className="size-10 rounded-lg bg-quaternary flex items-center justify-center flex-shrink-0 text-xl">
                                {enriched.icon}
                              </div>
                            ) : (
                              <div className="size-10 rounded-lg bg-quaternary flex items-center justify-center flex-shrink-0 text-xl">
                                🥘
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-primary">
                                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                                </span>
                                {inStock && (
                                  <Badge color="success" size="sm" className="flex items-center gap-1">
                                    <CheckCircle className="size-3" />
                                    In Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(index)}
                              className="text-tertiary hover:text-primary transition-colors flex-shrink-0"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Ingredient name"
                        value={newIngredientName}
                        onChange={setNewIngredientName}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newIngredientAmount}
                        onChange={setNewIngredientAmount}
                        className="w-24"
                      />
                      <Select
                        selectedKey={newIngredientUnit}
                        onSelectionChange={(key) => setNewIngredientUnit(key as string)}
                        items={UNITS}
                        size="sm"
                        className="w-32"
                      >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                      </Select>
                      <Button
                        color="secondary"
                        size="md"
                        onClick={handleAddIngredient}
                        disabled={!newIngredientName || !newIngredientAmount}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Nutrition Preview */}
                  {isCalculating && (
                    <div className="p-4 rounded-lg border border-secondary bg-secondary text-sm text-tertiary">
                      Calculating nutrition...
                    </div>
                  )}
                  {nutrition && !isCalculating && (
                    <div className="p-4 rounded-lg border border-secondary bg-secondary">
                      <h4 className="text-sm font-semibold text-primary mb-2">Nutrition Preview</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-tertiary">Calories:</span>{" "}
                          <span className="font-medium text-primary">{nutrition.calories}</span>
                        </div>
                        <div>
                          <span className="text-tertiary">Protein:</span>{" "}
                          <span className="font-medium text-primary">{nutrition.protein}g</span>
                        </div>
                        <div>
                          <span className="text-tertiary">Carbs:</span>{" "}
                          <span className="font-medium text-primary">{nutrition.carbs}g</span>
                        </div>
                        <div>
                          <span className="text-tertiary">Fat:</span>{" "}
                          <span className="font-medium text-primary">{nutrition.fat}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Instructions */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-3">Instructions</h3>
                    <div className="space-y-3">
                      {instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-semibold text-primary">
                            {index + 1}
                          </div>
                          <TextArea
                            placeholder={`Step ${index + 1}`}
                            value={instruction}
                            onChange={(value) => handleUpdateInstruction(index, value)}
                            rows={3}
                            className="flex-1"
                          />
                          {instructions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInstruction(index)}
                              className="text-tertiary hover:text-primary transition-colors self-start mt-2"
                            >
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      color="secondary"
                      size="md"
                      onClick={handleAddInstruction}
                      className="mt-4"
                    >
                      Add Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review with Tabs */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex gap-1 border-b border-secondary">
                    <button
                      type="button"
                      onClick={() => setReviewTab("overview")}
                      className={cx(
                        "px-4 py-2 text-sm font-medium transition-colors relative",
                        reviewTab === "overview"
                          ? "text-utility-brand-600"
                          : "text-tertiary hover:text-primary"
                      )}
                    >
                      Overview
                      {reviewTab === "overview" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-utility-brand-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewTab("ingredients")}
                      className={cx(
                        "px-4 py-2 text-sm font-medium transition-colors relative",
                        reviewTab === "ingredients"
                          ? "text-utility-brand-600"
                          : "text-tertiary hover:text-primary"
                      )}
                    >
                      Ingredients ({ingredients.length})
                      {reviewTab === "ingredients" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-utility-brand-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewTab("instructions")}
                      className={cx(
                        "px-4 py-2 text-sm font-medium transition-colors relative",
                        reviewTab === "instructions"
                          ? "text-utility-brand-600"
                          : "text-tertiary hover:text-primary"
                      )}
                    >
                      Steps ({instructions.filter((i) => i.trim().length > 0).length})
                      {reviewTab === "instructions" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-utility-brand-600" />
                      )}
                    </button>
                    {nutrition && (
                      <button
                        type="button"
                        onClick={() => setReviewTab("nutrition")}
                        className={cx(
                          "px-4 py-2 text-sm font-medium transition-colors relative",
                          reviewTab === "nutrition"
                            ? "text-utility-brand-600"
                            : "text-tertiary hover:text-primary"
                        )}
                      >
                        Nutrition
                        {reviewTab === "nutrition" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-utility-brand-600" />
                        )}
                      </button>
                    )}
                      </div>

                  {/* Tab Content */}
                  <div className="min-h-[300px]">
                    {/* Overview Tab */}
                    {reviewTab === "overview" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-secondary bg-secondary">
                          <h3 className="text-lg font-semibold text-primary mb-1">{name}</h3>
                      {description && (
                            <p className="text-sm text-tertiary mt-2">{description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border-secondary">
                        <div>
                              <span className="text-xs text-tertiary">Meal Type</span>
                              <p className="text-sm font-medium text-primary">
                                {MEAL_TYPES.find((m) => m.id === mealType)?.label}
                              </p>
                        </div>
                        {cuisine && (
                          <div>
                                <span className="text-xs text-tertiary">Cuisine</span>
                            <p className="text-sm font-medium text-primary">
                              {CUISINES.find((c) => c.id === cuisine)?.label}
                            </p>
                          </div>
                        )}
                        <div>
                              <span className="text-xs text-tertiary">Servings</span>
                              <p className="text-sm font-medium text-primary">{servings}</p>
                            </div>
                            {(prepTime || cookTime) && (
                              <div>
                                <span className="text-xs text-tertiary">Time</span>
                          <p className="text-sm font-medium text-primary">
                                  {prepTime && cookTime ? `${parseInt(prepTime) + parseInt(cookTime)} min` : prepTime ? `${prepTime} min` : `${cookTime} min`}
                          </p>
                          </div>
                        )}
                          </div>
                        </div>

                        {image && (
                          <div className="rounded-lg overflow-hidden border border-secondary">
                            <img src={image} alt={name} className="w-full h-48 object-cover" />
                      </div>
                        )}
                    </div>
                    )}

                    {/* Ingredients Tab */}
                    {reviewTab === "ingredients" && (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {ingredients.map((ingredient, index) => {
                        const enriched = getEnrichedIngredient(ingredient);
                        const inStock = isIngredientInStock(ingredient.name);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border border-secondary bg-secondary hover:bg-tertiary transition-colors"
                          >
                            {/* Ingredient Image/Icon */}
                            {enriched.image ? (
                              <img 
                                src={enriched.image} 
                                alt={ingredient.name}
                                className="size-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : enriched.icon ? (
                              <div className="size-12 rounded-lg bg-quaternary flex items-center justify-center flex-shrink-0 text-2xl">
                                {enriched.icon}
                              </div>
                            ) : (
                              <div className="size-12 rounded-lg bg-quaternary flex items-center justify-center flex-shrink-0 text-2xl">
                                🥘
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-primary">
                                  {ingredient.amount} {ingredient.unit}
                                </span>
                                <span className="text-sm text-primary">{ingredient.name}</span>
                                {inStock && (
                                  <Badge color="success" size="sm" className="flex items-center gap-1">
                                    <CheckCircle className="size-3" />
                                    In Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    )}

                    {/* Instructions Tab */}
                    {reviewTab === "instructions" && (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {instructions
                        .filter((i) => i.trim().length > 0)
                        .map((instruction, index) => (
                          <div
                            key={index}
                              className="p-4 rounded-lg border border-secondary bg-secondary"
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-utility-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                          </div>
                                <p className="text-sm text-primary flex-1">{instruction}</p>
                    </div>
                  </div>
                          ))}
                      </div>
                    )}

                    {/* Nutrition Tab */}
                    {reviewTab === "nutrition" && nutrition && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-secondary bg-secondary">
                            <span className="text-xs text-tertiary">Calories</span>
                            <p className="text-2xl font-bold text-primary mt-1">
                              {nutrition.calories}
                            </p>
                            <span className="text-xs text-tertiary">kcal</span>
                          </div>
                          <div className="p-4 rounded-lg border border-secondary bg-secondary">
                            <span className="text-xs text-tertiary">Protein</span>
                            <p className="text-2xl font-bold text-primary mt-1">
                              {nutrition.protein}
                            </p>
                            <span className="text-xs text-tertiary">grams</span>
                          </div>
                          <div className="p-4 rounded-lg border border-secondary bg-secondary">
                            <span className="text-xs text-tertiary">Carbs</span>
                            <p className="text-2xl font-bold text-primary mt-1">
                              {nutrition.carbs}
                            </p>
                            <span className="text-xs text-tertiary">grams</span>
                          </div>
                          <div className="p-4 rounded-lg border border-secondary bg-secondary">
                            <span className="text-xs text-tertiary">Fat</span>
                            <p className="text-2xl font-bold text-primary mt-1">
                              {nutrition.fat}
                            </p>
                            <span className="text-xs text-tertiary">grams</span>
                          </div>
                          {nutrition.fiber > 0 && (
                            <div className="p-4 rounded-lg border border-secondary bg-secondary col-span-2">
                              <span className="text-xs text-tertiary">Fiber</span>
                              <p className="text-2xl font-bold text-primary mt-1">
                                {nutrition.fiber}
                              </p>
                              <span className="text-xs text-tertiary">grams</span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-secondary p-6 gap-3">
              {currentStep > 0 && (
              <Button
                color="secondary"
                size="md"
                iconLeading={ChevronLeft}
                onClick={handleBack}
                  disabled={currentStep === 1 && !importMethod}
              >
                Back
              </Button>
              )}
              {currentStep === 0 && <div />}
              <div className="flex gap-2 ml-auto">
                <Button
                  color="secondary"
                  size="md"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                {currentStep === 0.1 ? null : currentStep < 4 ? (
                  <Button
                    color="primary"
                    size="md"
                    iconTrailing={ChevronRight}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    size="md"
                    onClick={handleSave}
                    disabled={isSaving || !nutrition}
                  >
                    {isSaving ? "Saving..." : "Save Recipe"}
                  </Button>
                )}
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

