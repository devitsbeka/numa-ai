"use client";

import { useMemo } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartTooltipContent, ChartLegendContent } from "@/components/application/charts/charts-base";
import { cx } from "@/utils/cx";
import { Badge } from "@/components/base/badges/badges";

interface MacroData {
    name: string;
    current: number;
    target: number;
    unit: string;
    color: string;
}

interface ActivityData {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface MacroDashboardProps {
    macros?: MacroData[];
    activityData?: ActivityData[];
    className?: string;
}

const defaultMacros: MacroData[] = [
    { name: "Calories", current: 1850, target: 2200, unit: "kcal", color: "#7f56d9" },
    { name: "Protein", current: 120, target: 150, unit: "g", color: "#10b981" },
    { name: "Carbs", current: 180, target: 250, unit: "g", color: "#f59e0b" },
    { name: "Fat", current: 65, target: 80, unit: "g", color: "#ef4444" },
];

const defaultActivityData: ActivityData[] = [
    { date: "Mon", calories: 2100, protein: 140, carbs: 220, fat: 75 },
    { date: "Tue", calories: 1950, protein: 130, carbs: 200, fat: 70 },
    { date: "Wed", calories: 2200, protein: 150, carbs: 250, fat: 80 },
    { date: "Thu", calories: 1850, protein: 120, carbs: 180, fat: 65 },
    { date: "Fri", calories: 2050, protein: 135, carbs: 230, fat: 72 },
    { date: "Sat", calories: 1900, protein: 125, carbs: 210, fat: 68 },
    { date: "Sun", calories: 2150, protein: 145, carbs: 240, fat: 78 },
];

// Circular progress component
const CircularProgress = ({ percentage, color, size = 120 }: { percentage: number; color: string; size?: number }) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    style={{
                        filter: `drop-shadow(0 0 8px ${color}40)`,
                    }}
                />
            </svg>
            <div className="absolute text-center">
                <div className="text-2xl font-bold" style={{ color }}>
                    {Math.round(percentage)}%
                </div>
            </div>
        </div>
    );
};

export const MacroDashboard = ({ macros = defaultMacros, activityData = defaultActivityData, className }: MacroDashboardProps) => {
    const macroProgress = useMemo(
        () =>
            macros.map((macro) => ({
                ...macro,
                percentage: Math.min((macro.current / macro.target) * 100, 100),
            })),
        [macros]
    );

    // Prepare pie chart data for macro distribution
    const macroDistribution = useMemo(() => {
        const total = macros.reduce((sum, m) => sum + m.current, 0);
        return macros.map((macro) => ({
            name: macro.name,
            value: macro.current,
            percentage: ((macro.current / total) * 100).toFixed(1),
            color: macro.color,
        }));
    }, [macros]);

    return (
        <div className={cx("flex flex-col gap-6", className)}>
            {/* Macro Progress Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {macroProgress.map((macro) => (
                    <div
                        key={macro.name}
                        className="group relative overflow-hidden rounded-2xl border border-secondary bg-primary p-6 transition-all hover:border-utility-brand-600/50 hover:shadow-lg"
                    >
                        {/* Gradient background effect */}
                        <div
                            className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
                            style={{ background: `linear-gradient(135deg, ${macro.color} 0%, transparent 100%)` }}
                        />
                        
                        <div className="relative flex flex-col items-center gap-4">
                            <CircularProgress percentage={macro.percentage} color={macro.color} size={100} />
                            <div className="text-center">
                                <div className="text-sm font-medium text-tertiary">{macro.name}</div>
                                <div className="mt-1 text-lg font-bold text-primary">
                                    {macro.current} / {macro.target} {macro.unit}
                                </div>
                                {macro.percentage >= 100 && (
                                    <Badge color="success" size="sm" className="mt-2">
                                        Target Met!
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Weekly Activity Chart */}
                <div className="rounded-2xl border border-secondary bg-primary p-6">
                    <h3 className="mb-4 text-lg font-semibold text-primary">Weekly Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7f56d9" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#7f56d9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="date" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="calories"
                                stroke="#7f56d9"
                                fillOpacity={1}
                                fill="url(#colorCalories)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Macro Distribution Pie Chart */}
                <div className="rounded-2xl border border-secondary bg-primary p-6">
                    <h3 className="mb-4 text-lg font-semibold text-primary">Macro Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={macroDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {macroDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent isPieChart />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Macro Breakdown */}
            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <h3 className="mb-4 text-lg font-semibold text-primary">Macro Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="carbs" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="fat" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

