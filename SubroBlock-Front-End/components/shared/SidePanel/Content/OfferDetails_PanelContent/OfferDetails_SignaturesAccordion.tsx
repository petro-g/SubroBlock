import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DATE_TIME_FORMAT, OFFER_SIGNATURES_REQUIRED } from "@/lib/constants/static";
import { cn } from "@/lib/utils";
import KeyGreen from "@/public/key-green.svg";
import KeyYellow from "@/public/key-orange.svg";
import { useOffersStore } from "@/store/useOffersStore";

const OfferDetails_SignaturesAccordion = () => {
  const { selectedOffer } = useOffersStore();

  return selectedOffer && selectedOffer.signatures && selectedOffer.signatures.length > 0 && (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "-mx-6 px-6 mb-6 border-t border-b",
        selectedOffer.status === "Signed" ? "bg-success-foreground" : "bg-warning-foreground"
      )}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center text-background text-sm max-w-62">
            <Image
              src={selectedOffer.status === "Signed"
                ? KeyGreen
                : KeyYellow
              }
              alt="Key"
              className="w-4 h-4 mr-2"
            />
            <span className="text-xs text-primary-foreground hover:no-underline">
              {selectedOffer.signatures.length} of {OFFER_SIGNATURES_REQUIRED} keys signed.
            </span>
          </div>
          <div className="text-accent-foreground ml-auto mr-1 text-sm">
              Hide Details
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {selectedOffer.signatures.map((signature, index) => (
            <div
              key={signature.signedAt}
              className="flex justify-between bg-background rounded-lg px-4 h-10 items-center mb-2"
            >
              <span className="text-primary-foreground">
                {index + 1} key signed
              </span>
              <span className="text-primary">
                {format(new Date(signature.signedAt), DATE_TIME_FORMAT)}
              </span>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default OfferDetails_SignaturesAccordion;
