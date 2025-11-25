/**
 * use-learn Hook
 * Manages user learning progress and skill tracking
 */

import { useState, useEffect, useCallback } from "react";
import type { UserLearningProgress, LearningStatus } from "@/types/learn";

const STORAGE_KEY = "yumlet-learn-progress";

/**
 * Get all learning progress from localStorage
 */
function getStoredProgress(): Record<string, UserLearningProgress> {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading learning progress from localStorage:", error);
    return {};
  }
}

/**
 * Save learning progress to localStorage
 */
function saveProgress(progress: Record<string, UserLearningProgress>): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving learning progress to localStorage:", error);
  }
}

export function useLearn() {
  // Start empty on both server and client to avoid hydration mismatches,
  // then hydrate from localStorage on the client.
  const [progress, setProgress] = useState<Record<string, UserLearningProgress>>({});

  // Sync with localStorage on mount (client only)
  useEffect(() => {
    setProgress(getStoredProgress());
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  /**
   * Add a skill to user's learning list
   */
  const addSkill = useCallback((skillId: string) => {
    setProgress(prev => {
      // Don't add if already exists
      if (prev[skillId]) {
        return prev;
      }
      
      return {
        ...prev,
        [skillId]: {
          skillId,
          status: "not-started",
          progress: 0,
          lastAccessed: new Date().toISOString(),
          bookmarked: false,
        },
      };
    });
  }, []);

  /**
   * Remove a skill from user's learning list
   */
  const removeSkill = useCallback((skillId: string) => {
    setProgress(prev => {
      const updated = { ...prev };
      delete updated[skillId];
      return updated;
    });
  }, []);

  /**
   * Update progress for a skill
   */
  const updateProgress = useCallback((skillId: string, newProgress: number) => {
    setProgress(prev => {
      const existing = prev[skillId];
      if (!existing) {
        // Create new entry if it doesn't exist
        return {
          ...prev,
          [skillId]: {
            skillId,
            status: newProgress >= 100 ? "completed" : newProgress > 0 ? "in-progress" : "not-started",
            progress: Math.max(0, Math.min(100, newProgress)),
            lastAccessed: new Date().toISOString(),
            completedAt: newProgress >= 100 ? new Date().toISOString() : undefined,
            bookmarked: false,
          },
        };
      }

      return {
        ...prev,
        [skillId]: {
          ...existing,
          progress: Math.max(0, Math.min(100, newProgress)),
          status: newProgress >= 100 ? "completed" : newProgress > 0 ? "in-progress" : "not-started",
          lastAccessed: new Date().toISOString(),
          completedAt: newProgress >= 100 && !existing.completedAt ? new Date().toISOString() : existing.completedAt,
        },
      };
    });
  }, []);

  /**
   * Mark a skill as complete
   */
  const markComplete = useCallback((skillId: string) => {
    updateProgress(skillId, 100);
  }, [updateProgress]);

  /**
   * Update skill status
   */
  const updateStatus = useCallback((skillId: string, status: LearningStatus) => {
    setProgress(prev => {
      const existing = prev[skillId];
      if (!existing) {
        return {
          ...prev,
          [skillId]: {
            skillId,
            status,
            progress: status === "completed" ? 100 : status === "in-progress" ? 50 : 0,
            lastAccessed: new Date().toISOString(),
            completedAt: status === "completed" ? new Date().toISOString() : undefined,
            bookmarked: false,
          },
        };
      }

      return {
        ...prev,
        [skillId]: {
          ...existing,
          status,
          progress: status === "completed" ? 100 : existing.progress,
          completedAt: status === "completed" && !existing.completedAt ? new Date().toISOString() : existing.completedAt,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, []);

  /**
   * Toggle bookmark status
   */
  const toggleBookmark = useCallback((skillId: string) => {
    setProgress(prev => {
      const existing = prev[skillId];
      if (!existing) {
        return {
          ...prev,
          [skillId]: {
            skillId,
            status: "not-started",
            progress: 0,
            lastAccessed: new Date().toISOString(),
            bookmarked: true,
          },
        };
      }

      return {
        ...prev,
        [skillId]: {
          ...existing,
          bookmarked: !existing.bookmarked,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, []);

  /**
   * Update notes for a skill
   */
  const updateNotes = useCallback((skillId: string, notes: string) => {
    setProgress(prev => {
      const existing = prev[skillId];
      if (!existing) {
        return {
          ...prev,
          [skillId]: {
            skillId,
            status: "not-started",
            progress: 0,
            lastAccessed: new Date().toISOString(),
            notes,
            bookmarked: false,
          },
        };
      }

      return {
        ...prev,
        [skillId]: {
          ...existing,
          notes,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, []);

  /**
   * Get user's skills (all skills in progress)
   */
  const getUserSkills = useCallback((): string[] => {
    return Object.keys(progress);
  }, [progress]);

  /**
   * Get progress for a specific skill
   */
  const getSkillProgress = useCallback((skillId: string): UserLearningProgress | null => {
    return progress[skillId] || null;
  }, [progress]);

  /**
   * Check if a skill is saved/being learned
   */
  const isSkillSaved = useCallback((skillId: string): boolean => {
    return skillId in progress;
  }, [progress]);

  /**
   * Get skills by status
   */
  const getSkillsByStatus = useCallback((status: LearningStatus): string[] => {
    return Object.entries(progress)
      .filter(([_, prog]) => prog.status === status)
      .map(([skillId]) => skillId);
  }, [progress]);

  /**
   * Get bookmarked skills
   */
  const getBookmarkedSkills = useCallback((): string[] => {
    return Object.entries(progress)
      .filter(([_, prog]) => prog.bookmarked)
      .map(([skillId]) => skillId);
  }, [progress]);

  /**
   * Get learning statistics
   */
  const getStats = useCallback(() => {
    const skills = Object.values(progress);
    return {
      total: skills.length,
      inProgress: skills.filter(s => s.status === "in-progress").length,
      completed: skills.filter(s => s.status === "completed").length,
      bookmarked: skills.filter(s => s.bookmarked).length,
      averageProgress: skills.length > 0
        ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length)
        : 0,
    };
  }, [progress]);

  return {
    progress,
    addSkill,
    removeSkill,
    updateProgress,
    markComplete,
    updateStatus,
    toggleBookmark,
    updateNotes,
    getUserSkills,
    getSkillProgress,
    isSkillSaved,
    getSkillsByStatus,
    getBookmarkedSkills,
    getStats,
  };
}

