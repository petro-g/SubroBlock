import { FC, ReactNode } from "react";
import { Checkbox as CheckboxComponent } from "@/components/ui/checkbox";

export interface ICheckbox {
  id?: string;
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Checkbox:FC<ICheckbox> = ({
  id,
  children,
  checked,
  onCheckedChange
}) => {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 text-base cursor-pointer hover:text-accent-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nowrap"
    >
      <CheckboxComponent
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      {children}
    </label>
  )
}
