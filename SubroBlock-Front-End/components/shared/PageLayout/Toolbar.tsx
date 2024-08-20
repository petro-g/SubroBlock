import React, { FC } from "react";
import {
  IDropdownGroupsProps
} from "@/components/shared/DropdownGroups/dropdown-groups.types";
import { ISearchProps, InputSearch } from "@/components/shared/input-search";
import { DropdownGroups } from "../DropdownGroups";

interface IToolbarProps {
  searchProps?: ISearchProps;
  filtersDropdownProps?: IDropdownGroupsProps;
  extraButtons?: React.ReactNode;
}

export const Toolbar: FC<IToolbarProps> = ({
  searchProps,
  filtersDropdownProps,
  extraButtons
}) => {
  return (
    <div className="py-6">
      <div className="flex justify-between gap-6">
        <div className="flex gap-6">
          {searchProps && (
            <InputSearch {...searchProps} />
          )}
          {filtersDropdownProps && (
            <DropdownGroups {...filtersDropdownProps} />
          )}
        </div>
        <div className="flex items-center gap-6">
          {extraButtons}
        </div>
      </div>
    </div>
  );
};
