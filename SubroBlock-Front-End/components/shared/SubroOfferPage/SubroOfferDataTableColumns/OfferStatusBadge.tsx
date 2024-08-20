import Image from "next/image";
import React from "react";
import OfferStatusTooltip from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferStatusTooltip";
import CircleCheckmark from "@/public/checkmark-green.svg";
import Group from "@/public/group.svg";
import KeyIcon from "@/public/key-orange.svg";
import TickCircle from "@/public/tick-circle-green.svg";
import { IOffer } from "@/store/types/offers";

export const OfferStatusBadgeTemplate: React.FC<{
  text: string;
  icon: string;
  bgColor: string;
  textColor: string;
  offer: IOffer;
}> = ({ text, icon, bgColor, textColor, offer }) => (
  <div
    className={`flex items-center rounded-2xl ${bgColor} w-fit py-1 px-2.5 h-6 shrink-0`}
  >
    <Image src={icon} alt="Status Icon" className="mr-1.5 w-4 h-4" />
    <span className={`${textColor} text-xs text-nowrap`}>
      {text.includes("/") ? (
        <>
          <span className="text-xs text-primary-foreground">
            {text.split("/")[0]}
          </span>
          /
          <span style={{ color: textColor }} className="text-xs">
            {text.split("/")[1]}
          </span>
        </>
      ) : (
        text
      )}
    </span>
    <OfferStatusTooltip offer={offer} />
  </div>
);

const OfferStatusBadge = ({ offer }: { offer: IOffer }) => {
  switch (offer.status) {
    case "Cancelled":
      return (
        <OfferStatusBadgeTemplate
          text={offer.status}
          icon={Group}
          bgColor="bg-destructive-foreground"
          textColor="text-destructive"
          offer={offer}
        />
      );
    case "AP1":
    case "AP2":
    case "AP3":
      return (
        <OfferStatusBadgeTemplate
          text={offer.status}
          icon={CircleCheckmark}
          bgColor="bg-success-foreground"
          textColor="text-success"
          offer={offer}
        />
      );
    case "Arbitration":
      return (
        <OfferStatusBadgeTemplate
          text={offer.arbitrationMethod === "Manual" ? "ARB" : "AI"}
          icon={Group}
          bgColor="bg-destructive-foreground"
          textColor="text-destructive"
          offer={offer}
        />
      );
    case "Signed":
      return (
        <OfferStatusBadgeTemplate
          text={offer.status}
          icon={TickCircle}
          bgColor="bg-success-foreground"
          textColor="text-success"
          offer={offer}
        />
      );
    case "0/2 keys":
    case "1/2 keys":
      return (
        <OfferStatusBadgeTemplate
          text={offer.status}
          icon={KeyIcon}
          bgColor="bg-accent"
          textColor="text-primary"
          offer={offer}
        />
      );
    default:
      break;
  }
};

export default OfferStatusBadge;
