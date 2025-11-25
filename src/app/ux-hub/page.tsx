"use client";

import { useMemo } from "react";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { Tabs, TabList, Tab, TabPanel } from "@/components/application/tabs/tabs";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

type PersonaId = "busy-professional" | "health-enthusiast" | "aspiring-home-chef";

const personas: Array<{
  id: PersonaId;
  name: string;
  tagline: string;
  goals: string[];
  pains: string[];
  behaviors: string[];
}> = [
  {
    id: "busy-professional",
    name: "Busy Professional",
    tagline: "Wants healthy food without spending all night in the kitchen.",
    goals: [
      "Plan a week of meals in a few minutes",
      "Reuse ingredients already in the kitchen",
      "Avoid decision fatigue at the end of the day",
    ],
    pains: [
      "Limited time to cook or plan",
      "Forgets what is already in the fridge",
      "Overwhelmed by too many recipe options",
    ],
    behaviors: [
      "Uses meal planning and shopping list together",
      "Filters recipes by time and ingredients on hand",
      "Prefers quick, repeatable flows over deep customization",
    ],
  },
  {
    id: "health-enthusiast",
    name: "Health Enthusiast",
    tagline: "Optimizes meals for macros, energy, and long‑term habits.",
    goals: [
      "Hit macro and calorie targets consistently",
      "Follow structured diet plans",
      "Track streaks and progress over time",
    ],
    pains: [
      "Hard to see nutrition impact of daily choices",
      "Difficult to stick to a plan without feedback",
      "Juggling multiple tools for tracking and recipes",
    ],
    behaviors: [
      "Uses diet plans and recipe filters (calories, diet type)",
      "Checks stats and streaks regularly",
      "Prefers repeatable, predictable recipes",
    ],
  },
  {
    id: "aspiring-home-chef",
    name: "Aspiring Home Chef",
    tagline: "Treats cooking as a craft and wants to level up skills.",
    goals: [
      "Explore new cuisines and techniques",
      "Get better at timing and multi‑tasking in the kitchen",
      "Build a personal recipe collection",
    ],
    pains: [
      "Intimidated by complex recipes",
      "Hard to translate recipes into a real‑time cooking flow",
      "Doesn’t remember what they learned last time",
    ],
    behaviors: [
      "Spends time in Cooking Mode and Learn pages",
      "Creates and refines custom recipes",
      "Uses voice control and step guidance while cooking",
    ],
  },
];

const flows: Array<{
  id: string;
  name: string;
  route: string;
  summary: string;
  keySteps: string[];
  personas: PersonaId[];
}> = [
  {
    id: "meal-planning",
    name: "Meal Planning",
    route: "/",
    summary:
      "Plan breakfast, lunch, and dinner on the overview timeline, then generate a shopping list from those choices.",
    keySteps: [
      "Pick a day on the overview timeline",
      "Add or replace meals for each slot",
      "Search or filter meals, then confirm",
      "Review planned meals and mark them as done",
    ],
    personas: ["busy-professional", "health-enthusiast"],
  },
  {
    id: "recipe-discovery",
    name: "Recipe Discovery",
    route: "/recipes",
    summary:
      "Browse the catalog of recipes and diet plans with rich filtering, then send selected meals into the meal plan.",
    keySteps: [
      "Choose between Recipes and Diet Plans tabs",
      "Apply filters such as cuisine, calories, cooking time, or diet goal",
      "Favorite and add recipes or plans to the meal planner",
    ],
    personas: ["busy-professional", "health-enthusiast", "aspiring-home-chef"],
  },
  {
    id: "kitchen-inventory",
    name: "Kitchen Inventory",
    route: "/my-kitchen",
    summary:
      "Maintain a live inventory of ingredients and equipment, including smart capture from photos or camera.",
    keySteps: [
      "Search and filter stock by storage area or status",
      "Add items manually, from uploaded photos, or via camera",
      "Remove, edit, or clear items as they are used",
    ],
    personas: ["busy-professional", "health-enthusiast"],
  },
  {
    id: "cooking-mode",
    name: "Cooking Mode",
    route: "/cooking-mode/[recipeId]",
    summary:
      "Run a single recipe as a guided experience with ingredient review, step navigation, and voice control.",
    keySteps: [
      "Review ingredients and substitutions before starting",
      "Follow normalized steps one by one",
      "Use timers, voice commands, and ingredient sidebar during cooking",
    ],
    personas: ["aspiring-home-chef", "busy-professional"],
  },
  {
    id: "learning",
    name: "Learning",
    route: "/learn",
    summary:
      "Track and grow cooking skills through lessons, categories, and progress metrics.",
    keySteps: [
      "Browse skills by status, category, or difficulty",
      "Open skill detail modals to learn concepts",
      "Watch progress and stats over time",
    ],
    personas: ["aspiring-home-chef", "health-enthusiast"],
  },
  {
    id: "stats-gamification",
    name: "Stats & Gamification",
    route: "/stats",
    summary:
      "See nutrition trends, streaks, and progress visualized over time.",
    keySteps: [
      "Pick a date from the calendar stripe",
      "Inspect macro breakdowns and trends",
      "Review XP, level, and streak status",
    ],
    personas: ["health-enthusiast"],
  },
  {
    id: "custom-recipes",
    name: "Custom Recipe Creation",
    route: "/recipes/my-recipes",
    summary:
      "Capture personal recipes either manually or via imports, then reuse them in the planner and Cooking Mode.",
    keySteps: [
      "Open My Recipes and start the creator",
      "Import via URL, image, or video, or enter details manually",
      "Adjust ingredients, instructions, and nutrition before saving",
    ],
    personas: ["aspiring-home-chef"],
  },
];

type SitemapNode = {
  label: string;
  path?: string;
  children?: SitemapNode[];
};

const sitemapTree: SitemapNode[] = [
  {
    label: "Overview",
    path: "/",
    children: [
      {
        label: "Meal Planning Card",
        children: [
          { label: "Empty State" },
          { label: "Planned State" },
          { label: "Adding Meal State" },
        ],
      },
      { label: "Shopping List Widget" },
      { label: "Kitchen Snapshot Widget" },
    ],
  },
  {
    label: "Recipes",
    path: "/recipes",
    children: [
      {
        label: "Recipes Tab",
        children: [
          { label: "Filters Bar" },
          { label: "Recipe Grid" },
          { label: "Add to Meal Plan actions" },
        ],
      },
      {
        label: "Diet Plans Tab",
        children: [
          { label: "Plan Filters (goals)" },
          { label: "Diet Plan Details Modal" },
        ],
      },
    ],
  },
  {
    label: "My Recipes",
    path: "/recipes/my-recipes",
    children: [
      { label: "Custom Recipe Grid / Empty State" },
      { label: "Recipe Creator Modal" },
    ],
  },
  {
    label: "Cooking Mode",
    path: "/cooking-mode/[recipeId]",
    children: [
      { label: "Ingredient Review Screen" },
      { label: "Cooking Steps View" },
      { label: "Voice Control & Timers" },
    ],
  },
  {
    label: "My Kitchen",
    path: "/my-kitchen",
    children: [
      {
        label: "My Stock Tab",
        children: [
          { label: "Filters (storage, expiring soon, healthy)" },
          { label: "Photo Upload Modal" },
          { label: "Camera Capture Panel" },
        ],
      },
      { label: "My Equipment Tab" },
    ],
  },
  {
    label: "Learn",
    path: "/learn",
    children: [
      { label: "My Learning Tab" },
      { label: "Discover Tab" },
      { label: "Categories Tab" },
      { label: "Skill Detail Modal" },
    ],
  },
  {
    label: "Stats",
    path: "/stats",
    children: [
      { label: "Calendar Stripe" },
      { label: "Macro Dashboard" },
      { label: "Gamification Panel" },
      { label: "3D Character Scene" },
    ],
  },
  {
    label: "Calendar",
    path: "/calendar",
    children: [
      { label: "Day View" },
      { label: "Week View" },
      { label: "Month View" },
    ],
  },
];

export default function UxHubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <AppHeader />
      <main className="flex-1 pb-16">
        <section className="border-b border-secondary bg-primary/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-container flex-col gap-3 px-4 py-6 md:px-8">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">UX Hub</h1>
              <p className="text-sm text-primary-foreground/70">
                Internal view of how Yumlet hangs together: key user flows, personas, and a sitemap of the product.
              </p>
            </div>
            <Tabs defaultSelectedKey="flows">
              <TabList type="button-brand" size="sm" items={[]}>
                <Tab id="flows">User Flows</Tab>
                <Tab id="personas">Personas</Tab>
                <Tab id="sitemap">Sitemap</Tab>
                <Tab id="suggested">Suggested Features</Tab>
              </TabList>

              <TabPanel id="flows">
                <FlowsTab />
              </TabPanel>
              <TabPanel id="personas">
                <PersonasTab />
              </TabPanel>
              <TabPanel id="sitemap">
                <SitemapTab />
              </TabPanel>
              <TabPanel id="suggested">
                <SuggestedFeaturesTab />
              </TabPanel>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}

function PersonaBadge({ id }: { id: PersonaId }) {
  const persona = personas.find((p) => p.id === id);
  if (!persona) return null;
  const colorMap: Record<PersonaId, "blue" | "success" | "purple"> = {
    "busy-professional": "blue",
    "health-enthusiast": "success",
    "aspiring-home-chef": "purple",
  };
  return (
    <Badge
      type="pill-color"
      size="sm"
      color={colorMap[id]}
      className="whitespace-nowrap"
    >
      {persona.name}
    </Badge>
  );
}

function FlowsTab() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {flows.map((flow) => (
        <article
          key={flow.id}
          className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-primary-foreground">
                {flow.name}
              </h2>
              <p className="text-xs text-tertiary">{flow.route}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {flow.personas.map((personaId) => (
                <PersonaBadge key={personaId} id={personaId} />
              ))}
            </div>
          </div>
          <p className="text-xs text-tertiary">{flow.summary}</p>
          <ul className="mt-1 space-y-1.5">
            {flow.keySteps.map((step, index) => (
              <li
                key={index}
                className="text-xs text-primary-foreground/80 leading-relaxed"
              >
                <span className="mr-1 text-tertiary">•</span>
                {step}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function PersonasTab() {
  const flowsByPersona: Record<PersonaId, string[]> = {
    "busy-professional": flows
      .filter((f) => f.personas.includes("busy-professional"))
      .map((f) => f.name),
    "health-enthusiast": flows
      .filter((f) => f.personas.includes("health-enthusiast"))
      .map((f) => f.name),
    "aspiring-home-chef": flows
      .filter((f) => f.personas.includes("aspiring-home-chef"))
      .map((f) => f.name),
  };

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {personas.map((persona) => (
        <article
          key={persona.id}
          className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4"
        >
          <div>
            <h2 className="text-sm font-semibold text-primary-foreground">
              {persona.name}
            </h2>
            <p className="text-xs text-tertiary">{persona.tagline}</p>
          </div>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-tertiary uppercase">
              Goals
            </h3>
            <ul className="space-y-1">
              {persona.goals.map((goal, index) => (
                <li key={index} className="text-xs text-primary-foreground/80">
                  • {goal}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-tertiary uppercase">
              Frictions
            </h3>
            <ul className="space-y-1">
              {persona.pains.map((pain, index) => (
                <li key={index} className="text-xs text-primary-foreground/80">
                  • {pain}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-tertiary uppercase">
              Behaviors in Yumlet
            </h3>
            <ul className="space-y-1">
              {persona.behaviors.map((behavior, index) => (
                <li key={index} className="text-xs text-primary-foreground/80">
                  • {behavior}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-tertiary uppercase">
              Primary Flows
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {flowsByPersona[persona.id].map((flowName) => (
                <span
                  key={flowName}
                  className={cx(
                    "rounded-full border border-secondary bg-primary px-2 py-0.5 text-[10px] text-tertiary"
                  )}
                >
                  {flowName}
                </span>
              ))}
            </div>
          </section>
        </article>
      ))}
    </div>
  );
}

function SitemapTab() {
  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-xl border border-secondary bg-primary p-4">
        <p className="text-xs text-tertiary">
          Visual map of Yumlet&apos;s pages and key states. The diagram shows navigation
          relationships; the cards below summarize the same information in a compact grid.
        </p>
      </div>

      <div className="rounded-2xl border border-secondary bg-primary/80 p-2 md:p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">
            Interactive Sitemap Diagram
          </p>
          <p className="text-[10px] text-tertiary">
            Scroll, drag, and zoom to explore the structure.
          </p>
        </div>
        <div className="h-[420px] w-full overflow-hidden rounded-xl bg-primary">
          <SitemapDiagram />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sitemapTree.map((node) => (
          <article
            key={node.label}
            className="flex flex-col gap-3 rounded-2xl border border-secondary bg-primary p-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-primary-foreground">
                  {node.label}
                </h2>
                {node.path && (
                  <p className="mt-0.5 text-[11px] text-tertiary">{node.path}</p>
                )}
              </div>
              <Badge size="sm" color="gray">
                Page
              </Badge>
            </div>

            {node.children && node.children.length > 0 && (
              <div className="space-y-2">
                {node.children.map((child) => (
                  <div
                    key={child.label}
                    className="rounded-lg border border-secondary/60 bg-primary/80 p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">
                        {child.label}
                      </span>
                      {child.children && child.children.length > 0 && (
                        <span className="text-[10px] text-tertiary/80">
                          {child.children.length} states
                        </span>
                      )}
                    </div>
                    {child.children && child.children.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {child.children.map((grandchild) => (
                          <span
                            key={grandchild.label}
                            className="rounded-full bg-quaternary/60 px-2 py-0.5 text-[10px] text-primary-foreground/90"
                          >
                            {grandchild.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function SuggestedFeaturesTab() {
  const featuresByFlow: Record<
    string,
    { title: string; description: string }[]
  > = {
    "meal-planning": [
      {
        title: "AI Weekly Plan Draft",
        description:
          "Generate a full week of meals in one click based on kitchen stock, calories, and time budget.",
      },
      {
        title: "Smart Leftover Suggestions",
        description:
          "Detect leftover ingredients in the kitchen and suggest ways to reuse them in upcoming meals.",
      },
      {
        title: "Conflict Warnings",
        description:
          "Surface alerts when the same heavy dish appears too many times in a short period.",
      },
      {
        title: "Prep Batch Mode",
        description:
          "Highlight recipes that share prep steps so users can batch chop or cook components.",
      },
      {
        title: "Calendar Sync",
        description:
          "Sync planned meals to external calendars with reminders before cooking time.",
      },
    ],
    "recipe-discovery": [
      {
        title: "Taste Profile Filters",
        description:
          "Filter recipes by taste dimensions (spicy, savory, fresh, comfort) learned from past likes.",
      },
      {
        title: "Ingredient Swap Hints",
        description:
          "Show common substitutions inline on recipe cards based on kitchen items.",
      },
      {
        title: "Session-Based Discovery",
        description:
          "Group browsing sessions so users can quickly revisit shortlists from a previous night.",
      },
      {
        title: "Budget Slider",
        description:
          "Let users filter recipes by estimated cost per serving using ingredient price data.",
      },
      {
        title: "Cuisine Journey Paths",
        description:
          "Recommend themed weeks (e.g., 'Italian Week') that sequence recipes in a narrative.",
      },
    ],
    "kitchen-inventory": [
      {
        title: "Auto-Decay Freshness Meter",
        description:
          "Visual freshness scores that degrade over time to draw attention to at‑risk ingredients.",
      },
      {
        title: "Smart Restock Recommendations",
        description:
          "Suggest what to buy next based on historical usage and current meal plans.",
      },
      {
        title: "Pantry Zones",
        description:
          "Allow users to define custom zones (e.g., 'Snack Shelf') for more intuitive inventory.",
      },
      {
        title: "Barcode Scan Import",
        description:
          "Scan packaged goods to add quantity, brand, and nutrition data automatically.",
      },
      {
        title: "Shared Household Pantry",
        description:
          "Multi‑user kitchen lists that sync across roommates or family members.",
      },
    ],
    "cooking-mode": [
      {
        title: "Adaptive Step Timing",
        description:
          "Adjust step durations based on user’s historical pace and equipment (e.g., induction vs. gas).",
      },
      {
        title: "Multi‑Recipe Orchestration",
        description:
          "Run two recipes at once with a merged timeline so dishes finish together.",
      },
      {
        title: "Hands‑Free Branching",
        description:
          "Voice prompts that offer branches (e.g., crispier vs. softer outcome) mid‑flow.",
      },
      {
        title: "Safety Checkpoints",
        description:
          "Highlight critical food‑safety steps (temps, resting times) with extra emphasis.",
      },
      {
        title: "Live Troubleshooting Helper",
        description:
          "In‑flow tips when users report issues like 'sauce too thin' or 'pasta overcooked'.",
      },
    ],
    learning: [
      {
        title: "Skill Tracks",
        description:
          "Curated learning paths (e.g., 'Knife Skills 101') that bundle recipes and lessons.",
      },
      {
        title: "Micro‑Quizzes",
        description:
          "Lightweight checks after skills to reinforce concepts like doneness cues or seasoning.",
      },
      {
        title: "Contextual Skill Prompts",
        description:
          "Suggest relevant skills directly from recipe steps that introduce new techniques.",
      },
      {
        title: "Streak‑Aware Goals",
        description:
          "Weekly learning goals tied into the stats streak system to keep momentum.",
      },
      {
        title: "Skill Sharing",
        description:
          "Allow users to share their progress and favorite lessons with friends.",
      },
    ],
    "stats-gamification": [
      {
        title: "Goal Templates",
        description:
          "Ready‑made nutrition and habit goals (e.g., 'More Fiber Week') with tracking.",
      },
      {
        title: "What‑If Simulations",
        description:
          "Let users see how swapping a meal would affect macros and streaks before committing.",
      },
      {
        title: "Badge Collections",
        description:
          "Collectable badges for streaks, skills, and cuisines to deepen gamification.",
      },
      {
        title: "Weekly Story Recap",
        description:
          "Narrative recap cards explaining how the week went nutritionally and skill‑wise.",
      },
      {
        title: "Coach Nudges",
        description:
          "Contextual suggestions when trends drift (e.g., too few veggies over several days).",
      },
    ],
    "custom-recipes": [
      {
        title: "Template Library",
        description:
          "Starter templates for common patterns (sheet‑pan dinners, one‑pot soups, etc.).",
      },
      {
        title: "Smart Import Clean‑Up",
        description:
          "AI normalization of messy imported recipes into consistent ingredient and step formats.",
      },
      {
        title: "Version History",
        description:
          "Track iterations of a recipe as users tweak seasoning, timing, or techniques.",
      },
      {
        title: "Shareable Recipe Cards",
        description:
          "Beautiful share links or PDFs that keep Yumlet branding and cooking‑mode links.",
      },
      {
        title: "Collaborative Recipes",
        description:
          "Let multiple people co‑edit a recipe and comment on steps.",
      },
    ],
  };

  const featuresByPersona: Record<
    PersonaId,
    { title: string; description: string }[]
  > = {
    "busy-professional": [
      {
        title: "One‑Tap Auto Plan",
        description:
          "Generate a full week’s dinner plan constrained by time (e.g., under 25 minutes per night).",
      },
      {
        title: "Commute‑Aware Reminders",
        description:
          "Notifications timed to commute so they can decide 'cook vs. order in' with a suggested plan.",
      },
      {
        title: "Batch‑Cook Suggestions",
        description:
          "Highlight recipes that reheat well and reuse components for lunches.",
      },
      {
        title: "Meeting‑Safe Meals",
        description:
          "Tag recipes that are low‑mess and easy to eat between calls or while multitasking.",
      },
      {
        title: "Time Budget Overview",
        description:
          "Weekly view that sums expected cooking time across all planned meals.",
      },
    ],
    "health-enthusiast": [
      {
        title: "Macro Guardrails",
        description:
          "Live feedback while planning that shows when the week is skewing off macro targets.",
      },
      {
        title: "Goal‑Aligned Swaps",
        description:
          "Suggest nutritionally better alternatives when a meal pulls stats out of range.",
      },
      {
        title: "Micronutrient Highlights",
        description:
          "Call out iron, fiber, omega‑3, and other key nutrients for each day.",
      },
      {
        title: "Program‑Style Plans",
        description:
          "Multi‑week structured plans for goals like recomposition or gut health.",
      },
      {
        title: "Coach Chat Layer",
        description:
          "A guided Q&A about goals that directly nudges plan, recipes, and stats views.",
      },
    ],
    "aspiring-home-chef": [
      {
        title: "Technique Milestones",
        description:
          "Unlock new recipe difficulty tiers as users complete foundational skills.",
      },
      {
        title: "Chef’s Notebook",
        description:
          "Central place to store tasting notes, plating ideas, and timing tweaks per recipe.",
      },
      {
        title: "Guided Service Flow",
        description:
          "Hosting mode that coordinates multi‑course meals with plating cues.",
      },
      {
        title: "Flavor Pairing Explorer",
        description:
          "Suggest ingredient pairings and flavor families to experiment with.",
      },
      {
        title: "Practice Sessions",
        description:
          "Quick, low‑stakes drills (e.g., chopping onions in 5 minutes) tracked like workouts.",
      },
    ],
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-secondary bg-primary p-4">
        <h2 className="text-sm font-semibold text-primary-foreground">
          By User Flow
        </h2>
        <p className="mt-1 text-xs text-tertiary">
          Five concrete ideas per core flow, tuned to extend what already exists in the product.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <article
              key={flow.id}
              className="flex flex-col gap-2 rounded-xl border border-secondary bg-primary p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-primary-foreground">
                    {flow.name}
                  </h3>
                  <p className="text-[11px] text-tertiary">{flow.route}</p>
                </div>
              </div>
              <ul className="mt-1 space-y-1.5">
                {featuresByFlow[flow.id]?.map((f) => (
                  <li key={f.title} className="text-[11px] text-primary-foreground/90">
                    <span className="font-semibold">{f.title}.</span>{" "}
                    <span className="text-tertiary">{f.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-secondary bg-primary p-4">
        <h2 className="text-sm font-semibold text-primary-foreground">
          By Persona
        </h2>
        <p className="mt-1 text-xs text-tertiary">
          Ideas that deepen the relationship between Yumlet and each persona&apos;s goals.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <article
              key={persona.id}
              className="flex flex-col gap-2 rounded-xl border border-secondary bg-primary p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-primary-foreground">
                  {persona.name}
                </h3>
                <PersonaBadge id={persona.id} />
              </div>
              <ul className="mt-1 space-y-1.5">
                {featuresByPersona[persona.id].map((f) => (
                  <li key={f.title} className="text-[11px] text-primary-foreground/90">
                    <span className="font-semibold">{f.title}.</span>{" "}
                    <span className="text-tertiary">{f.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SitemapDiagram() {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let idCounter = 0;
    let row = 0;

    const xSpacing = 260;
    const ySpacing = 110;

    const traverse = (node: SitemapNode, depth: number, parentId?: string) => {
      const id = `n-${idCounter++}`;

      nodes.push({
        id,
        data: { label: node.label, path: node.path },
        position: {
          x: depth * xSpacing,
          y: row * ySpacing,
        },
        style: {
          padding: 8,
          borderRadius: 999,
          border: "1px solid rgba(148, 163, 184, 0.7)",
          background: "rgba(15, 23, 42, 0.96)",
          color: "#e5e7eb",
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: "nowrap",
        },
      });

      if (parentId) {
        edges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: "smoothstep",
          animated: false,
          style: { stroke: "rgba(148,163,184,0.7)", strokeWidth: 1.2 },
        });
      }

      const thisRow = row;
      row += 1;

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          traverse(child, depth + 1, id);
        });
      }

      return thisRow;
    };

    sitemapTree.forEach((root) => {
      traverse(root, 0, undefined);
    });

    return { nodes, edges };
  }, []);

  const nodeTypes = useMemo(
    () => ({
      default: (props: any) => {
        const { data } = props;
        return (
          <div className="rounded-full border border-secondary bg-primary px-3 py-1 shadow-xs">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-primary-foreground">
                {data.label}
              </span>
              {data.path && (
                <span className="text-[10px] text-tertiary">{data.path}</span>
              )}
            </div>
          </div>
        );
      },
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodeTypes={nodeTypes}
      fitViewOptions={{ padding: 0.2 }}
      panOnScroll
      minZoom={0.4}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={16} size={1} color="rgba(30,64,175,0.35)" />
      <MiniMap
        pannable
        zoomable
        nodeColor={() => "#38bdf8"}
        nodeStrokeColor={() => "#0ea5e9"}
        maskColor="rgba(15,23,42,0.8)"
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

