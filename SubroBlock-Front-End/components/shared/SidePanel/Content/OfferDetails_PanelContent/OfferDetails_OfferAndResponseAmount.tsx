import React from "react";
import useOfferPageTypeDetails from "@/components/shared/SubroOfferPage/useOfferPageTypeDetails";
import { IOffer } from "@/store/types/offers";
import { useOffersStore } from "@/store/useOffersStore";

const getFailedResponseText = (selectedOffer: IOffer) => {
  if (selectedOffer?.failedResponses === 1) {
    return "1st Response";
  } else if (selectedOffer?.failedResponses === 2) {
    return "2nd Response";
  } else if (selectedOffer?.failedResponses === 3) {
    return "3rd Response:";
  }
  return "Final Settlement Amount:";
};

export default function OfferDetails_OfferAndResponseAmount() {
  const { selectedOffer } = useOffersStore();
  const { isArbitratingOffers } = useOfferPageTypeDetails();

  if (!selectedOffer) return;

  return (
    <>
      <div className="flex">
        <div>
          <div className="text-xs text-primary">Initial Amount</div>
          <div className="text-sm text-primary-foreground mt-3">
            ${selectedOffer.offerAmount}
          </div>
        </div>
        {isArbitratingOffers && (
          <div className="ml-28">
            <div className="text-xs text-primary">Prior Response Amount</div>
            <div className="text-sm text-primary-foreground mt-3">
              ${selectedOffer.priorResponseAmount}
            </div>
          </div>
        )}
      </div>

      {((selectedOffer.failedResponses &&
          selectedOffer.failedResponses > 0) ||
        selectedOffer.status === "AP2" ||
        selectedOffer.status === "AP3") && (
        <div className="flex flex-wrap">
          <div>
            <div className="text-xs text-primary">Failed Responses</div>
            <div className="text-sm text-primary-foreground mt-3">
              {selectedOffer.failedResponses}
            </div>
          </div>
          <div className="ml-24">
            <div className="text-xs text-primary">
              {getFailedResponseText(selectedOffer)}
            </div>
            <div className="text-sm text-primary-foreground mt-3">
              ${selectedOffer.responseAmount}
            </div>
          </div>
          {selectedOffer.status &&
            ["AP2", "AP3"].includes(selectedOffer.status) && (
            <div className="w-full mt-6">
              <div className="text-xs text-primary">Prior Response</div>
              <div className="text-sm text-primary-foreground mt-3">
                  ${selectedOffer.priorResponseAmount}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
