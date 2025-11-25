"use client";

import { useState, useMemo } from "react";
import { X, Trash01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { cx } from "@/utils/cx";
import type { Diner, DietaryPreference } from "@/types/cooking-mode";

interface DinerSettingsPopoverProps {
  diner: Diner;
  onUpdate: (diner: Diner) => void;
  onRemove: () => void;
}

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: "none", label: "None" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "keto", label: "Keto" },
  { value: "dairy-free", label: "Dairy-Free" },
];

const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Shellfish",
  "Fish",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat",
  "Sesame",
];

export function DinerSettingsPopover({
  diner,
  onUpdate,
  onRemove,
}: DinerSettingsPopoverProps) {
  const [name, setName] = useState(diner.name);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>(diner.dietaryPreferences);
  const [allergies, setAllergies] = useState<string[]>(diner.allergies);
  const [customAllergy, setCustomAllergy] = useState("");

  const handleDietaryToggle = (preference: DietaryPreference) => {
    if (preference === "none") {
      setDietaryPreferences([]);
      return;
    }
    
    setDietaryPreferences((prev) => {
      const filtered = prev.filter((p) => p !== "none");
      if (filtered.includes(preference)) {
        return filtered.filter((p) => p !== preference);
      } else {
        return [...filtered, preference];
      }
    });
  };

  const handleAllergyToggle = (allergy: string) => {
    setAllergies((prev) => {
      if (prev.includes(allergy)) {
        return prev.filter((a) => a !== allergy);
      } else {
        return [...prev, allergy];
      }
    });
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies((prev) => [...prev, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const handleSave = () => {
    onUpdate({
      ...diner,
      name,
      dietaryPreferences: dietaryPreferences.length === 0 ? ["none"] : dietaryPreferences,
      allergies,
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-secondary">
        <h3 className="text-lg font-semibold text-primary-foreground">Diner Settings</h3>
        <Button
          size="sm"
          iconLeading={X}
          onClick={onRemove}
          className="text-primary-foreground/60 hover:text-primary-foreground"
          aria-label="Remove diner"
        />
      </div>

      {/* Name Input */}
      <div>
        <label className="text-sm font-medium text-primary-foreground mb-1.5 block">
          Name
        </label>
        <Input
          value={name}
          onChange={setName}
          placeholder="Enter name"
          className="w-full"
        />
      </div>

      {/* Dietary Preferences */}
      <div>
        <label className="text-sm font-medium text-primary-foreground mb-2 block">
          Dietary Preferences
        </label>
        <div className="space-y-2">
          {DIETARY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Checkbox
                isSelected={
                  option.value === "none"
                    ? dietaryPreferences.length === 0
                    : dietaryPreferences.includes(option.value)
                }
                onChange={() => handleDietaryToggle(option.value)}
              />
              <span className="text-sm text-primary-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="text-sm font-medium text-primary-foreground mb-2 block">
          Allergies
        </label>
        <div className="space-y-2 mb-2">
          {COMMON_ALLERGIES.map((allergy) => (
            <label
              key={allergy}
              className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Checkbox
                isSelected={allergies.includes(allergy)}
                onChange={() => handleAllergyToggle(allergy)}
              />
              <span className="text-sm text-primary-foreground">{allergy}</span>
            </label>
          ))}
        </div>
        
        {/* Custom Allergy Input */}
        <div className="flex gap-2">
          <Input
            value={customAllergy}
            onChange={setCustomAllergy}
            placeholder="Add custom allergy"
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomAllergy();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleAddCustomAllergy}
            className="shrink-0"
          >
            Add
          </Button>
        </div>

        {/* Selected Allergies */}
        {allergies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="px-2 py-1 rounded text-xs font-medium bg-utility-error-500/20 text-utility-error-400 border border-utility-error-500/50"
              >
                {allergy}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-secondary">
        <Button
          size="md"
          onClick={handleSave}
          className="flex-1 bg-utility-success-600 hover:bg-utility-success-700 text-white"
        >
          Save
        </Button>
        <Button
          size="md"
          iconLeading={Trash01}
          onClick={onRemove}
          className="bg-utility-error-600 hover:bg-utility-error-700 text-white"
          aria-label="Remove diner"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

