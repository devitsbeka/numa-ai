"use client";

import { useState } from "react";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { CalendarStripe } from "@/components/stats/calendar-stripe";
import { CharacterScene } from "@/components/stats/character-scene";
import { MacroDashboard } from "@/components/stats/macro-dashboard";
import { GamificationPanel } from "@/components/stats/gamification-panel";
import { cx } from "@/utils/cx";

export default function StatsPage() {
    const [selectedDate, setSelectedDate] = useState<CalendarDate>(today(getLocalTimeZone()));
    
    // Mock data - in production, this would come from your data source
    const level = 5;
    const streak = 12;
    const xp = 1250;
    const xpToNextLevel = 2000;

    return (
        <div className="flex min-h-screen flex-col bg-primary">
            <AppHeader />
            
            <main className="flex-1 px-4 py-8 md:px-8">
                <div className="mx-auto w-full max-w-container">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary">My Stats</h1>
                        <p className="mt-2 text-tertiary">Track your nutrition journey and achievements</p>
                    </div>

                    {/* Calendar Stripe */}
                    <div className="mb-8 rounded-2xl border border-secondary bg-primary p-4">
                        <CalendarStripe selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                        {/* Left Column - Dashboard */}
                        <div className="flex flex-col gap-6">
                            <MacroDashboard />
                            <GamificationPanel level={level} xp={xp} xpToNextLevel={xpToNextLevel} streak={streak} />
                        </div>

                        {/* Right Column - 3D Character */}
                        <div className="sticky top-8 h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)]">
                            <CharacterScene level={level} streak={streak} className="h-full" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

