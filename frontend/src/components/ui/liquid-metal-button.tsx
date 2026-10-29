"use client"

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders"
import { Sparkles } from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"

export type LiquidMetalColorTheme = "emerald" | "amber" | "indigo" | "rose" | "cyan" | "slate"

export interface LiquidMetalButtonProps {
  label?: string
  onClick?: () => void
  viewMode?: "text" | "icon"
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
  colorTheme?: LiquidMetalColorTheme
}

const THEME_STYLES: Record<
  LiquidMetalColorTheme,
  {
    innerBg: string
    textColor: string
    shiftRed: number
    shiftBlue: number
    glow: string
  }
> = {
  emerald: {
    innerBg: "linear-gradient(180deg, rgba(16, 185, 129, 0.88) 0%, rgba(4, 120, 87, 0.95) 100%)",
    textColor: "#ffffff",
    shiftRed: 0.1,
    shiftBlue: 0.4,
    glow: "0 0 16px rgba(16, 185, 129, 0.35)",
  },
  cyan: {
    innerBg: "linear-gradient(180deg, rgba(6, 182, 212, 0.88) 0%, rgba(14, 116, 144, 0.95) 100%)",
    textColor: "#ffffff",
    shiftRed: 0.1,
    shiftBlue: 0.7,
    glow: "0 0 16px rgba(6, 182, 212, 0.35)",
  },
  indigo: {
    innerBg: "linear-gradient(180deg, rgba(99, 102, 241, 0.88) 0%, rgba(67, 56, 202, 0.95) 100%)",
    textColor: "#ffffff",
    shiftRed: 0.5,
    shiftBlue: 0.8,
    glow: "0 0 16px rgba(99, 102, 241, 0.35)",
  },
  amber: {
    innerBg: "linear-gradient(180deg, rgba(245, 158, 11, 0.88) 0%, rgba(180, 83, 9, 0.95) 100%)",
    textColor: "#ffffff",
    shiftRed: 0.8,
    shiftBlue: 0.1,
    glow: "0 0 16px rgba(245, 158, 11, 0.35)",
  },
  rose: {
    innerBg: "linear-gradient(180deg, rgba(244, 63, 94, 0.88) 0%, rgba(190, 18, 60, 0.95) 100%)",
    textColor: "#ffffff",
    shiftRed: 0.9,
    shiftBlue: 0.3,
    glow: "0 0 16px rgba(244, 63, 94, 0.35)",
  },
  slate: {
    innerBg: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
    textColor: "#f8fafc",
    shiftRed: 0.3,
    shiftBlue: 0.3,
    glow: "none",
  },
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  disabled = false,
  icon,
  className = "",
  colorTheme = "emerald",
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([])
  const shaderRef = useRef<HTMLDivElement>(null)
  const shaderMount = useRef<any>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleId = useRef(0)

  const dimensions = useMemo(() => {
    if (viewMode === "icon") {
      return {
        width: 46,
        height: 42,
        innerWidth: 42,
        innerHeight: 38,
        shaderWidth: 46,
        shaderHeight: 42,
      }
    } else {
      return {
        width: Math.max(142, label.length * 9 + 48),
        height: 42,
        innerWidth: Math.max(138, label.length * 9 + 44),
        innerHeight: 38,
        shaderWidth: Math.max(142, label.length * 9 + 48),
        shaderHeight: 42,
      }
    }
  }, [viewMode, label])

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }

    const loadShader = async () => {
      try {
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy()
          }

          const themeCfg = THEME_STYLES[colorTheme] || THEME_STYLES.emerald

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: themeCfg.shiftRed,
              u_shiftBlue: themeCfg.shiftBlue,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6,
          )
        }
      } catch (error) {
        console.error("[LiquidMetalButton] Failed to load shader:", error)
      }
    }

    loadShader()

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy()
        shaderMount.current = null
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (disabled) return
    setIsHovered(true)
    shaderMount.current?.setSpeed?.(1)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    shaderMount.current?.setSpeed?.(0.6)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4)
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1)
        } else {
          shaderMount.current?.setSpeed?.(0.6)
        }
      }, 300)
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ripple = { x, y, id: rippleId.current++ }

      setRipples((prev) => [...prev, ripple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
      }, 600)
    }

    onClick?.()
  }

  return (
    <div className={`relative inline-block ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`}>
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition:
              "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            transform: "none",
          }}
        >
          {/* Label / Icon Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {icon ? (
              <span className="text-slate-200 shrink-0">{icon}</span>
            ) : viewMode === "icon" ? (
              <Sparkles
                size={16}
                style={{
                  color: "#cbd5e1",
                  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.6))",
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                }}
              />
            ) : null}

            {viewMode === "text" && (
              <span
                style={{
                  fontSize: "13px",
                  color: (THEME_STYLES[colorTheme] || THEME_STYLES.emerald).textColor,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  textShadow: "0px 1px 3px rgba(0, 0, 0, 0.8)",
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            )}
          </div>

          {/* Inner Shadow / Bevel Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "100px",
                background: (THEME_STYLES[colorTheme] || THEME_STYLES.emerald).innerBg,
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.5), inset 0px 1px 2px rgba(0, 0, 0, 0.4)"
                  : (THEME_STYLES[colorTheme] || THEME_STYLES.emerald).glow,
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Shader Container Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "100px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(56, 189, 248, 0.4), 0px 1px 2px 0px rgba(0, 0, 0, 0.4)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(56, 189, 248, 0.6), 0px 8px 16px -2px rgba(14, 165, 233, 0.3)"
                    : "0px 0px 0px 1px rgba(255, 255, 255, 0.15), 0px 4px 10px 0px rgba(0, 0, 0, 0.3)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "transparent",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.4s ease, height 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Interactive Button Click Area */}
          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              background: "transparent",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  )
}

