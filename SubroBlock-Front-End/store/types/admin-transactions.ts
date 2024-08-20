import { ResponseAPI } from "@/lib/fetchAPI";
import { IFetchPaginationParams } from "@/store/types/_common";
import { IUserBase } from "@/store/types/user";
import { IWallet } from "@/store/types/wallet";

export interface IFetchAdminTransactionsResponse {
  success: boolean;
  message: string;
  data: IAdminTransaction[];
  count: number;
}

export interface IAdminTransaction {
  amount: number;
  createdAt: string;
  transactionId: number;
  status: "SIGNED" | "NOT_SIGNED";
  type: "BUY" | "SELL" | "MINT" | "MOVE";

  originName: IWallet["walletName"];
  originWalletId: IWallet["walletId"];
  destinationName: IWallet["walletName"];
  destinationWalletId: IWallet["walletId"];
}

export interface IAdminTransactionsStore {
  transactions: IAdminTransaction[] | null;
  transactionsTotalCount: number;
  lastFetchParams: IFetchPaginationParams;
}

export interface IAdminTransactionsStoreActions {
  moveCoins: (currentUser: IUserBase, originWalletId: string, destinationWalletId: string, amount: number) => Promise<ResponseAPI>
  fetchTransactions: (currentUser: IUserBase, fetchParams: IFetchPaginationParams) => void;
  createCoins: (destinationWalletId: string, amount: number) => Promise<ResponseAPI>
}

export const INITIAL_ADMIN_TRANSACTION_STORE_DATA: IAdminTransactionsStore = {
  transactions: null,
  transactionsTotalCount: 0,
  lastFetchParams: { pageSize: 10, page: 1, search: "", order: "asc", sort: "" }
};
