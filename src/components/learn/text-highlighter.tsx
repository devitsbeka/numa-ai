"use client";

import { useState, useMemo } from "react";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { Tooltip as AriaTooltip, TooltipTrigger as AriaTooltipTrigger } from "react-aria-components";
import { Button as AriaButton } from "react-aria-components";
import { findCookingTerms } from "@/data/cooking-terms";
import { getSkillById } from "@/data/cooking-skills";
import { useLearn } from "@/hooks/use-learn";
import { useRouter } from "next/navigation";
import { cx } from "@/utils/cx";
import type { Skill } from "@/types/learn";

interface TextHighlighterProps {
  text: string;
  className?: string;
  onSkillClick?: (skillId: string) => void;
}

interface TextSegment {
  type: "text" | "term";
  content: string;
  skillId?: string;
  index: number;
  length: number;
}

export function TextHighlighter({ text, className, onSkillClick }: TextHighlighterProps) {
  const router = useRouter();
  const { isSkillSaved, addSkill } = useLearn();
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  // Parse text and find cooking terms
  const segments = useMemo(() => {
    const matches = findCookingTerms(text);
    const segments: TextSegment[] = [];
    let lastIndex = 0;

    matches.forEach(match => {
      // Add text before the match
      if (match.index > lastIndex) {
        segments.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
          index: lastIndex,
          length: match.index - lastIndex,
        });
      }

      // Add the matched term
      segments.push({
        type: "term",
        content: match.term,
        skillId: match.skillId,
        index: match.index,
        length: match.length,
      });

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex),
        index: lastIndex,
        length: text.length - lastIndex,
      });
    }

    // If no matches, return the whole text as a single segment
    if (segments.length === 0) {
      segments.push({
        type: "text",
        content: text,
        index: 0,
        length: text.length,
      });
    }

    return segments;
  }, [text]);

  const handleTermClick = (skillId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onSkillClick) {
      onSkillClick(skillId);
    } else {
      // Default behavior: navigate to learn page with skill detail
      router.push(`/learn?skill=${skillId}`);
    }
  };

  const handleAddToLearning = (skillId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addSkill(skillId);
  };

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        const skill = segment.skillId ? getSkillById(segment.skillId) : null;
        const isSaved = segment.skillId ? isSkillSaved(segment.skillId) : false;

        if (!skill || !segment.skillId) {
          return <span key={index}>{segment.content}</span>;
        }

        return (
          <AriaTooltipTrigger
            key={index}
            delay={300}
            trigger="hover"
            onHoverChange={(isHovered) => {
              setHoveredSkillId(isHovered ? segment.skillId || null : null);
            }}
          >
            <button
              type="button"
              onClick={(e) => handleTermClick(segment.skillId!, e)}
              className={cx(
                "underline decoration-utility-brand-500/30 underline-offset-2",
                "hover:decoration-utility-brand-500 hover:text-utility-brand-600",
                "transition-colors cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              )}
              aria-label={`Learn about ${skill.name}`}
            >
              {segment.content}
            </button>
            <AriaTooltip
              placement="top"
              offset={8}
              className={({ isEntering, isExiting }) =>
                cx(
                  "z-50 max-w-xs",
                  isEntering && "ease-out animate-in fade-in zoom-in-95",
                  isExiting && "ease-in animate-out fade-out zoom-out-95"
                )
              }
            >
              {({ isEntering, isExiting }) => (
                <div
                  className={cx(
                    "flex flex-col gap-2 rounded-lg bg-primary-solid px-3 py-3 shadow-lg",
                    isEntering && "animate-in fade-in zoom-in-95",
                    isExiting && "animate-out fade-out zoom-out-95"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{skill.name}</span>
                      {skill.difficulty && (
                        <span className={cx(
                          "text-xs px-1.5 py-0.5 rounded",
                          skill.difficulty === "beginner" && "bg-utility-success-500/20 text-utility-success-300",
                          skill.difficulty === "intermediate" && "bg-utility-warning-500/20 text-utility-warning-300",
                          skill.difficulty === "advanced" && "bg-utility-error-500/20 text-utility-error-300"
                        )}>
                          {skill.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2">{skill.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                    <AriaButton
                      onPress={(e) => {
                        e.preventDefault();
                        handleTermClick(segment.skillId!, e as any);
                      }}
                      className="flex-1 px-2 py-1 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors outline-hidden"
                    >
                      Learn More
                    </AriaButton>
                    {!isSaved && (
                      <AriaButton
                        onPress={(e) => {
                          e.preventDefault();
                          handleAddToLearning(segment.skillId!, e as any);
                        }}
                        className="px-2 py-1 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors outline-hidden"
                        aria-label="Add to Learning"
                      >
                        + Add
                      </AriaButton>
                    )}
                  </div>
                </div>
              )}
            </AriaTooltip>
          </AriaTooltipTrigger>
        );
      })}
    </span>
  );
}

