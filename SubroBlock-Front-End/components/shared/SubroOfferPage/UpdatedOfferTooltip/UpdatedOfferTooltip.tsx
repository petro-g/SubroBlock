import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Close from "@/public/close-circle.svg";
import Ellipse from "@/public/ellipse-active.svg";

export const UpdatedOfferTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Image
            src={Ellipse}
            alt="Info"
            className="w-4 h-4 absolute top-[50%] -left-6 -mt-2"
          />
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-primary-foreground">
          <div className="flex flex-col justify-start text-background text-sm max-w-60">
            <div className="flex flex-row items-center">
              <Image
                src={Close}
                alt="Key"
                className="w-4 h-4 mr-2"
              />
              <span>
                First response filled
              </span>
            </div>
            <Button variant="link" className="text-accent-foreground text-xs text-left">Mark as seen</Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
