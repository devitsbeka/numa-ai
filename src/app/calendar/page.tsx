"use client";

import { useState, useCallback, useTransition } from "react";
import { LayoutGrid01, ArrowLeft, ArrowRight, Plus } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import Link from "next/link";
import { AppHeader } from "@/components/application/app-navigation/app-header";
import { Calendar } from "@/components/application/calendar/calendar";
import { events } from "@/components/application/calendar/config";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";

export default function CalendarPage() {
    const [viewMode, setViewMode] = useState<"days" | "weeks" | "months">("months");
    const [isPending, startTransition] = useTransition();
    const [navigationHandlers, setNavigationHandlers] = useState<{ onPrev: () => void; onNext: () => void; onToday: () => void; setView: (view: "month" | "week" | "day") => void } | null>(null);
    
    // Map view mode to Calendar component's expected format
    const viewMap: Record<"days" | "weeks" | "months", "day" | "week" | "month"> = {
        days: "day",
        weeks: "week",
        months: "month",
    };
    const reverseViewMap: Record<"day" | "week" | "month", "days" | "weeks" | "months"> = {
        day: "days",
        week: "weeks",
        month: "months",
    };
    const view = viewMap[viewMode];

    // Handle view changes from calendar (e.g., from dropdown)
    const handleViewChange = useCallback((newView: "month" | "week" | "day") => {
        setViewMode(reverseViewMap[newView]);
    }, []);

    // Handle tab selection - update both local state and calendar view
    const handleTabChange = useCallback((key: string) => {
        const newViewMode = key as "days" | "weeks" | "months";
        if (newViewMode !== viewMode) {
            startTransition(() => {
                setViewMode(newViewMode);
                // Also update calendar view
                if (navigationHandlers) {
                    navigationHandlers.setView(viewMap[newViewMode]);
                }
            });
        }
    }, [viewMode, navigationHandlers, viewMap]);

    // Memoize the navigation handlers callback to prevent infinite loops
    const handleNavigationHandlersReady = useCallback((handlers: { onPrev: () => void; onNext: () => void; onToday: () => void; setView: (view: "month" | "week" | "day") => void }) => {
        setNavigationHandlers(handlers);
    }, []);

    // Handle add event action
    const handleAddEvent = useCallback(() => {
        // TODO: Implement add event functionality
        console.log("Add event clicked");
    }, []);

    return (
        <div className="bg-primary">
            <AppHeader
                secondaryNavLeft={
                    <ButtonGroup selectedKeys={[]} size="md" className="flex">
                        <ButtonGroupItem 
                            id="prev" 
                            iconLeading={ArrowLeft} 
                            onPress={() => navigationHandlers?.onPrev()}
                        />
                        <ButtonGroupItem 
                            id="today" 
                            className="flex-1 justify-center text-center" 
                            onPress={() => navigationHandlers?.onToday()}
                        >
                            Today
                        </ButtonGroupItem>
                        <ButtonGroupItem 
                            id="next" 
                            iconLeading={ArrowRight} 
                            onPress={() => navigationHandlers?.onNext()}
                        />
                    </ButtonGroup>
                }
                secondaryNavTabs={{
                    selectedKey: viewMode,
                    onSelectionChange: handleTabChange,
                    items: [
                        { id: "days", label: "Days" },
                        { id: "weeks", label: "Weeks" },
                        { id: "months", label: "Months" },
                    ],
                }}
                secondaryNavRight={
                    <Link href="/">
                        <AriaButton className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary bg-primary text-tertiary hover:bg-primary_hover hover:text-secondary transition-colors outline-hidden">
                            <LayoutGrid01 className="size-4" />
                        </AriaButton>
                    </Link>
                }
            />

            {/* Calendar Content */}
            <main className="mx-auto w-full max-w-container px-4 py-8 md:px-8 relative">
                <Calendar 
                    events={events} 
                    view={view} 
                    onNavigationHandlersReady={handleNavigationHandlersReady}
                    onViewChange={handleViewChange}
                />
                
                {/* Floating CTA Button */}
                <Button
                    color="primary"
                    size="xl"
                    iconLeading={Plus}
                    onClick={handleAddEvent}
                    className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg md:bottom-12 md:right-12"
                    aria-label="Add event"
                />
            </main>
        </div>
    );
}

