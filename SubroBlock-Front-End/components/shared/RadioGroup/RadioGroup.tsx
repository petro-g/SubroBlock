import { RadioGroupProps } from "@radix-ui/react-radio-group";
import { FC } from "react";
import { Label } from "@/components/ui/label"
import { RadioGroup as DefaultRadioGroup, RadioButtonsProps, RadioGroupItem } from "@/components/ui/radio-group"

export type IRadioGroupListItems = {
    id: string;
    value: string;
}

export interface IRadioGroup extends RadioGroupProps  {
    listItems: IRadioGroupListItems[]
}
const RadioGroup:FC<IRadioGroup & Omit<RadioButtonsProps, "value">> = ({
  size,
  variant,
  defaultValue,
  disabled,
  listItems = []
}) => {
  return (
    <DefaultRadioGroup defaultValue={defaultValue} disabled={disabled}>
      {listItems?.map(({ id, value }) => (
        <div key={id} className="flex items-center space-x-2">
          <RadioGroupItem disabled={disabled} size={size} variant={variant} value={value} id={id}/>
          <Label htmlFor={id}>{value}</Label>
        </div>))}
    </DefaultRadioGroup>
  )
};

export default RadioGroup;

