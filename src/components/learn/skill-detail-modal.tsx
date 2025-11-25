"use client";

import { X, Bookmark, BookmarkCheck, CheckCircle, Clock, ArrowRight } from "@untitledui/icons";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { TextArea } from "@/components/base/textarea/textarea";
import { useLearn } from "@/hooks/use-learn";
import { getSkillById, getSkillsByCategory } from "@/data/cooking-skills";
import { cx } from "@/utils/cx";
import { useState, useEffect } from "react";
import type { Skill } from "@/types/learn";

interface SkillDetailModalProps {
  skillId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillDetailModal({ skillId, isOpen, onClose }: SkillDetailModalProps) {
  const {
    getSkillProgress,
    addSkill,
    removeSkill,
    updateProgress,
    markComplete,
    toggleBookmark,
    updateNotes,
  } = useLearn();
  const [notes, setNotes] = useState("");

  // Get skill and progress - use null-safe values
  const skill = skillId ? getSkillById(skillId) : null;
  const progress = skillId ? getSkillProgress(skillId) : null;

  // Load notes when modal opens or skill changes
  useEffect(() => {
    if (progress?.notes) {
      setNotes(progress.notes);
    } else {
      setNotes("");
    }
  }, [skillId, progress?.notes]);

  // Early returns must come AFTER all hooks
  if (!skillId) return null;
  if (!skill) return null;

  const isSaved = !!progress;
  const isBookmarked = progress?.bookmarked || false;
  const isCompleted = progress?.status === "completed";
  const progressValue = progress?.progress || 0;

  const relatedSkills = skill.relatedSkills
    ?.map(id => getSkillById(id))
    .filter((s): s is Skill => s !== undefined)
    .slice(0, 3) || [];

  const categorySkills = getSkillsByCategory(skill.category)
    .filter(s => s.id !== skillId)
    .slice(0, 3);

  const getCategoryColor = (category: Skill["category"]) => {
    switch (category) {
      case "technique":
        return "brand";
      case "nutrition":
        return "success";
      case "health":
        return "warning";
      case "ingredient":
        return "gray";
      case "equipment":
        return "gray-blue";
      default:
        return "gray";
    }
  };

  const getDifficultyColor = (difficulty: Skill["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "error";
      default:
        return "gray";
    }
  };

  const handleSaveNotes = () => {
    updateNotes(skillId, notes);
  };

  const handleProgressChange = (newProgress: number) => {
    updateProgress(skillId, newProgress);
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
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
          <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b border-secondary">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-primary">{skill.name}</h2>
                {isCompleted && (
                  <CheckCircle className="size-6 text-utility-success-600" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge type="pill-color" size="md" color={getCategoryColor(skill.category)}>
                  {skill.category}
                </Badge>
                <Badge type="pill-color" size="md" color={getDifficultyColor(skill.difficulty)}>
                  {skill.difficulty}
                </Badge>
                {skill.estimatedTime && (
                  <div className="flex items-center gap-1 text-sm text-tertiary">
                    <Clock className="size-4" />
                    <span>{skill.estimatedTime} minutes</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleBookmark(skillId)}
                className={cx(
                  "p-2 rounded-md transition-colors",
                  "hover:bg-secondary",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="size-5 text-utility-brand-600" />
                ) : (
                  <Bookmark className="size-5 text-tertiary" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={cx(
                  "p-2 rounded-md transition-colors",
                  "hover:bg-secondary",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                )}
                aria-label="Close"
              >
                <X className="size-5 text-tertiary" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Description */}
            <p className="text-base text-primary mb-6">{skill.description}</p>

            {/* Progress Section */}
            {isSaved && (
              <div className="mb-6 p-4 rounded-lg border border-secondary bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">Your Progress</span>
                  <span className="text-sm font-semibold text-primary">{progressValue}%</span>
                </div>
                <ProgressBar value={progressValue} className="mb-4" />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleProgressChange(Math.min(100, progressValue + 25))}
                    disabled={progressValue >= 100}
                  >
                    +25%
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => markComplete(skillId)}
                    disabled={isCompleted}
                    iconLeading={CheckCircle}
                  >
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none mb-6">
              <div
                className="text-primary whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: skill.content.replace(/\n/g, "<br />") }}
              />
            </div>

            {/* Notes Section */}
            {isSaved && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary mb-2">
                  Your Notes
                </label>
                <TextArea
                  value={notes}
                  onChange={setNotes}
                  onBlur={handleSaveNotes}
                  placeholder="Add your notes about this skill..."
                  rows={4}
                  className="mb-2"
                />
                <p className="text-xs text-tertiary">Notes are saved automatically</p>
              </div>
            )}

            {/* Related Skills */}
            {(relatedSkills.length > 0 || categorySkills.length > 0) && (
              <div className="border-t border-secondary pt-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Related Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[...relatedSkills, ...categorySkills]
                    .filter((s, i, arr) => arr.findIndex(s2 => s2.id === s.id) === i)
                    .slice(0, 3)
                    .map((relatedSkill) => (
                      <div
                        key={relatedSkill.id}
                        className="p-3 rounded-lg border border-secondary bg-primary hover:border-border-primary transition-colors cursor-pointer"
                        onClick={() => {
                          // This would ideally update the modal content, but for now we'll just close and let parent handle it
                          onClose();
                        }}
                      >
                        <h4 className="text-sm font-semibold text-primary mb-1">
                          {relatedSkill.name}
                        </h4>
                        <p className="text-xs text-tertiary line-clamp-2">
                          {relatedSkill.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 p-6 border-t border-secondary bg-secondary/30">
            {!isSaved ? (
              <Button
                size="lg"
                color="primary"
                onClick={() => {
                  addSkill(skillId);
                }}
                className="flex-1"
              >
                Add to Learning
              </Button>
            ) : (
              <Button
                size="lg"
                color="secondary"
                onClick={() => {
                  removeSkill(skillId);
                  onClose();
                }}
                className="flex-1"
              >
                Remove from Learning
              </Button>
            )}
            <Button
              size="lg"
              color="primary"
              onClick={onClose}
              iconTrailing={ArrowRight}
            >
              Close
            </Button>
          </div>
        </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

