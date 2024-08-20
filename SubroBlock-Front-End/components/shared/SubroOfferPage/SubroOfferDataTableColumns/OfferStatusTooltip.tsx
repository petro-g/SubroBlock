import Image from "next/image";
import React from "react";
import TooltipCustom from "@/components/shared/Tooltip/Tooltip";
import Info from "@/public/info.svg";
import KeyWhite from "@/public/key-white.svg";
import { IOffer } from "@/store/types/offers";

const OfferStatusTooltip = ({ offer }: { offer: IOffer }) => {
  switch (offer.status) {
    case "0/2 keys":
    case "1/2 keys":
      const numberOfKeysSigned = offer.signatures?.length || 0;
      return (
        <TooltipCustom trigger={<Image src={Info} alt="Info" className="ml-1 -mr-1 w-3 h-3" />}>
          <div className="flex items-center text-background text-sm max-w-62">
            <Image src={KeyWhite} alt="Key" className="w-4 h-4 mr-2" />
            <span>{numberOfKeysSigned} of 2 keys signed. {offer.signedByMe ? "You have signed and " : ""} {2 - numberOfKeysSigned} more key is required</span>
          </div>
        </TooltipCustom>
      )
    default:
      break;
  }

  switch (offer.response?.status) {
    case "0/2 keys":
    case "1/2 keys":
      const numberOfKeysSigned = offer.response?.responseSignatures?.length || 0;
      return (
        <TooltipCustom trigger={<Image src={Info} alt="Info" className="ml-1 -mr-1 w-3 h-3" />}>
          <div className="flex items-center text-background text-sm max-w-62">
            <Image src={KeyWhite} alt="Key" className="w-4 h-4 mr-2" />
            <span>{numberOfKeysSigned} of 2 keys signed. {offer.response?.responseSignedByMe ? "You have signed and " : ""} {2 - numberOfKeysSigned} more key is required</span>
          </div>
        </TooltipCustom>
      )
    default:
      break;
  }
}

export default OfferStatusTooltip;
