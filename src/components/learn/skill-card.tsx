"use client";

import { Bookmark, BookmarkCheck, X, CheckCircle, Clock } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { useLearn } from "@/hooks/use-learn";
import { getSkillById } from "@/data/cooking-skills";
import { cx } from "@/utils/cx";
import type { Skill } from "@/types/learn";

interface SkillCardProps {
  skillId: string;
  onClick?: () => void;
  showActions?: boolean;
  className?: string;
}

export function SkillCard({ skillId, onClick, showActions = true, className }: SkillCardProps) {
  const { getSkillProgress, removeSkill, toggleBookmark, markComplete } = useLearn();
  const skill = getSkillById(skillId);
  const progress = getSkillProgress(skillId);

  if (!skill) {
    return null;
  }

  const isCompleted = progress?.status === "completed";
  const isBookmarked = progress?.bookmarked || false;
  const progressValue = progress?.progress || 0;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeSkill(skillId);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(skillId);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    markComplete(skillId);
  };

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

  return (
    <div
      onClick={onClick}
      className={cx(
        "group relative flex flex-col gap-3 p-4 rounded-xl border border-secondary bg-primary",
        "hover:border-border-primary hover:shadow-md transition-all cursor-pointer",
        isCompleted && "bg-utility-success-50/50 border-utility-success-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-primary line-clamp-2 group-hover:text-utility-brand-600 transition-colors">
            {skill.name}
          </h3>
          <p className="text-xs text-tertiary mt-1 line-clamp-2">
            {skill.description}
          </p>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleBookmark}
              className={cx(
                "p-1.5 rounded-md transition-colors",
                "hover:bg-secondary",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              )}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="size-4 text-utility-brand-600" />
              ) : (
                <Bookmark className="size-4 text-tertiary" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className={cx(
                "p-1.5 rounded-md transition-colors",
                "hover:bg-secondary",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              )}
              aria-label="Remove from learning"
            >
              <X className="size-4 text-tertiary" />
            </button>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge type="pill-color" size="sm" color={getCategoryColor(skill.category)}>
          {skill.category}
        </Badge>
        <Badge type="pill-color" size="sm" color={getDifficultyColor(skill.difficulty)}>
          {skill.difficulty}
        </Badge>
        {skill.estimatedTime && (
          <div className="flex items-center gap-1 text-xs text-tertiary">
            <Clock className="size-3" />
            <span>{skill.estimatedTime} min</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {progress && progressValue > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-tertiary">Progress</span>
            <span className="text-xs font-medium text-primary">{progressValue}%</span>
          </div>
          <ProgressBar value={progressValue} size="sm" />
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="flex items-center gap-2 text-xs text-utility-success-600">
          <CheckCircle className="size-4" />
          <span className="font-medium">Completed</span>
        </div>
      )}

      {/* Action Button */}
      {showActions && !isCompleted && progress && (
        <Button
          size="sm"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleComplete(e);
          }}
          className="w-full mt-1"
        >
          Mark Complete
        </Button>
      )}
    </div>
  );
}

