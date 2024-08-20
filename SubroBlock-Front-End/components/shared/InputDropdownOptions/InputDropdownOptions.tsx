"use client";
import React, { ChangeEvent, FC, useEffect } from "react";
import { IDropdownOptionsProps } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import DropdownOptionsContent from "@/components/shared/DropdownOptionsMenu/DropdownOptionsContent";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IInputDropdownOptionsProps extends IDropdownOptionsProps {
  inputProps?: InputProps;
}

// doesn't use regular dropdown list because needs input focus during dropdown being opened
export const InputDropdownOptions: FC<IInputDropdownOptionsProps> = (props) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState<string>("");

  useEffect(() => {
    window.addEventListener("click", (e) => {
      if (e.target instanceof HTMLElement && !e.target.closest(".input-dropdown"))
        setOpen(false); // close on click outside
    }, true);
  }, []);

  return (
    <div className="relative input-dropdown">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off" // disable browser autocomplete
        type="text"
        {...props.inputProps}
        onFocus={(e) => {
          setOpen(true); // open on click
          props.inputProps?.onFocus?.(e);
        }}
        // onBlur \\ if clicking on option - it closes dropdown before option is selected
      />
      <div
        role="listbox"
        className={cn(
          open ? "flex" : "hidden",
          "absolute z-50 bg-white top-full mt-2 min-w-72 flex-col w-full rounded-lg border"
        )}>
        <DropdownOptionsContent
          {...props}
          onApplyOptionsChange={(options) => {
            setOpen(false); // when applied options - close modal
            props.inputProps?.onChange?.({ target: { value: options.map((o) => o.label).join(", ") } } as ChangeEvent<HTMLInputElement>);
            props.onApplyOptionsChange?.(options);
          }}
        />
      </div>
    </div>
  );
};
