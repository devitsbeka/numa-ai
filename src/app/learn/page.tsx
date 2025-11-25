"use client";

import { useState, useMemo } from "react";
import { SearchLg, Filter01 } from "@untitledui/icons";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { Tab, TabList, Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { ProgressDashboard } from "@/components/learn/progress-dashboard";
import { SkillCard } from "@/components/learn/skill-card";
import { SkillDetailModal } from "@/components/learn/skill-detail-modal";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { useLearn } from "@/hooks/use-learn";
import { COOKING_SKILLS, getSkillsByCategory } from "@/data/cooking-skills";
import { cx } from "@/utils/cx";
import type { Skill, SkillCategory, SkillDifficulty } from "@/types/learn";

type TabType = "my-learning" | "discover" | "categories";

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my-learning");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<SkillDifficulty | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in-progress" | "completed" | "bookmarked">("all");

  const {
    getUserSkills,
    getSkillProgress,
    isSkillSaved,
    getSkillsByStatus,
    getBookmarkedSkills,
    getStats,
  } = useLearn();

  // Get user's saved skills
  const userSkillIds = getUserSkills();
  const userSkills = userSkillIds
    .map(id => COOKING_SKILLS.find(s => s.id === id))
    .filter((s): s is Skill => s !== undefined);

  // Filter skills based on search and filters
  const filteredSkills = useMemo(() => {
    let skills: Skill[] = [];

    if (activeTab === "my-learning") {
      skills = userSkills;
      
      // Apply status filter
      if (statusFilter === "in-progress") {
        const inProgressIds = getSkillsByStatus("in-progress");
        skills = skills.filter(s => inProgressIds.includes(s.id));
      } else if (statusFilter === "completed") {
        const completedIds = getSkillsByStatus("completed");
        skills = skills.filter(s => completedIds.includes(s.id));
      } else if (statusFilter === "bookmarked") {
        const bookmarkedIds = getBookmarkedSkills();
        skills = skills.filter(s => bookmarkedIds.includes(s.id));
      }
    } else if (activeTab === "discover") {
      skills = COOKING_SKILLS;
    } else {
      // Categories tab - show all skills grouped by category
      skills = COOKING_SKILLS;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      skills = skills.filter(
        skill =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      skills = skills.filter(skill => skill.category === categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      skills = skills.filter(skill => skill.difficulty === difficultyFilter);
    }

    return skills;
  }, [
    activeTab,
    userSkills,
    searchQuery,
    categoryFilter,
    difficultyFilter,
    statusFilter,
    getSkillsByStatus,
    getBookmarkedSkills,
  ]);

  const stats = getStats();

  const categories: SkillCategory[] = ["technique", "nutrition", "health", "ingredient", "equipment"];

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <AppHeader />
      
      <main className="flex-1 pb-12">
        {/* Header Section */}
        <div className="sticky top-0 z-40 border-b border-secondary bg-primary/90 backdrop-blur-md">
          <div className="flex w-full items-center justify-center py-4">
            <div className="flex w-full max-w-container flex-col gap-4 px-4 md:px-8">
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground mb-1">Learn</h1>
                <p className="text-sm text-primary-foreground/60">
                  Master cooking skills, techniques, and nutrition knowledge
                </p>
              </div>

              {/* Tabs */}
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as TabType)}
              >
                <TabList type="button-brand" size="sm">
                  <Tab id="my-learning">My Learning</Tab>
                  <Tab id="discover">Discover</Tab>
                  <Tab id="categories">Categories</Tab>
                </TabList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Progress Dashboard */}
        {activeTab === "my-learning" && stats.total > 0 && (
          <div className="border-b border-secondary bg-primary">
            <div className="flex w-full items-center justify-center py-6">
              <div className="w-full max-w-container px-4 md:px-8">
                <ProgressDashboard />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="sticky top-[140px] z-30 border-b border-secondary bg-primary/90 backdrop-blur-md">
          <div className="flex w-full items-center justify-center py-3">
            <div className="flex w-full max-w-container items-center gap-3 px-4 md:px-8">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search skills..."
                  icon={SearchLg}
                  size="md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {activeTab === "discover" && (
                <>
                  <Select
                    selectedKey={categoryFilter}
                    onSelectionChange={(key) => setCategoryFilter(key as SkillCategory | "all")}
                    placeholder="Category"
                    size="md"
                    items={[
                      { id: "all", label: "All Categories" },
                      ...categories.map(cat => ({
                        id: cat,
                        label: cat.charAt(0).toUpperCase() + cat.slice(1),
                      })),
                    ]}
                  >
                    {(item) => <Select.Item key={item.id} id={item.id}>{item.label}</Select.Item>}
                  </Select>
                  
                  <Select
                    selectedKey={difficultyFilter}
                    onSelectionChange={(key) => setDifficultyFilter(key as SkillDifficulty | "all")}
                    placeholder="Difficulty"
                    size="md"
                    items={[
                      { id: "all", label: "All Difficulties" },
                      { id: "beginner", label: "Beginner" },
                      { id: "intermediate", label: "Intermediate" },
                      { id: "advanced", label: "Advanced" },
                    ]}
                  >
                    {(item) => <Select.Item key={item.id} id={item.id}>{item.label}</Select.Item>}
                  </Select>
                </>
              )}

              {activeTab === "my-learning" && (
                <Select
                  selectedKey={statusFilter}
                  onSelectionChange={(key) => setStatusFilter(key as typeof statusFilter)}
                  placeholder="Status"
                  size="md"
                  items={[
                    { id: "all", label: "All Status" },
                    { id: "in-progress", label: "In Progress" },
                    { id: "completed", label: "Completed" },
                    { id: "bookmarked", label: "Bookmarked" },
                  ]}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-container px-4 md:px-8 py-6">
            {activeTab === "categories" ? (
              // Categories View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => {
                  const categorySkills = getSkillsByCategory(category);
                  const userCategorySkills = categorySkills.filter(s => isSkillSaved(s.id));
                  
                  return (
                    <div
                      key={category}
                      onClick={() => {
                        setActiveTab("discover");
                        setCategoryFilter(category);
                      }}
                      className="flex flex-col gap-3 p-6 rounded-xl border border-secondary bg-primary hover:border-border-primary hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-primary capitalize">
                        {category}
                      </h3>
                      <p className="text-sm text-tertiary">
                        {categorySkills.length} skills available
                      </p>
                      {userCategorySkills.length > 0 && (
                        <p className="text-xs text-utility-brand-600">
                          {userCategorySkills.length} in your learning
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : filteredSkills.length === 0 ? (
              // Empty State
              <EmptyState
                title={
                  activeTab === "my-learning"
                    ? "No skills yet"
                    : searchQuery
                    ? "No skills found"
                    : "Start learning"
                }
                description={
                  activeTab === "my-learning"
                    ? "Add skills from recipes or browse the Discover tab to start your learning journey."
                    : searchQuery
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Click on cooking terms in recipes to learn new skills, or browse the Discover tab."
                }
              />
            ) : (
              // Skills Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSkills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skillId={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    showActions={activeTab === "my-learning" || isSkillSaved(skill.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Skill Detail Modal */}
      <SkillDetailModal
        skillId={selectedSkillId}
        isOpen={selectedSkillId !== null}
        onClose={() => setSelectedSkillId(null)}
      />
    </div>
  );
}

