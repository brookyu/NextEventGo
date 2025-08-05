import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, onPressedChange, variant = "default", size = "default", onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onPressedChange) {
        onPressedChange(!pressed)
      }
      onClick?.(event)
    }

    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variantClasses = {
      default: pressed
        ? "bg-gray-200 text-gray-900"
        : "bg-transparent hover:bg-gray-100 hover:text-gray-900",
      outline: pressed
        ? "border border-gray-300 bg-gray-100 text-gray-900"
        : "border border-gray-300 bg-transparent hover:bg-gray-100 hover:text-gray-900"
    }

    const sizeClasses = {
      default: "h-10 px-3",
      sm: "h-9 px-2.5",
      lg: "h-11 px-5"
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        aria-pressed={pressed}
        {...props}
      />
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle }
