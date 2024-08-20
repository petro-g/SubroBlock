import { IFetchPaginationParams } from "@/store/types/_common";
import { IUserBase } from "@/store/types/user";

export interface IFetchRootTransactionsResponse {
  success: boolean;
  message: string;
  data: IRootTransaction[];
  count: number;
}

export interface IRootTransaction {
  amount: number;
  date: string;
  transactionId: number;
  type: "SIGNED" | "NOT_SIGNED";
  status: string; // TODO add types
}

export interface IRootTransactionsStore {
  transactions: IRootTransaction[] | null;
  transactionsTotalCount: number;
  lastFetchParams: IFetchPaginationParams;
}

export interface IRootTransactionsStoreActions {
  fetchTransactions: (currentUser: IUserBase, fetchParams: IFetchPaginationParams) => void;
}

export const INITIAL_ROOT_TRANSACTIONS_STORE_DATA: IRootTransactionsStore = {
  transactions: null,
  transactionsTotalCount: 0,
  lastFetchParams: { pageSize: 10, page: 1, search: "", order: "asc", sort: "" }
};
