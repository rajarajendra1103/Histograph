import React from "react"
import { cn } from "@/lib/utils"

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

export const BentoCard = ({
  className,
  title,
  subtitle,
  icon,
  badge,
  badgeColor = "border-cyan-500/30 text-cyan-400 bg-cyan-950/40",
  children,
  onClick,
}: {
  className?: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: string
  badgeColor?: string
  children?: React.ReactNode
  onClick?: () => void
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-cyan-950/20",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-cyan-400 group-hover:scale-105 transition-transform">
              {icon}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-slate-100 text-sm leading-snug tracking-tight">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badge && (
          <span
            className={cn(
              "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border tracking-wider",
              badgeColor
            )}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-300 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
