import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import OfferDetails_OfferAndResponseAmount from "@/components/shared/SidePanel/Content/OfferDetails_PanelContent/OfferDetails_OfferAndResponseAmount";
import OfferDetails_SignaturesAccordion from "@/components/shared/SidePanel/Content/OfferDetails_PanelContent/OfferDetails_SignaturesAccordion";
import OfferStatusBadge from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferStatusBadge";
import useOfferPageTypeDetails from "@/components/shared/SubroOfferPage/useOfferPageTypeDetails";
import { DATE_FORMAT } from "@/lib/constants/static";
import Calendar from "@/public/calendar-2.svg";
import Group from "@/public/group.svg";
import { useOffersStore } from "@/store/useOffersStore";
import { formatCycleTime } from "../../../SubroOfferPage/SubroOfferDataTableColumns/useOffersTableColumnsDef";

export const OfferDetails_PanelContent = () => {
  const { selectedOffer } = useOffersStore();
  const { isArbitratingOffers } = useOfferPageTypeDetails();

  if (!selectedOffer) return;

  return (
    <div>
      <OfferDetails_SignaturesAccordion />

      <div className="flex flex-col gap-6">
        {selectedOffer.status === "Arbitration" && (
          <div className="w-[531px] border-[#FF2B0026] border-t-[1px] border-b-[1px] -ml-6 -mt-6 pl-6 h-8 text-sm text-primary-foreground mr-8 bg-destructive-foreground flex items-center">
            <Image src={Group} alt="Group" className="mr-1.5 w-4 h-4" />
            Arbitration
          </div>
        )}

        {isArbitratingOffers && (
          <div>
            <div className="text-xs text-primary">Sender Company Name</div>
            <div className="text-sm text-primary-foreground mt-3">
              {selectedOffer.issuerCompany}
            </div>
          </div>
        )}
        <div>
          <div className="text-xs text-primary">Responder Company Name</div>
          <div className="text-sm text-primary-foreground mt-3">
            {selectedOffer.responderCompany}
          </div>
        </div>

        <div className="">
          <div className="text-xs text-primary">Status</div>
          <div className="text-sm text-primary-foreground mt-3">
            <OfferStatusBadge offer={selectedOffer} />
          </div>
        </div>

        <div className="flex">
          <div>
            <div className="text-xs text-primary flex">
              <Image src={Calendar} alt="date" className="mr-3" />
              Date of Accident:
            </div>
            <div className="text-sm text-primary-foreground mt-3">
              {format(new Date(selectedOffer.accidentDate || 0), DATE_FORMAT)}
            </div>
          </div>
          <div className="ml-16">
            <div className="text-xs text-primary flex">
              <Image src={Calendar} alt="date" className="mr-3" />
              Date of Offer
            </div>
            <div className="text-sm text-primary-foreground mt-3">
              {format(new Date(selectedOffer.dateOfOffer || 0), DATE_FORMAT)}
            </div>
          </div>
        </div>

        <div className="">
          <div className="text-xs text-primary">Cycle Time</div>
          <div className="text-sm text-primary-foreground mt-3">
            {formatCycleTime(selectedOffer.cycleTimeDurDecimal || 0)}
          </div>
        </div>

        <div className="flex justify-start">
          <div>
            <div className="text-xs text-primary">Offer Vehicle VIN</div>
            <div className="text-sm text-primary-foreground mt-3">
              {selectedOffer.offerVehicleVin}
            </div>
          </div>
          <div className="ml-16">
            <div className="text-xs text-primary">Respond Vehicle VIN</div>
            <div className="text-sm text-primary-foreground mt-3">
              {selectedOffer.responderVehicleVin}
            </div>
          </div>
        </div>

        <OfferDetails_OfferAndResponseAmount />

        {isArbitratingOffers && Boolean(selectedOffer.arbitratedAmount) && (
          <div className="flex flex-col">
            <div className="text-xs text-primary">Arbitrated Amount</div>
            <div className="text-sm text-primary-foreground mt-3">
              ${selectedOffer.arbitratedAmount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
