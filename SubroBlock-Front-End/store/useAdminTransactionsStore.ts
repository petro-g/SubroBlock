import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";
import { URL_ADMIN_CREATE_COINS, URL_ADMIN_GET_TRANSACTIONS, URL_ADMIN_MOVE_COINS } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { currentUserHasSomeRoles } from "@/lib/utils";
import {
  IAdminTransactionsStore,
  IAdminTransactionsStoreActions,
  IFetchAdminTransactionsResponse,
  INITIAL_ADMIN_TRANSACTION_STORE_DATA
} from "@/store/types/admin-transactions";

export const useAdminTransactionsStore = create<IAdminTransactionsStore & IAdminTransactionsStoreActions>((set) => ({
  ...INITIAL_ADMIN_TRANSACTION_STORE_DATA,
  moveCoins: async (currentUser, originWalletId, destinationWalletId, amount) => {
    return await fetchAPI(
      currentUserHasSomeRoles(currentUser, ["admin"])
        ? URL_ADMIN_MOVE_COINS
        : URL_ADMIN_MOVE_COINS, // TODO: Add URL for non-admin move coins

      {
        method: "POST",
        body: JSON.stringify({
          originWalletId,
          destinationWalletId,
          amount
        })
      },
      {
        successToast: { title: "Transaction successfully created", description: `Moved ${amount} coins` },
        errorToast: { title: "Error moving coins" }
      }
    );
  },
  fetchTransactions: async (currentUser, fetchParams) => {
    const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

    if (!isAdmin) {
      toast({
        title: "Error fetching transactions",
        description: "You are not authorized to view this page",
        variant: "error"
      });

      return;
    }

    const url = URL_ADMIN_GET_TRANSACTIONS;

    const params = new URLSearchParams({
      pageSize: fetchParams.pageSize.toString(),
      page: fetchParams.page.toString(),
      search: fetchParams.search || ""
    });

    if (fetchParams.sort) {
      params.append("sort", fetchParams.sort);
      params.append("order", fetchParams.order);
    }

    const { ok, data } = await fetchAPI<IFetchAdminTransactionsResponse>(
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
  },
  createCoins: async (destinationWalletId, amount) => {
    return await fetchAPI(
      URL_ADMIN_CREATE_COINS,
      {
        method: "POST",
        body: JSON.stringify({
          destinationWalletId,
          amount
        })
      },
      {
        successToast: { title: "Mint transaction successfully created", description: `Minted ${amount} coins` },
        errorToast: { title: "Error creating coins" }
      }
    );
  }
}));
