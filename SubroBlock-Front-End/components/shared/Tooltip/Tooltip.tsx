import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React, { FC } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface TooltipProps
    extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>{}

interface ITooltipCustom extends TooltipProps{
    trigger?: React.ReactNode;
}
const TooltipCustom: FC<ITooltipCustom> = ({ ...props }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {props.trigger}
        </TooltipTrigger>
        <TooltipContent {...props}>
          {props.children}
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};

export default TooltipCustom;
