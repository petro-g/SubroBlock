import React, { FC } from "react";
import { IDropdownOptionsProps } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import DropdownOptionsContent from "@/components/shared/DropdownOptionsMenu/DropdownOptionsContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const DropdownOptionsMenu: FC<IDropdownOptionsProps> = (props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {props.children}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <DropdownOptionsContent {...props} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownOptionsMenu;
