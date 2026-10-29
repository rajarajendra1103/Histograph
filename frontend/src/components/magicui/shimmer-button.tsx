import React from "react"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "10px",
      background = "radial-gradient(ellipse 80% 80% at 50% 120%, rgba(14, 165, 233, 0.4), rgba(15, 23, 42, 0.95))",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative cursor-pointer overflow-hidden whitespace-nowrap px-5 py-2.5 font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-cyan-950/40 hover:shadow-cyan-500/20",
          className
        )}
        style={{
          borderRadius,
          background,
        }}
        {...props}
      >
        {/* Shimmer sweep */}
        <div
          className="pointer-events-none absolute -inset-full w-[200%] animate-shimmer bg-linear-to-r from-transparent via-white/15 to-transparent"
          style={{ animationDuration: shimmerDuration }}
        />
        <div className="relative z-10 flex items-center justify-center gap-2 text-sm text-slate-100 font-semibold tracking-wide">
          {children}
        </div>
      </button>
    )
  }
)
ShimmerButton.displayName = "ShimmerButton"
