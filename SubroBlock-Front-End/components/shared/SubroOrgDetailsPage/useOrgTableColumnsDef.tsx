import { ColumnDef } from "@tanstack/react-table";
import { ColumnSort } from "@tanstack/table-core";
import Image from "next/image";
import * as React from "react";
import { useMemo } from "react";
import {
  OrganizationsMoreActionsDropdown
} from "@/components/shared/SubroOrgDetailsPage/OrganizationsMoreActionsDropdown";
import { getSortingIcon, handleSortingClick } from "@/components/shared/TableCardList/table-card-list.utils";
import { Button } from "@/components/ui/button";
import JCIcon from "@/public/jci.svg";
import { IOrganization } from "@/store/types/organization";
import { useSidePanelStore } from "@/store/useSidePanelStore";

interface IColumnProps {
  setSorting?: (sortBy: ColumnSort) => void;
  sorting?: ColumnSort;
}

export const useOrgTableColumnsDef = (props: IColumnProps): ColumnDef<IOrganization>[] => {
  const { setOpenPanel } = useSidePanelStore();

  return useMemo(() => {
    return [
      {
        accessorKey: "company",
        header: () => (
          <div className="flex cursor-pointer select-none" onClick={handleSortingClick("name", props)}>
          Name
            <Image
              src={getSortingIcon("name", props?.sorting)}
              alt="Sort"
              className="w-4 h-4"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="mr-2">
              <Image src={JCIcon} alt="SubroBlock JCIcon" className="min-w-10"/>
            </div>
            <div className="text-primary-foreground text-base">{row.original.company}</div>
          </div>
        )
      },
      {
        accessorKey: "rootUserEmail",
        header: () => (
          <div className="flex cursor-pointer select-none"
            onClick={handleSortingClick("rootUserEmail", props)}>
              Root User Email
            <Image
              src={getSortingIcon("rootUserEmail", props?.sorting)}
              alt="Sort"
              className="w-4 h-4"
            />
          </div>
        ),
        cell: ({ row }) => (
          <>
            <div className="text-sm text-secondary-foreground">
              Root User Email:
            </div>
            <div className="text-sm ">{row.original.rootUserEmail || "N/A"}</div>
          </>
        )
      },
      {
        accessorKey: "subroCoins",
        header: () => <>SubroCoins</>,
        cell: ({ row }) => (
          <>
            <div className="text-sm text-secondary-foreground">
              SubroCoins:
            </div>
            <div className="text-primary-foreground text-base">{row.original.subroCoins || "N/A"}</div>
          </>
        )
      },
      {
        accessorKey: "subroOffers",
        header: () => <>SubroOffers</>,
        cell: ({ row }) => (
          <>
            <div className="text-sm text-secondary-foreground">
              SubroOffers:
            </div>
            <div className="text-primary-foreground text-base">{row.original.subroCoins || "N/A"}</div>
          </>
        )
      },
      {
        accessorKey: "status",
        header: () => (
          <div className="flex cursor-pointer select-none" onClick={handleSortingClick("status", props)}>
            Status
            <Image
              src={getSortingIcon("status", props?.sorting)}
              alt="Sort"
              className="w-4 h-4"
            />
          </div>
        ),
        cell: ({ row }) => (
          <>
            <div className="text-sm text-secondary-foreground">
              Status:
            </div>
            <div
              className={`${
                (row.original.status.toUpperCase() === "ACTIVE" ? "text-primary" : "text-secondary-foreground")
              } text-sm uppercase`}
            >
              &#8226; {row.original.status}
            </div>
          </>
        )
      },
      {
        accessorKey: "actions",
        header: () => <div className="flex"> Actions </div>,
        cell: ({ row }) => {
          const { id: organizationId, status: organizationStatus } = row.original;
          return <div className="flex flex-row items-center gap-4">
            <Button variant="outline">
            View
            </Button>
            <OrganizationsMoreActionsDropdown
              organizationId={organizationId}
              organizationStatus={organizationStatus}
            />
          </div>
        }
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOpenPanel, props.setSorting, props.sorting]);
}

