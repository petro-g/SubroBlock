import Image from "next/image";
import React, { FC } from "react";
import TooltipCustom from "@/components/shared/Tooltip/Tooltip";
import { Button } from "@/components/ui/button";
import Close from "@/public/close-circle.svg";
import Ellipse from "@/public/ellipse-active.svg";
interface INotificationTooltip {
  showTooltip: boolean,
  children? : React.ReactNode,
  description: string,
  onClickSeen: () => void
}
const NotificationTooltip: FC<INotificationTooltip> = ({
  showTooltip,
  children,
  description,
  onClickSeen
}) => {
  return (
    <div className="relative">
      {showTooltip && <TooltipCustom
        side="left"
        align="start"
        trigger={
          <Image
            src={Ellipse}
            alt="Info"
            className="w-4 h-4 absolute top-[50%] -left-6 -mt-2"
          />
        }
      >
        <div className="bg-primary-foreground">
          <div className="flex flex-col justify-start text-background text-sm max-w-60">
            <div className="flex flex-row items-center mb-2">
              <Image
                src={Close}
                alt="Key"
                className="w-4 h-4 mr-2"
              />
              <span>
                {description}
              </span>
            </div>
            <Button variant="link" onClick={onClickSeen} className="text-accent-foreground text-xs text-left">Mark as seen</Button>
          </div>
        </div>
      </TooltipCustom>}
      {children}
    </div>
  );
};

export default NotificationTooltip;
