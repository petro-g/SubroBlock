import { ResponseAPI } from "@/lib/fetchAPI";
import { IUserBase } from "@/store/types/user";

export interface IFetchWalletsParams {
  search: string;
}

export interface IFetchWalletsResponse {
  success: boolean;
  message: string;
  data: IWallet[];
  count: number;
}

export interface IFetchWalletAnalyticsParams {
  dateFrom: string;
  dateTo: string;
}

export interface IFetchWalletAnalyticsResponse {
  success: boolean;
  message: string;
  data: IWalletAnalytics[];
}

export interface IWalletAnalytics {
  hour: string;
  total: number;
  incomingTransactionsCount: number;
  outgoingTransactionsCount: number;
  incomingTransactionsAmount: number;
  outgoingTransactionsAmount: number;
}

export interface IWalletBalance {
  balance: number;
  pendingSentOffers: number;
  pendingReceivedOffers: number;
}

export interface IWalletBalanceResponse {
  success: boolean;
  message: string;
  data: IWalletBalance;
}

export interface IWallet {
  walletId: number;
  walletName: string;
  ownerOrganizationId: number;
}

export interface IWalletStore {
  wallets: IWallet[] | null;
  walletsTotalCount: number;
  lastFetchWalletParams: IFetchWalletsParams;
  balance: IWalletBalance | null;
  analytics: IWalletAnalytics[] | null;
  lastFetchAnalyticsParams: IFetchWalletAnalyticsParams;
}

export interface IWalletStoreActions {
  fetchWallets: (fetchParams: IFetchWalletsParams) => Promise<ResponseAPI<IFetchWalletsResponse>>;
  fetchRootWalletBalance: () => Promise<ResponseAPI<IWalletBalanceResponse>>;
  rootBuyBalance: (currentUser: IUserBase, amount: number) => void;
  rootSellBalance: (currentUser: IUserBase, amount: number) => void;
  fetchWalletAnalytics: (fetchParams: IFetchWalletAnalyticsParams) => Promise<ResponseAPI<IFetchWalletAnalyticsResponse>>;
}

export const INITIAL_WALLET_STORE_DATA: IWalletStore = {
  wallets: null,
  walletsTotalCount: 0,
  lastFetchWalletParams: { search: "" },
  balance: null,
  analytics: null,
  lastFetchAnalyticsParams: { dateFrom: "", dateTo: "" }
};
