import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";
import { URL_ADMIN_GET_WALLETS, URL_ROOT_BUY_WALLET_BALANCE, URL_ROOT_GET_WALLET_ANALYTICS, URL_ROOT_GET_WALLET_BALANCE, URL_ROOT_SELL_WALLET_BALANCE } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { currentUserHasSomeRoles } from "@/lib/utils";
import {
  IFetchWalletAnalyticsResponse,
  IFetchWalletsResponse,
  INITIAL_WALLET_STORE_DATA,
  IWalletBalanceResponse,
  IWalletStore,
  IWalletStoreActions
} from "@/store/types/wallet";

export const useRootWalletStore = create<IWalletStore & IWalletStoreActions>((set, get) => ({
  ...INITIAL_WALLET_STORE_DATA,
  fetchWallets: async (fetchParams) => {
    const params = new URLSearchParams({ ...fetchParams });

    const { ok, data, ...rest } = await fetchAPI<IFetchWalletsResponse>(
      URL_ADMIN_GET_WALLETS + "?" + params,
      { method: "GET" },
      { errorToast: { title: "Error fetching wallets" } }
    );

    if (ok)
      set({
        wallets: data.data || [],
        walletsTotalCount: data.count,
        lastFetchWalletParams: fetchParams
      });
    else
      set({
        wallets: [],
        walletsTotalCount: 0
      });

    return { ok, data, ...rest };
  },
  fetchRootWalletBalance: async () => {
    const { ok, data, ...rest } = await fetchAPI<IWalletBalanceResponse>(
      URL_ROOT_GET_WALLET_BALANCE,
      { method: "GET" },
      { errorToast: { title: "Error fetching balance" } }
    );

    if (ok)
      set({
        balance: data.data
      });
    else
      set({
        balance: null
      });

    return { ok, data, ...rest };
  },
  rootBuyBalance: async (currentUser, amount) => {
    const isRoot = currentUserHasSomeRoles(currentUser, ["org_root"]);

    if (!isRoot) {
      toast({
        title: "You are not authorized to view this page",
        variant: "error"
      });
      return;
    }

    const responseApi = await fetchAPI(
      URL_ROOT_BUY_WALLET_BALANCE,
      { method: "POST", body: JSON.stringify({ amount }) },
      {
        successToast: { title: "Balance bought successfully" },
        errorToast: { title: "Error buying balance" }
      }
    );

    if (responseApi.ok) {
      await get().fetchRootWalletBalance();
      await get().fetchWalletAnalytics(get().lastFetchAnalyticsParams);
    }

    return responseApi;
  },
  rootSellBalance: async (currentUser, amount) => {
    const isRoot = currentUserHasSomeRoles(currentUser, ["org_root"]);

    if (!isRoot) {
      toast({
        title: "You are not authorized to view this page",
        variant: "error"
      });
      return;
    }

    const apiResponse = await fetchAPI(
      URL_ROOT_SELL_WALLET_BALANCE,
      { method: "POST", body: JSON.stringify({ amount }) },
      {
        successToast: { title: "Balance sold successfully" },
        errorToast: { title: "Error selling balance" }
      }
    );

    if (apiResponse.ok) {
      await get().fetchRootWalletBalance();
      await get().fetchWalletAnalytics(get().lastFetchAnalyticsParams);
    }

    return apiResponse;
  },
  fetchWalletAnalytics: async (fetchParams) => {
    const params = new URLSearchParams({ ...fetchParams });

    const { ok, data, ...rest } = await fetchAPI<IFetchWalletAnalyticsResponse>(
      URL_ROOT_GET_WALLET_ANALYTICS + "?" + params,
      { method: "GET" },
      { errorToast: { title: "Error fetching wallet analytics" } }
    );

    if (ok) {
      if (data.data.length === 1) {
        // if only 1 data present - chart won't show anything, as lines must be rendered between 2 points,
        // so we add another point with 0 values
        data.data.push({
          total: 0,
          incomingTransactionsCount: 0,
          outgoingTransactionsCount: 0,
          incomingTransactionsAmount: 0,
          outgoingTransactionsAmount: 0,
          hour: new Date().toISOString()
        });
      }

      set({
        analytics: data.data || [],
        lastFetchAnalyticsParams: fetchParams
      });
    } else
      set({
        analytics: null,
        lastFetchAnalyticsParams: fetchParams
      });

    return { ok, data, ...rest };
  }
}));
