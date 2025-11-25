"use client";

import { useState, useMemo } from "react";
import { CheckCircle, SearchLg, Plus } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { KITCHEN_EQUIPMENT, getEquipmentByCategory, getEquipmentCategories } from "@/data/equipment-data";
import { useEquipment } from "@/hooks/use-equipment";
import type { Equipment, EquipmentCategory } from "@/types/equipment";

interface EquipmentCardProps {
  equipment: Equipment;
  isUnlocked: boolean;
  onToggle: () => void;
}

function EquipmentCard({ equipment, isUnlocked, onToggle }: EquipmentCardProps) {
  return (
    <div
      onClick={onToggle}
      className={cx(
        "relative p-6 rounded-lg border transition-all duration-200 cursor-pointer group",
        isUnlocked
          ? "bg-primary border-utility-brand-500/30 hover:border-utility-brand-500/50 hover:shadow-md"
          : "bg-secondary_alt border-secondary hover:border-primary-foreground/20 hover:bg-secondary"
      )}
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        {isUnlocked ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-utility-success-500/10 border border-utility-success-500/30">
            <CheckCircle className="size-4 text-utility-success-500" />
            <span className="text-xs font-medium text-utility-success-500">Owned</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-secondary">
            <Plus className="size-4 text-primary-foreground/40" />
            <span className="text-xs font-medium text-primary-foreground/40">Add</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="mb-4 flex items-center justify-center">
        <div
          className={cx(
            "text-4xl transition-opacity",
            !isUnlocked && "opacity-50"
          )}
        >
          {equipment.icon || "🔧"}
        </div>
      </div>

      {/* Name */}
      <h3
        className={cx(
          "text-lg font-semibold mb-2",
          isUnlocked ? "text-primary-foreground" : "text-primary-foreground/70"
        )}
      >
        {equipment.name}
      </h3>

      {/* Description */}
      <p
        className={cx(
          "text-sm mb-4 line-clamp-2 leading-relaxed",
          isUnlocked ? "text-primary-foreground/70" : "text-primary-foreground/50"
        )}
      >
        {equipment.description}
      </p>

      {/* Capabilities */}
      {equipment.capabilities && equipment.capabilities.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {equipment.capabilities.slice(0, 3).map((capability, idx) => (
              <Badge key={idx} type="color" color="gray" size="sm">
                {capability}
              </Badge>
            ))}
            {equipment.capabilities.length > 3 && (
              <Badge type="color" color="gray" size="sm">
                +{equipment.capabilities.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Click Hint */}
      <div className="mt-4 pt-4 border-t border-secondary">
        <p className="text-xs text-primary-foreground/40 text-center">
          {isUnlocked ? "Click to remove" : "Click to add to your kitchen"}
        </p>
      </div>
    </div>
  );
}

interface EquipmentCategorySectionProps {
  category: EquipmentCategory;
  equipment: Equipment[];
  searchQuery: string;
  getEquipmentStatus: (eq: Equipment) => Equipment["status"];
  onToggleEquipment: (id: string) => void;
}

function EquipmentCategorySection({
  category,
  equipment,
  searchQuery,
  getEquipmentStatus,
  onToggleEquipment,
}: EquipmentCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery) return equipment;
    const query = searchQuery.toLowerCase();
    return equipment.filter(
      (eq) =>
        eq.name.toLowerCase().includes(query) ||
        eq.description.toLowerCase().includes(query) ||
        eq.category.toLowerCase().includes(query) ||
        eq.capabilities?.some((cap) => cap.toLowerCase().includes(query))
    );
  }, [equipment, searchQuery]);

  if (filteredEquipment.length === 0 && !searchQuery) {
    return null;
  }

  const unlockedCount = filteredEquipment.filter((eq) => getEquipmentStatus(eq) === "unlocked").length;
  const totalCount = filteredEquipment.length;

  return (
    <div className="mb-8">
      {/* Category Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary-foreground">{category}</h2>
          <p className="text-sm text-primary-foreground/50 mt-0.5">
            {unlockedCount} of {totalCount} items
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors"
        >
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {/* Equipment Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredEquipment.length === 0 ? (
            <div className="col-span-full text-center py-8 text-primary-foreground/50">
              No equipment found in {category.toLowerCase()}
            </div>
          ) : (
            filteredEquipment.map((eq) => {
              const status = getEquipmentStatus(eq);
              return (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  isUnlocked={status === "unlocked"}
                  onToggle={() => onToggleEquipment(eq.id)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function EquipmentTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | "all">("all");
  const { toggleEquipment, getEquipmentStatus, unlockedCount } = useEquipment();

  const categories = getEquipmentCategories();
  const totalCount = KITCHEN_EQUIPMENT.length;

  const filteredEquipment = useMemo(() => {
    let filtered = KITCHEN_EQUIPMENT;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((eq) => eq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (eq) =>
          eq.name.toLowerCase().includes(query) ||
          eq.description.toLowerCase().includes(query) ||
          eq.category.toLowerCase().includes(query) ||
          eq.capabilities?.some((cap) => cap.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const equipmentByCategory = useMemo(() => {
    const grouped: Record<EquipmentCategory, Equipment[]> = {} as Record<
      EquipmentCategory,
      Equipment[]
    >;
    categories.forEach((cat) => {
      grouped[cat] = getEquipmentByCategory(cat);
    });
    return grouped;
  }, [categories]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-primary-foreground/60">
          Select the equipment you have in your kitchen. This helps us suggest recipes and techniques you can use.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="px-4 py-2.5 rounded-lg bg-secondary_alt border border-secondary">
          <span className="text-sm text-primary-foreground/60">Total: </span>
          <span className="text-sm font-semibold text-primary-foreground">{totalCount}</span>
        </div>
        <div className="px-4 py-2.5 rounded-lg bg-utility-success-500/10 border border-utility-success-500/30">
          <span className="text-sm font-semibold text-utility-success-500">
            In Your Kitchen: {unlockedCount}
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={SearchLg}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-utility-brand-500 text-white"
                : "bg-secondary_alt border border-secondary text-primary-foreground hover:bg-secondary"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-utility-brand-500 text-white"
                  : "bg-secondary_alt border border-secondary text-primary-foreground hover:bg-secondary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment by Category */}
      {selectedCategory === "all" ? (
        categories.map((category) => (
          <EquipmentCategorySection
            key={category}
            category={category}
            equipment={equipmentByCategory[category]}
            searchQuery={searchQuery}
            getEquipmentStatus={getEquipmentStatus}
            onToggleEquipment={toggleEquipment}
          />
        ))
      ) : (
        <EquipmentCategorySection
          category={selectedCategory}
          equipment={equipmentByCategory[selectedCategory]}
          searchQuery={searchQuery}
          getEquipmentStatus={getEquipmentStatus}
          onToggleEquipment={toggleEquipment}
        />
      )}

      {/* Empty State */}
      {filteredEquipment.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-lg text-primary-foreground/60 mb-4">
            No equipment found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
