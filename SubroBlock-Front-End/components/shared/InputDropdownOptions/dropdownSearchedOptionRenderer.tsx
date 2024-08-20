import React from "react";
import { IOption } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import { cn } from "@/lib/utils";

// highlight searched value in dropdown options
const dropdownSearchedOptionRenderer = ({ label = "" }: IOption, searchValue: string) => {
  const index = label
    .toLowerCase()
    .indexOf(searchValue.toLowerCase());

  const length = index > -1 ? searchValue.length : 0;

  return (
    <span
      className={cn(
        "text-md",
        searchValue && "text-secondary-foreground"
      )}
    >
      {label.slice(0, index)}
      <span className="text-primary-foreground">
        {label.slice(index, index + length)}
      </span>
      {label.slice(index + length)}
    </span>
  );
}

export default dropdownSearchedOptionRenderer;
