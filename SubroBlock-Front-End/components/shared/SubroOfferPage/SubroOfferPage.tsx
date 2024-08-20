import { Row } from "@tanstack/react-table";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IDropdownGroupItemProps } from "@/components/shared/DropdownGroups/dropdown-groups.types";
import { IOption } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import { useOffersTableColumnsDef } from "@/components/shared/SubroOfferPage/SubroOfferDataTableColumns/useOffersTableColumnsDef";
import useOfferPageTypeDetails from "@/components/shared/SubroOfferPage/useOfferPageTypeDetails";
import TableCardList from "@/components/shared/TableCardList/TableCardList";
import { useTableDataProps } from "@/components/shared/TableCardList/use-table-data-props";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { cn, currentUserHasSomeRoles } from "@/lib/utils";
import Download from "@/public/download-icon.svg";
import FilterOrange from "@/public/filter-orange.svg";
import Filter from "@/public/filter.svg";
import { IOffer } from "@/store/types/offers";
import { useOffersStore } from "@/store/useOffersStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { useUsersStore } from "@/store/useUsersStore";
import { Toolbar } from "../PageLayout/Toolbar";

const statusFilterOptions = [
  { label: "0/2 keys", value: "0/2 keys" satisfies IOffer["status"] },
  { label: "1/2 keys", value: "1/2 keys" satisfies IOffer["status"] },
  { label: "Signed", value: "Signed" satisfies IOffer["status"] },
  { label: "ARB (Manual)", value: "Arbitration" satisfies IOffer["status"] }
];

export default function SubroOfferPage() {
  const {
    fetchOffers,
    count,
    offers,
    setSelectedOffer,
    lastFetchParams
  } = useOffersStore();

  const { currentUserActivityCounts } = useUsersStore();
  const currentUser = useCurrentUser();
  const { setOpenPanel } = useSidePanelStore();

  const { isReceivedOffers, isArbitratingOffers, isOffersHistory } = useOfferPageTypeDetails();

  const [selectedResponderFilterOptions, setSelectedResponderFilterOptions]
    = useState<IOption[]>([]);
  const [selectedStatusOptions, setSelectedStatusOptions] =
    useState<IOption[]>([]);

  const [activeTab, setActiveTab] = useState<"signed" | "drafts">("signed");

  const {
    page,
    setPage,
    pageSize,
    searchValue,
    setSearchValue,
    sorting,
    setSorting,
    searchParams,
    loading,
    withLoadingDelayed
  } = useTableDataProps({ lastFetchParams });

  const columns = useOffersTableColumnsDef({
    setSorting,
    sorting,
    inDraft: activeTab === "drafts"
  });

  useEffect(() => {
    if (currentUser) {
      withLoadingDelayed(() =>
        fetchOffers({
          currentUser,
          isReceivedOffers,
          isOffersHistory,
          fetchParams: {
            ...searchParams,
            inDraft: !isOffersHistory && activeTab === "drafts",
            responderCompany: selectedResponderFilterOptions.find((option) => option.value)?.value,
            status: selectedStatusOptions.find((option) => option.value)?.value as (IOffer["status"] | undefined)
          }
        }));
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [
    isArbitratingOffers,
    currentUser,
    isReceivedOffers,
    searchParams,
    selectedResponderFilterOptions,
    selectedStatusOptions,
    activeTab,
    isOffersHistory
  ]);

  const responderFilterOptions = (offers || []).map((offer) => ({
    label: offer?.responderCompany.toString() || "Default",
    value: offer?.responderCompany.toString() || "-1"
  }))
    // remove duplicates
    .filter((option, index, self) => self.findIndex((t) => t.value === option.value) === index);

  return (
    <>
      {!isOffersHistory && currentUserHasSomeRoles(currentUser, ["org_user"]) && (
        <div className="flex">
          <div
            onClick={() => setActiveTab("signed")}
            className={cn(
              "cursor-pointer flex text-base pb-2",
              activeTab === "signed" &&
              "border-b-2 border-accent-active text-primary-foreground"
            )}
          >
            Signed
            <div className="ml-1 text-secondary-foreground">
              {isReceivedOffers
                ? currentUserActivityCounts?.signedReceivedOfferResponses
                : currentUserActivityCounts?.signedSentOffers}
            </div>
          </div>
          <div
            onClick={() => setActiveTab("drafts")}
            className={cn(
              "text-base ml-2 flex cursor-pointer pb-2",
              activeTab === "drafts" &&
              "border-b-2 border-accent-active text-primary-foreground"
            )}
          >
            Drafts
            <div className="ml-1 text-secondary-foreground">
              {isReceivedOffers
                ? currentUserActivityCounts?.draftReceivedOfferResponses
                : currentUserActivityCounts?.draftSentOffers}
            </div>
          </div>
        </div>
      )}
      <Toolbar
        extraButtons={
          <>
            <Button variant="link" onClick={() => setOpenPanel("viewFiles")}>
              <Image src={Download} alt="Download" className="mr-1.5 w-4 h-4" />
              Download SubroOffers Data
            </Button>
            {!isReceivedOffers &&
              !isOffersHistory &&
              currentUserHasSomeRoles(currentUser, ["org_user"]) && (
              <Button
                onClick={() => {
                  setOpenPanel("createOffer");
                  setActiveTab("drafts"); // new offer will be in drafts, so put user there
                }}
              >
                  Create Offer
              </Button>
            )}
          </>
        }
        searchProps={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search Company name"
        }}
        filtersDropdownProps={{
          title: "Filters",
          icon: Filter,
          activeIcon: FilterOrange,
          groups: [
            {
              description: <div>Responder Company</div>,
              selectedOptions: selectedResponderFilterOptions,
              onApplyOptionsChange: setSelectedResponderFilterOptions,
              options: responderFilterOptions
            },
            {
              description: <div>Offer Status</div>,
              selectedOptions: selectedStatusOptions,
              onApplyOptionsChange: setSelectedStatusOptions,
              options: isArbitratingOffers ? [] : statusFilterOptions
            }
          ].filter((group: IDropdownGroupItemProps) => group.options.length > 0)
        }}
      />

      <div className="table-wrapper w-full overflow-visible">
        <TableCardList
          title={
            // eslint-disable-next-line no-nested-ternary
            isReceivedOffers
              ? "Received Offers"
              : activeTab === "signed"
                ? "Signed Offers"
                : "Draft Offers"
          }
          data={offers}
          columns={columns}
          loading={loading}
          pageSize={pageSize}
          page={page}
          count={count}
          setPage={setPage}
          rowProps={{
            className: "cursor-pointer",
            onClick: (row: Row<IOffer>) => {
              setOpenPanel("offerDetails");
              setSelectedOffer(row.original);
            }
          }}
        />
      </div>
    </>
  );
}
