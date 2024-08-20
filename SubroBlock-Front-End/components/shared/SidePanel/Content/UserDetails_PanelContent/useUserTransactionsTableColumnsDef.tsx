import { ColumnDef } from "@tanstack/react-table";
import { ColumnSort } from "@tanstack/table-core";
import { format } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";
import * as React from "react";
import { getSortingIcon, handleSortingClick } from "@/components/shared/TableCardList/table-card-list.utils";
import { Button } from "@/components/ui/button";
import { IActionsLog } from "@/store/types/actions-log";

interface IColumnProps {
  setSorting?: (sortBy: ColumnSort) => void;
  sorting?: ColumnSort;
}

const formatType = (type: IActionsLog["type"]) => // camelCase to Title Case
  type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

export const useUserActionsLogTableColumnsDef = (props: IColumnProps): ColumnDef<IActionsLog>[] => useMemo(() => [
  {
    accessorKey: "type",
    width: 200,
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("type", props)}>
      Type
      <Image
        src={getSortingIcon("type", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <>{formatType(row.original.type)}</>
    )
  },
  {
    accessorKey: "date",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("date", props)}>
      Date
      <Image
        src={getSortingIcon("date", props?.sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <>{format(new Date(row.original.date), "dd MM yyyy")}</>
    )
  },
  {
    accessorKey: "details",
    header: () => <></>,
    cell: () => (
      <Button variant="link">
        View Details
      </Button>
    )
  }
], [props?.sorting]); // eslint-disable-line react-hooks/exhaustive-deps

