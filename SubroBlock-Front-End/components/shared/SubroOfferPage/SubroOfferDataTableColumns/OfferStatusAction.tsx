import React from "react";
import { openModal } from "@/components/shared/use-confirmation-modal";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { IOffer } from "@/store/types/offers";
import { useOffersStore } from "@/store/useOffersStore";

const OfferStatusAction = ({ offer, inDraft }: { offer: IOffer; inDraft: boolean }) => {
  const currentUser = useCurrentUser();
  const { signOffer } = useOffersStore();

  const handleSignClick = (e: React.MouseEvent) => {
    if (!currentUser) return;

    e.stopPropagation();
    openModal({
      title: `Sign an offer for $${offer.offerAmount} to "${offer.responderCompany}"`,
      description: "By signing, you confirm that you have reviewed and approved the offer details",
      confirmText: "Sign",
      onConfirm: () => signOffer(currentUser, offer)
    })
  };

  if (!currentUser?.hasKeyAssigned) return; // needs key to sign offer or sign the response
  if (!["0/2 keys", "1/2 keys"].includes(offer.status)) return; // skip if not in the correct status
  if (offer.signedByMe) return; // skip if already signed
  if (!inDraft) return;

  return (
    <Button onClick={handleSignClick} variant="outline" className="border-solid border border-accent-foreground text-accent-foreground">
        Sign
    </Button>
  );

}

export default OfferStatusAction;
