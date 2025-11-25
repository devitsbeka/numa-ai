"use client";

import { CheckCircle, BookOpen01, TrendUp02, Clock } from "@untitledui/icons";
import { useLearn } from "@/hooks/use-learn";
import { cx } from "@/utils/cx";

export function ProgressDashboard() {
  const { getStats } = useLearn();
  const stats = getStats();

  const statCards = [
    {
      label: "Total Skills",
      value: stats.total,
      icon: BookOpen01,
      color: "utility-brand",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "utility-warning",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "utility-success",
    },
    {
      label: "Avg Progress",
      value: `${stats.averageProgress}%`,
      icon: TrendUp02,
      color: "utility-brand",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cx(
              "flex flex-col gap-2 p-4 rounded-xl border border-secondary bg-primary",
              "hover:border-border-primary transition-colors"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cx(
                  "p-2 rounded-lg",
                  stat.color === "utility-brand" && "bg-utility-brand-50 text-utility-brand-600",
                  stat.color === "utility-warning" && "bg-utility-warning-50 text-utility-warning-600",
                  stat.color === "utility-success" && "bg-utility-success-50 text-utility-success-600"
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-tertiary">{stat.label}</p>
                <p className="text-2xl font-bold text-primary mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

