"use client";
import React, { FC } from "react";
import {
  IDropdownOptionsProps,
  IOption
} from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import { cn } from "@/lib/utils";

const DropdownOptionsContent: FC<IDropdownOptionsProps> = ({
  options = [],
  selectedOptions = [],
  onApplyOptionsChange,
  isMulti
}) => {
  const setSelectedOptions = (options: IOption[]) => {
    onApplyOptionsChange?.(options);
  };

  return (
    <div className="flex flex-col scroll-auto max-h-96 overflow-y-auto w-full">
      {options && options.length
        ? options?.map((option, index) => option && (
          <div
            key={option.value + index}
            id={option.value}
            className={cn(
              "text-base tracking-[-0.1px] relative flex flex-row items-center w-full cursor-pointer hover:bg-accent-muted py-3 px-4 text-primary-foreground",
              selectedOptions.some((selectedOption) => selectedOption.value === option.value) && "bg-accent font-medium tracking-[-0.2px]",
            )}
            onClick={(e) => {
              option.onClick?.(option, e);
              if (isMulti) {
                if (selectedOptions.some((selectedOption) => selectedOption.value === option.value)) {
                  setSelectedOptions(selectedOptions.filter((selectedOption) => selectedOption.value !== option.value));
                } else {
                  setSelectedOptions([...selectedOptions, option]);
                }
              } else {
                if (selectedOptions.some((selectedOption) => selectedOption.value === option.value)) {
                  setSelectedOptions([]);
                } else {
                  setSelectedOptions([option]);
                }
              }
            }}
          >
            {index !== 0 &&
              <div className="border-t absolute top-0 left-4 w-[calc(100%-2rem)]" />
            }
            {option.render?.(option) || option.label || option.value}
          </div>
        )) : (
          <div className="flex flex-col w-full py-3 px-4 text-secondary">
            No Results
          </div>
        )}
    </div>
  );
};

export default DropdownOptionsContent;
