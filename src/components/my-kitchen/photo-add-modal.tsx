"use client";

import { useState, useRef } from "react";
import { X, Upload01, ImageX } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Modal, ModalOverlay, Dialog } from "@/components/application/modals/modal";
import { cx } from "@/utils/cx";
import type { KitchenItem } from "@/hooks/use-kitchen";

interface PhotoAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsRecognized: (items: Omit<KitchenItem, 'id' | 'addedAt'>[]) => void;
}

export function PhotoAddModal({ isOpen, onClose, onItemsRecognized }: PhotoAddModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState<Array<Omit<KitchenItem, 'id' | 'addedAt'>>>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setRecognizedItems([]);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-utility-brand-500');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-utility-brand-500');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-utility-brand-500');
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRecognize = async () => {
    if (!selectedFile) return;

    setIsRecognizing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/kitchen/recognize', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to recognize ingredients');
      }

      if (result.items && result.items.length > 0) {
        setRecognizedItems(result.items);
      } else {
        setError('No ingredients were recognized in this image. Try a clearer photo.');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setError(err instanceof Error ? err.message : 'Failed to recognize ingredients');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleAddAll = () => {
    if (recognizedItems.length > 0) {
      onItemsRecognized(recognizedItems);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setRecognizedItems([]);
    setError(null);
    setIsRecognizing(false);
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Modal
        className={({ isEntering, isExiting }) =>
          cx(
            "w-full max-w-4xl max-h-[90vh] overflow-hidden",
            isEntering && "animate-in fade-in zoom-in-95",
            isExiting && "animate-out fade-out zoom-out-95"
          )
        }
      >
        <Dialog className="flex flex-col h-full max-h-[90vh] rounded-lg border border-secondary bg-primary shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary">
            <h2 className="text-xl font-semibold text-primary-foreground">
              Add Ingredients via Photo
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="size-5 text-primary-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Upload Area */}
              <div className="space-y-4">
                {!preview ? (
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cx(
                      "border-2 border-dashed rounded-xl p-8 text-center",
                      "border-secondary hover:border-primary-foreground/30 transition-colors",
                      "cursor-pointer"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <ImageX className="size-12 text-primary-foreground/40 mx-auto mb-4" />
                    <p className="text-sm font-medium text-primary-foreground mb-2">
                      Drop an image here or click to upload
                    </p>
                    <p className="text-xs text-primary-foreground/60">
                      Supports JPG, PNG, WebP
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full rounded-xl border border-secondary"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        setRecognizedItems([]);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-primary/90 backdrop-blur-sm hover:bg-primary transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="size-4 text-primary-foreground" />
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-utility-error-500/20 border border-utility-error-500/50">
                    <p className="text-sm text-utility-error-400">{error}</p>
                  </div>
                )}

                {preview && !recognizedItems.length && (
                  <Button
                    onClick={handleRecognize}
                    disabled={isRecognizing}
                    isLoading={isRecognizing}
                    className="w-full"
                    size="lg"
                  >
                    {isRecognizing ? "Recognizing..." : "Recognize Ingredients"}
                  </Button>
                )}
              </div>

              {/* Right: Recognized Items */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary-foreground">
                  Recognized Items
                </h3>

                {recognizedItems.length === 0 ? (
                  <div className="text-center py-12 text-primary-foreground/60">
                    <p className="text-sm">
                      {preview
                        ? "Click 'Recognize Ingredients' to identify items"
                        : "Upload an image to get started"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {recognizedItems.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border border-secondary bg-secondary_alt"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary-foreground truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-primary-foreground/60 mt-1">
                                {item.quantity}
                              </p>
                              {item.category && (
                                <p className="text-xs text-primary-foreground/50 mt-1">
                                  {item.category}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleAddAll}
                      className="w-full"
                      size="lg"
                    >
                      Add All to Kitchen ({recognizedItems.length})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

