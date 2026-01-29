import React from 'react'

interface BudgetProgressBarProps {
    current: number
    total: number
    height?: string
    showLabel?: boolean
    animate?: boolean
}

export function BudgetProgressBar({
    current,
    total,
    height = "h-2",
    showLabel = true,
    animate = true
}: BudgetProgressBarProps) {
    const percentage = total > 0 ? (current / total) * 100 : 0
    const clampedPercentage = Math.min(percentage, 100)

    // Semáforo Logic
    let colorClass = "bg-emerald-500" // Default Safe
    let bgClass = "bg-emerald-100" // Default bg

    if (percentage > 85) {
        // Crítico (85-100%)
        colorClass = "bg-red-500"
        bgClass = "bg-red-100"
    } else if (percentage > 60) {
        // Atención (60-85%)
        colorClass = "bg-amber-500"
        bgClass = "bg-amber-100"
    } else {
        // Seguro (0-60%)
        colorClass = "bg-emerald-500"
        bgClass = "bg-emerald-100"
    }

    // Gradient variants for premium feel
    const gradientClass = percentage > 85
        ? "bg-gradient-to-r from-red-600 to-red-400"
        : percentage > 60
            ? "bg-gradient-to-r from-amber-500 to-amber-300"
            : "bg-gradient-to-r from-emerald-500 to-emerald-400"

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height} shadow-inner`}>
                <div
                    className={`${height} rounded-full ${gradientClass} shadow-lg ${animate ? 'transition-all duration-1000 ease-out' : ''}`}
                    style={{ width: `${clampedPercentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                    <span>Progreso</span>
                    <span className={
                        percentage > 85 ? "text-red-500" :
                            percentage > 60 ? "text-amber-500" :
                                "text-emerald-500"
                    }>
                        {percentage.toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    )
}
