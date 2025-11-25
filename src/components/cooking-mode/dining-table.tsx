"use client";

import { useState, useRef, useMemo, createRef } from "react";
import { Plus, User01, X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Popover } from "react-aria-components";
import { DinerSettingsPopover } from "./diner-settings-popover";
import { PreferenceIcons } from "./preference-icons";
import { cx } from "@/utils/cx";
import type { Diner } from "@/types/cooking-mode";

interface DiningTableProps {
  diners: Diner[];
  onDinersChange: (diners: Diner[]) => void;
  maxSeats?: number;
  originalServings?: number;
}

// Calculate position for each diner around the table (circular layout)
const calculateSeatPosition = (index: number, total: number, radius: number = 100) => {
  if (total === 0) return { x: 0, y: 0 };
  
  // For a circular table, distribute seats evenly around the circle
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  
  return { x, y };
};

export function DiningTable({
  diners,
  onDinersChange,
  maxSeats = 8,
  originalServings,
}: DiningTableProps) {
  const [selectedDinerId, setSelectedDinerId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Create refs for each diner button using a Map
  const dinerRefsMap = useRef<Map<string, React.RefObject<HTMLButtonElement | null>>>(new Map());
  
  // Get or create ref for a diner
  const getDinerRef = (dinerId: string) => {
    if (!dinerRefsMap.current.has(dinerId)) {
      const ref = createRef<HTMLButtonElement>();
      dinerRefsMap.current.set(dinerId, ref);
    }
    return dinerRefsMap.current.get(dinerId)!;
  };

  const handleAddDiner = () => {
    if (diners.length >= maxSeats) return;
    
    const newDiner: Diner = {
      id: `diner-${Date.now()}`,
      name: `Person ${diners.length + 1}`,
      dietaryPreferences: [],
      allergies: [],
      customSubstitutions: {},
    };
    
    onDinersChange([...diners, newDiner]);
  };

  const handleUpdateDiner = (updatedDiner: Diner) => {
    onDinersChange(diners.map(d => d.id === updatedDiner.id ? updatedDiner : d));
    setSelectedDinerId(null);
  };

  const handleRemoveDiner = (dinerId: string) => {
    onDinersChange(diners.filter(d => d.id !== dinerId));
    setSelectedDinerId(null);
  };

  const availableSeats = maxSeats - diners.length;

  return (
    <div className="w-full h-full flex flex-col items-center gap-3">
      <div className="text-center shrink-0">
        <h2 className="text-base font-bold text-primary-foreground mb-1">Dining Table</h2>
        <p className="text-xs text-primary-foreground/60">
          {diners.length} {diners.length === 1 ? 'person' : 'people'}
        </p>
      </div>

      {/* Circular Table View */}
      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center"
        style={{ minHeight: '250px', height: '250px' }}
      >
        {/* Table Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-secondary border-2 border-secondary shadow-lg" />
        </div>

        {/* Diners positioned around the table */}
        {diners.map((diner, index) => {
          const { x, y } = calculateSeatPosition(index, diners.length);
          const isSelected = selectedDinerId === diner.id;
          const triggerRef = getDinerRef(diner.id);
          
          return (
            <div
              key={diner.id}
              className="absolute transform transition-all duration-300 group"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setSelectedDinerId(isSelected ? null : diner.id)}
                className={cx(
                  "relative w-12 h-12 rounded-full border-2 transition-all duration-200",
                  "flex items-center justify-center",
                  isSelected
                    ? "border-utility-success-500 bg-utility-success-500/20 scale-110 shadow-lg"
                    : "border-secondary bg-secondary_alt hover:border-primary-foreground/30 hover:scale-105 cursor-pointer"
                )}
              >
                <User01 className="size-6 text-primary-foreground" />
                
                {/* Dietary preference icons */}
                {diner.dietaryPreferences.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                    <PreferenceIcons preferences={diner.dietaryPreferences} size="small" />
                  </div>
                )}
                
                {/* Badge for allergies (if no dietary preferences) */}
                {diner.dietaryPreferences.length === 0 && diner.allergies.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-utility-warning-500 border-2 border-primary" />
                )}
              </button>
              
              {/* Remove button - positioned outside the main button */}
              {diners.length > 0 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveDiner(diner.id);
                  }}
                  className="absolute -top-1 -left-1 rounded-full bg-primary/80 p-0.5 text-primary-foreground/80 opacity-0 transition-opacity hover:text-primary-foreground group-hover:opacity-100 z-10"
                  aria-label={`Remove ${diner.name}`}
                >
                  <X className="size-3.5" />
                </button>
              )}
              
              {isSelected && (
                <Popover 
                  isOpen={isSelected}
                  onOpenChange={(open) => setSelectedDinerId(open ? diner.id : null)}
                  triggerRef={triggerRef}
                  placement={index < diners.length / 2 ? "bottom" : "top"}
                  className="w-80 rounded-lg bg-primary border border-secondary shadow-xl p-0"
                >
                  <DinerSettingsPopover
                    diner={diner}
                    onUpdate={handleUpdateDiner}
                    onRemove={() => handleRemoveDiner(diner.id)}
                  />
                </Popover>
              )}
            </div>
          );
        })}

        {/* Add Button - centered */}
        {availableSeats > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {diners.length === 0 ? (
              <Button
                size="lg"
                iconLeading={Plus}
                onClick={handleAddDiner}
                className="pointer-events-auto bg-primary text-primary-foreground border border-secondary hover:bg-primary_hover"
              >
                Add Person
              </Button>
            ) : (
              <Button
                size="sm"
                iconLeading={Plus}
                onClick={handleAddDiner}
                className={cx(
                  "pointer-events-auto w-10 h-10 rounded-full p-0",
                  "bg-primary text-primary-foreground border border-secondary shadow-sm hover:bg-primary_hover"
                )}
                aria-label="Add person"
              />
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {diners.length > 0 && (
        <div className="flex flex-col items-center gap-2 text-xs shrink-0 w-full">
          <div className="px-3 py-1.5 rounded-lg bg-secondary_alt border border-secondary w-full text-center">
            <span className="text-primary-foreground/60">Servings: </span>
            <span className="font-semibold text-primary-foreground">{diners.length}</span>
          </div>
          {diners.filter(d => d.dietaryPreferences.length > 0 || d.allergies.length > 0).length > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-utility-warning-500/20 border border-utility-warning-500/50 w-full text-center">
              <span className="text-utility-warning-400">
                {diners.filter(d => d.dietaryPreferences.length > 0 || d.allergies.length > 0).length} restricted
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

