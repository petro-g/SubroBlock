import { ColumnDef, ColumnSort } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import React, { useMemo } from "react";
import { SubroOffersMoreActionsDropdown } from "@/components/shared/SubroOfferPage/OffersMoreActionsDropdown";
import OfferResponseStatusAction from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferResponseStatusAction";
import OfferResponseStatusBadge from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferResponseStatusBadge";
import OfferStatusAction from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferStatusAction";
import OfferStatusBadge from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/OfferStatusBadge";
import useOfferPageTypeDetails from "@/components/shared/SubroOfferPage/useOfferPageTypeDetails";
import { getSortingIcon, handleSortingClick } from "@/components/shared/TableCardList/table-card-list.utils";
import TooltipCustom from "@/components/shared/Tooltip/Tooltip";
import { DATE_FORMAT } from "@/lib/constants/static";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { currentUserHasSomeRoles } from "@/lib/utils";
import Calendar from "@/public/calendar-2.svg";
import Info from "@/public/info.svg";
import SortFilter from "@/public/sort-filter.svg";
import { IOffer } from "@/store/types/offers";
import { useOffersStore } from "@/store/useOffersStore";

export const formatCycleTime = (cycleTime: number, short?: boolean) => {
  const days = Math.floor(cycleTime / (24 * 3600));
  const hours = Math.floor((cycleTime % (24 * 3600)) / 3600);
  const minutes = Math.floor((cycleTime % 3600) / 60);

  const result = [];

  if (days) result.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) result.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) result.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  return short ? result[0] || "N/A" : result.join(" ") || "N/A";
};

const differenceCount = (initialAmount: number, recentResponse: number) => {
  const initialDifference = recentResponse - initialAmount;
  const recentDifferenceInPercent = (initialDifference / initialAmount) * 100;
  if (initialDifference < 0) {
    return {
      difference: `(-)$${Math.abs(initialDifference).toFixed()}`,
      differenceInPercent: `(-)%${Math.abs(recentDifferenceInPercent).toFixed()}`
    }
  }

  if (initialDifference === 0) {
    return {
      difference: `$${Math.abs(initialDifference).toFixed()}`,
      differenceInPercent: `%${Math.abs(recentDifferenceInPercent).toFixed()}`
    }
  }

  return {
    difference: `(+)$${Math.abs(initialDifference).toFixed()}`,
    differenceInPercent: `(+)%${Math.abs(recentDifferenceInPercent).toFixed()}`
  }
}

const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;
  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span key={index} className="text-primary-foreground text-base">
        {part}
      </span>
    ) : (
      <span key={index} className="text-secondary-foreground text-base">
        {part}
      </span>
    )
  );
};

export const useOffersTableColumnsDef = ({
  setSorting,
  sorting,
  inDraft
}: {
  setSorting: (sorting: ColumnSort) => void;
  sorting: ColumnSort;
  inDraft: boolean;
}): ColumnDef<IOffer>[] => {
  const isAdmin = currentUserHasSomeRoles(useCurrentUser(), ["admin"]);
  const { isReceivedOffers, isArbitratingOffers } = useOfferPageTypeDetails();
  const highlightedSearchTerm = useOffersStore()?.lastFetchParams.search;

  return useMemo(
    () => ([
      (!isReceivedOffers || isArbitratingOffers) && {
        accessorKey: "responderCompany",
        header: () => (
          <div className="text-xs text-primary flex">
            <span className="mr-2">
              Responder Company Name
            </span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="relative">
            <div className="text-primary-foreground text-base">
              {highlightText(
                row.original.responderCompany,
                highlightedSearchTerm
              )}
            </div>
            <div className="flex">
              <Image
                src={Calendar}
                alt="Date of offer"
                className="mr-1.5 w-4 h-4"
              />
              <span className="text-xs text-primary mr-1">Date of offer: </span>
              <span className="text-xs text-primary-foreground">
                {format(new Date(row?.original?.dateOfOffer || row?.original?.accidentDate || 0), DATE_FORMAT)}
              </span>
            </div>
          </div>
        )
      },
      (isReceivedOffers || isArbitratingOffers) && {
        accessorKey: "responderCompany",
        header: () => (
          <div className="text-xs text-primary flex">
            <span className="mr-2">
              Sender Company Name
            </span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="relative">
            <div className="text-primary-foreground text-base">
              {highlightText(
                row.original.issuerCompany,
                highlightedSearchTerm
              )}
            </div>
            {!isArbitratingOffers && (
              <div className="flex">
                <Image
                  src={Calendar}
                  alt="Date of offer"
                  className="mr-1.5 w-4 h-4"
                />
                <span className="text-xs text-primary mr-1">Date of offer: </span>
                <span className="text-xs text-primary-foreground">
                  {format(new Date(row?.original?.dateOfOffer || row?.original?.accidentDate || 0), DATE_FORMAT)}
                </span>
              </div>
            )}
          </div>
        )
      },
      {
        accessorKey: "issuerCompany",
        header: () =>
          isReceivedOffers ||
          (isAdmin && (
            <div className="text-xs text-primary flex">
              <span className="mr-2">Sender Company Name</span>
              <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
            </div>
          )),
        cell: ({ row }) =>
          isReceivedOffers ||
          (isAdmin && (
            <div className="relative">
              <div className="text-primary-foreground text-base">
                {row.original.issuerCompany}
              </div>
              <div className="flex">
                <Image
                  src={Calendar}
                  alt="Date of offer"
                  className="mr-1.5 w-4 h-4"
                />
                <span className="text-xs text-primary mr-1">
                  Date of offer:{" "}
                </span>
                <span className="text-xs text-primary-foreground">
                  {format(
                    new Date(row?.original?.dateOfOffer || row?.original?.accidentDate || 0),
                    DATE_FORMAT
                  )}
                </span>
              </div>
            </div>
          ))
      },
      {
        accessorKey: "cycleTime",
        header: () => (
          <div className="text-xs text-primary flex">
            <span className="mr-2">Cycle Time</span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>
        ),
        cell: ({ row }) => {
          const shortCycleTime = formatCycleTime(
            row.original.cycleTimeDurDecimal || 0,
            true
          );
          const longCycleTime = formatCycleTime(
            row.original.cycleTimeDurDecimal || 0
          );

          // if same values no need to show tooltip
          if (shortCycleTime === longCycleTime) return longCycleTime;

          return (
            <div className="text-xs text-primary-foreground">
              <TooltipCustom
                trigger={
                  <div className="flex items-center gap-2">
                    <Image src={Info} alt="Info" className="w-3 h-3" />
                    {shortCycleTime}
                  </div>
                }
              >
                {longCycleTime}
              </TooltipCustom>
            </div>
          );
        }
      },
      {
        accessorKey: "offerVehicleVin",
        header: () => (
          <div className="text-xs text-primary flex">
            <span className="mr-2">Offer Vehicle VIN</span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-xs text-primary-foreground">
            {row.getValue("offerVehicleVin")}
          </div>
        )
      },
      {
        accessorKey: "responderVehicleVin",
        header: () => (
          <div className="text-xs text-primary flex">
            <span className="mr-2">Respond Vehicle VIN</span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-xs text-primary-foreground">
            {row.getValue("responderVehicleVin")}
          </div>
        )
      },
      (isReceivedOffers || isAdmin) && {
        accessorKey: "responseStatus",
        header: () =>
          <div className="text-xs text-primary flex">
            <span className="mr-2">Response</span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>,
        cell: ({ row }) =>
          <div className="flex items-center gap-2">
            <OfferResponseStatusBadge offer={row.original} />
            <OfferResponseStatusAction
              offer={row.original}
              inDraft={inDraft}
            />
          </div>
      },
      isArbitratingOffers && {
        accessorKey: "offerAmount",
        header: () =>
          <div className="text-xs text-primary flex">
            <span className="mr-2">Initial Amount</span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>,
        cell: ({ row }) =>
          <div className="text-xs text-primary-foreground">
            ${row.original.offerAmount}
          </div>
      },
      isArbitratingOffers && {
        accessorKey: "responseAmount",
        header: () => (
          <div className="text-xs text-primary flex" onClick={handleSortingClick("responseAmount", { sorting, setSorting })}>
            <span className="mr-2">Final Amount</span>
            <Image
              src={getSortingIcon("responseAmount", sorting)}
              alt="Sort"
              className="w-4 h-4"
            />
          </div>
        ),
        cell: ({ row }) => {
          const initialAmount: number = row.getValue("offerAmount");
          const recentResponse: number = row.getValue("responseAmount");

          const { difference, differenceInPercent } = differenceCount(initialAmount, recentResponse)

          return (
            <div className="flex">
              <div className="text-xs text-primary-foreground mr-2">{`$${row.original.responseAmount || 0}`}</div>
              <TooltipCustom
                side="bottom"
                align="end"
                trigger={
                  <Image
                    src={Info}
                    alt="Info"
                    className="w-4 h-4 mr-2"
                  />}
              >
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between p-1">
                    <p className="mr-1 text-background-secondary text-xs font-normal tracking-[-0.1px] opacity-70">3rd Response Amount:</p>
                    <span className="text-background text-xs font-medium">{`$${row.getValue("responseAmount")}`}</span>
                  </div>
                  <div className="flex flex-row justify-between p-1 items-center">
                    <p className="mr-1 text-background-secondary text-xs font-normal tracking-[-0.1px] opacity-70">Difference:</p>
                    <span className="mr-1 text-background text-xs font-medium">{difference}</span>
                    <div className="bg-secondary-foreground flex items-center p-0 h-auto rounded-3xl">
                      <span className="text-background text-xs font-medium leading-none p-1">{differenceInPercent}</span>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between p-1">
                    <p className="mr-1 text-background-secondary text-xs font-normal tracking-[-0.1px] opacity-70">Failed Responses:</p>
                    <span className="text-background text-xs font-medium">{row.original.failedResponses}</span>
                  </div>
                </div>
              </TooltipCustom>
            </div>
          )
        }
      },
      {
        accessorKey: "Status",
        header: () => (
          <div className="text-xs text-primary flex">
            <span className="mr-2">Status</span>
            <Image src={SortFilter} alt="Sort" className="w-4 h-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <OfferStatusBadge offer={row.original} />
            <OfferStatusAction offer={row.original} inDraft={inDraft} />
          </div>
        )
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <SubroOffersMoreActionsDropdown offer={row.original} />
        )
      }
    ] as ColumnDef<IOffer>[]).filter(Boolean),
    [isReceivedOffers, isArbitratingOffers, isAdmin, highlightedSearchTerm, inDraft, sorting, setSorting]
  );
};
