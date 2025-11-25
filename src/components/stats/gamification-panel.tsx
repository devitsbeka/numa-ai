"use client";

import { cx } from "@/utils/cx";
import { Badge } from "@/components/base/badges/badges";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedDate?: string;
}

interface GamificationPanelProps {
    level?: number;
    xp?: number;
    xpToNextLevel?: number;
    streak?: number;
    achievements?: Achievement[];
    className?: string;
}

const defaultAchievements: Achievement[] = [
    { id: "1", name: "First Steps", description: "Log your first meal", icon: "🎯", unlocked: true, unlockedDate: "2024-01-15" },
    { id: "2", name: "Week Warrior", description: "Complete 7 days in a row", icon: "🔥", unlocked: true, unlockedDate: "2024-01-22" },
    { id: "3", name: "Protein Power", description: "Hit protein goal 5 days", icon: "💪", unlocked: true, unlockedDate: "2024-01-20" },
    { id: "4", name: "Month Master", description: "Complete 30 days", icon: "⭐", unlocked: false },
    { id: "5", name: "Macro Master", description: "Hit all macro goals for a week", icon: "🏆", unlocked: false },
    { id: "6", name: "Century Club", description: "100 day streak", icon: "💯", unlocked: false },
];

export const GamificationPanel = ({
    level = 5,
    xp = 1250,
    xpToNextLevel = 2000,
    streak = 12,
    achievements = defaultAchievements,
    className,
}: GamificationPanelProps) => {
    const levelProgress = (xp / xpToNextLevel) * 100;
    const unlockedAchievements = achievements.filter((a) => a.unlocked);
    const lockedAchievements = achievements.filter((a) => !a.unlocked);

    return (
        <div className={cx("flex flex-col gap-6", className)}>
            {/* Level Progress */}
            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary">Level Progress</h3>
                    <Badge color="brand" size="md">
                        Level {level}
                    </Badge>
                </div>
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-tertiary">XP: {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()}</span>
                    <span className="font-semibold text-utility-brand-600">{Math.round(levelProgress)}%</span>
                </div>
                <div className="relative h-4 overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-utility-brand-600 to-utility-success-600 transition-all duration-500"
                        style={{ width: `${levelProgress}%` }}
                    >
                        <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Streak Display */}
            <div className="rounded-2xl border border-secondary bg-gradient-to-br from-utility-success-600/10 to-utility-success-600/5 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-tertiary">Current Streak</div>
                        <div className="mt-1 text-3xl font-bold text-utility-success-600">{streak} days</div>
                        <div className="mt-2 text-xs text-tertiary">Keep it up! 🔥</div>
                    </div>
                    <div className="text-5xl">🔥</div>
                </div>
            </div>

            {/* Achievements */}
            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <h3 className="mb-4 text-lg font-semibold text-primary">Achievements</h3>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {unlockedAchievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className="group relative overflow-hidden rounded-xl border border-utility-success-600/50 bg-utility-success-600/10 p-4 transition-all hover:border-utility-success-600 hover:shadow-lg"
                        >
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="text-3xl">{achievement.icon}</div>
                                <div className="text-sm font-semibold text-primary">{achievement.name}</div>
                                <div className="text-xs text-tertiary">{achievement.description}</div>
                                {achievement.unlockedDate && (
                                    <div className="mt-1 text-xs text-utility-success-600">
                                        {new Date(achievement.unlockedDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {lockedAchievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className="group relative overflow-hidden rounded-xl border border-secondary bg-secondary/50 p-4 opacity-60 grayscale transition-all hover:opacity-80"
                        >
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="text-3xl">{achievement.icon}</div>
                                <div className="text-sm font-semibold text-tertiary">{achievement.name}</div>
                                <div className="text-xs text-tertiary">{achievement.description}</div>
                                <div className="mt-1 text-xs text-tertiary">Locked</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

