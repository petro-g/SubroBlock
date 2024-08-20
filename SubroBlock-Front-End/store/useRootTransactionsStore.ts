import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";
import { URL_ROOT_GET_TRANSACTIONS } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { currentUserHasSomeRoles } from "@/lib/utils";
import {
  IFetchRootTransactionsResponse,
  INITIAL_ROOT_TRANSACTIONS_STORE_DATA,
  IRootTransactionsStore,
  IRootTransactionsStoreActions
} from "@/store/types/root-transactions";

export const useRootTransactionsStore = create<IRootTransactionsStore & IRootTransactionsStoreActions>((set) => ({
  ...INITIAL_ROOT_TRANSACTIONS_STORE_DATA,
  fetchTransactions: async (currentUser, fetchParams) => {
    const isRootUser = currentUserHasSomeRoles(currentUser, ["org_root"]);

    if (!isRootUser) {
      toast({
        title: "Error fetching transactions",
        description: "You are not authorized to view this page",
        variant: "error"
      })

      return;
    }

    const url = URL_ROOT_GET_TRANSACTIONS;

    const params = new URLSearchParams({
      page: fetchParams.page.toString(),
      pageSize: fetchParams.pageSize.toString(),
      search: fetchParams.search || ""
    });

    if (fetchParams.sort) {
      params.append("sort", fetchParams.sort);
      params.append("order", fetchParams.order);
    }

    const { ok, data } = await fetchAPI<IFetchRootTransactionsResponse>(
      url + "?" + params,
      { method: "GET" },
      { errorToast: { title: "Error fetching transactions" } }
    );

    if (ok)
      set({
        transactions: data.data || [],
        transactionsTotalCount: data.count,
        lastFetchParams: fetchParams
      });
    else
      set({
        transactions: [],
        transactionsTotalCount: 0
      });
  }
}));
