import React from "react";
import { IInfoTooltip } from "@/components/shared/SubroOfferPage/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
export const InfoTooltip: React.FC<IInfoTooltip> =
    ({ tooltip = <></> }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {tooltip}
            </TooltipTrigger>
            <TooltipContent side='bottom' className="max-w-48">
              <div className="text-background text-sm">
                <div className="flex justify-between">
                  <span className="text-background/[.7]">2nd Response Amount:</span>
                  <span>$1500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-background/[.7]">Difference:</span>
                  <span>$200 %15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-background/[.7]">Failed Responses:</span>
                  <span>2</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    };
