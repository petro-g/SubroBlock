"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { cn } from "@/lib/utils";

export type CalendarComponentProps = React.ComponentProps<typeof DayPicker>;
export interface CalendarProps {
    onCancelHandler?: () => void,
    onSelectHandler?: () => void,
}

function Calendar({
  className,
  classNames,
  onCancelHandler,
  onSelectHandler,
  showOutsideDays = true,
  ...props
}: CalendarProps & CalendarComponentProps) {
  const { globalClassName } = useGlobalStyles();
  const isFutureDate = (date: Date) => {
    const today = new Date();
    return date > today;
  };
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className, globalClassName)}
      classNames={{
        root: "bg-background rounded",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-left pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-accent-foreground"
        ),
        nav_button_previous: "absolute right-5 text-accent-foreground",
        nav_button_next: "absolute right-0 text-accent-foreground",
        table: "w-full space-y-1 border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent",
        head_row: "flex border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent",
        head_cell:
          "border-0 border-transparent text-secondary-foreground rounded-md w-9 font-primary-foreground text-sm font-normal",
        row: "border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent flex w-full mt-2",
        cell: "border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "hover:bg-accent hover:text-primary-foreground text-primary-foreground border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-accent-foreground text-background focus:text-background focus:bg-accent-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "disabled:bg-transparent border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent text-secondary-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-secondary-foreground aria-selected:opacity-30",
        day_disabled: "disabled:bg-transparent border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent text-secondary-foreground opacity-50",
        day_range_middle:
          "disabled:bg-transparent border-0 border-transparent first:border-0 first:border-transparent last:border-0 last:border-transparent aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4 text-accent-foreground" />,
        IconRight: () => <ChevronRight className="h-4 w-4 text-accent-foreground" />,
        Footer:({}) => <div className="flex justify-end items-center">
          <Button variant="link" className="mr-4" onClick={onCancelHandler}>Cancel</Button>
          <Button onClick={onSelectHandler}>Select</Button>
        </div>
      }}
      disabled={isFutureDate}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
