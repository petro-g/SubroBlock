import React from "react";

export interface IOption {
  label?: string;
  value: string;
  render?: (self: IOption) => React.ReactNode; // in case custom renderer for options needed
  onClick?: (self: IOption, e: React.MouseEvent) => void;
}

export interface IDropdownOptionsProps<OPTION extends IOption = IOption> {
  options: (false | OPTION)[]; // false will be ignored
  isMulti?: boolean;
  selectedOptions?: OPTION[];
  onApplyOptionsChange?: (options: OPTION[]) => void;
  children?: React.ReactNode; // is trigger to open dropdowns
}
