// Events configuration for calendar
export interface CalendarEvent {
    id: string;
    date: Date;
    title: string;
    type: "breakfast" | "lunch" | "dinner" | "learning";
}

// Generate demo events based on activities
const generateEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activityTypes: Array<"breakfast" | "lunch" | "dinner" | "learning"> = ["breakfast", "lunch", "dinner", "learning"];
    const titles = {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        learning: "Learning Session",
    };
    
    // Generate events for the next 90 days
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateId = `date-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const hash = dateId.split("-").reduce((acc, val) => acc + parseInt(val) || 0, 0);
        const count = (hash % 3) + 1; // 1-3 activities per day
        const selectedTypes = activityTypes.slice(0, count);
        
        selectedTypes.forEach((type, idx) => {
            events.push({
                id: `${dateId}-${idx}`,
                date: new Date(date),
                title: titles[type],
                type,
            });
        });
    }
    
    return events;
};

export const events = generateEvents();

