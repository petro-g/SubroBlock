import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-nowrap capitalize",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-background-secondary text-secondary-foreground hover:bg-primary/80",
        destructive:
          "border-transparent bg-destructive-foreground text-destructive hover:bg-destructive/80",
        success:
          "border-transparent bg-success-foreground text-success hover:bg-success/80"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
