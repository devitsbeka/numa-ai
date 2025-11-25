"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash01, SearchLg, X, Box, Camera03, ImageX } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { Tab, TabList, TabPanel, Tabs } from "@/components/application/tabs/tabs";
import { Badge } from "@/components/base/badges/badges";
import { useKitchen } from "@/hooks/use-kitchen";
import { ToastContainer, useToast } from "@/components/base/toast/toast";
import { KitchenItemCard } from "@/components/my-kitchen/kitchen-item-card";
import { EquipmentTab } from "@/components/my-kitchen/equipment-tab";
import { PhotoAddModal } from "@/components/my-kitchen/photo-add-modal";
import { CameraAddPanel } from "@/components/my-kitchen/camera-add-panel";
import { FloatingAddButton } from "@/components/my-kitchen/floating-add-button";
import type { StorageArea, IngredientCategory } from "@/utils/storage-categorizer";
import { cx } from "@/utils/cx";

type TabType = "stock" | "equipment";

export default function MyKitchenPage() {
  const { items, addItem, addItems, removeItem, clearList, updateItem } = useKitchen();
  const { toasts, showToast, dismissToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCameraPanelOpen, setIsCameraPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    const itemName = newItemName.trim();
    await addItem({
      name: itemName,
    });
    setNewItemName("");
    setIsAddingItem(false);
    showToast(`${itemName} added to kitchen`, "success");
  };

  const handleItemsRecognized = async (recognizedItems: Omit<typeof items[0], 'id' | 'addedAt'>[]) => {
    try {
      await addItems(recognizedItems);
      showToast(`${recognizedItems.length} item${recognizedItems.length > 1 ? 's' : ''} added to kitchen`, "success");
    } catch (error) {
      console.error('Error adding recognized items:', error);
      showToast("Failed to add some items", "error");
    }
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    removeItem(id);
    if (item) {
      showToast(`${item.name} removed from kitchen`, "success");
    }
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (confirm(`Remove all ${items.length} items from your kitchen?`)) {
      clearList();
      showToast("Kitchen cleared", "success");
    }
  };

  const totalItems = items.length;

  // Filter items based on active filters and search query
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply active filters (OR logic - show items matching ANY selected filter)
    if (activeFilters.size > 0) {
      filtered = filtered.filter((item) => {
        // Check storage area filters
        if (activeFilters.has("refrigerator") && item.storageArea === "fridge") {
          return true;
        }
        if (activeFilters.has("pantry") && item.storageArea === "pantry") {
          return true;
        }
        if (activeFilters.has("freezer") && item.storageArea === "freezer") {
          return true;
        }

        // Check expiring soon filter
        if (activeFilters.has("expiring-soon")) {
          if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
            const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            if (expiryDate <= threeDaysFromNow && expiryDate >= new Date()) {
              return true;
            }
          }
        }

        // Check healthy filter (produce, dairy, seafood categories)
        if (activeFilters.has("healthy")) {
          const healthyCategories: Array<IngredientCategory> = ["produce", "dairy", "seafood"];
          if (item.category && healthyCategories.includes(item.category)) {
            return true;
          }
        }

        // If no specific filter matches, exclude this item
        return false;
      });
    }

    return filtered;
  }, [items, searchQuery, activeFilters]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return newFilters;
    });
  };

  return (
    <div className="min-h-screen bg-primary">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            My Kitchen
          </h1>
          <p className="text-primary-foreground/60">
            Manage your pantry ingredients and discover recipes
          </p>
        </div>

        {/* Tabs */}
        <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as TabType)} className="mb-6">
          <TabList type="underline" size="md" fullWidth orientation="horizontal" items={[]}>
            <Tab id="stock">
              My Stock
              {totalItems > 0 && (
                <Badge type="color" color="gray" size="sm" className="ml-2">
                  {totalItems}
                </Badge>
              )}
            </Tab>
            <Tab id="equipment">My Equipment</Tab>
          </TabList>

          {/* My Stock Tab */}
          <TabPanel id="stock">
            {/* Search Bar */}
            <div className="mb-6 pt-[10px]">
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={setSearchQuery}
                icon={SearchLg}
                className="w-full"
              />
            </div>

            {/* Filter Badges */}
            <div className="mb-6 flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "refrigerator", label: "Refrigerator", icon: "🧊" },
                  { id: "pantry", label: "Pantry", icon: "🥫" },
                  { id: "freezer", label: "Freezer", icon: "❄️" },
                  { id: "expiring-soon", label: "Expiring Soon", icon: "⏰" },
                  { id: "healthy", label: "Healthy", icon: "🥗" },
                ].map((filter) => {
                  const isActive = activeFilters.has(filter.id);
                  return (
                    <Button
                      key={filter.id}
                      size="sm"
                      color="secondary"
                      onClick={() => toggleFilter(filter.id)}
                      className={isActive ? "ring-1 ring-utility-success-500 bg-utility-success-500/15" : ""}
                    >
                      <span className="mr-2">{filter.icon}</span>
                      <span>{filter.label}</span>
                      {isActive && (
                        <span
                          className="ml-2 inline-flex items-center justify-center cursor-pointer hover:bg-utility-success-500/20 rounded p-0.5 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFilter(filter.id);
                          }}
                        >
                          <X className="size-3" />
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
              {activeFilters.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <span>
                    Showing {filteredItems.length} out of {totalItems} items.
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFilters(new Set())}
                    className="text-utility-success-500 hover:text-utility-success-600 font-semibold underline underline-offset-2 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>


            {/* Items Grid */}
            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-primary-foreground/60 mb-4">
                  {searchQuery
                    ? "No items match your search"
                    : "Your kitchen is empty"}
                </p>
                {!searchQuery && (
                  <Button
                    size="lg"
                    iconLeading={Plus}
                    onClick={() => setIsAddingItem(true)}
                  >
                    Add Your First Item
                  </Button>
                )}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-primary-foreground/60 mb-4">
                  No items match your filters
                </p>
                <Button
                  size="md"
                  color="secondary"
                  onClick={() => setActiveFilters(new Set())}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <KitchenItemCard
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            )}
          </TabPanel>

          {/* My Equipment Tab */}
          <TabPanel id="equipment">
            <EquipmentTab />
          </TabPanel>
        </Tabs>
      </div>

      {/* Photo Upload Modal */}
      <PhotoAddModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onItemsRecognized={handleItemsRecognized}
      />

      {/* Camera Panel */}
      <CameraAddPanel
        isOpen={isCameraPanelOpen}
        onClose={() => setIsCameraPanelOpen(false)}
        onItemsConfirmed={handleItemsRecognized}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Floating Add Button */}
      {activeTab === "stock" && (
        <FloatingAddButton
          onAddItem={() => setIsAddingItem(true)}
          onAddPhoto={() => setIsPhotoModalOpen(true)}
          onAddCamera={() => setIsCameraPanelOpen(true)}
        />
      )}
    </div>
  );
}
