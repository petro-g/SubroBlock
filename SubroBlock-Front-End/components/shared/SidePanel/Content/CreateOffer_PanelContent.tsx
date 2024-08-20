"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IOption } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import dropdownSearchedOptionRenderer from "@/components/shared/InputDropdownOptions/dropdownSearchedOptionRenderer";
import { useTableDataProps } from "@/components/shared/TableCardList/use-table-data-props";
import TooltipCustom from "@/components/shared/Tooltip/Tooltip";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { formCreateOfferSchema } from "@/lib/validator";
import CalendarIcon from "@/public/calendar-2.svg";
import InfoIcon from "@/public/info-icon.svg";
import { useOffersStore } from "@/store/useOffersStore";
import { useOrganizationsStore } from "@/store/useOrganizationsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { InputDropdownOptions } from "../../InputDropdownOptions";

const CreateOffer_PanelContent = () => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewFiles, setViewFiles] = useState(false);

  const form = useForm({
    defaultValues: {
      responderCompany: "",
      accidentDate: "",
      offerVehicleVin: "",
      responderVehicleVin: "",
      publicOfferAmount: "",
      secretOfferAmount: "",
      cycleTimeDurDecimal: 0
    },
    resolver: zodResolver(formCreateOfferSchema)
  });

  const responderCompany = form.watch("responderCompany");
  const date = form.watch("accidentDate");

  const { setOpenPanel } = useSidePanelStore();
  const currentUser = useCurrentUser();
  const { organizations, fetchOrganizations, lastFetchParams } =
    useOrganizationsStore();

  const { createOffer } = useOffersStore();

  const { withLoadingDelayed } = useTableDataProps({ lastFetchParams });

  useEffect(() => {
    withLoadingDelayed(async () =>
      fetchOrganizations({
        ...lastFetchParams,
        organizationName: responderCompany
      })
    );
  }, [fetchOrganizations, responderCompany]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSelectHandler = () => {
    form.setValue("accidentDate", selectedDate?.toString() || "");
    setOpenCalendar(false);
  };

  const onCancelHandler = () => {
    form.setValue("accidentDate", "");
    setSelectedDate(undefined);
    setOpenCalendar(false);
  };

  const {
    formState: { errors }
  } = form;

  async function onSubmit(
    values: z.infer<typeof formCreateOfferSchema>,
    viewFiles: boolean
  ) {
    console.log("values:", values);
    const selectedOrganizationId =
      organizations?.find((organization) =>
        organization.company
          ? organization.company === responderCompany
          : organization.id.toString() === responderCompany
      )?.id || -1;

    const formattedValues = {
      ...values,
      responderCompanyId: selectedOrganizationId,
      accidentDate: date ? format(date, "yyyy-MM-dd") : ""
    };

    if (!currentUser) {
      toast({
        variant: "error",
        title: "Error",
        description: "User not found"
      });
      return;
    }

    const response = await createOffer(currentUser, formattedValues);

    if (response.ok) viewFiles ? setOpenPanel("viewFiles") : setOpenPanel(null);
  }

  console.log("errors:", errors);

  const options = organizations?.map(
    (organization) =>
      ({
        label: organization.company || organization.id.toString(),
        render: (option) =>
          dropdownSearchedOptionRenderer(option, responderCompany),
        value: organization.id.toString()
      }) as IOption
  ) || [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values, viewFiles))}
      >
        <FormField
          name="responderCompany"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col ">
              <FormLabel htmlFor="responderCompany" className="text-sm">
                Responder Company Name
              </FormLabel>
              <FormControl>
                <InputDropdownOptions
                  inputProps={{
                    placeholder: "Enter organization name",
                    required: true,
                    ...field,
                    value: responderCompany
                  }}
                  options={options}
                  onApplyOptionsChange={(selectedOptions) =>
                    form.setValue(
                      "responderCompany",
                      selectedOptions[0].label || ""
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="accidentDate"
          control={form.control}
          render={() => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel htmlFor="accidentDate" className="text-sm">
                Date of Accident
              </FormLabel>
              <FormControl>
                <Popover open={openCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      onClick={() => {
                        setOpenCalendar((state) => !state);
                      }}
                      variant="secondary"
                      className={cn(
                        "w-full bg-background justify-between text-left font-normal text-secondary-foreground hover:text-secondary-foreground hover:bg-transparent hover:border-accent-foreground focus:border-accent-foreground focus:bg-transparent",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : <span>Select Date</span>}
                      <Image
                        src={CalendarIcon}
                        alt="CalendarIcon"
                        className="mr-2 h-4 w-4"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(date)}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        form.setValue("accidentDate", date?.toString() || "");
                      }}
                      onCancelHandler={onCancelHandler}
                      onSelectHandler={() => onSelectHandler()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                  type="text"
                  id="offerVehicleVin"
                  placeholder="Enter offer vehicle VIN"
                  className={`h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-accent-foreground ${errors.offerVehicleVin ? "border-red-500" : ""}`}
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
                  type="text"
                  id="responderVehicleVin"
                  placeholder="Enter respond vehicle VIN"
                  className={`h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-none ${errors.responderVehicleVin ? "border-red-500" : ""}`}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="publicOfferAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel htmlFor="publicOfferAmount" className="text-sm">
                Public Offer Amount
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="publicOfferAmount"
                  placeholder="Enter public offer amount"
                  className={`h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-accent-foreground ${errors.publicOfferAmount ? "border-red-500" : ""}`}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="secretOfferAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel
                htmlFor="secretOfferAmount"
                className="text-sm flex justify-between"
              >
                Secret Offer Amount Secret
                <TooltipCustom
                  side="bottom"
                  align="start"
                  trigger={
                    <div className="flex font-normal cursor-pointer">
                      <Image src={InfoIcon} alt="Info" className="mr-1" />
                      Secret
                    </div>
                  }
                >
                  <div className="text-background  w-[200px]">
                    Reserve offer amount is secret. This information is
                    protected by cryptography. You must record secret amount
                    somewhere else
                  </div>
                </TooltipCustom>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="secretOfferAmount"
                  placeholder="Enter secret offer amount"
                  className={`h-12 focus-visible:-ring-offset-[-5px] focus-visible:ring-shadow-accent-foreground ${errors.secretOfferAmount ? "border-red-500" : ""}`}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex">
          <Button
            type="submit"
            variant="outline"
            className="w-[167px] h-[48px] absolute bottom-8"
          >
            Create & Close
          </Button>
          <Button
            type="submit"
            variant="default"
            onClick={() => setViewFiles(true)}
            className="w-[167px] h-[48px] absolute right-6 bottom-8 "
          >
            Create & Add Files
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default CreateOffer_PanelContent;
