/**
 * Learn Tab Type Definitions
 * Types for cooking skills, learning progress, and user learning data
 */

export type SkillCategory = "technique" | "nutrition" | "health" | "ingredient" | "equipment";

export type SkillDifficulty = "beginner" | "intermediate" | "advanced";

export type LearningStatus = "not-started" | "in-progress" | "completed";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: SkillCategory;
  description: string;
  content: string; // Detailed lesson content (can be markdown or HTML)
  difficulty: SkillDifficulty;
  relatedSkills?: string[]; // Array of skill IDs
  videoUrl?: string;
  imageUrl?: string;
  estimatedTime: number; // Minutes to learn
}

export interface UserLearningProgress {
  skillId: string;
  status: LearningStatus;
  progress: number; // 0-100
  lastAccessed: string; // ISO date string
  completedAt?: string; // ISO date string
  notes?: string;
  bookmarked: boolean;
}

export interface CookingTerm {
  term: string;
  skillId: string;
  variations?: string[]; // Alternative forms of the term (e.g., "chop", "chopped", "chopping")
}

