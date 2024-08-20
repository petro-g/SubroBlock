"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { VariantProps, cva } from "class-variance-authority";
import { Circle } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const radioButtonsVariants = cva(
  "aspect-square rounded-full border focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-secondary hover:border-accent-active",
        error: "border-destructive hover:border-destructive",
        disabled: "border-secondary hover:border-secondary"
      },
      size: {
        default: "h-6 w-6",
        sm: "h-5 w-5",
        xs:"h-4 w-4"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const radioButtonsInsideVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "fill-accent-foreground text-accent-foreground",
        error: "fill-destructive hover:border-destructive",
        disabled: "fill-secondary border-secondary text-secondary hover:fill-secondary hover:border-secondary"
      },
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        xs:"h-2.5 w-2.5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioButtonsProps extends
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioButtonsVariants> {}

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    RadioButtonsProps
>(({ className, variant, size, disabled, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioButtonsVariants({ variant, size, className }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={
        cn("flex items-center justify-center bg-transparent")}>
        <Circle
          className={
            cn(radioButtonsInsideVariants({ variant, size, className }),
              disabled ? radioButtonsInsideVariants({ variant: "disabled", size, className }): null)
          }
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
