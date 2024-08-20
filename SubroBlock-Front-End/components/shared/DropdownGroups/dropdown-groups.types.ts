import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { ReactNode } from "react";
import {
  IDropdownOptionsProps
} from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";

export interface IDropdownGroupsProps {
  title: string;
  icon: StaticImport;
  activeIcon?: StaticImport;
  groups: IDropdownGroupItemProps[]
}

export interface IDropdownGroupItemProps extends Omit<IDropdownOptionsProps, "children"> {
  description: ReactNode;
}
