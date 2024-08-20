import { FC } from "react";
import { Label } from "@/components/ui/label"
import { Switch as DefaultSwitch, SwitchProps } from "@/components/ui/switch"

export interface ISwitch extends SwitchProps {
    id: string;
    label?: string;
}

const Switch:FC<ISwitch> = ({
  id,
  label,
  ...props
}) => {
  return (
    <div className="flex items-center space-x-2">
      <DefaultSwitch id={id} {...props} />
      {label && <Label htmlFor={id}>{label}</Label>}
    </div>
  )
};

export default Switch;
