import React from "react";
import { SidebarHeader } from "@/components/shared/SidePanel/SidePanel/SidebarHeader";
import { IRightSidePanel } from "@/components/shared/SidePanel/SidePanel/types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { cn } from "@/lib/utils";

export const SidePanel: React.FC<IRightSidePanel> = ({
  open,
  onOpenChange,
  title,
  headerChildren,
  children
}) => {
  const { globalClassName } = useGlobalStyles();

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        id="right-side-panel-content"
        className={cn(
          globalClassName,
          "bg-background p-0 w-[531px] sm:max-w-[531px]"
        )}
      >
        {(title || headerChildren) && (
          <SidebarHeader title={title}>
            {headerChildren}
          </SidebarHeader>
        )}
        <div className="h-full box-border p-6">{children}</div>
      </SheetContent>
    </Sheet>
  )
  ;
};
