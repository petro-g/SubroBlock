"use client";
import { format } from "date-fns";
import Image from "next/image";
import * as React from "react";
import { IDatePicker } from "@/components/shared/DatePicker/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CalendarIcon from "../../../public/calendar-2.svg";

export const DatePicker: React.FC<IDatePicker> = () => {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            `w-[280px] rounded-[8px] text-sm text-[#A2A4A9] 
                                border-[rgba(122, 125, 132, 0.20)] p-[14px] justify-start text-left 
                                font-normal hover:text-[#A2A4A9]`,
            !date && "text-secondary-foreground"
          )}
        >
          <Image
            src={CalendarIcon}
            alt="Calendar"
            className="mr-[8px]"
          />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
