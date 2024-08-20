"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import { VariantProps, cva } from "class-variance-authority";
import * as React from "react"
import { cn } from "@/lib/utils"

const switchRootVariants = cva(
  "peer shrink-0 inline-flex cursor-pointer items-center rounded-2xl transition-colors data-[state=checked]:bg-accent-foreground data-[state=unchecked]:bg-secondary hover:data-[state=unchecked]:bg-secondary-foreground hover:data-[state=checked]:bg-accent-active",
  {
    variants: {
      variant: {
        disabled: "cursor-not-allowed opacity-50"
      },
      size: {
        default: "h-6 w-10",
        sm: "h-5 w-8",
        xs:"h-4 w-7"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-1",
  {
    variants: {
      variant: {
        disabled: "cursor-not-allowed opacity-50"
      },
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4 data-[state=checked]:translate-x-3",
        xs:"h-3 w-3 data-[state=checked]:translate-x-3"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);

export interface SwitchProps extends
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchRootVariants> {}

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    SwitchProps
>(({ variant, size, className, disabled, ...props }, ref) => {

  return <SwitchPrimitives.Root
    className={cn(
      switchRootVariants({ variant, size, className }),
      disabled ? switchRootVariants({ variant: "disabled", size, className }): null
    )}
    disabled={disabled}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={
        cn(switchThumbVariants({ variant, size, className }),
          disabled ? switchThumbVariants({ variant: "disabled", size, className }): null
        )
      }
    />
  </SwitchPrimitives.Root>
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
