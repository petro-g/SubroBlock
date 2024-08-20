import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import "@/pages/globals.css";

interface IAccordionDefault {
  type:  "single" | "multiple";
  value: string;
  triggerText: string;
  contentText: string;
}

/**
 * Primary UI component for user interaction
 */
export const AccordionDefault = ({ type, value, triggerText, contentText  }: IAccordionDefault) => {
  return (
    <Accordion type={type} collapsible className="w-full">
      <AccordionItem value={value}>
        <AccordionTrigger>{triggerText}</AccordionTrigger>
        <AccordionContent>
          {contentText}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

