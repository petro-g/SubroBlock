import { ColumnDef } from "@tanstack/react-table";
import { ColumnSort } from "@tanstack/table-core";
import { format } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";
import * as React from "react";
import { AvatarUser } from "@/components/shared/avatar";
import { BadgeUserStatus } from "@/components/shared/badge-status";
import { SubroUsersMoreActionsDropdown } from "@/components/shared/SubroUsersPage/SubroUsersMoreActionsDropdown";
import { getSortingIcon, handleSortingClick } from "@/components/shared/TableCardList/table-card-list.utils";
import { Button } from "@/components/ui/button";
import { DATE_FORMAT } from "@/lib/constants/static";
import { currentUserHasSomeRoles } from "@/lib/utils";
import { IUser, IUserBase } from "@/store/types/user";

interface IColumnProps {
  setSorting: (sortBy: ColumnSort) => void;
  sorting: ColumnSort;
  currentUser: IUserBase | null;
  isArbitratorsPage: boolean;
}

export const useUsersTableColumnsDef = ({ sorting, setSorting, currentUser, isArbitratorsPage }: IColumnProps): ColumnDef<IUser>[] => useMemo(() => ([
  {
    accessorKey: "email",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("email", { sorting, setSorting })}>
      User Email
      <Image
        src={getSortingIcon("email", sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="mr-2">
          <AvatarUser user={row.original} />
        </div>
        <div className="flex flex-col">
          <div className="text-primary-foreground text-base">{row.original.firstName} {row.original.lastName}</div>
          <div className="text-sm">{row.original.email || "N/A"}</div>
        </div>
      </div>
    )
  },
  // only admin can see root user email (owner of org), and on page with regular users, not arbitrators
  !isArbitratorsPage && currentUserHasSomeRoles(currentUser, ["admin"]) && {
    accessorKey: "organization",
    header: () => <>Root User Email</>,
    cell: ({ row }) => (
      <>
        <div className="text-sm text-primary-foreground font-medium mb-1">
          Root User Email
        </div>
        <div className="text-sm">{row.original.organization?.rootUserEmail || "N/A"}</div>
      </>
    )
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("createdAt", { sorting, setSorting })}>
      Created At
      <Image
        src={getSortingIcon("createdAt", sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="text-sm">{
        row.original.createdAt
          ? format(new Date(row.original.createdAt), DATE_FORMAT)
          : "N/A"
      }</div>
    )
  },
  {
    accessorKey: "loggedAt",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("loggedAt", { sorting, setSorting })}>
      Last Logged At
      <Image
        src={getSortingIcon("loggedAt", sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="text-sm">{
        row.original.loggedAt
          ? format(new Date(row.original.loggedAt), DATE_FORMAT)
          : "N/A"
      }</div>
    )
  },
  {
    accessorKey: "status",
    header: () => <div className="flex cursor-pointer select-none" onClick={handleSortingClick("status", { sorting, setSorting })}>
      Status
      <Image
        src={getSortingIcon("status", sorting)}
        alt="Sort"
        className="w-4 h-4"
      />
    </div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-between gap-4">
        <BadgeUserStatus user={row.original} />
        <div className="flex flex-row justify-end items-center gap-4">
          <Button variant="outline">
            View
          </Button>
          <SubroUsersMoreActionsDropdown user={row.original} />
        </div>
      </div>
    )
  }
] as ColumnDef<IUser>[]).filter(Boolean), [isArbitratorsPage, currentUser, sorting, setSorting]);

