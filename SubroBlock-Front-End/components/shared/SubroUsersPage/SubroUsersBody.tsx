import { Row } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import {
  IOption
} from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import {
  useUsersTableColumnsDef
} from "@/components/shared/SubroUsersPage/useUsersTableColumnsDef";
import TableCardList from "@/components/shared/TableCardList/TableCardList";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
import { Button } from "@/components/ui/button";
import useCurrentRoute from "@/lib/hooks/useCurrentRoute";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import FilterOrange from "@/public/filter-orange.svg";
import Filter from "@/public/filter.svg";
import { IUser } from "@/store/types/user";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { useUsersStore } from "@/store/useUsersStore";
import { Toolbar } from "../PageLayout/Toolbar";

const statusFilterOptions: IOption[] = [
  { label: "Active", value: "ACTIVE" satisfies IUser["status"] },
  { label: "Suspended", value: "SUSPENDED" satisfies IUser["status"] }
];

const hasKeyFilterOptions: IOption[] = [{ label: "Has key", value: "hasKey" }];

const SubroUsersBody = () => {
  const {
    users,
    count,
    fetchUsers,
    lastFetchParams,
    setSelectedUser
  } = useUsersStore();

  const currentRoute = useCurrentRoute();
  const isArbitratorsPage = currentRoute?.href === "/arbitrators";

  const { setOpenPanel } = useSidePanelStore();
  const currentUser = useCurrentUser();

  const {
    page,
    setPage,
    pageSize,
    searchParams,
    sorting,
    setSorting,
    setSearchValue,
    searchValue,
    loading,
    withLoadingDelayed
  } = useTableDataProps({ lastFetchParams });

  const columnsDef = useUsersTableColumnsDef({
    setSorting,
    sorting,
    currentUser,
    isArbitratorsPage
  });

  const [selectedFilterOptions, setSelectedFilterOptions] = useState<IOption[]>([]);
  const [selectedKeyFilterOptions, setSelectedKeyFilterOptions] = useState<IOption[]>([]);
  const [selectedStatusFilterOptions, setSelectedStatusFilterOptions] = useState<IOption[]>([]);

  // TODO get global list of organizations, not from users. users provide limited list of organizations
  const organizationOptions: IOption[] = (users || [])
    .map((user) => ({
      label: user.organization?.name || "no org in user, skip it",
      value: user.organization?.organizationId?.toString() || "-1"
    }))
    .filter((option, index, self) => option.value !== "-1" && self.findIndex((t) => t.value === option.value) === index);

  // fetch users, but if searchName is changed, debounce it
  useEffect(() => {
    if (currentUser?.roles) {
      withLoadingDelayed(async () => fetchUsers(
        currentUser,
        isArbitratorsPage,
        {
          organizationId: Number(selectedFilterOptions.find((option) => organizationOptions.find((org) => org.value === option.value))?.value),
          hasKeyAssigned: selectedKeyFilterOptions.some((option) => option.value === "hasKey") ? true : undefined,
          status: selectedStatusFilterOptions.find((option) => option.value)?.value as (IUser["status"] | undefined),
          ...searchParams
        }
      ));
    }
  }, [page, currentUser?.roles, selectedFilterOptions, selectedKeyFilterOptions, searchParams, isArbitratorsPage, selectedStatusFilterOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toolbar
        searchProps={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search user name"
        }}
        filtersDropdownProps={{
          title: "Filters",
          icon: Filter,
          activeIcon: FilterOrange,
          groups: [
            {
              description: <div>Users only with key</div>,
              selectedOptions: selectedKeyFilterOptions,
              onApplyOptionsChange: setSelectedKeyFilterOptions,
              options: hasKeyFilterOptions
            },
            {
              description: <div>Filter by status</div>,
              selectedOptions: selectedStatusFilterOptions,
              onApplyOptionsChange: setSelectedStatusFilterOptions,
              options: statusFilterOptions
            },
            {
              description: <div>Select from organization</div>,
              selectedOptions: selectedFilterOptions,
              onApplyOptionsChange: setSelectedFilterOptions,
              options: organizationOptions
            }].filter((group) => group.options.length > 0)
        }}
        extraButtons={
          <Button onClick={() => setOpenPanel(isArbitratorsPage ? "createArbitrator" : "createUser")}>
            Create {isArbitratorsPage ? "Arbitrator" : "User"}
          </Button>
        }
      />
      <TableCardList
        title="Users"
        data={users}
        columns={columnsDef}
        loading={loading}
        rowProps={{
          className: "cursor-pointer",
          onClick: (user: Row<IUser>) => {
            setSelectedUser(user.original);
            setOpenPanel("userDetails");
          }
        }}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        count={count}
      />
    </>
  );
};
export default SubroUsersBody;
