import { ColumnDef } from "@tanstack/react-table";
import { ColumnSort } from "@tanstack/table-core";
import { format } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";
import * as React from "react";
import {
  getSortingIcon,
  handleSortingClick
} from "@/components/shared/TableCardList/table-card-list.utils";
import {
  WalletMoreActionsDropdown
} from "@/components/shared/WalletPage/WalletMoreActionsDropdown";
import { Badge } from "@/components/ui/badge";
import { DATE_FORMAT } from "@/lib/constants/static";
import { IRootTransaction } from "@/store/types/root-transactions";

interface IColumnProps {
  setSorting?: (sortBy: ColumnSort) => void;
  sorting?: ColumnSort;
}

export const useRootTransactionsTableColumnsDef = (props: IColumnProps): ColumnDef<IRootTransaction>[] => useMemo(() => [
  {
    accessorKey: "type",
    width: 200,
    header: () => <div
      className="flex cursor-pointer select-none"
      onClick={handleSortingClick("type", props)}
    >
      Transaction
      <Image
        src={getSortingIcon("type", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.type}</div>
    )
  },
  {
    accessorKey: "amount",
    header: () => <div
      className="flex cursor-pointer select-none"
      onClick={handleSortingClick("amount", props)}
    >
      SubroCoin Amount
      <Image
        src={getSortingIcon("amount", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <>{row.original.amount}</>
    )
  },
  {
    accessorKey: "date",
    header: () => <div
      className="flex cursor-pointer select-none"
      onClick={handleSortingClick("date", props)}
    >
      Date
      <Image
        src={getSortingIcon("date", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <>{format(new Date(row.original.date || 0), DATE_FORMAT)}</>
    )
  },
  {
    accessorKey: "status",
    header: () => <div className="flex cursor-pointer select-none"
      onClick={handleSortingClick("status", props)}
    >
      Status
      <Image
        src={getSortingIcon("status", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <Badge variant="success">
        <div
          className="w-2 h-2 bg-current rounded-full mr-1 border border-background"
        />
        {row.original.status || "N/A"}
      </Badge>
    )
  },
  {
    accessorKey: "actions",
    header: () => <></>,
    cell: () => (
      <div className="flex justify-end">
        <WalletMoreActionsDropdown />
      </div>
    )
  }
], [props?.sorting]); // eslint-disable-line react-hooks/exhaustive-deps

