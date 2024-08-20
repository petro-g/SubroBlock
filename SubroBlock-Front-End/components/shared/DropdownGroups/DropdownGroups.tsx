import Image from "next/image";
import React, { FC } from "react";
import {
  IDropdownGroupsProps
} from "@/components/shared/DropdownGroups/dropdown-groups.types";
import DropdownGroupsContent
  from "@/components/shared/DropdownGroups/DropdownGroupsContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import CloseIcon from "@/public/close-cross-success.svg";

export const DropdownGroups: FC<IDropdownGroupsProps> = (props) => {
  const [open, setOpen] = React.useState(false);

  const hasSelectedOptions = props.groups.some(group => group.selectedOptions && group.selectedOptions.length > 0);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex items-center gap-2">
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasSelectedOptions ? "outline" : "secondary"}
            className={cn(
              "text-primary text-nowrap",
              hasSelectedOptions && "text-accent-foreground"
            )}
          >
            <Image
              src={hasSelectedOptions && props.activeIcon || props.icon}
              alt={props.title}
              className={cn(
                "w-4 h-4 mr-1",
                hasSelectedOptions && "text-accent-foreground"
              )}
            />
            {props.title}
          </Button>
        </DropdownMenuTrigger>
        {props.groups.map((group, index) => group.selectedOptions && group.selectedOptions.length > 0 && (
          group.selectedOptions.map((option, index) => (
            <Badge
              key={index}
              className="cursor-pointer transition-all hover:opacity-70 h-6 shrink-0"
              variant="success"
              onClick={() => group.onApplyOptionsChange?.(group.selectedOptions?.filter(selectedOption => selectedOption.value !== option.value) || [])}
            >
              <span className="truncate max-w-32">
                {option.label}
              </span>
              <Image
                src={CloseIcon}
                alt="Remove"
                className="w-4 h-4 -mr-1 rounded-full text-success"
              />
            </Badge>
          ))
        ))}
      </div>
      <DropdownMenuContent className="min-w-40 p-5">
        <DropdownGroupsContent
          {...props}
          onClearAll={() => setOpen(false)}
          onApplyAll={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
