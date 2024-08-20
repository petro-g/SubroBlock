import React from "react";
import { openModal } from "@/components/shared/use-confirmation-modal";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { IOffer } from "@/store/types/offers";
import { useOffersStore } from "@/store/useOffersStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";

const OfferResponseStatusAction = ({ offer, inDraft }: { offer: IOffer; inDraft: boolean }) => {
  const { setOpenPanel } = useSidePanelStore();
  const currentUser = useCurrentUser();
  const { setSelectedOffer, signOfferResponse } = useOffersStore();

  const handleResponseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenPanel("createResponse");
    setSelectedOffer(offer);
  };

  const handleSignClick = (e: React.MouseEvent) => {
    if (!currentUser) return;

    e.stopPropagation();
    openModal({
      title: `Sign an offer response for $${offer.responseAmount} to "${offer.issuerCompany}"`,
      description: "By signing, you confirm that you have reviewed and approved the offer response details",
      confirmText: "Sign",
      onConfirm: () => signOfferResponse(currentUser, offer)
    })
  };

  if (!inDraft) return;

  if (offer.response) {
    if (!currentUser?.hasKeyAssigned) return;
    if (offer.response.responseSignedByMe) return;

    return (
      <Button onClick={handleSignClick} variant="outline" className="border-solid border border-accent-foreground text-accent-foreground">
        Sign
      </Button>
    );
  }

  return (
    <Button onClick={handleResponseClick} variant="outline" className="border-solid border border-accent-foreground text-accent-foreground">
        Response
    </Button>
  );

}

export default OfferResponseStatusAction;
