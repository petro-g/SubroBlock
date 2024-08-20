import { OfferStatusBadgeTemplate } from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferStatusBadge";
import CircleCheckmark from "@/public/checkmark-green.svg";
import Group from "@/public/group.svg";
import KeyIcon from "@/public/key-orange.svg";
import TickCircle from "@/public/tick-circle-green.svg";
import { IOffer } from "@/store/types/offers";

const OfferResponseStatusBadge = ({ offer }: { offer: IOffer }) => {
  switch (offer.response?.status) {
    case "AP1":
    case "AP2":
    case "AP3":
      return (
        <OfferStatusBadgeTemplate
          text={offer.response?.status}
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
          text={offer.response?.status}
          icon={TickCircle}
          bgColor="bg-success-foreground"
          textColor="text-success"
          offer={offer}
        />
      );
    // 2 below are surely used for response status, not sure if others above even possible to happen
    case "0/2 keys":
    case "1/2 keys":
      return (
        <OfferStatusBadgeTemplate
          text={offer.response?.status}
          icon={KeyIcon}
          bgColor="bg-accent"
          textColor="text-secondary-foreground
      "
          offer={offer}
        />
      );
    default:
      break;
  }
};

export default OfferResponseStatusBadge;
