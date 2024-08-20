"use client";
import * as React from "react";
import { useEffect } from "react";
import { Toolbar } from "@/components/shared/PageLayout/Toolbar";
import { useAdminTransactionsTableColumnsDef } from "@/components/shared/SubroCoinPage/useAdminTransactionsTableColumnsDef";
import TableCardList from "@/components/shared/TableCardList/TableCardList";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useAdminTransactionsStore } from "@/store/useAdminTransactionsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";

const SubroCoinPage = () => {
  const {
    fetchTransactions,
    transactions,
    transactionsTotalCount,
    lastFetchParams
  } = useAdminTransactionsStore();

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

  const { setOpenPanel } = useSidePanelStore();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (currentUser?.roles) {
      withLoadingDelayed(async () => fetchTransactions(
        currentUser,
        searchParams
      ));
    }}, [searchParams, currentUser?.roles]); // eslint-disable-line react-hooks/exhaustive-deps

  const columnsDef = useAdminTransactionsTableColumnsDef({ setSorting, sorting });

  return (
    <div>
      <Toolbar
        searchProps={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search origin wallet name"
        }}
        extraButtons={
          <Button onClick={() => setOpenPanel("createTransaction")}>
            Create Transaction
          </Button>
        }
      />
      <TableCardList
        title="Transactions"
        data={transactions}
        columns={columnsDef}
        loading={loading}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
        count={transactionsTotalCount}
      />
    </div>
  );
};
export default SubroCoinPage;
