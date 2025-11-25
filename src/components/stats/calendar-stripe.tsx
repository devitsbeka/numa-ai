"use client";

import { useState, useRef, useEffect } from "react";
import { getLocalTimeZone, today, CalendarDate, isToday as isTodayDate } from "@internationalized/date";
import { cx } from "@/utils/cx";

interface CalendarStripeProps {
    selectedDate: CalendarDate;
    onDateSelect: (date: CalendarDate) => void;
    className?: string;
}

export const CalendarStripe = ({ selectedDate, onDateSelect, className }: CalendarStripeProps) => {
    const [visibleDates, setVisibleDates] = useState<CalendarDate[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastSelectedDateRef = useRef<string | null>(null);

    // Generate dates: 30 days before today, today, and 60 days after
    useEffect(() => {
        const todayDate = today(getLocalTimeZone());
        const dates: CalendarDate[] = [];
        const startDate = todayDate.subtract({ days: 30 });
        
        for (let i = 0; i < 91; i++) {
            dates.push(startDate.add({ days: i }));
        }
        
        setVisibleDates(dates);
    }, []); // Only run once on mount

    // Scroll to selected date when it changes and dates are loaded
    useEffect(() => {
        if (!scrollContainerRef.current || !selectedDate || visibleDates.length === 0) {
            return;
        }

        const selectedDateKey = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
        
        // Only scroll if the selected date actually changed
        if (lastSelectedDateRef.current === selectedDateKey) {
            return;
        }

        const selectedIndex = visibleDates.findIndex(
            (d) => d.year === selectedDate.year && d.month === selectedDate.month && d.day === selectedDate.day
        );
        
        if (selectedIndex !== -1) {
            const container = scrollContainerRef.current;
            const itemWidth = 80; // Approximate width of each date item
            const scrollPosition = selectedIndex * itemWidth - container.clientWidth / 2 + itemWidth / 2;
            
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                if (container) {
                    container.scrollTo({
                        left: Math.max(0, scrollPosition),
                        behavior: "smooth",
                    });
                    lastSelectedDateRef.current = selectedDateKey;
                }
            });
        }
    }, [selectedDate, visibleDates]);

    const formatDay = (date: CalendarDate) => {
        return date.day;
    };

    const formatWeekday = (date: CalendarDate) => {
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return weekdays[date.toDate(getLocalTimeZone()).getDay()];
    };

    const formatMonth = (date: CalendarDate) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[date.month - 1];
    };

    const isToday = (date: CalendarDate) => {
        return isTodayDate(date, getLocalTimeZone());
    };

    const isSelected = (date: CalendarDate) => {
        return (
            date.year === selectedDate.year &&
            date.month === selectedDate.month &&
            date.day === selectedDate.day
        );
    };

    // Group dates by month for month headers
    const monthGroups = visibleDates.reduce((acc, date) => {
        const monthKey = `${date.year}-${date.month}`;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(date);
        return acc;
    }, {} as Record<string, CalendarDate[]>);

    return (
        <div className={cx("relative w-full", className)}>
            <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-4"
                style={{ scrollSnapType: "x proximity" }}
            >
                {visibleDates.map((date, index) => {
                    const showMonthHeader =
                        index === 0 || visibleDates[index - 1].month !== date.month;
                    
                    return (
                        <div key={`${date.year}-${date.month}-${date.day}`} className="flex flex-col items-center">
                            {showMonthHeader && (
                                <div className="mb-2 text-xs font-semibold text-tertiary">
                                    {formatMonth(date)} {date.year}
                                </div>
                            )}
                            {!showMonthHeader && <div className="mb-2 h-4" />}
                            
                            <button
                                onClick={() => onDateSelect(date)}
                                className={cx(
                                    "group relative flex h-20 w-16 flex-col items-center justify-center rounded-xl border-2 transition-all duration-200",
                                    "hover:scale-105 hover:shadow-lg",
                                    isSelected(date)
                                        ? "border-utility-brand-600 bg-utility-brand-600/10 shadow-lg shadow-utility-brand-600/20"
                                        : "border-secondary bg-primary hover:border-utility-brand-600/50",
                                    isToday(date) && !isSelected(date) && "border-utility-success-600/50 bg-utility-success-600/5"
                                )}
                                style={{ scrollSnapAlign: "center" }}
                            >
                                <span
                                    className={cx(
                                        "text-xs font-medium",
                                        isSelected(date)
                                            ? "text-utility-brand-600"
                                            : isToday(date)
                                              ? "text-utility-success-600"
                                              : "text-tertiary"
                                    )}
                                >
                                    {formatWeekday(date)}
                                </span>
                                <span
                                    className={cx(
                                        "text-2xl font-bold",
                                        isSelected(date)
                                            ? "text-utility-brand-600"
                                            : isToday(date)
                                              ? "text-utility-success-600"
                                              : "text-primary"
                                    )}
                                >
                                    {formatDay(date)}
                                </span>
                                {isToday(date) && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-utility-success-600" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {/* Gradient fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-primary to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-primary to-transparent" />
        </div>
    );
};

