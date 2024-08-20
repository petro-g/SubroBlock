import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { openModal } from "@/components/shared/use-confirmation-modal";
import useCurrentRoute from "@/lib/hooks/useCurrentRoute";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { cn, currentUserHasSomeRoles } from "@/lib/utils";
import Archive from "@/public/archive-tick.svg";
import DownloadIcon from "@/public/download.svg";
import { IOffer } from "@/store/types/offers";
import { useOffersStore } from "@/store/useOffersStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import DropdownOptionsMenu from "../DropdownOptionsMenu";

interface IProps {
  offer: IOffer;
}

export const SubroOffersMoreActionsDropdown = ({ offer }: IProps) => {
  const { setOpenPanel } = useSidePanelStore();
  const { setSelectedOffer, cancelOffer } = useOffersStore();
  const currentRoute = useCurrentRoute();
  const currentUser = useCurrentUser();
  const isReceivedOffers = currentRoute.subRoute?.href === "/received";

  if (!currentUser) return null;

  const isUser = currentUserHasSomeRoles(currentUser, ["org_user"]);
  const isArbitrator = currentUserHasSomeRoles(currentUser, ["arbitrator"]);

  return (
    <DropdownOptionsMenu
      options={[
        {
          value: "download",
          onClick: () => setOpenPanel("viewFiles"),
          render: () => (<>
            <Image
              src={DownloadIcon}
              alt="Date of offer"
              className="mr-1.5 w-4 h-4"
            />
            Download SubroOffer Data
          </>)
        },
        {
          value: "offerDetails",
          onClick: () => setOpenPanel("offerDetails"),
          render: () => (<>
            <Image
              src={Archive}
              alt="Download"
              className="mr-1.5 w-4 h-4"
            />
            Offer Details
          </>)
        },
        isUser && {
          value: "cancelOffer",
          onClick: () => {
            openModal({
              title: "Cancel Offer",
              description: "Are you sure you want to cancel this offer?",
              onConfirm: () => cancelOffer(currentUser, offer)
            });
          },
          render: () => (<>
            <Image
              src={Archive}
              alt="Download"
              className="mr-1.5 w-4 h-4"
            />
            Cancel Offer
          </>)
        },
        // visible only if on received offers and this offer has less than 3 failed responses
        isUser && isReceivedOffers && (offer.failedResponses || 0) < 3 && {
          value: "createResponse",
          onClick: () => {
            setSelectedOffer(offer);
            setOpenPanel("createResponse");
          },
          render: () => (<>
            <Image
              src={Archive}
              alt="Download"
              className="mr-1.5 w-4 h-4"
            />
            New Response
          </>)
        },
        isUser && {
          value: "archive",
          onClick: () => {},
          render: () => (<>
            <Image
              src={Archive}
              alt="Download"
              className="mr-1.5 w-4 h-4"
            />
            Archive
          </>)
        },
        isArbitrator && {
          value: "arbitrate",
          onClick: () => {},
          render: () => (<>
            <Image
              src={Archive}
              alt="Arbitrate"
              className="mr-1.5 w-4 h-4"
            />
            Arbitrate
          </>)
        }
      ]}
    >
      <div className={cn(
        "h-6 w-6 p-0 hover:rounded-full",
        // button and ghost variant styles. because can't put button inside button, causes hydration issues
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "hover:bg-accent outline-0 hover:text-accent-foreground disabled:bg-background disabled:text-secondary-foreground disabled:hover:bg-background disabled:border-secondary-foreground disabled:opacity-100",
      )}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-6 w-6" />
      </div>
    </DropdownOptionsMenu>
  )
};
