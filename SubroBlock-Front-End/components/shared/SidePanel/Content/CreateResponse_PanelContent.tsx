"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import OrangeInfoIcon from "@/public/orange-info.svg";
import { useOffersStore } from "@/store/useOffersStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import TooltipCustom from "../../Tooltip/Tooltip";

const formNewResponsSchema = z.object({
  responseAmount: z.string()
});
const CreateResponse_PanelContent =  () => {
  const { createResponse, selectedOffer } = useOffersStore();
  const form = useForm({
    defaultValues: {
      responderCompany: selectedOffer?.responderCompany || "",
      accidentDate: selectedOffer?.accidentDate || "",
      offerVehicleVin: selectedOffer?.offerVehicleVin || "",
      responderVehicleVin: selectedOffer?.responderVehicleVin || "",
      responseAmount: ""
    },
    resolver: zodResolver(formNewResponsSchema)
  });
  const { setOpenPanel } = useSidePanelStore();
  const currentUser = useCurrentUser();
  useEffect(() => {
    form.setValue("responderCompany", selectedOffer?.responderCompany || "");
    form.setValue("accidentDate", selectedOffer?.accidentDate || "");
    form.setValue("offerVehicleVin", selectedOffer?.offerVehicleVin || "");
    form.setValue(
      "responderVehicleVin",
      selectedOffer?.responderVehicleVin || ""
    );
    form.setFocus("responseAmount");
  }, [form, selectedOffer]);

  async function onSubmit(values: z.infer<typeof formNewResponsSchema>) {
    if (!currentUser) {
      toast({
        variant: "error",
        title: "Error",
        description: "User not found"
      });
      return;
    }

    if (!selectedOffer) {
      toast({
        variant: "error",
        title: "Error",
        description: "Offer not found"
      });
      return;
    }

    const response = await createResponse(
      currentUser,
      selectedOffer.id,
      values.responseAmount
    );

    if (response.ok) setOpenPanel(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="responderCompany"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col ">
              <FormLabel htmlFor="responderCompany" className="text-sm">
                Sender Company Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  disabled
                  id="offerVehicleVin"
                  placeholder="Enter offer vehicle VIN"
                  className={
                    "h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-accent-foreground"
                  }
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="accidentDate"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel htmlFor="accidentDate" className="text-sm">
                Date of Accident
              </FormLabel>
              <FormControl>
                <Input
                  disabled
                  type="text"
                  id="accidentDate"
                  placeholder="Date of Accident"
                  className="h-12 focus-visible:-ring-offset-1 focus-visible:ring-shadow-none"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="offerVehicleVin"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel htmlFor="offerVehicleVin" className="text-sm">
                Offer Vehicle VIN
              </FormLabel>
              <FormControl>
                <Input
                  disabled
                  type="text"
                  id="offerVehicleVin"
                  placeholder="Enter offer vehicle VIN"
                  className={
                    "h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-accent-foreground"
                  }
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="responderVehicleVin"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel htmlFor="responderVehicleVin" className="text-sm">
                Respond Vehicle VIN
              </FormLabel>
              <FormControl>
                <Input
                  disabled
                  type="text"
                  id="responderVehicleVin"
                  placeholder="Enter respond vehicle VIN"
                  className={
                    "h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-none "
                  }
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="responseAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel
                htmlFor="responseAmount"
                className="text-sm flex justify-between"
              >
                Response Amount
                <TooltipCustom
                  side="bottom"
                  align="start"
                  trigger={
                    <div className="flex font-normal cursor-pointer">
                      <Image src={OrangeInfoIcon} alt="Info" className="mr-1" />
                      <div className="text-accent-foreground">Secret</div>
                    </div>
                  }
                >
                  <div className="text-background w-[200px]">
                    Offer response amount is secret. This information is
                    protected by cryptography. You must record secret amount
                    somewhere else
                  </div>
                </TooltipCustom>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="responseAmount"
                  placeholder="Enter response amount"
                  className="h-12 focus-visible:-ring-offset-1 focus-visible:ring-shadow-none"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-[467px] h-[48px] absolute bottom-[32px]"
        >
          Create Response
        </Button>
      </form>
    </Form>
  );
};
export default CreateResponse_PanelContent;
