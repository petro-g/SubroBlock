import React, { useEffect, useState } from "react";
import {
  IOption
} from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import { useOrgTableColumnsDef } from "@/components/shared/SubroOrgDetailsPage/useOrgTableColumnsDef";
import TableCardList from "@/components/shared/TableCardList/TableCardList";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
import { Button } from "@/components/ui/button";
import FilterOrange from "@/public/filter-orange.svg";
import Filter from "@/public/filter.svg";
import { useOrganizationsStore } from "@/store/useOrganizationsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { Toolbar } from "../PageLayout/Toolbar";

const SubroOrgBody = () => {
  const { organizations, count, fetchOrganizations, lastFetchParams } =
    useOrganizationsStore();

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

  const columns = useOrgTableColumnsDef({ setSorting, sorting });
  const { setOpenPanel } = useSidePanelStore();
  const [selectedFilterOptions, setSelectedFilterOptions]
    = useState<IOption[]>([]);

  // TODO get global list of organizations, not from users. users provide limited list of organizations
  const organizationOptions: IOption[] = (organizations || [])
    .filter((organization) => organization.company)
    .map((organization) => ({
      label: organization.company,
      value: organization.id?.toString()
    }));

  useEffect(() => {
    withLoadingDelayed(async () =>
      fetchOrganizations({
        organizationName: searchParams.search, // TODO ask backend to rename search to just search
        ...searchParams
      })
    );
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toolbar
        searchProps={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search Company name"
        }}
        filtersDropdownProps={{
          title: "Filters",
          icon: Filter,
          activeIcon: FilterOrange,
          groups: [{
            description: "Company",
            selectedOptions: selectedFilterOptions,
            onApplyOptionsChange: setSelectedFilterOptions,
            options: organizationOptions
          }]
        }}
        extraButtons={
          <Button onClick={() => setOpenPanel("createOrg")}>
            Create Organization
          </Button>
        }
      />
      <TableCardList
        title="Organizations"
        page={page}
        setPage={setPage}
        count={count}
        data={organizations}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
      />
    </>
  );
};
export default SubroOrgBody;
