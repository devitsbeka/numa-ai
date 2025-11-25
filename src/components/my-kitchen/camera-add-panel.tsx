"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera03, Check, Trash01, Edit03 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import Image from "next/image";
import type { KitchenItem } from "@/hooks/use-kitchen";
import { getStorageAreaInfo, getCategoryInfo } from "@/utils/storage-categorizer";
import { fetchIngredientImage } from "@/utils/ingredient-image-fetcher";
import { get3DIconForIngredient, getIngredientImageSource } from "@/utils/ingredient-icon-map";

interface RecognizedItem extends Omit<KitchenItem, 'id' | 'addedAt'> {
  tempId: string;
  isConfirmed?: boolean;
  isEditing?: boolean;
}

interface CameraAddPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsConfirmed: (items: Omit<KitchenItem, 'id' | 'addedAt'>[]) => void;
}

export function CameraAddPanel({ isOpen, onClose, onItemsConfirmed }: CameraAddPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItem[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizingItemNames, setRecognizingItemNames] = useState<Set<string>>(new Set());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const autoCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);
  const CAPTURE_INTERVAL_MS = 1000; // Capture every 1 second

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setPermissionError(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setPermissionError(true);
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    if (autoCaptureIntervalRef.current) {
      clearInterval(autoCaptureIntervalRef.current);
      autoCaptureIntervalRef.current = null;
    }
  }, []);

  // Capture frame and recognize
  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isRecognizing) {
      return;
    }

    const now = Date.now();
    if (now - lastCaptureTimeRef.current < CAPTURE_INTERVAL_MS) {
      return; // Rate limit
    }

    setIsRecognizing(true);
    lastCaptureTimeRef.current = now;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsRecognizing(false);
          return;
        }

        try {
          const formData = new FormData();
          formData.append('image', blob, 'capture.jpg');

          const response = await fetch('/api/kitchen/recognize', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to recognize ingredients');
          }

          if (result.items && result.items.length > 0) {
            // Add new items to the list (avoid duplicates by name)
            setRecognizedItems((prev) => {
              const existingNames = new Set(prev.map((item) => item.name.toLowerCase()));
              const newItems: RecognizedItem[] = result.items
                .filter((item: Omit<KitchenItem, 'id' | 'addedAt'>) => 
                  !existingNames.has(item.name.toLowerCase())
                )
                .map((item: Omit<KitchenItem, 'id' | 'addedAt'>) => ({
                  ...item,
                  image: get3DIconForIngredient(item.name),
                  tempId: `temp-${Date.now()}-${Math.random()}`,
                  isConfirmed: false,
                }));

              // Show brief recognition highlight for new items
              if (newItems.length > 0) {
                const newItemNames = new Set(newItems.map(item => item.name.toLowerCase()));
                setRecognizingItemNames(newItemNames);
                
                // Clear highlight after brief animation
                setTimeout(() => {
                  setRecognizingItemNames((prev) => {
                    const updated = new Set(prev);
                    newItemNames.forEach(name => updated.delete(name));
                    return updated;
                  });
                }, 800);

                // Fetch spoonacular images for items that still lack icons
                newItems.forEach(async (item) => {
                  if (item.image) return;
                  try {
                    const image = await fetchIngredientImage(item.name);
                    if (image) {
                      setRecognizedItems((prev) =>
                        prev.map((i) =>
                          i.tempId === item.tempId ? { ...i, image } : i
                        )
                      );
                    }
                  } catch (error) {
                    console.error(`Error fetching image for ${item.name}:`, error);
                  }
                });
              }

              return [...prev, ...newItems];
            });
          }
        } catch (err) {
          console.error('Recognition error:', err);
          // Don't show error for every failed recognition to avoid spam
        } finally {
          setIsRecognizing(false);
        }
      }, 'image/jpeg', 0.8);
    } catch (err) {
      console.error('Capture error:', err);
      setIsRecognizing(false);
    }
  }, [isRecognizing]);

  // Auto-start recognition when camera is streaming
  useEffect(() => {
    if (isStreaming) {
      // Start capturing immediately and then every second
      captureAndRecognize();
      autoCaptureIntervalRef.current = setInterval(() => {
        captureAndRecognize();
      }, CAPTURE_INTERVAL_MS);
    } else {
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
        autoCaptureIntervalRef.current = null;
      }
    }

    return () => {
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
      }
    };
  }, [isStreaming, captureAndRecognize]);

  // Start camera when panel opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setRecognizedItems([]);
      setError(null);
      setPermissionError(false);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Handle confirm all
  const handleConfirmAll = () => {
    const unconfirmedItems = recognizedItems.filter((item) => !item.isConfirmed);
    if (unconfirmedItems.length > 0) {
      onItemsConfirmed(unconfirmedItems);
      setRecognizedItems((prev) =>
        prev.map((item) => ({ ...item, isConfirmed: true }))
      );
    }
  };

  // Handle remove item
  const handleRemoveItem = (tempId: string) => {
    setRecognizedItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  // Handle start editing
  const handleStartEdit = (item: RecognizedItem) => {
    setEditingItemId(item.tempId);
    setEditingName(item.name);
  };

  // Handle save edit
  const handleSaveEdit = (tempId: string) => {
    setRecognizedItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId
          ? { ...item, name: editingName.trim() || item.name }
          : item
      )
    );
    setEditingItemId(null);
    setEditingName("");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingName("");
  };

  // Handle close
  const handleClose = () => {
    stopCamera();
    setRecognizedItems([]);
    setError(null);
    setPermissionError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary bg-primary">
        <h2 className="text-lg font-semibold text-primary-foreground">
          Scan Ingredients
        </h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="size-5 text-primary-foreground" />
        </button>
      </div>

      {/* Main Content - Split View */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left: Camera Feed */}
        <div className="flex-1 flex flex-col border-r border-secondary bg-secondary_alt">
          {permissionError ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Camera03 className="size-16 text-primary-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                  Camera Access Required
                </h3>
                <p className="text-sm text-primary-foreground/60 mb-4">
                  Please allow camera permissions to scan ingredients. Click the button below to try again.
                </p>
                <Button onClick={startCamera} size="md">
                  Request Camera Access
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex-1 bg-primary">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Status */}
              <div className="p-3 border-t border-secondary bg-primary">
                <div className="flex items-center justify-center gap-2">
                  <div className="size-2 rounded-full bg-utility-success-500" />
                  <span className="text-xs text-primary-foreground/60">
                    Scanning automatically
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Recognized Items */}
        <div className="w-96 flex flex-col border-l border-secondary bg-primary">
          <div className="p-4 border-b border-secondary">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-primary-foreground">
                Recognized Items
              </h3>
              {recognizedItems.length > 0 && (
                <span className="text-xs text-primary-foreground/60">
                  {recognizedItems.filter((item) => !item.isConfirmed).length} new
                </span>
              )}
            </div>
            {recognizedItems.length > 0 && (
              <Button
                onClick={handleConfirmAll}
                size="sm"
                className="w-full"
                disabled={recognizedItems.filter((item) => !item.isConfirmed).length === 0}
              >
                Add All to Kitchen ({recognizedItems.filter((item) => !item.isConfirmed).length})
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recognizedItems.length === 0 ? (
              <div className="text-center py-12 text-primary-foreground/60">
                <p className="text-sm">
                  Point your camera at ingredients to start recognizing
                </p>
              </div>
            ) : (
              recognizedItems.map((item) => {
                const storageInfo = item.storageArea
                  ? getStorageAreaInfo(item.storageArea)
                  : null;
                const categoryInfo = item.category
                  ? getCategoryInfo(item.category)
                  : null;
                const isCurrentlyRecognizing = recognizingItemNames.has(item.name.toLowerCase());
                const isEditing = editingItemId === item.tempId;
                const displayImage = getIngredientImageSource(item.name, item.image);

                return (
                  <div
                    key={item.tempId}
                    className={cx(
                      "group p-3 rounded-lg border-2 transition-all",
                      item.isConfirmed
                        ? "border-utility-success-500/50 bg-utility-success-500/10"
                        : isCurrentlyRecognizing
                        ? "border-utility-brand-500/50 bg-utility-brand-500/10"
                        : "border-secondary bg-secondary_alt hover:border-primary-foreground/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-secondary bg-secondary shrink-0">
                        {displayImage ? (
                          <Image
                            src={displayImage}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isCurrentlyRecognizing && (
                          <div className="absolute inset-0 bg-utility-brand-500/20 animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name - Editable */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mb-1">
                            <Input
                              value={editingName}
                              onChange={setEditingName}
                              size="sm"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(item.tempId);
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(item.tempId)}
                              className="p-1 rounded hover:bg-secondary transition-colors"
                              aria-label="Save"
                            >
                              <Check className="size-4 text-utility-success-500" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 rounded hover:bg-secondary transition-colors"
                              aria-label="Cancel"
                            >
                              <X className="size-4 text-primary-foreground/60" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <p 
                              className="text-sm font-medium text-primary-foreground truncate flex-1 cursor-pointer hover:text-utility-brand-500 transition-colors"
                              onClick={() => handleStartEdit(item)}
                              title="Click to edit name"
                            >
                              {item.name}
                            </p>
                            {!item.isConfirmed && (
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1 rounded hover:bg-secondary transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                aria-label={`Edit ${item.name}`}
                              >
                                <Edit03 className="size-3.5 text-primary-foreground/60" />
                              </button>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-primary-foreground/60 mt-1">
                          {item.quantity || "As needed"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {categoryInfo && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary border border-secondary">
                              {categoryInfo.icon} {categoryInfo.name}
                            </span>
                          )}
                          {storageInfo && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary border border-secondary">
                              {storageInfo.icon} {storageInfo.name}
                            </span>
                          )}
                        </div>
                        {item.isConfirmed && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-utility-success-500">
                            <Check className="size-3" />
                            <span>Added to kitchen</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      {!item.isConfirmed && !isEditing && (
                        <button
                          onClick={() => handleRemoveItem(item.tempId)}
                          className="p-1 rounded hover:bg-secondary transition-colors shrink-0"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash01 className="size-4 text-primary-foreground/60" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

