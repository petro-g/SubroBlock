import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background disabled:bg-background disabled:text-secondary-foreground disabled:border-secondary-foreground disabled:saturate-0",
  {
    variants: {
      variant: {
        default: "radius-lg bg-accent-foreground text-accent hover:bg-accent-active border border-secondary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-secondary disabled:text-secondary-foreground disabled:hover:bg-secondary",
        outline: // has bright outline
          "border border-accent-foreground text-accent-foreground bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: // same as outline, but not bright border
          "border border-accent text-accent-foreground bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent text-accent-foreground hover:text-accent-active disabled:bg-secondary",
        link: "!p-0 w-fit !h-fit text-accent-active hover:text-accent-active hover:no-underline disabled:bg-background disabled:text-secondary-foreground disabled:hover:bg-background disabled:border-none disabled:opacity-100"
      },
      size: {
        default: "h-10 py-2 px-4 rounded-lg",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "" // already has default styles, IDK where
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
