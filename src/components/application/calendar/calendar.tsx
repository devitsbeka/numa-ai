"use client";

import type { CalendarEvent as ConfigCalendarEvent } from "./config";
import { Calendar as FullCalendar } from "./application/calendar";

interface CalendarProps {
    events?: ConfigCalendarEvent[];
    view?: "month" | "week" | "day";
    onNavigationHandlersReady?: Parameters<typeof FullCalendar>[0]["onNavigationHandlersReady"];
    onViewChange?: Parameters<typeof FullCalendar>[0]["onViewChange"];
}

export const Calendar = ({ events = [], view = "month", onNavigationHandlersReady, onViewChange }: CalendarProps) => {
    // Convert events from config format to FullCalendar format
    const convertedEvents = events.map((event) => {
        // Set start time to beginning of day
        const start = new Date(event.date);
        start.setHours(0, 0, 0, 0);
        
        // Set end time to end of day (or 1 hour later for all-day events)
        const end = new Date(event.date);
        end.setHours(23, 59, 59, 999);
        
        // Map event types to colors
        const colorMap: Record<string, "yellow" | "green" | "orange" | "blue"> = {
            breakfast: "yellow",
            lunch: "green",
            dinner: "orange",
            learning: "blue",
        };

        return {
            id: event.id,
            title: event.title,
            start,
            end,
            color: colorMap[event.type] || "blue",
        };
    });

    return <FullCalendar events={convertedEvents} view={view} onNavigationHandlersReady={onNavigationHandlersReady} onViewChange={onViewChange} />;
};

