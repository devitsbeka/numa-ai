"use client";

import { useState } from "react";
import { Plus, ImageX, Camera03, X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface FloatingAddButtonProps {
  onAddItem: () => void;
  onAddPhoto: () => void;
  onAddCamera: () => void;
}

export function FloatingAddButton({
  onAddItem,
  onAddPhoto,
  onAddCamera,
}: FloatingAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  const handleAddItem = () => {
    onAddItem();
    close();
  };

  const handleAddPhoto = () => {
    onAddPhoto();
    close();
  };

  const handleAddCamera = () => {
    onAddCamera();
    close();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Secondary Action Buttons */}
      <div className="flex flex-col gap-3 items-end">
        {/* Camera Button */}
        <button
          type="button"
          onClick={handleAddCamera}
          className={cx(
            "flex items-center justify-center w-12 h-12 rounded-full bg-primary border-2 border-secondary shadow-lg transition-all duration-300 ease-out",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-50 translate-y-4 pointer-events-none"
          )}
          style={{
            transitionDelay: isOpen ? "50ms" : "0ms",
          }}
          aria-label="Scan via Camera"
        >
          <Camera03 className="size-5 text-primary-foreground" />
        </button>

        {/* Photo Button */}
        <button
          type="button"
          onClick={handleAddPhoto}
          className={cx(
            "flex items-center justify-center w-12 h-12 rounded-full bg-primary border-2 border-secondary shadow-lg transition-all duration-300 ease-out",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-50 translate-y-4 pointer-events-none"
          )}
          style={{
            transitionDelay: isOpen ? "100ms" : "0ms",
          }}
          aria-label="Add via Photo"
        >
          <ImageX className="size-5 text-primary-foreground" />
        </button>
      </div>

      {/* Main FAB Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cx(
          "flex items-center justify-center w-14 h-14 rounded-full bg-utility-success-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-out",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Close menu" : "Add item"}
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <Plus className="size-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </div>
  );
}


