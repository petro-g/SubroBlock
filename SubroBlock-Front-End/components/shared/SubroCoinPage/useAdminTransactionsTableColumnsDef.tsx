import { ColumnDef } from "@tanstack/react-table";
import { ColumnSort } from "@tanstack/table-core";
import Image from "next/image";
import { useMemo } from "react";
import * as React from "react";
import { getSortingIcon, handleSortingClick } from "@/components/shared/TableCardList/table-card-list.utils";
import { IAdminTransaction } from "@/store/types/admin-transactions";

interface IColumnProps {
  setSorting?: (sortBy: ColumnSort) => void;
  sorting?: ColumnSort;
}

export const useAdminTransactionsTableColumnsDef = (props: IColumnProps): ColumnDef<IAdminTransaction>[] => useMemo(() => [
  {
    accessorKey: "originName",
    width: 200,
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("originName", props)}>
      Origin Name
      <Image
        src={getSortingIcon("originName", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="flex gap-2 flex-col">
        <div className="text-secondary-foreground text-sm">Origin Name</div>
        <div className="text-primary-foreground text-base">{row.original.originName || row.original.originWalletId || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "destinationName",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("destinationName", props)}>
      Destination Name
      <Image
        src={getSortingIcon("destinationName", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="flex gap-2 flex-col">
        <div className="text-secondary-foreground text-sm">Destination Name</div>
        <div className="text-primary-foreground text-base">{row.original.destinationName || row.original.destinationWalletId || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "amount",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("amount", props)}>
      Amount
      <Image
        src={getSortingIcon("amount", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="flex gap-2 flex-col">
        <div className="text-secondary-foreground text-sm">SubroCoin Amount</div>
        <div className="text-primary-foreground text-base">{row.original.amount}</div>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("status", props)}>
      Status
      <Image
        src={getSortingIcon("status", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="flex gap-2 flex-col">
        <div className="text-secondary-foreground text-sm">Status</div>
        <div className="text-primary-foreground text-base">{row.original.status}</div>
      </div>
    )
  }
], [props?.sorting]); // eslint-disable-line react-hooks/exhaustive-deps

