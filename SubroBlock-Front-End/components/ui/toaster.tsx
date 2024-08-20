"use client";
import Image from "next/image";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import DangerError from "@/public/danger-error.svg";
import DangerWarning from "@/public/danger-warning.svg";
import TickCircle from "@/public/tick-circle-green.svg";

const WARNING_VARIANT = "warning" as const;
const ERROR_VARIANT = "error" as const;

const getToastIcon = (variant: string) => {
  if (variant === WARNING_VARIANT) {
    return DangerWarning;
  }
  if (variant === ERROR_VARIANT) {
    return DangerError;
  }

  return TickCircle;
}

const getToastTextStyle = (variant: "warning" | "error" | "success" | null | undefined) => {
  if (variant === WARNING_VARIANT) {
    return "text-warning";
  }
  if (variant === ERROR_VARIANT) {
    return "text-destructive";
  }
  return "text-success";
}
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, action, ...props }) => (
        <Toast
          key={id}
          variant={variant}
          {...props}
          className={cn("cursor-pointer", props.className)}
          onClick={() => dismiss(id)}
        >
          <div className="flex justify-start">
            {variant && (
              <Image src={getToastIcon(variant)} alt={variant} className="mr-2" />
            )}
            <div className="grid gap-1">
              {title && <ToastTitle
                className="text-primary-foreground text-base">{title}</ToastTitle>}
              {description && (
                <ToastDescription
                  className="text-primary text-sm">{description}</ToastDescription>
              )}
            </div>
          </div>
          <div className={cn("flex flex-row pl-4", getToastTextStyle(variant))}>
            {action}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
