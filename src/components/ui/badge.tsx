import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/components/ui/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-primary text-white shadow-modern hover:shadow-modern-lg",
        secondary:
          "border-transparent bg-gradient-secondary text-white shadow-modern hover:shadow-modern-lg",
        accent:
          "border-transparent bg-gradient-accent text-white shadow-modern hover:shadow-modern-lg",
        success:
          "border-transparent bg-gradient-success text-white shadow-modern hover:shadow-modern-lg",
        warning:
          "border-transparent bg-gradient-warning text-white shadow-modern hover:shadow-modern-lg",
        danger:
          "border-transparent bg-gradient-danger text-white shadow-modern hover:shadow-modern-lg",
        outline: 
          "border-2 border-gray-300 bg-background/80 backdrop-blur-sm text-foreground hover:bg-gray-100 hover:border-gray-400",
        ghost:
          "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: "default" | "secondary" | "accent" | "success" | "warning" | "danger" | "outline" | "ghost";
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
